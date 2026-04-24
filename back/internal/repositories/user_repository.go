package repositories

import (
	"context"

	"github.com/ekosachev/movie-hub/internal/models"
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

func (r *UserRepository) GetByID(ctx context.Context, id uint) (*models.User, error) {
	users, err := r.Query(ctx, &models.User{Model: gorm.Model{ID: id}})

	if err != nil {
		return nil, err
	}

	if len(users) == 0 {
		return nil, nil
	}

	return &users[0], nil
}

func (r *UserRepository) Update(ctx context.Context, filter *models.User, obj models.User) (int, error) {
	return gorm.G[models.User](r.db).Where(filter).Updates(ctx, obj)
}

func (r *UserRepository) Delete(ctx context.Context, filter *models.User) (int, error) {
	return gorm.G[models.User](r.db).Where(filter).Delete(ctx)
}
