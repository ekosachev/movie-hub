package database

import (
	"context"
)

type BaseRepository interface {
	Create(ctx context.Context, obj *BaseRepository) error
	Query(ctx context.Context, filter *BaseRepository) ([]BaseRepository, error)
	Update(ctx context.Context, filter *BaseRepository, obj *BaseRepository) (rowsAffected int, err error)
	Delete(ctx context.Context, filter *BaseRepository) error
}
