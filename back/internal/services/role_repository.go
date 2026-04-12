package services

import (
	"github.com/ekosachev/movie-hub/internal/models"
	"github.com/ekosachev/movie-hub/internal/repositories"
)

type RoleService struct {
	*BaseService[models.Role]
}

func NewRoleService(repo repositories.BaseRepository[models.Role]) *RoleService {
	return &RoleService{
		BaseService: NewBaseService(repo),
	}
}
