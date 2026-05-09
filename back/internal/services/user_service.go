package services

import (
	"context"

	"github.com/ekosachev/movie-hub/internal/models"
	"github.com/ekosachev/movie-hub/internal/repositories"
	"github.com/ekosachev/movie-hub/internal/utils"
)

type UserService struct {
	*BaseService[models.User]
	Repo repositories.UserRepository
}

func NewUserService(repo repositories.UserRepository) *UserService {
	return &UserService{
		BaseService: NewBaseService(repo),
		Repo:        repo,
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

func (s *UserService) GetAll(ctx context.Context) ([]models.User, error) {
	return s.Repo.GetAll(ctx)
}
