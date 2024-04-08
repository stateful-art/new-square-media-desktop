package main

import (
	"context"
	"embed"
	Multimedia "lolipie/multimedia"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"
	"github.com/wailsapp/wails/v2/pkg/runtime"

	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()
	lib := Multimedia.NewLibrary()
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
		}, Bind: []interface{}{
			app, search, lib,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}

}
