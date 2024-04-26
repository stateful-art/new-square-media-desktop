package playlist

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type Playlist struct {
	ctx    context.Context
	client *http.Client
}

func NewPlaylist() *Playlist {
	return &Playlist{
		client: &http.Client{},
	}
}

func (p *Playlist) Startup(ctx context.Context) {
	p.ctx = ctx
}

func (p *Playlist) GetPlayListsOfPlace(owner string) []PlaylistDTO {
	log.Print("@GetPlayListsOfPlace", owner)
	requestURL := fmt.Sprintf("https://xyz.newnew.media/playlists/owner/%s", owner)

	req, err := http.NewRequest("GET", requestURL, nil)
	if err != nil {
		return nil
	}

	req.Header.Add("Content-Type", "application/json")
	resp, err := p.client.Do(req)
	if err != nil {
		return nil
	}
	defer resp.Body.Close()

	var playlists []PlaylistDTO
	err = json.NewDecoder(resp.Body).Decode(&playlists)
	if err != nil {
		return nil
	}

	log.Print("@playlists", playlists)
	return playlists
}
