package services

import (
	"github.com/ekosachev/movie-hub/database"
	"github.com/ekosachev/movie-hub/database/models"
)

type UserService struct {
	*BaseService[models.User]
}

func NewUserService(repo database.BaseRepository[models.User]) *UserService {
	return &UserService{
		BaseService: NewBaseService(repo),
	}
}
