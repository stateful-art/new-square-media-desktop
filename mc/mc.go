package mc

/*
#cgo CFLAGS: -x objective-c
#cgo LDFLAGS: -framework Cocoa -framework MediaPlayer
#include "MediaControl.h"
*/
import "C"
import "log"

func UpMC(songName string) {
	cSongName := C.CString(songName)
	log.Println("@UpMC with songName: ", songName)
	// defer C.free(unsafe.Pointer(cSongName)) // Free the C string when done
	log.Print("calling C.UMC(cSongName)")

	C.UMC(cSongName)
}
