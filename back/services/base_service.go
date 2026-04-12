package services

import (
	"context"

	"github.com/ekosachev/movie-hub/database"
)

type BaseService[T any] struct {
	Repo database.BaseRepository[T]
}

func NewBaseService[T any](repo database.BaseRepository[T]) *BaseService[T] {
	return &BaseService[T]{Repo: repo}
}

func (s *BaseService[T]) Create(ctx context.Context, entity *T) error {
	return s.Repo.Create(ctx, entity)
}

func (s *BaseService[T]) Query(ctx context.Context, filter *T) ([]T, error) {
	return s.Repo.Query(ctx, filter)
}

func (s *BaseService[T]) Update(ctx context.Context, filter *T, entity T) (rowsAffected int, err error) {
	return s.Repo.Update(ctx, filter, entity)
}

func (s *BaseService[T]) Delete(ctx context.Context, filter *T) (rowsAffected int, err error) {
	return s.Repo.Delete(ctx, filter)
}
