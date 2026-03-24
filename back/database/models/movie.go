package models

import (
	"time"

	"gorm.io/gorm"
)

type Movie struct {
	gorm.Model
	Title       string
	Description string
	ReleaseDate time.Time
	Cast        []*Cast `gorm:"many2many:movie_cast;"`
	Tag         []*Tag  `gorm:"many2many:movie_tag;"`
}
