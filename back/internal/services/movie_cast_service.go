package services

import (
	"github.com/ekosachev/movie-hub/internal/models"
	"github.com/ekosachev/movie-hub/internal/repositories"
)

type MoveCastService struct {
	*BaseService[models.MovieCast]
}

func NewMovieCastService(repo repositories.BaseRepository[models.MovieCast]) *MoveCastService {
	return &MoveCastService{
		BaseService: NewBaseService(repo),
	}
}
