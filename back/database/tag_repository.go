package database

import (
	"context"

	"github.com/ekosachev/movie-hub/database/models"
	"gorm.io/gorm"
)

type TagRepository struct {
	db *gorm.DB
}

func NewTagRepository(db *gorm.DB) *TagRepository {
	return &TagRepository{db: db}
}

func (r *TagRepository) Create(ctx context.Context, obj *models.Tag) error {
	return gorm.G[models.Tag](r.db).Create(ctx, obj)
}

func (r *TagRepository) Query(ctx context.Context, filter *models.Tag) ([]models.Tag, error) {
	return gorm.G[models.Tag](r.db).Where(filter).Find(ctx)
}

func (r *TagRepository) Update(ctx context.Context, filter *models.Tag, obj models.Tag) (int, error) {
	return gorm.G[models.Tag](r.db).Where(filter).Updates(ctx, obj)
}

func (r *TagRepository) Delete(ctx context.Context, filter *models.Tag) (int, error) {
	return gorm.G[models.Tag](r.db).Where(filter).Delete(ctx)
}
