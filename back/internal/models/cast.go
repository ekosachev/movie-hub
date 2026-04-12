package models

import "gorm.io/gorm"

type Cast struct {
	gorm.Model
	Name      string
	Biography string
	PhotoUrl  string
	Movies    []*Movie `gorm:"many2many:movie_cast;"`
}

type MovieCast struct {
	MovieID int `gorm:"primaryKey"`
	CastID  int `gorm:"primaryKey"`
	Role    string
}
