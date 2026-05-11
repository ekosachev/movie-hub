package services

import (
	"context"

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

func (s *CommentService) GetLatestForAdmin(ctx context.Context, limit, offset int) ([]models.Comment, int64, error) {
	return s.Repo.GetLatestForAdmin(ctx, limit, offset)
}

func (s *CommentService) UpdateStatus(ctx context.Context, id uint, status string) error {
	return s.Repo.UpdateStatus(ctx, id, status)
}
