package playlist

type Song struct {
	ID        string `json:"_id,omitempty" bson:"_id,omitempty"`
	Name      string `json:"name,omitempty" bson:"name,omitempty"`
	Artist    string `json:"artist,omitempty" bson:"artist_id,omitempty"`
	PlayCount int16  `json:"play_count,omitempty" bson:"play_count,omitempty"`
}

type PlaylistType string

const (
	Private PlaylistType = "private"
	Public  PlaylistType = "public"
)

type ContentSource string

const (
	Local   ContentSource = "local"
	Spotify ContentSource = "spotify"
	Youtube ContentSource = "youtube"
)

type RevenueSharingModel string

const (
	CollectiveSharing RevenueSharingModel = "collective"
	IndividualSharing RevenueSharingModel = "individual"
)

type PlaylistDTO struct {
	ID          string        `json:"_id,omitempty" bson:"_id,omitempty"`
	Name        string        `json:"name,omitempty" bson:"name,omitempty"`
	Description string        `json:"description,omitempty" bson:"description,omitempty"`
	Owner       string        `json:"owner,omitempty" bson:"owner,omitempty"`
	Type        PlaylistType  `json:"type,omitempty" bson:"type,omitempty"`
	Source      ContentSource `json:"content_source,omitempty" bson:"content_source,omitempty"`

	RevenueSharingModel  RevenueSharingModel `json:"revenue_sharing_model,omitempty" bson:"revenue_sharing_model,omitempty"`
	RevenueCutPercentage float64             `json:"revenue_cut_percentage,omitempty" bson:"revenue_cut_percentage,omitempty"`
	Songs                []Song              `json:"songs,omitempty" bson:"songs,omitempty"`
	Url                  string              `json:"url,omitempty" bson:"url,omitempty"`
	Image                string              `json:"image,omitempty" bson:"image,omitempty"`

	CreatedAt string `json:"created_at,omitempty" bson:"created_at,omitempty"`
	UpdatedAt string `json:"updated_at,omitempty" bson:"updated_at,omitempty"`
}
