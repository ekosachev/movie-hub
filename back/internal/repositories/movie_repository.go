package repositories

import (
	"context"

	"github.com/ekosachev/movie-hub/internal/dto"
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
	return gorm.G[models.Movie](r.db).Preload("Tag", nil).Where(filter).Find(ctx)
}

func (r *MovieRepository) GetByID(ctx context.Context, id uint) (*models.Movie, error) {
	movies, err := r.Query(ctx, &models.Movie{Model: gorm.Model{ID: id}})

	if err != nil {
		return nil, err
	}

	if len(movies) == 0 {
		return nil, nil
	}

	return &movies[0], nil
}

func (r *MovieRepository) Update(ctx context.Context, filter *models.Movie, obj models.Movie) (int, error) {
	toUpdate, err := r.Query(ctx, filter)
	if err != nil {
		return 0, err
	}

	updated := 0

	for _, v := range toUpdate {
		if err := r.update_movie(ctx, v.ID, obj); err != nil {
			return updated, err
		}
		updated += 1
	}

	return updated, nil
}

func (r *MovieRepository) update_movie(ctx context.Context, movieID uint, updatedMovie models.Movie) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var movie models.Movie
		if err := tx.First(&movie, movieID).Error; err != nil {
			return err
		}

		if err := tx.Model(&movie).Updates(updatedMovie).Error; err != nil {
			return err
		}

		if err := tx.Model(&movie).Association("Tag").Replace(updatedMovie.Tag); err != nil {
			return err
		}

		return nil
	})
}

func (r *MovieRepository) Delete(ctx context.Context, filter *models.Movie) (int, error) {
	return gorm.G[models.Movie](r.db).Where(filter).Delete(ctx)
}

func (r *MovieRepository) FindWithFilters(ctx context.Context, filter dto.MovieFilterRequest) ([]models.Movie, error) {
	var movies []models.Movie

	query := r.db.Model(&models.Movie{})

	if filter.Title != "" {
		query = query.Where("title ILIKE ?", "%"+filter.Title+"%")
	}

	if filter.DateFrom != nil {
		query = query.Where("release_date >= ?", filter.DateFrom)
	}

	if filter.DateTo != nil {
		query = query.Where("release_date <= ?", filter.DateTo)
	}

	if len(filter.TagIDs) > 0 {
		query = query.Joins("JOIN movie_tag ON movie_tag.movie_id = movies.id").
			Where("movie_tag.tag_id IN ?", filter.TagIDs).
			Group("movies.id").
			Having("COUNT (DISTINCT movie_tag.tag_id) >= ?", len(filter.TagIDs))
	}

	if filter.MinRating > 0 {
		query = query.Joins("LEFT JOIN ratings ON ratings.movie_id = movies.id").
			Group("movies.id").
			Having("AVG(ratings.score) >= ?", filter.MinRating)
	}

	err := query.Preload("Tag").Find(&movies).Error
	return movies, err
}
