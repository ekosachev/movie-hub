package services

import (
	"github.com/ekosachev/movie-hub/internal/models"
	"github.com/ekosachev/movie-hub/internal/repositories"
)

type CastService struct {
	*BaseService[models.Cast]
}

func NewCastService(repo repositories.BaseRepository[models.Cast]) *CastService {
	return &CastService{
		BaseService: NewBaseService(repo),
	}
}
