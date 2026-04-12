package services

import (
	"github.com/ekosachev/movie-hub/internal/models"
	"github.com/ekosachev/movie-hub/internal/repositories"
)

type RateService struct {
	*BaseService[models.Rate]
}

func NewRateService(repo repositories.BaseRepository[models.Rate]) *RateService {
	return &RateService{
		BaseService: NewBaseService(repo),
	}
}
