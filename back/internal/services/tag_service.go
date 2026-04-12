package services

import (
	"github.com/ekosachev/movie-hub/internal/models"
	"github.com/ekosachev/movie-hub/internal/repositories"
)

type TagService struct {
	*BaseService[models.Tag]
}

func NewTagService(repo repositories.BaseRepository[models.Tag]) *TagService {
	return &TagService{
		BaseService: NewBaseService(repo),
	}
}
