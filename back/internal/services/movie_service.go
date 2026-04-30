package services

import (
	"context"

	"github.com/ekosachev/movie-hub/internal/dto"
	"github.com/ekosachev/movie-hub/internal/models"
	"github.com/ekosachev/movie-hub/internal/repositories"
)

type MovieService struct {
	Repo repositories.MovieRepository
}

func NewMovieService(repo repositories.MovieRepository) *MovieService {
	return &MovieService{
		Repo: repo,
	}
}

func (s *MovieService) FindWithFilters(ctx context.Context, filter dto.MovieFilterRequest) ([]models.Movie, error) {
	return s.Repo.FindWithFilters(ctx, filter)
}
