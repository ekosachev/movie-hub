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

func (r *RateRepository) GetAverageByMovieID(ctx context.Context, movieID uint) (*dto.AverageRatingResponse, error) {
	var result struct {
		AvgPlot float64
		AvgPerf float64
		AvgSfx  float64
		Count   int64
	}
	err := r.db.WithContext(ctx).
		Model(&models.Rate{}).
		Where("movie_id = ?", movieID).
		Select(`
			COALESCE(AVG(plot), 0) as avg_plot, 
			COALESCE(AVG(performance), 0) as avg_perf, 
			COALESCE(AVG(sfx), 0) as avg_sfx, 
			COUNT(id) as count
		`).
		Scan(&result).Error
	if err != nil {
		return nil, err
	}
	overall := 0.0
	if result.Count > 0 {
		overall = (result.AvgPlot + result.AvgPerf + result.AvgSfx) / 3.0
	}

	return &dto.AverageRatingResponse{
		MovieID:            movieID,
		AveragePlot:        result.AvgPlot,
		AveragePerformance: result.AvgPerf,
		AverageSfx:         result.AvgSfx,
		OverallAverage:     overall,
		TotalVotes:         result.Count,
	}, nil
}
