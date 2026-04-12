package services

import (
	"github.com/ekosachev/movie-hub/internal/models"
	"github.com/ekosachev/movie-hub/internal/repositories"
)

type CommentService struct {
	*BaseService[models.Comment]
}

func NewCommentService(repo repositories.BaseRepository[models.Comment]) *CommentService {
	return &CommentService{
		BaseService: NewBaseService(repo),
	}
}
