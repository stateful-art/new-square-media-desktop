package multimedia

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"log"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	rt "github.com/wailsapp/wails/v2/pkg/runtime"
)

var Libraries = make(map[string]Lib)

type Library struct {
	ctx    context.Context
	client *http.Client
	index  *TrieNode // create root node for the index
}

type SongLibrary struct {
	Name     string `json:"name"`
	Path     string `json:"path"`
	IsFolder bool   `json:"isFolder"`
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

func NewLibrary() *Library {
	index := NewTrieNode() // Initialize the trie root
	return &Library{
		client: &http.Client{},
		index:  index, // Set the trie field
	}
}

func (a *Library) Startup(ctx context.Context) {
	a.ctx = ctx
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
		return // Return early if there's an error fetching contents
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

func (a *Library) CreateLibrary(library *Lib) error {
	if _, exists := Libraries[library.Name]; !exists {
		// If the library does not exist, add it to the map
		Libraries[library.Name] = *library

		log.Printf("indexing new lib: [ %s ] ...", library.Name)
		go a.UpdateSearchIndex(&LibItem{Name: library.Name, Path: library.Path, IsFolder: true})
		return nil

	} else {
		return errors.New("lib with name already exist")
	}
}

func (a *Library) ListLibraries() ([]Lib, error) {
	var libraries []Lib

	if len(Libraries) == 0 {
		return make([]Lib, 0), errors.New("no item in lib")
	}
	// Iterate over the Libraries map and convert each entry to a SongLibrary
	for _, lib := range Libraries {
		// Convert each Library to a SongLibrary and append to the slice
		libraries = append(libraries, Lib{
			Name: lib.Name,
			Path: lib.Path,
		})
	}
	return libraries, nil
}

func (a *Library) ListLibraryContents(name string, path string) ([]LibItem, error) {
	// Check if the library exists
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
	startTime := time.Now()
	resultChan := make(chan string)

	a.GetSongAsync(path, resultChan)
	// Wait for the result
	encodedString := <-resultChan
	if encodedString == "" {
		return "", errors.New("failed to get song")
	} else {
		fmt.Printf("GetSong took %v\n", time.Since(startTime))
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
		log.Printf("path: %s \n mimeType: %s", path, mimeType)

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
