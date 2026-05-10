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

func (s *UserService) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	users, err := s.Query(ctx, &models.User{EmailAddress: email})

	if err != nil {
		return nil, err
	}

	if len(users) < 1 {
		return nil, nil
	}

	return &users[0], nil
}
