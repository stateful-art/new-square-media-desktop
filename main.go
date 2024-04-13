package main

import (
	"context"
	"database/sql"
	"embed"
	"log"

	Multimedia "lolipie/multimedia"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"
	"github.com/wailsapp/wails/v2/pkg/runtime"

	_ "github.com/mattn/go-sqlite3"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS
var db *sql.DB

func init() {
	// Open SQLite database
	var err error
	db, err = sql.Open("sqlite3", "./data.db")
	if err != nil {
		log.Fatal(err)
	}
	// defer db.Close()

	// Initialize tables if not exists
	if err := createTables(); err != nil {
		log.Fatal(err)
	}
}

func main() {
	// Create an instance of the app structure
	app := NewApp()
	lib := Multimedia.NewLibrary(db)
	search := Multimedia.NewTrieNode()

	AppMenu := menu.NewMenu()
	FileMenu := AppMenu.AddSubmenu("File")
	// FileMenu.AddText("&Open", keys.CmdOrCtrl("o"), openFile)
	FileMenu.AddSeparator()
	FileMenu.AddText("Quit", keys.CmdOrCtrl("q"), func(_ *menu.CallbackData) {
		runtime.Quit(app.ctx)
	})

	// if runtime.GOOS == "darwin" {
	// 	AppMenu.Append(menu.EditMenu()) // on macos platform, we should append EditMenu to enable Cmd+C,Cmd+V,Cmd+Z... shortcut
	// }

	// Create application with options

	err := wails.Run(&options.App{
		Title:  "New Square",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets:  assets,
			Handler: Multimedia.NewLibraryLoader(),
		},
		Menu:             AppMenu,
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			app.startup(ctx)
			lib.Startup(ctx)
			search.Startup(ctx)
		},

		Bind: []interface{}{
			app, search, lib,
		},
	})

	if err != nil {
		println("Error:", err.Error())
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
		return err
	}

	// Add more CREATE TABLE statements for other tables if needed

	return nil
}
