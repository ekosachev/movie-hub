package repositories

import (
	"context"

	"github.com/ekosachev/movie-hub/internal/models"
	"gorm.io/gorm"
)

type MovieRepository struct {
	db *gorm.DB
}

func NewMovieRepository(db *gorm.DB) *MovieRepository {
	return &MovieRepository{db: db}
}

func (r *MovieRepository) Create(ctx context.Context, obj *models.Movie) error {
	return gorm.G[models.Movie](r.db).Create(ctx, obj)
}

func (r *MovieRepository) Query(ctx context.Context, filter *models.Movie) ([]models.Movie, error) {
	return gorm.G[models.Movie](r.db).Where(filter).Find(ctx)
}

func (r *MovieRepository) Update(ctx context.Context, filter *models.Movie, obj models.Movie) (int, error) {
	return gorm.G[models.Movie](r.db).Where(filter).Updates(ctx, obj)
}

func (r *MovieRepository) Delete(ctx context.Context, filter *models.Movie) (int, error) {
	return gorm.G[models.Movie](r.db).Where(filter).Delete(ctx)
}
