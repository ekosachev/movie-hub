package services

import (
	"github.com/ekosachev/movie-hub/database"
	"github.com/ekosachev/movie-hub/database/models"
)

type CastService struct {
	*BaseService[models.Cast]
}

func NewCastService(repo database.BaseRepository[models.Cast]) *CastService {
	return &CastService{
		BaseService: NewBaseService(repo),
	}
}
