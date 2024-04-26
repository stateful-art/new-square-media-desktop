package main

import (
	"context"
	"database/sql"
	"embed"
	"fmt"
	"log"
	"os"
	"path/filepath"
	goruntime "runtime"

	Multimedia "newnew.media/multimedia"
	Place "newnew.media/place"
	Playlist "newnew.media/playlist"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"
	"github.com/wailsapp/wails/v2/pkg/runtime"

	_ "github.com/mattn/go-sqlite3"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed all:data
var embeddedData embed.FS

//go:embed build/appicon.png
var icon []byte

var db *sql.DB

func init() {

	// log.Println("N2MEDIA_API_URL: ", os.Getenv("N2MEDIA_API_URL"))

	homeDir, err := getDBPath()
	dbPath := filepath.Join(homeDir, "data.db")
	if err != nil {
		log.Println("error loading data.db")
	}

	var erro error
	db, erro = sql.Open("sqlite3", dbPath)
	if erro != nil {
		log.Fatal("Error opening SQLite database:", erro)
	}

	// Initialize tables if they don't exist
	if err := createTables(); err != nil {
		log.Fatal("Error creating tables:", err)
	}
}
func main() {
	// Create an instance of the app structure
	app := NewApp()

	lib := Multimedia.NewLibrary(db)
	search := Multimedia.NewTrieNode()
	place := Place.NewPlace()
	playlist := Playlist.NewPlaylist()

	AppMenu := menu.NewMenu()
	FileMenu := AppMenu.AddSubmenu("File")
	AboutMenu := AppMenu.AddSubmenu("About")
	AboutMenu.AddSeparator()
	AboutMenu.AddText("Copyright © start", nil, nil)

	FileMenu.AddSeparator()
	FileMenu.AddText("Quit", keys.CmdOrCtrl("q"), func(_ *menu.CallbackData) {
		runtime.Quit(app.ctx)
	})

	if goruntime.GOOS == "darwin" { //std "runtime" package
		AppMenu.Append(menu.EditMenu()) // on macos platform, we should append EditMenu to enable Cmd+A,Cmd+C,Cmd+V,Cmd+Z... shortcut
	}

	// Create application with options
	erro := wails.Run(&options.App{
		Title:  "New Square Media",
		Width:  1024,
		Height: 768,

		AssetServer: &assetserver.Options{
			Assets:  assets,
			Handler: Multimedia.NewLibraryLoader(),
		},
		Menu: AppMenu,

		Mac: &mac.Options{
			TitleBar: &mac.TitleBar{
				TitlebarAppearsTransparent: true,
				HideTitle:                  true,
				HideTitleBar:               false,
				FullSizeContent:            true,
				UseToolbar:                 false,
				HideToolbarSeparator:       true,
			},
			Appearance:           mac.NSAppearanceNameDarkAqua,
			WebviewIsTransparent: true,
			WindowIsTranslucent:  false,
		},

		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			app.startup(ctx)
			lib.Startup(ctx)
			place.Startup(ctx)
			playlist.Startup(ctx)
			search.Startup(ctx)
		},
		Bind: []interface{}{
			app, lib, place, playlist, search,
		},
	})

	if erro != nil {
		println("Error:", erro.Error())
	}
}

// createTables initializes the necessary tables in the SQLite database
func createTables() error {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS libraries (
			name TEXT PRIMARY KEY,
			data TEXT
		)
	`)
	if err != nil {
		log.Print("already got table")

		return err
	}

	// Add more CREATE TABLE statements for other tables if needed

	return nil
}

func extractEmbeddedData(targetDir string) error {
	files, err := embeddedData.ReadDir("data")
	if err != nil {
		return err
	}

	for _, file := range files {
		data, err := embeddedData.ReadFile(fmt.Sprintf("data/%s", file.Name()))
		if err != nil {
			return err
		}
		if err := os.WriteFile(filepath.Join(targetDir, file.Name()), data, 0777); err != nil {
			return err
		}
	}
	return nil
}

func getDBPath() (string, error) {

	tempDir, err := os.MkdirTemp("", "data")
	if err != nil {
		log.Fatal("Error creating temporary directory:", err)
	}

	// Extract the embedded data directory to the temporary directory
	if err := extractEmbeddedData(tempDir); err != nil {
		log.Fatal("Error extracting embedded data:", err)
	}

	homeDir, err := os.UserHomeDir()
	if err != nil {
		log.Fatal("Error getting user's home directory:", err)
	}

	// Define the directory path
	dirPath := filepath.Join(homeDir, ".n2media")

	// Check if the directory exists
	_, err = os.Stat(dirPath)
	if os.IsNotExist(err) {
		// Directory does not exist, create it
		err := os.MkdirAll(dirPath, 0777)
		if err != nil {
			log.Fatal("Error creating directory:", err)
			return "", err
		}
		log.Println("Directory created:", dirPath)
		return dirPath, nil
	} else if err != nil {
		// Error occurred while checking directory existence
		log.Fatal("Error checking directory:", err)
		return "", err
	} else {
		// Directory already exists
		log.Println("Directory already exists:", dirPath)
		return dirPath, nil
	}

}
