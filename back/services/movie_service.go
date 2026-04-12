package services

import (
	"github.com/ekosachev/movie-hub/database"
	"github.com/ekosachev/movie-hub/database/models"
)

type MovieService struct {
	*BaseService[models.Movie]
}

func NewMovieService(repo database.BaseRepository[models.Movie]) *MovieService {
	return &MovieService{
		BaseService: NewBaseService(repo),
	}
}
