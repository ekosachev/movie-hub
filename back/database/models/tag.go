package models

import "gorm.io/gorm"

type Tag struct {
	gorm.Model
	Name  string
	Movie []*Movie `gorm:"many2many:movie_tag;"`
}
