package repositories

import (
	"context"

	"github.com/ekosachev/movie-hub/internal/models"
	"gorm.io/gorm"
)

type MovieCastRepository struct {
	db *gorm.DB
}

func NewMovieCastRepository(db *gorm.DB) *MovieCastRepository {
	return &MovieCastRepository{db: db}
}

func (r *MovieCastRepository) Create(ctx context.Context, obj *models.MovieCast) error {
	return r.db.WithContext(ctx).Create(obj).Error
}

func (r *MovieCastRepository) Query(ctx context.Context, filter *models.MovieCast) ([]models.MovieCast, error) {
	var movieCasts []models.MovieCast
	err := r.db.WithContext(ctx).Where(filter).Find(&movieCasts).Error
	return movieCasts, err
}

func (r *MovieCastRepository) GetByID(ctx context.Context, id uint) (*models.MovieCast, error) {
	var movieCast models.MovieCast
	err := r.db.WithContext(ctx).First(&movieCast, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &movieCast, nil
}

func (r *MovieCastRepository) Update(ctx context.Context, filter *models.MovieCast, obj models.MovieCast) (int, error) {
	result := r.db.WithContext(ctx).Where(filter).Updates(obj)
	return int(result.RowsAffected), result.Error
}

func (r *MovieCastRepository) Delete(ctx context.Context, filter *models.MovieCast) (int, error) {
	result := r.db.WithContext(ctx).Where(filter).Delete(&models.MovieCast{})
	return int(result.RowsAffected), result.Error
}
