package dto

type CreateCastRequest struct {
	Name      string `json:"name" binding:"required"`
	Biography string `json:"biography"`
	PhotoUrl  string `json:"photo_url"`
}

type UpdateCastRequest struct {
	Name      *string `json:"name"`
	Biography *string `json:"biography"`
	PhotoUrl  *string `json:"photo_url"`
}

type CastResponse struct {
	ID        uint   `json:"id"`
	Name      string `json:"name"`
	Biography string `json:"biography"`
	PhotoUrl  string `json:"photo_url"`
}
