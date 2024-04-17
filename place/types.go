package place

type GeometryType string

const (
	Point              GeometryType = "Point"
	LineString         GeometryType = "LineString"
	Polygon            GeometryType = "Polygon"
	MultiPoint         GeometryType = "MultiPoint"
	MultiLineString    GeometryType = "MultiLineString"
	MultiPolygon       GeometryType = "MultiPolygon"
	GeometryCollection GeometryType = "GeometryCollection"
)

type Location struct {
	Type        GeometryType `json:"type"`
	Coordinates []float64    `json:"coordinates"`
}
type Link struct {
	Platform string `json:"platform"`
	Url      string `json:"url"`
}

type PlaceDAO struct {
	ID        string   `json:"id,omitempty" bson:"_id,omitempty"`
	Owner     string   `json:"owner,omitempty" bson:"owner,omitempty"`
	Email     string   `json:"email"`
	Phone     string   `json:"phone"`
	SpotifyID string   `json:"spotify_id" bson:"spotify_id"`
	Name      string   `json:"name"`
	Location  Location `json:"location"`
	City      string   `json:"city"`
	Country   string   `json:"country"`

	Description string `json:"description"`
	Image       string `json:"image"`
	Links       []Link `json:"links"`
}

type PlaceDTO struct {
	ID        string   `json:"id,omitempty" bson:"_id,omitempty"`
	Owner     string   `json:"owner,omitempty" bson:"owner,omitempty"`
	Email     string   `json:"email"`
	Phone     string   `json:"phone"`
	SpotifyID string   `json:"spotify_id" bson:"spotify_id"`
	Name      string   `json:"name"`
	Location  Location `json:"location"`
	City      string   `json:"city"`
	Country   string   `json:"country"`

	Description string `json:"description"`
	Image       string `json:"image"`
	Links       []Link `json:"links"`
}
