package dto

type CreateMovieCastRequest struct {
	MovieID int    `json:"movie_id" binding:"required"`
	CastID  int    `json:"cast_id" binding:"required"`
	Role    string `json:"role"`
}

type UpdateMovieCastRequest struct {
	Role *string `json:"role"`
}

type MovieCastResponse struct {
	MovieID int    `json:"movie_id"`
	CastID  int    `json:"cast_id"`
	Role    string `json:"role"`
}
