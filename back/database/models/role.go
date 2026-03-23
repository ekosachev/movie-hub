package models

import "gorm.io/gorm"

type Role struct {
	gorm.Model
	CanCreateMovies   bool
	CanBanUsers       bool
	CanRemoveComments bool
	Users             []User
}
