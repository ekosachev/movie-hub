package services

import (
	"context"

	"github.com/ekosachev/movie-hub/internal/models"
	"github.com/ekosachev/movie-hub/internal/repositories"
)

type TagService struct {
	*BaseService[models.Tag]
	Repo repositories.TagRepository
}

func NewTagService(repo repositories.TagRepository) *TagService {
	return &TagService{
		BaseService: &BaseService[models.Tag]{Repo: repo},
		Repo:        repo,
	}
}

func (s *TagService) GetAll(ctx context.Context) ([]models.Tag, error) {
	return s.Repo.GetAll(ctx)
}
