package services

import (
	"github.com/ekosachev/movie-hub/database"
	"github.com/ekosachev/movie-hub/database/models"
)

type ReactionService struct {
	*BaseService[models.Reaction]
}

func NewReactionService(repo database.BaseRepository[models.Reaction]) *ReactionService {
	return &ReactionService{
		BaseService: NewBaseService(repo),
	}
}
