package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Username     string
	EmailAddress string
	PasswordHash string
	RoleID       *uint
	Favorites    []*Movie `gorm:"many2many:user_favorites;"`
	Watched      []*Movie `gorm:"many2many:user_watched;"`
	Watchlist    []*Movie `gorm:"many2many:user_watchlist;"`
}
