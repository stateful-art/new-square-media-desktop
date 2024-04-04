package main

import (
	"context"
	"embed"
	Library "lolipie/multimedia"

	"github.com/wailsapp/wails/v2"

	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()
	lib := Library.NewLibrary()

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "New Square",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			// Call the startup method of the Library instance with the correct context
			lib.Startup(ctx)
			// Optionally, call the startup method of the App instance if it requires context
			app.startup(ctx)
		}, Bind: []interface{}{
			app, lib,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}

}
