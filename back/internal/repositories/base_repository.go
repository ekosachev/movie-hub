package repositories

import (
	"context"
)

type BaseRepository[T any] interface {
	Create(ctx context.Context, obj *T) error
	Query(ctx context.Context, filter *T) ([]T, error)
	Update(ctx context.Context, filter *T, obj T) (rowsAffected int, err error)
	Delete(ctx context.Context, filter *T) (rowsAffected int, err error)
}
