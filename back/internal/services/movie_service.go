package services

import (
	"context"

	"github.com/ekosachev/movie-hub/internal/dto"
	"github.com/ekosachev/movie-hub/internal/models"
	"github.com/ekosachev/movie-hub/internal/repositories"
)

type MovieService struct {
	*BaseService[models.Movie]
	Repo *repositories.MovieRepository
}

func NewMovieService(repo *repositories.MovieRepository) *MovieService {
	return &MovieService{
		BaseService: &BaseService[models.Movie]{Repo: repo},
		Repo:        repo,
	}
}

func (s *MovieService) FindWithFilters(ctx context.Context, filter dto.MovieFilterRequest) ([]models.Movie, int64, error) {
	return s.Repo.FindWithFilters(ctx, filter)
}

func (s *MovieService) GetMovieCasts(ctx context.Context, movieID uint) ([]dto.MovieActorResponse, error) {
	casts, err := s.Repo.GetCastsByMovieID(ctx, movieID)
	if err != nil {
		return nil, err
	}

	result := make([]dto.MovieActorResponse, 0, len(casts))
	for _, c := range casts {
		result = append(result, dto.MovieActorResponse{
			ID:       c.Cast.ID,
			Name:     c.Cast.Name,
			PhotoUrl: c.Cast.PhotoUrl,
			Role:     c.Role,
		})
	}

	return result, nil
}
