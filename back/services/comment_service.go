package services

import (
	"github.com/ekosachev/movie-hub/database"
	"github.com/ekosachev/movie-hub/database/models"
)

type CommentService struct {
	*BaseService[models.Comment]
}

func NewCommentService(repo database.BaseRepository[models.Comment]) *CommentService {
	return &CommentService{
		BaseService: NewBaseService(repo),
	}
}
