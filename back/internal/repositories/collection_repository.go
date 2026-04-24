package repositories

import (
	"context"

	"github.com/ekosachev/movie-hub/internal/models"
	"gorm.io/gorm"
)

type CollectionRepository struct {
	db *gorm.DB
}

func NewCollectionRepository(db *gorm.DB) *CollectionRepository {
	return &CollectionRepository{db: db}
}

func (r *CollectionRepository) Create(ctx context.Context, obj *models.Collection) error {
	return gorm.G[models.Collection](r.db).Create(ctx, obj)
}

func (r *CollectionRepository) Query(ctx context.Context, filter *models.Collection) ([]models.Collection, error) {
	return gorm.G[models.Collection](r.db).Where(filter).Find(ctx)
}

func (r *CollectionRepository) GetByID(ctx context.Context, id uint) (*models.Collection, error) {
	collections, err := r.Query(ctx, &models.Collection{Model: gorm.Model{ID: id}})

	if err != nil {
		return nil, err
	}

	if len(collections) == 0 {
		return nil, nil
	}

	return &collections[0], nil
}

func (r *CollectionRepository) Update(ctx context.Context, filter *models.Collection, obj models.Collection) (int, error) {
	return gorm.G[models.Collection](r.db).Where(filter).Updates(ctx, obj)
}

func (r *CollectionRepository) Delete(ctx context.Context, filter *models.Collection) (int, error) {
	return gorm.G[models.Collection](r.db).Where(filter).Delete(ctx)
}
