package database

import (
	"context"

	"github.com/ekosachev/movie-hub/database/models"
	"gorm.io/gorm"
)

type CommentRepository struct {
	db *gorm.DB
}

func NewCommentRepository(db *gorm.DB) *CommentRepository {
	return &CommentRepository{db: db}
}

func (r *CommentRepository) Create(ctx context.Context, obj *models.Comment) error {
	return gorm.G[models.Comment](r.db).Create(ctx, obj)
}

func (r *CommentRepository) Query(ctx context.Context, filter *models.Comment) ([]models.Comment, error) {
	return gorm.G[models.Comment](r.db).Where(filter).Find(ctx)
}

func (r *CommentRepository) Update(ctx context.Context, filter *models.Comment, obj models.Comment) (int, error) {
	return gorm.G[models.Comment](r.db).Where(filter).Updates(ctx, obj)
}

func (r *CommentRepository) Delete(ctx context.Context, filter *models.Comment) (int, error) {
	return gorm.G[models.Comment](r.db).Where(filter).Delete(ctx)
}
