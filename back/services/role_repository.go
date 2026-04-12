package services

import (
	"github.com/ekosachev/movie-hub/database"
	"github.com/ekosachev/movie-hub/database/models"
)

type RoleService struct {
	*BaseService[models.Role]
}

func NewRoleService(repo database.BaseRepository[models.Role]) *RoleService {
	return &RoleService{
		BaseService: NewBaseService(repo),
	}
}
