package models

import "gorm.io/gorm"

type Reaction struct {
	gorm.Model
	IsPositive bool
	UserID     int
	CommentID  int

	User    User    `gorm:"foreignKey:UserID"`
	Comment Comment `gorm:"foreignKey:CommentID"`
}
