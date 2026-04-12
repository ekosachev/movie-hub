package services

import (
	"github.com/ekosachev/movie-hub/database"
	"github.com/ekosachev/movie-hub/database/models"
)

type RateService struct {
	*BaseService[models.Rate]
}

func NewRateService(repo database.BaseRepository[models.Rate]) *RateService {
	return &RateService{
		BaseService: NewBaseService(repo),
	}
}
