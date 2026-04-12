package services

import (
	"github.com/ekosachev/movie-hub/internal/models"
	"github.com/ekosachev/movie-hub/internal/repositories"
)

type ReactionService struct {
	*BaseService[models.Reaction]
}

func NewReactionService(repo repositories.BaseRepository[models.Reaction]) *ReactionService {
	return &ReactionService{
		BaseService: NewBaseService(repo),
	}
}
