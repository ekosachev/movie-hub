package models

import (
	"gorm.io/gorm"
)

type Rate struct {
	gorm.Model
	Plot       uint `gorm:"not null"`
	Perfomance uint `gorm:"not null"`
	Sfx        uint `gorm:"not null"`
	UserID     int
	MovieID    int

	User  User  `gorm:"foreignKey:UserID"`
	Movie Movie `gorm:"foreignKey:MovieID"`
}
