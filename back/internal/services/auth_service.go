package services

import (
	"context"

	"github.com/ekosachev/movie-hub/internal/models"
	"github.com/ekosachev/movie-hub/internal/repositories"
	"github.com/ekosachev/movie-hub/internal/utils"
	"gorm.io/gorm"
)

type AuthService struct {
	UserRepo *repositories.UserRepository
	RoleRepo *repositories.RoleRepository
}

func NewAuthService(userRepo repositories.UserRepository, roleRepo repositories.RoleRepository) *AuthService {
	return &AuthService{
		UserRepo: &userRepo,
		RoleRepo: &roleRepo,
	}
}

func (s *AuthService) Login(ctx context.Context, email string, password string) (string, error) {
	users, err := s.UserRepo.Query(ctx, &models.User{EmailAddress: email})

	if err != nil {
		return "", err
	}

	if len(users) < 1 {
		return "", nil
	}

	user := users[0]

	if err := utils.CheckPassword(user.PasswordHash, password); err != nil {
		return "", nil
	}

	var role *models.Role = nil

	if user.RoleID != nil {
		roles, err := s.RoleRepo.Query(ctx, &models.Role{Model: gorm.Model{ID: *user.RoleID}})

		if err != nil || len(roles) == 0 {
			return "", err
		}

		role = &roles[0]
	}

	var permissions []string = []string{}

	if role != nil {
		permissions = role.GeneratePermissionList()
	}

	token, err := utils.GenerateToken(user.ID, permissions)

	if err != nil {
		return "", err
	}

	return token, nil
}
