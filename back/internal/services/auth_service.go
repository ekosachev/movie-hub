package services

import (
	"context"

	"github.com/ekosachev/movie-hub/internal/models"
	"github.com/ekosachev/movie-hub/internal/repositories"
)

type AuthService struct {
	UserRepo *repositories.UserRepository
	RoleRepo *repositories.RoleRepository
}

func (s *AuthService) Login(ctx context.Context, email string, password string) (string, error) {
	users, err := s.UserRepo.Query(ctx, &models.User{EmailAddress: email})

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
