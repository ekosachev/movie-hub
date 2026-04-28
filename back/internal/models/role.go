package models

import "gorm.io/gorm"

type Role struct {
	gorm.Model
	CanCreateMovies   bool
	CanBanUsers       bool
	CanRemoveComments bool
	Users             []User
}

func (r *Role) GeneratePermissionList() []string {
	permissions := []string{}

	if r.CanCreateMovies {
		permissions = append(permissions, "create_movies")
	}
	if r.CanBanUsers {
		permissions = append(permissions, "ban_users")
	}
	if r.CanRemoveComments {
		permissions = append(permissions, "remove_comments")
	}

	return permissions
}
