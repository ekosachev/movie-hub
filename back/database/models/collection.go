package models

import "gorm.io/gorm"

type Collection struct {
	gorm.Model
	Name            string
	IsPublic        bool
	UserID          int
	MovieCollection []*Movie `gorm:"many2many:moviecollection;"`
}
