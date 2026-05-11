package services

import (
	"context"
	"errors"

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

func (s *CollectionService) GetSystemLists(ctx context.Context, userID uint) ([]uint, []uint, []uint, error) {
	return s.repo.GetSystemLists(ctx, userID)
}

func (s *CollectionService) AddToSystemList(ctx context.Context, userID uint, listType string, movieID uint) error {
	listName := s.getListName(listType)
	if listName == "" {
		return errors.New("invalid list type")
	}
	return s.repo.AddToSystemList(ctx, userID, listName, movieID)
}

func (s *CollectionService) RemoveFromSystemList(ctx context.Context, userID uint, listType string, movieID uint) error {
	listName := s.getListName(listType)
	if listName == "" {
		return errors.New("invalid list type")
	}
	return s.repo.RemoveFromSystemList(ctx, userID, listName, movieID)
}

func (s *CollectionService) getListName(listType string) string {
	switch listType {
	case "favorites":
		return "Favorites"
	case "watched":
		return "Watched"
	case "watchlist":
		return "Watchlist"
	default:
		return ""
	}
}
