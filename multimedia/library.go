package multimedia

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	rt "github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type Library struct {
	ctx    context.Context
	client *http.Client // Add an http.Client field to the Library struct
}

type SongLibrary struct {
	Name string `json:"name"`
	Path string `json:"path"`
}

// NewApp creates a new App application struct
func NewLibrary() *Library {
	return &Library{
		client: &http.Client{}, // Initialize the http.Client when creating a new Library instance
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *Library) Startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *Library) GetLibrary(name string) string {
	return fmt.Sprintf("so you want to create a lib named %s, ha?", name)
}

func (a *Library) OpenFileDialog() (string, error) {

	var opts = rt.OpenDialogOptions{
		Title: "Select File",
		Filters: []rt.FileFilter{
			{
				DisplayName: "Images (*.mp3;*.jpg)",
				Pattern:     "*.png;*.jpg",
			}, {
				DisplayName: "Videos (*.mov;*.mp4)",
				Pattern:     "*.mov;*.mp4",
			},
		},
	}
	selection, err := rt.OpenFileDialog(a.ctx, opts)
	if err != nil {
		return "", err
	}
	log.Print(selection)
	return "", nil
}

// OpenFolderDialog opens a file dialog and returns the selected folder's path
// func (a *Library) OpenFolderDialog() (string, error) {
// 	// Use Wails runtime to open a file dialog
// 	// runtime := wails.Runtime(a.ctx)
// 	var opts = rt.OpenDialogOptions{Title: "Select a folder"}

//		dialog, err := rt.OpenDirectoryDialog(a.ctx, opts)
//		if err != nil {
//			return "", err
//		}
//		log.Print(dialog)
//		return "", nil
//	}
func (a *Library) OpenFolderDialog() (string, error) {
	// Use Wails runtime to open a file dialog
	var opts = rt.OpenDialogOptions{Title: "Select a folder"}

	dialog, err := rt.OpenDirectoryDialog(a.ctx, opts)
	if err != nil {
		return "", err
	}
	log.Print(dialog)  // This will log the selected folder's path
	return dialog, nil // Return the selected folder's path
}

func (a *Library) CreateLibrary(library *SongLibrary) error {
	// Serialize the SongLibrary struct into JSON format
	jsonData, err := json.Marshal(library)
	if err != nil {
		return err
	}

	// Create a new HTTP request
	requestURL := fmt.Sprintf("http://localhost:%d/addLibrary", 8090)
	req, err := http.NewRequest("POST", requestURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	// Set the content type to application/json
	req.Header.Set("Content-Type", "application/json")

	resp, err := a.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	// Log the response
	log.Printf("Response: %s", body)

	return nil
}
