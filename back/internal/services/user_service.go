package services

import (
	"github.com/ekosachev/movie-hub/internal/models"
	"github.com/ekosachev/movie-hub/internal/repositories"
)

type UserService struct {
	*BaseService[models.User]
}

func NewUserService(repo repositories.BaseRepository[models.User]) *UserService {
	return &UserService{
		BaseService: NewBaseService(repo),
	}
}
