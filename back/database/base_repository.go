package database

import (
	"context"
)

type BaseRepository interface {
	create(ctx context.Context, obj *BaseRepository) error
	query(ctx context.Context, filter *BaseRepository) ([]BaseRepository, error)
	update(ctx context.Context, filter *BaseRepository, obj *BaseRepository) (rowsAffected int, err error)
	delete(ctx context.Context, filter *BaseRepository) error
}
