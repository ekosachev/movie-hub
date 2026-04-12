package services

import (
	"github.com/ekosachev/movie-hub/database"
	"github.com/ekosachev/movie-hub/database/models"
)

type TagService struct {
	*BaseService[models.Tag]
}

func NewTagService(repo database.BaseRepository[models.Tag]) *TagService {
	return &TagService{
		BaseService: NewBaseService(repo),
	}
}
