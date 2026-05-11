package dto

type CreateCollectionRequest struct {
	Name     string `json:"name" binding:"required,min=1,max=255"`
	IsPublic bool   `json:"is_public"`
}

type UpdateCollectionRequest struct {
	Name        *string `json:"name" binding:"omitempty,min=1,max=255"`
	IsPublic    *bool   `json:"is_public" binding:"omitempty"`
	Description string  `json:"description" binding:"omitempty"`
}

type CollectionResponse struct {
	ID       uint   `json:"id"`
	Name     string `json:"name"`
	IsPublic bool   `json:"is_public"`
	UserID   int    `json:"user_id"`
	MovieIDs []uint `json:"movie_ids"`
}

type AddMovieToCollectionRequest struct {
	MovieID uint `json:"movie_id" binding:"required"`
}

type SystemListsResponse struct {
	Favorites []uint `json:"favorites"`
	Watched   []uint `json:"watched"`
	Watchlist []uint `json:"watchlist"`
}
