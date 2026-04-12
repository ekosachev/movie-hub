package services

import (
	"github.com/ekosachev/movie-hub/database"
	"github.com/ekosachev/movie-hub/database/models"
)

type CollectionService struct {
	*BaseService[models.Collection]
}

func NewCollectionService(repo database.BaseRepository[models.Collection]) *CollectionService {
	return &CollectionService{
		BaseService: NewBaseService(repo),
	}
}
