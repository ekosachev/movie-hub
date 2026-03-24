package models

import "gorm.io/gorm"

type Comment struct {
	gorm.Model
	Content   string
	Reactions []*Reaction

	ParentCommentID *int
	Parent          *Comment  `gorm:"foreignKey:ParentCommentID"`
	Children        []Comment `gorm:"foreignKey:ParentCommentID"`

	UserID  int
	MovieID int
	User    User  `gorm:"foreignKey:UserID"`
	Movie   Movie `gorm:"foreignKey:MovieID"`
}
