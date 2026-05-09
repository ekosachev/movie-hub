package services

import (
	"context"

	"github.com/ekosachev/movie-hub/internal/models"
	"github.com/ekosachev/movie-hub/internal/repositories"
)

type RoleService struct {
	*BaseService[models.Role]
	Repo repositories.RoleRepository
}

func NewRoleService(repo repositories.RoleRepository) *RoleService {
	return &RoleService{
		BaseService: NewBaseService(repo),
		Repo:        repo,
	}
}

func (s *RoleService) GetAll(ctx context.Context) ([]models.Role, error) {
	return s.Repo.GetAll(ctx)
}
