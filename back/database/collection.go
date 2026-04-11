package database

import (
	"context"

	"github.com/ekosachev/movie-hub/database/models"
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

func (r *CollectionRepository) Update(ctx context.Context, filter *models.Collection, obj models.Collection) (int, error) {
	return gorm.G[models.Collection](r.db).Where(filter).Updates(ctx, obj)
}

func (r *CollectionRepository) Delete(ctx context.Context, filter *models.Collection) (int, error) {
	return gorm.G[models.Collection](r.db).Where(filter).Delete(ctx)
}
