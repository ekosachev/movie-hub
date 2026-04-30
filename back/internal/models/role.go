package models

import "gorm.io/gorm"

type Role struct {
	gorm.Model
	CanDeleteUsers       bool
	CanUpdateMovies      bool
	CanUpdateRoles       bool
	CanUpdateTags        bool
	CanUpdateCollections bool
	CanManageCast        bool
	CanManageComments    bool
	Users                []User
}

func (r *Role) GeneratePermissionList() []string {
	permissions := []string{}

	if r.CanDeleteUsers {
		permissions = append(permissions, "delete_users")
	}
	if r.CanUpdateMovies {
		permissions = append(permissions, "update_movies")
	}
	if r.CanUpdateRoles {
		permissions = append(permissions, "update_roles")
	}
	if r.CanUpdateTags {
		permissions = append(permissions, "update_tags")
	}
	if r.CanUpdateCollections {
		permissions = append(permissions, "update_collections")
	}
	if r.CanManageCast {
		permissions = append(permissions, "manage_cast")
	}
	if r.CanManageComments {
		permissions = append(permissions, "manage_comments")
	}

	return permissions
}
