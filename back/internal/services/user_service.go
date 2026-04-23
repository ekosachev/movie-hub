package services

import (
	"context"

	"github.com/ekosachev/movie-hub/internal/models"
	"github.com/ekosachev/movie-hub/internal/repositories"
	"github.com/ekosachev/movie-hub/internal/utils"
)

type UserService struct {
	*BaseService[models.User]
}

func NewUserService(repo repositories.BaseRepository[models.User]) *UserService {
	return &UserService{
		BaseService: NewBaseService(repo),
	}
}

func (s *UserService) Create(ctx context.Context, entity *models.User) error {
	hashedPassword, err := utils.HashPassword(entity.PasswordHash)
	if err != nil {
		return err
	}
	entity.PasswordHash = hashedPassword
	return s.BaseService.Create(ctx, entity)
}
