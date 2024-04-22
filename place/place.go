package place

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type Place struct {
	ctx    context.Context
	client *http.Client
}

func NewPlace() *Place {
	return &Place{
		client: &http.Client{},
	}
}

func (p *Place) Startup(ctx context.Context) {
	p.ctx = ctx
}

func (p *Place) GetPlaces() []PlaceDTO {
	requestURL := fmt.Sprintf("http://%s:%d/places", "192.168.228.5", 3000)

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

	var places []PlaceDTO
	err = json.NewDecoder(resp.Body).Decode(&places)
	if err != nil {
		return nil
	}

	log.Println("returning libraries from desktop backend")
	log.Print(places)
	return places
}

func (p *Place) GetNearbyPlaces(lat string, long string) []PlaceDTO {
	requestURL := fmt.Sprintf("http://%s:%d/places/nearby/%s/%s", "192.168.228.5", 3000, lat, long)

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

	var places []PlaceDTO
	err = json.NewDecoder(resp.Body).Decode(&places)
	if err != nil {
		return nil
	}

	log.Println("returning libraries from desktop backend")
	log.Print(places)
	return places
}
