package repositories

import (
	"context"

	"github.com/ekosachev/movie-hub/internal/models"
	"gorm.io/gorm"
)

type RateRepository struct {
	db *gorm.DB
}

func NewRateRepository(db *gorm.DB) *RateRepository {
	return &RateRepository{db: db}
}

func (r *RateRepository) Create(ctx context.Context, obj *models.Rate) error {
	return gorm.G[models.Rate](r.db).Create(ctx, obj)
}

func (r *RateRepository) Query(ctx context.Context, filter *models.Rate) ([]models.Rate, error) {
	return gorm.G[models.Rate](r.db).Where(filter).Find(ctx)
}

func (r *RateRepository) Update(ctx context.Context, filter *models.Rate, obj models.Rate) (int, error) {
	return gorm.G[models.Rate](r.db).Where(filter).Updates(ctx, obj)
}

func (r *RateRepository) Delete(ctx context.Context, filter *models.Rate) (int, error) {
	return gorm.G[models.Rate](r.db).Where(filter).Delete(ctx)
}
