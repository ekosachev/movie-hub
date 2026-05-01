package repositories

import (
	"context"

	"github.com/ekosachev/movie-hub/internal/models"
	"gorm.io/gorm"
)

type CastRepository struct {
	db *gorm.DB
}

func NewCastRepository(db *gorm.DB) *CastRepository {
	return &CastRepository{db: db}
}

func (r *CastRepository) Create(ctx context.Context, obj *models.Cast) error {
	return r.db.WithContext(ctx).Create(obj).Error
}

func (r *CastRepository) Query(ctx context.Context, filter *models.Cast) ([]models.Cast, error) {
	var casts []models.Cast
	err := r.db.WithContext(ctx).Where(filter).Find(&casts).Error
	return casts, err
}

func (r *CastRepository) GetByID(ctx context.Context, id uint) (*models.Cast, error) {
	var cast models.Cast
	err := r.db.WithContext(ctx).First(&cast, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &cast, nil
}

func (r *CastRepository) Update(ctx context.Context, filter *models.Cast, obj models.Cast) (int, error) {
	result := r.db.WithContext(ctx).Where(filter).Updates(obj)
	return int(result.RowsAffected), result.Error
}

func (r *CastRepository) Delete(ctx context.Context, filter *models.Cast) (int, error) {
	result := r.db.WithContext(ctx).Where(filter).Delete(&models.Cast{})
	return int(result.RowsAffected), result.Error
}
