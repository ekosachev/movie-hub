package repositories

import (
	"context"

	"github.com/ekosachev/movie-hub/internal/models"
	"gorm.io/gorm"
)

type CollectionRepository struct {
	db *gorm.DB
}

func NewCollectionRepository(db *gorm.DB) *CollectionRepository {
	return &CollectionRepository{db: db}
}

func (r *CollectionRepository) Create(ctx context.Context, obj *models.Collection) error {
	return gorm.G[models.Collection](r.db).Create(ctx, obj)
}

func (r *CollectionRepository) Query(ctx context.Context, filter *models.Collection) ([]models.Collection, error) {
	return gorm.G[models.Collection](r.db).Where(filter).Find(ctx)
}

func (r *CollectionRepository) GetByID(ctx context.Context, id uint) (*models.Collection, error) {
	var collection models.Collection
	err := r.db.WithContext(ctx).Preload("MovieCollection").First(&collection, id).Error
	if err != nil {
		return nil, err
	}
	return &collection, nil
}

func (r *CollectionRepository) Update(ctx context.Context, filter *models.Collection, obj models.Collection) (int, error) {
	return gorm.G[models.Collection](r.db).Where(filter).Updates(ctx, obj)
}

func (r *CollectionRepository) Delete(ctx context.Context, filter *models.Collection) (int, error) {
	return gorm.G[models.Collection](r.db).Where(filter).Delete(ctx)
}

func (r *CollectionRepository) GetByUserID(ctx context.Context, userID uint) ([]models.Collection, error) {
	var collections []models.Collection
	err := r.db.WithContext(ctx).Preload("MovieCollection").Where("user_id = ?", userID).Find(&collections).Error
	return collections, err
}

func (r *CollectionRepository) AddMovie(ctx context.Context, collectionID uint, movieID uint) error {
	collection := models.Collection{Model: gorm.Model{ID: collectionID}}
	movie := models.Movie{Model: gorm.Model{ID: movieID}}
	return r.db.WithContext(ctx).Model(&collection).Association("MovieCollection").Append(&movie)
}

func (r *CollectionRepository) RemoveMovie(ctx context.Context, collectionID uint, movieID uint) error {
	collection := models.Collection{Model: gorm.Model{ID: collectionID}}
	movie := models.Movie{Model: gorm.Model{ID: movieID}}
	return r.db.WithContext(ctx).Model(&collection).Association("MovieCollection").Delete(&movie)
}

func (r *CollectionRepository) GetSystemLists(ctx context.Context, userID uint) ([]uint, []uint, []uint, error) {
	var user models.User
	err := r.db.WithContext(ctx).
		Preload("Favorites").
		Preload("Watched").
		Preload("Watchlist").
		First(&user, userID).Error
	if err != nil {
		return nil, nil, nil, err
	}

	var favIDs, watchedIDs, watchlistIDs []uint
	for _, m := range user.Favorites {
		favIDs = append(favIDs, m.ID)
	}
	for _, m := range user.Watched {
		watchedIDs = append(watchedIDs, m.ID)
	}
	for _, m := range user.Watchlist {
		watchlistIDs = append(watchlistIDs, m.ID)
	}
	return favIDs, watchedIDs, watchlistIDs, nil
}

func (r *CollectionRepository) AddToSystemList(ctx context.Context, userID uint, listName string, movieID uint) error {
	user := models.User{Model: gorm.Model{ID: userID}}
	movie := models.Movie{Model: gorm.Model{ID: movieID}}
	return r.db.WithContext(ctx).Model(&user).Association(listName).Append(&movie)
}

func (r *CollectionRepository) RemoveFromSystemList(ctx context.Context, userID uint, listName string, movieID uint) error {
	user := models.User{Model: gorm.Model{ID: userID}}
	movie := models.Movie{Model: gorm.Model{ID: movieID}}
	return r.db.WithContext(ctx).Model(&user).Association(listName).Delete(&movie)
}
