package dto

type CreateMovieRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description" binding:"required"`
	ReleaseDate string `json:"release_date" binding:"required,datetime=DateTime"`
}

type MovieResponse struct {
	ID          uint   `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	ReleaseDate string `json:"release_date"`
}

type UpdateMovieRequest struct {
	Title       *string `json:"title" binding:"omitempty"`
	Description *string `json:"description" binding:"omitempty"`
	ReleaseDate *string `json:"release_date" binding:"omitempty,datetime=DateTime"`
}
