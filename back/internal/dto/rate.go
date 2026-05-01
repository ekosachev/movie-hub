package dto

type CreateRateRequest struct {
	Plot        uint `json:"plot" binding:"required,min=1,max=10"`
	Performance uint `json:"performance" binding:"required,min=1,max=10"`
	Sfx         uint `json:"sfx" binding:"required,min=1,max=10"`
	UserID      int  `json:"user_id" binding:"required"`
	MovieID     int  `json:"movie_id" binding:"required"`
}

type UpdateRateRequest struct {
	Plot        *uint `json:"plot" binding:"omitempty,min=1,max=10"`
	Performance *uint `json:"performance" binding:"omitempty,min=1,max=10"`
	Sfx         *uint `json:"sfx" binding:"omitempty,min=1,max=10"`
}

type RateResponse struct {
	ID          uint `json:"id"`
	Plot        uint `json:"plot"`
	Performance uint `json:"performance"`
	Sfx         uint `json:"sfx"`
	UserID      int  `json:"user_id"`
	MovieID     int  `json:"movie_id"`
}
