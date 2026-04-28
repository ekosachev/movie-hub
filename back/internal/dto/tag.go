package dto

type CreateTagRequest struct {
	Name string `json:"name" binding:"required"`
}

type TagResponse struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

type UpdateTagRequest struct {
	Name *string `json:"name" binding:"omitempty"`
}
