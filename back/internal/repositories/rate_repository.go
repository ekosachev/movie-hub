package repositories

import (
	"context"

	"github.com/ekosachev/movie-hub/internal/dto"
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

func (r *RateRepository) GetByID(ctx context.Context, id uint) (*models.Rate, error) {
	rates, err := r.Query(ctx, &models.Rate{Model: gorm.Model{ID: id}})

	if err != nil {
		return nil, err
	}

	if len(rates) == 0 {
		return nil, nil
	}

	return &rates[0], nil
}

func (r *RateRepository) Update(ctx context.Context, filter *models.Rate, obj models.Rate) (int, error) {
	return gorm.G[models.Rate](r.db).Where(filter).Updates(ctx, obj)
}

func (r *RateRepository) Delete(ctx context.Context, filter *models.Rate) (int, error) {
	return gorm.G[models.Rate](r.db).Where(filter).Delete(ctx)
}

func (r *RateRepository) GetByMovieID(movieID uint) ([]dto.RateResponse, error) {
	var results []dto.RateResponse

	err := r.db.Table("rates").
		Select("rates.id, rates.plot, rates.performance, rates.sfx, rates.user_id, users.username as username").
		Joins("join users on users.id = rates.user_id").
		Where("rates.movie_id = ?", movieID).
		Scan(&results).
		Error

	return results, err
}
