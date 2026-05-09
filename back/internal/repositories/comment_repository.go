package repositories

import (
	"context"

	"github.com/ekosachev/movie-hub/internal/dto"
	"github.com/ekosachev/movie-hub/internal/models"
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

func (r *CommentRepository) GetByID(ctx context.Context, id uint) (*models.Comment, error) {
	var comment models.Comment
	err := r.db.WithContext(ctx).Preload("User").Preload("Reactions").First(&comment, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &comment, nil
}

func (r *CommentRepository) Update(ctx context.Context, filter *models.Comment, obj models.Comment) (int, error) {
	return gorm.G[models.Comment](r.db).Where(filter).Updates(ctx, obj)
}

func (r *CommentRepository) Delete(ctx context.Context, filter *models.Comment) (int, error) {
	return gorm.G[models.Comment](r.db).Where(filter).Delete(ctx)
}

func (r *CommentRepository) GetByMovieID(movieID uint) ([]dto.CommentResponse, error) {
	var comments []models.Comment
	err := r.db.Preload("User").Preload("Reactions").
		Where("movie_id = ?", movieID).
		Find(&comments).Error

	if err != nil {
		return nil, err
	}
	var results []dto.CommentResponse
	for _, c := range comments {
		var reactions []dto.ReactionResponse
		for _, rx := range c.Reactions {
			reactions = append(reactions, dto.ReactionResponse{
				ID:         rx.ID,
				UserID:     rx.UserID,
				IsPositive: rx.IsPositive,
			})
		}
		if reactions == nil {
			reactions = []dto.ReactionResponse{}
		}
		results = append(results, dto.CommentResponse{
			ID:              c.ID,
			Content:         c.Content,
			ParentCommentID: c.ParentCommentID,
			UserID:          c.UserID,
			MovieID:         c.MovieID,
			Username:        c.User.Username,
			Reactions:       reactions,
		})
	}

	return results, nil
}
