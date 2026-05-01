package dto

type CreateCommentRequest struct {
	Content         string `json:"content" binding:"required"`
	ParentCommentID *int   `json:"parent_comment_id,omitempty"`
	UserID          int    `json:"user_id" binding:"required"`
	MovieID         int    `json:"movie_id" binding:"required"`
}

type UpdateCommentRequest struct {
	Content *string `json:"content" binding:"required"`
}

type CommentResponse struct {
	ID              uint   `json:"id"`
	Content         string `json:"content"`
	ParentCommentID *int   `json:"parent_comment_id,omitempty"`
	UserID          int    `json:"user_id"`
	MovieID         int    `json:"movie_id"`
	Username        string `json:"username"`
}
