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

func (s *UserService) Login(ctx context.Context, email string, password string) (string, error) {
	users, err := s.Query(ctx, &models.User{EmailAddress: email})

	if err != nil {
		return "", err
	}

	if len(users) < 1 {
		return "", nil
	}

	// user := users[0];
	// token := generate token;

	return "", nil
}
