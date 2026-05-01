package services

import (
	"github.com/ekosachev/movie-hub/internal/dto"
	"github.com/ekosachev/movie-hub/internal/models"
	"github.com/ekosachev/movie-hub/internal/repositories"
)

type CommentService struct {
	*BaseService[models.Comment]
	Repo *repositories.CommentRepository
}

func NewCommentService(repo *repositories.CommentRepository) *CommentService {
	return &CommentService{
		BaseService: NewBaseService(repo),
		Repo:        repo,
	}
}

func (s *CommentService) GetByMovieID(movieID uint) ([]dto.CommentResponse, error) {
	return s.Repo.GetByMovieID(movieID)
}
