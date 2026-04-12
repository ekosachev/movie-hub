package services

import (
	"github.com/ekosachev/movie-hub/internal/models"
	"github.com/ekosachev/movie-hub/internal/repositories"
)

type CollectionService struct {
	*BaseService[models.Collection]
}

func NewCollectionService(repo repositories.BaseRepository[models.Collection]) *CollectionService {
	return &CollectionService{
		BaseService: NewBaseService(repo),
	}
}
