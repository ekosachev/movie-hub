package database

import (
	"context"

	"github.com/ekosachev/movie-hub/database/models"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, obj *models.User) error {
	return gorm.G[models.User](r.db).Create(ctx, obj)
}

func (r *UserRepository) Query(ctx context.Context, filter *models.User) ([]models.User, error) {
	return gorm.G[models.User](r.db).Where(filter).Find(ctx)
}

func (r *UserRepository) Update(ctx context.Context, filter *models.User, obj models.User) (int, error) {
	return gorm.G[models.User](r.db).Where(filter).Updates(ctx, obj)
}

func (r *UserRepository) Delete(ctx context.Context, filter *models.User) (int, error) {
	return gorm.G[models.User](r.db).Where(filter).Delete(ctx)
}
