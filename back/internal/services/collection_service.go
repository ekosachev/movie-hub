package services

import (
	"context"

	"github.com/ekosachev/movie-hub/internal/models"
	"github.com/ekosachev/movie-hub/internal/repositories"
)

type CollectionService struct {
	*BaseService[models.Collection]
	repo *repositories.CollectionRepository
}

func NewCollectionService(repo *repositories.CollectionRepository) *CollectionService {
	return &CollectionService{
		BaseService: NewBaseService(repo),
		repo:        repo,
	}
}

func (s *CollectionService) GetByID(ctx context.Context, id uint) (*models.Collection, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *CollectionService) GetByUserID(ctx context.Context, userID uint) ([]models.Collection, error) {
	return s.repo.GetByUserID(ctx, userID)
}

func (s *CollectionService) AddMovie(ctx context.Context, collectionID uint, movieID uint) error {
	return s.repo.AddMovie(ctx, collectionID, movieID)
}

func (s *CollectionService) RemoveMovie(ctx context.Context, collectionID uint, movieID uint) error {
	return s.repo.RemoveMovie(ctx, collectionID, movieID)
}
