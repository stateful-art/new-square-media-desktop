package place

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
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
	requestURL := fmt.Sprintf("%s/places", os.Getenv("N2MEDIA_API_URL"))

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
	requestURL := fmt.Sprintf("%s/places/nearby/%s/%s", os.Getenv("N2MEDIA_API_URL"), lat, long)

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
