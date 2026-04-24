package dto

type CreateCollectionRequest struct {
	Name     string `json:"name" binding:"required,min=1,max=255"`
	IsPublic bool   `json:"is_public"`
	UserID   int    `json:"user_id" binding:"required"`
}

type UpdateCollectionRequest struct {
	Name     *string `json:"name" binding:"omitempty,min=1,max=255"`
	IsPublic *bool   `json:"is_public" binding:"omitempty"`
}

type CollectionResponse struct {
	ID       uint   `json:"id"`
	Name     string `json:"name"`
	IsPublic bool   `json:"is_public"`
	UserID   int    `json:"user_id"`
}
