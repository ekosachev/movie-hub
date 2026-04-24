package repositories

import (
	"context"

	"github.com/ekosachev/movie-hub/internal/models"
	"gorm.io/gorm"
)

type RoleRepository struct {
	db *gorm.DB
}

func NewRoleRepository(db *gorm.DB) *RoleRepository {
	return &RoleRepository{db: db}
}

func (r *RoleRepository) Create(ctx context.Context, obj *models.Role) error {
	return gorm.G[models.Role](r.db).Create(ctx, obj)
}

func (r *RoleRepository) Query(ctx context.Context, filter *models.Role) ([]models.Role, error) {
	return gorm.G[models.Role](r.db).Where(filter).Find(ctx)
}

func (r *RoleRepository) GetByID(ctx context.Context, id uint) (*models.Role, error) {
	roles, err := r.Query(ctx, &models.Role{Model: gorm.Model{ID: id}})

	if err != nil {
		return nil, err
	}

	if len(roles) == 0 {
		return nil, nil
	}

	return &roles[0], nil
}

func (r *RoleRepository) Update(ctx context.Context, filter *models.Role, obj models.Role) (int, error) {
	return gorm.G[models.Role](r.db).Where(filter).Updates(ctx, obj)
}

func (r *RoleRepository) Delete(ctx context.Context, filter *models.Role) (int, error) {
	return gorm.G[models.Role](r.db).Where(filter).Delete(ctx)
}
