package multimedia

import (
	"context"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"

	_ "github.com/mattn/go-sqlite3"

	rt "github.com/wailsapp/wails/v2/pkg/runtime"
)

var Libraries = make(map[string]Lib)

// var Libraries map[string]Lib

type Library struct {
	ctx    context.Context
	client *http.Client
	index  *TrieNode // create root node for the index
	db     *sql.DB
}

type Lib struct {
	Name        string `json:"name"`
	Path        string `json:"path"`
	PathChanged bool   `json:"path_changed"` //  indicates if the path has changed and needs to be restored
}

type LibItem struct {
	Name     string `json:"name"`
	Path     string `json:"path"`
	IsFolder bool   `json:"isFolder"`
}

type Song struct {
	Name    string `json:"name"`
	Path    string `json:"path"`
	LibName string `json:"lib"`
}

func NewLibrary(db *sql.DB) *Library {
	index := NewTrieNode()
	return &Library{
		client: &http.Client{},
		index:  index,
		db:     db,
	}
}

func (a *Library) Startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *Library) RemoveLibraryDialog() (string, error) {
	var opts = rt.MessageDialogOptions{
		Message:       "Are you sure to delete this library?",
		Buttons:       []string{"yes", "no"},
		DefaultButton: "yes",
		CancelButton:  "no",
	}

	selection, err := rt.MessageDialog(a.ctx, opts)
	if err != nil {
		return "", err
	}
	return selection, nil // Return the selected file path
}

func (a *Library) OpenFileDialog() (string, error) {
	var opts = rt.OpenDialogOptions{
		Title: "Select File",
		Filters: []rt.FileFilter{
			{
				DisplayName: "Audio Files (*.mp3;*.mp4;*.wav;*.flac)",
				Pattern:     "*.mp3;*.mp4;*.wav;*.flac",
			},
			// {
			// 	DisplayName: "Images (*.png;*.jpg)",
			// 	Pattern:     "*.png;*.jpg",
			// },
			// {
			// 	DisplayName: "Videos (*.mov;*.mp4)",
			// 	Pattern:     "*.mov;*.mp4",
			// },
		},
	}
	selection, err := rt.OpenFileDialog(a.ctx, opts)
	if err != nil {
		return "", err
	}
	log.Print(selection)
	return selection, nil // Return the selected file path
}

func (a *Library) OpenFolderDialog() (string, error) {
	// Use Wails runtime to open a file dialog
	var opts = rt.OpenDialogOptions{Title: "Select a folder"}

	folderPath, err := rt.OpenDirectoryDialog(a.ctx, opts)
	if err != nil {
		return "", err
	}
	return folderPath, nil // Return the selected folder's path
}

func (a *Library) UpdateSearchIndex(library *LibItem) {
	// Fetch the contents of the current library
	contents, err := a.ListLibraryContents(library.Name, library.Path)

	if err != nil {
		log.Printf("Error fetching contents for library %s: %v", library.Name, err)
		return
	}

	log.Printf("indexing folder: %s \n", library.Path)
	for _, item := range contents {
		// Skip if the item is a folder and is empty or hidden
		if item.IsFolder {
			if isFolderEmptyOrHidden(item.Path) {
				continue // Skip empty or hidden folders
			}
			// Recursively insert folder contents
			a.UpdateSearchIndex(&LibItem{Name: library.Name, Path: item.Path, IsFolder: true})
		} else {
			// Update the trie with the item's name
			name := item.Name
			a.index.Insert(name, item) // Use the trie for indexing
		}
	}

	// erro := a.index.TestSearch("Muharrem")
	// if erro != nil {
	// 	log.Println(erro.Error())
	// }

}

func (a *Library) CreateLibrary(library Lib) error {
	// Check if the library name already exists
	if _, exists := Libraries[library.Name]; exists {
		return errors.New("library with name already exists")
	}

	// Check if the folder is empty, hidden, or contains only images or videos
	if isFolderEmptyOrHidden(library.Path) {
		return errors.New("selected folder is empty, hidden, or contains only images or videos")
	}

	// Check if the folder or its subfolders contain music files
	if !hasMusicFiles(library.Path) {
		return errors.New("selected folder or its subfolders do not contain any music files")
	}

	// Create the library
	Libraries[library.Name] = library
	a.SaveLibraries()

	return nil
}

// hasMusicFiles checks if a folder or its subfolders contain music files
func hasMusicFiles(path string) bool {
	// Check if the folder contains music files
	if containsMusicFiles(path) {
		return true
	}

	// Recursively check subfolders for music files
	entries, err := os.ReadDir(path)
	if err != nil {
		return false // Return false if there's an error reading the directory
	}
	for _, entry := range entries {
		if entry.IsDir() {
			subFolderPath := filepath.Join(path, entry.Name())
			if hasMusicFiles(subFolderPath) {
				return true
			}
		}
	}
	return false
}

// containsMusicFiles checks if a folder contains music files
func containsMusicFiles(path string) bool {
	entries, err := os.ReadDir(path)
	if err != nil {
		return false // Return false if there's an error reading the directory
	}
	for _, entry := range entries {
		if !entry.IsDir() && isMusicFile(entry.Name()) {
			return true
		}
	}
	return false
}

func (a *Library) UpdateLibraryName(oldName, newName string) error {
	// Check if the oldName exists in the Libraries map
	if lib, exists := Libraries[oldName]; exists {
		var newLib Lib
		newLib.Name = newName
		newLib.Path = lib.Path
		// Add the updated entry back to the map
		Libraries[newName] = newLib

		delete(Libraries, oldName)
		log.Println("deleting lib with old name")
		log.Println("saving lib back")

		// Save the updated Libraries map
		if err := a.SaveLibraries(); err != nil {
			return err
		}
		return nil
	} else {
		return errors.New("library with the old name does not exist")
	}
}

func (a *Library) RemoveLibrary(libraryName string) error {
	if _, exists := Libraries[libraryName]; exists {
		delete(Libraries, libraryName)
		if err := a.SaveLibraries(); err != nil {
			return err
		}
		return nil
	} else {
		return errors.New("library with name does not exist")
	}
}

func (a *Library) SaveLibraries() error {
	tx, err := a.db.Begin()
	if err != nil {
		log.Println("Error starting transaction:", err)
		return err
	}
	defer tx.Rollback() // Rollback transaction if commit is not called

	// Check if libraries entry exists
	var count int
	err = tx.QueryRow("SELECT COUNT(*) FROM libraries").Scan(&count)
	if err != nil {
		log.Println("Error checking count:", err)
		return err
	}

	// Serialize Libraries map to JSON
	data, err := json.Marshal(Libraries)
	if err != nil {
		log.Println("Error marshalling JSON:", err)
		return err
	}

	if count == 0 {
		// If libraries entry doesn't exist, insert it
		_, err = tx.Exec("INSERT INTO libraries(name, data) VALUES(?, ?)", "libraries", string(data))
		if err != nil {
			log.Println("Error executing query:", err)
			return err
		}
	} else {
		// If libraries entry exists, replace its data
		_, err = tx.Exec("UPDATE libraries SET data = ? WHERE name = ?", string(data), "libraries")
		if err != nil {
			log.Println("Error executing query:", err)
			return err
		}
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		log.Println("Error committing transaction:", err)
		return err
	}

	return nil
}

// LoadLibraries loads the Libraries map from the SQLite database
func (a *Library) LoadLibraries() error {
	// Query data from the database
	var data string
	err := a.db.QueryRow("SELECT data FROM libraries WHERE name = ?", "libraries").Scan(&data)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Print("No data found for libraries in the database. Initializing Libraries with an empty map.")
			Libraries = make(map[string]Lib)
			return nil
		}
		log.Print("Error querying data from the database:", err)
		return err
	}

	// Deserialize data from JSON
	err = json.Unmarshal([]byte(data), &Libraries)
	if err != nil {
		log.Print("Error deserializing data:", err)
		return err
	}

	return nil
}

func (a *Library) ListLibraries() ([]Lib, error) {
	var libraries []Lib

	if len(Libraries) == 0 {
		return make([]Lib, 0), errors.New("no item in lib")
	}
	for _, lib := range Libraries {
		libraries = append(libraries, Lib{
			Name: lib.Name,
			Path: lib.Path,
		})
	}
	return libraries, nil
}

func (a *Library) ListLibraryContents(name string, path string) ([]LibItem, error) {
	_, ok := Libraries[name]
	if !ok {
		return nil, errors.New("library not found")
	}

	// Use a channel to collect the items
	itemsChan := make(chan LibItem)
	// Use a channel to collect errors
	errChan := make(chan error)
	// Use a WaitGroup to wait for all goroutines to finish
	var wg sync.WaitGroup

	// Start a goroutine to read the directory
	wg.Add(1)
	go func() {
		defer wg.Done()
		readDirectory(path, itemsChan, errChan)
	}()

	// Collect the items from the channel
	var items []LibItem
	var readErr error
	for {
		select {
		case item, ok := <-itemsChan:
			if !ok {
				// Channel closed, all items received
				goto done
			}
			items = append(items, item)
		case readErr = <-errChan:
			// Error received, stop receiving items
			if readErr != nil {
				a.setLibraryPathChanged(name, true)
				goto done
			}
		}
	}
done:
	// Wait for all goroutines to finish
	wg.Wait()

	// Check if there was an error while reading the directory
	if readErr != nil {
		return nil, readErr
	}

	return items, nil
}

// Function to set the PathChanged field of a library
func (a *Library) setLibraryPathChanged(name string, changed bool) {
	// Find the library with the given name
	lib, exists := Libraries[name]
	if exists {
		// Update the PathChanged field
		lib.PathChanged = changed
		// Update the library in the Libraries map
		Libraries[name] = lib
		a.SaveLibraries()
	}
}

func readDirectory(path string, itemsChan chan<- LibItem, errChan chan<- error) {
	files, err := os.ReadDir(path)
	if err != nil {
		errChan <- err
		return
	}
	for _, file := range files {
		// Check if the file is a directory or a music file
		if isMusicFileOrDir(path, file) {
			item := LibItem{
				Name:     file.Name(),
				Path:     filepath.Join(path, file.Name()),
				IsFolder: file.IsDir(),
			}
			itemsChan <- item
		}
	}
	close(itemsChan)
}

func isMusicFileOrDir(path string, file os.DirEntry) bool {
	// Check if the file is a music file
	if !file.IsDir() {
		return isMusicFile(file.Name())
	}

	// Check if the directory is empty or contains music files
	dirEntries, err := os.ReadDir(filepath.Join(path, file.Name()))
	if err != nil {
		fmt.Printf("Error reading directory: %v\n", err)
		return false
	}
	for _, entry := range dirEntries {
		if isMusicFile(entry.Name()) {
			return true
		}
	}
	return false
}

// isMusicFile checks if a file has a music file extension
func isMusicFile(filename string) bool {
	musicExtensions := map[string]bool{
		".mp3":  true,
		".wav":  true,
		".flac": true,
		".m4a":  true,
		".aac":  true,
		".wma":  true,
	}

	fileExtension := strings.ToLower(filepath.Ext(filename))

	return musicExtensions[fileExtension]
}

// var assets embed.FS

type LibraryLoader struct {
	http.Handler
}

func NewLibraryLoader() *LibraryLoader {
	return &LibraryLoader{}
}

func (a *Library) GetSong(path string) (string, error) {
	resultChan := make(chan string)

	a.GetSongAsync(path, resultChan)
	// Wait for the result
	encodedString := <-resultChan
	if encodedString == "" {
		return "", errors.New("failed to get song")
	} else {
		return encodedString, nil
	}

}

func (a *Library) GetSongAsync(path string, resultChan chan<- string) {
	go func() {
		fileData, err := os.ReadFile(path)
		if err != nil {
			resultChan <- "" // Send an empty string to indicate an error
			return
		}

		// Determine the MIME type of the file
		ext := filepath.Ext(path)
		mimeType := mime.TypeByExtension(ext)

		// Check if the MIME type is a video or audio/mpeg; if so, don't return a Song
		if mimeType != "" && mimeType[:5] == "video/" {
			resultChan <- "" // Send an empty string to indicate an error
			return
		}

		encodedString := base64.StdEncoding.EncodeToString(fileData)
		resultChan <- encodedString // Send the encoded string to the channel
	}()
}

// List of common image file extensions
var imageExtensions = []string{".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp"}

// List of common video file extensions
var videoExtensions = []string{".mp4", ".avi", ".mov", ".mkv", ".flv", ".wmv", ".mpg", ".mpeg"}

// isFolderEmptyOrHidden checks if a folder is empty, hidden, or contains only images or videos.
func isFolderEmptyOrHidden(path string) bool {
	// Check if the folder is hidden (name starts with a dot)
	if strings.HasPrefix(filepath.Base(path), ".") {
		return true
	}

	// Check if the folder is empty
	entries, err := os.ReadDir(path)
	if err != nil {
		return true // Return true if there's an error reading the directory
	}
	if len(entries) == 0 {
		return true // Return true if the folder is empty
	}

	// Check if the folder contains only images or videos
	for _, entry := range entries {
		if !entry.IsDir() {
			ext := filepath.Ext(entry.Name())
			if !isImageOrVideoFile(ext) {
				return false // Return false if the folder contains a non-image/video file
			}
		}
	}

	return true // Return true if the folder contains only images or videos
}

// isImageOrVideoFile checks if a file is an image or video based on its extension.
func isImageOrVideoFile(ext string) bool {
	for _, imageExt := range imageExtensions {
		if ext == imageExt {
			return true
		}
	}
	for _, videoExt := range videoExtensions {
		if ext == videoExt {
			return true
		}
	}
	return false
}
