package services

import (
	"github.com/ekosachev/movie-hub/database"
	"github.com/ekosachev/movie-hub/database/models"
)

type MoveCastService struct {
	*BaseService[models.MovieCast]
}

func NewMovieCastService(repo database.BaseRepository[models.MovieCast]) *MoveCastService {
	return &MoveCastService{
		BaseService: NewBaseService(repo),
	}
}
