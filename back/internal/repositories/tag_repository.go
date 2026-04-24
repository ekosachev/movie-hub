package repositories

import (
	"context"

	"github.com/ekosachev/movie-hub/internal/models"
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

func (r *TagRepository) GetByID(ctx context.Context, id uint) (*models.Tag, error) {
	tags, err := r.Query(ctx, &models.Tag{Model: gorm.Model{ID: id}})

	if err != nil {
		return nil, err
	}

	if len(tags) == 0 {
		return nil, nil
	}

	return &tags[0], nil
}

func (r *TagRepository) Update(ctx context.Context, filter *models.Tag, obj models.Tag) (int, error) {
	return gorm.G[models.Tag](r.db).Where(filter).Updates(ctx, obj)
}

func (r *TagRepository) Delete(ctx context.Context, filter *models.Tag) (int, error) {
	return gorm.G[models.Tag](r.db).Where(filter).Delete(ctx)
}
