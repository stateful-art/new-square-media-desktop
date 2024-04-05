package multimedia

import (
	"bytes"
	"context"
	"embed"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"

	rt "github.com/wailsapp/wails/v2/pkg/runtime"
)

type Library struct {
	ctx    context.Context
	client *http.Client
}

type SongLibrary struct {
	Name     string `json:"name"`
	Path     string `json:"path"`
	IsFolder bool   `json:"isFolder"`
}

func NewLibrary() *Library {
	return &Library{
		client: &http.Client{},
	}
}

// startup is called when the Library starts.
// the context is saved so we can call the runtime methods
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

func (a *Library) CreateLibrary(library *SongLibrary) error {
	jsonData, err := json.Marshal(library)
	if err != nil {
		return err
	}

	requestURL := fmt.Sprintf("http://localhost:%d/addLibrary", 8090)
	req, err := http.NewRequest("POST", requestURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := a.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	log.Printf("Response: %s", body)

	return nil
}

func (a *Library) ListLibraries() ([]SongLibrary, error) {
	requestURL := fmt.Sprintf("http://localhost:%d/listLibraries", 8090)
	req, err := http.NewRequest("GET", requestURL, nil)
	if err != nil {
		return nil, err
	}

	resp, err := a.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	var libraries []SongLibrary
	err = json.NewDecoder(resp.Body).Decode(&libraries)
	if err != nil {
		return nil, err
	}

	log.Println("returning libarries from desktop backend")
	log.Print(libraries)
	return libraries, nil
}

func (a *Library) ListLibrary(name string, path string) ([]SongLibrary, error) {
	requestURL := fmt.Sprintf("http://localhost:%d/listLibrary?name=%s&path=%s", 8090, url.QueryEscape(name), url.QueryEscape(path))
	req, err := http.NewRequest("GET", requestURL, nil)
	if err != nil {
		return nil, err
	}

	resp, err := a.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var libraries []SongLibrary
	err = json.NewDecoder(resp.Body).Decode(&libraries)
	if err != nil {
		return nil, err
	}

	log.Print(libraries)
	return libraries, nil
}

func (a *Library) ListLibraryContents(name string, path string) ([]SongLibrary, error) {
	requestURL := fmt.Sprintf("http://localhost:%d/listLibrary?name=%s&path=%s", 8090, url.QueryEscape(name), url.QueryEscape(path))
	req, err := http.NewRequest("GET", requestURL, nil)
	if err != nil {
		return nil, err
	}

	resp, err := a.client.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	var contents []SongLibrary
	err = json.NewDecoder(resp.Body).Decode(&contents)
	if err != nil {
		return nil, err
	}

	log.Print(contents)
	return contents, nil
}

var assets embed.FS

type LibraryLoader struct {
	http.Handler
}

func NewLibraryLoader() *LibraryLoader {
	return &LibraryLoader{}
}

// func (a *Library) GetSong(res http.ResponseWriter, req *http.Request) {
// 	var err error
// 	requestedFilename := strings.TrimPrefix(req.URL.Path, "/")
// 	log.Printf("req.URL.Path @ GetSong >>  %s \n", req.URL.Path)
// 	log.Printf("requestedFilename @ GetSong >> %s \n", requestedFilename)

// 	println("Requesting file:", requestedFilename)
// 	fileData, err := os.ReadFile(requestedFilename)
// 	if err != nil {
// 		res.WriteHeader(http.StatusBadRequest)
// 		res.Write([]byte(fmt.Sprintf("Could not load file %s", requestedFilename)))
// 	}

// 	res.Write(fileData)
// }

// func (a *Library) GetSong(path string) ([]byte, error) {
// 	var err error
// 	// println("Requesting file:", requestedFilename)
// 	fileData, err := os.ReadFile(path)
// 	if err != nil {
// 		return nil, err
// 	}
// 	return fileData, nil

// }

func (a *Library) GetSong(path string) (string, error) {
	fileData, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}

	encodedString := base64.StdEncoding.EncodeToString(fileData)
	return encodedString, nil
}
