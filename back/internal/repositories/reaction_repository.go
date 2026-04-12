package repositories

import (
	"context"

	"github.com/ekosachev/movie-hub/internal/models"
	"gorm.io/gorm"
)

type ReactionRepository struct {
	db *gorm.DB
}

func NewReactionRepository(db *gorm.DB) *ReactionRepository {
	return &ReactionRepository{db: db}
}

func (r *ReactionRepository) Create(ctx context.Context, obj *models.Reaction) error {
	return gorm.G[models.Reaction](r.db).Create(ctx, obj)
}

func (r *ReactionRepository) Query(ctx context.Context, filter *models.Reaction) ([]models.Reaction, error) {
	return gorm.G[models.Reaction](r.db).Where(filter).Find(ctx)
}

func (r *ReactionRepository) Update(ctx context.Context, filter *models.Reaction, obj models.Reaction) (int, error) {
	return gorm.G[models.Reaction](r.db).Where(filter).Updates(ctx, obj)
}

func (r *ReactionRepository) Delete(ctx context.Context, filter *models.Reaction) (int, error) {
	return gorm.G[models.Reaction](r.db).Where(filter).Delete(ctx)
}
