package dto

type CreateReactionRequest struct {
	IsPositive *bool `json:"is_positive" binding:"required"`
	CommentID  int   `json:"comment_id" binding:"required"`
}

type UpdateReactionRequest struct {
	IsPositive *bool `json:"is_positive" binding:"required"`
}

type ReactionResponse struct {
	ID         uint `json:"id"`
	IsPositive bool `json:"is_positive"`
	UserID     int  `json:"user_id"`
	CommentID  int  `json:"comment_id"`
}
