package services

import (
	"github.com/ekosachev/movie-hub/internal/models"
	"github.com/ekosachev/movie-hub/internal/repositories"
)

type MovieService struct {
	*BaseService[models.Movie]
}

func NewMovieService(repo repositories.BaseRepository[models.Movie]) *MovieService {
	return &MovieService{
		BaseService: NewBaseService(repo),
	}
}
