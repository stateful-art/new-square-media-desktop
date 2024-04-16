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
	Name string `json:"name"`
	Path string `json:"path"`
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
	if _, exists := Libraries[library.Name]; !exists {

		Libraries[library.Name] = library
		a.SaveLibraries()
		// go a.UpdateSearchIndex(&LibItem{Name: library.Name, Path: library.Path, IsFolder: true})
		return nil

	} else {
		return errors.New("lib with name already exist")
	}
}
func (a *Library) UpdateLibraryName(oldName, newName string) error {
	log.Printf("@UpdateLibraryName from %s to %s", oldName, newName)
	// Check if the oldName exists in the Libraries map
	if lib, exists := Libraries[oldName]; exists {
		var newLib Lib
		log.Println("creating new lib item with new name")
		newLib.Name = newName
		newLib.Path = lib.Path

		log.Println("here is new Lib", newLib)
		log.Println("Adding the updated entry back to the map")

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
	log.Print("removing the lib named", libraryName)
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
	// Use a WaitGroup to wait for all goroutines to finish
	var wg sync.WaitGroup

	// Start a goroutine to read the directory
	wg.Add(1)
	go func() {
		defer wg.Done()
		readDirectory(path, itemsChan)
	}()

	// Collect the items from the channel
	var items []LibItem
	for item := range itemsChan {
		items = append(items, item)
	}

	// Wait for all goroutines to finish
	wg.Wait()

	return items, nil
}

func readDirectory(path string, itemsChan chan<- LibItem) {
	files, err := os.ReadDir(path)
	if err != nil {
		log.Printf("Error reading directory: %v", err)
		return
	}
	for _, file := range files {
		// Check if the file is a directory or a music file
		if isMusicFileOrDir(path, file) {
			item := LibItem{
				Name:     file.Name(),
				Path:     path + "/" + file.Name(),
				IsFolder: file.IsDir(),
			}
			itemsChan <- item
		}
	}
	close(itemsChan)
}

func isMusicFileOrDir(path string, file os.DirEntry) bool {
	// Check if the file is a music file
	if isMusicFile(file.Name()) {
		return true
	}

	// Check if the file is a directory
	if file.IsDir() {
		// Check if the file is not a hidden folder (starts with a dot)
		if !strings.HasPrefix(file.Name(), ".") {
			return true // Return true if the directory is not empty
		}

		// Check if the directory is empty
		entries, err := os.ReadDir(path + "/" + file.Name())
		if err != nil {
			fmt.Printf("Error reading directory: %v\n", err)
			return false // Return false if there's an error reading the directory
		}

		if len(entries) > 0 {
			return true // Return false if the directory is empty
		}

		return true
	}

	return false
}

// isMusicFile checks if a file has a music file extension
func isMusicFile(filename string) bool {
	musicExtensions := []string{".mp3", ".wav", ".flac", ".m4a", ".aac", ".m4a", ".wma"}

	fileExtension := filepath.Ext(filename)

	for _, ext := range musicExtensions {
		if fileExtension == ext {
			return true
		}
	}

	return false
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
