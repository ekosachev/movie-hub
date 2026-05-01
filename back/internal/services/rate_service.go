package services

import (
	"github.com/ekosachev/movie-hub/internal/dto"
	"github.com/ekosachev/movie-hub/internal/models"
	"github.com/ekosachev/movie-hub/internal/repositories"
)

type RateService struct {
	*BaseService[models.Rate]
	Repo *repositories.RateRepository
}

func NewRateService(repo *repositories.RateRepository) *RateService {
	return &RateService{
		BaseService: NewBaseService(repo),
		Repo:        repo,
	}
}

func (s *RateService) GetByMovieID(movieID uint) ([]dto.RateResponse, error) {
	return s.Repo.GetByMovieID(movieID)
}
