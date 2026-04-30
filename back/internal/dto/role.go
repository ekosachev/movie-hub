package dto

type CreateRoleRequest struct {
	CanDeleteUsers  bool `json:"can_delete_users" binding:"required"`
	CanUpdateMovies bool `json:"can_update_movies" binding:"required"`
	CanUpdateRoles  bool `json:"can_update_roles" binding:"required"`
	CanUpdateTags   bool `json:"can_update_tags" binding:"required"`
}

type RoleResponse struct {
	ID              uint `json:"id"`
	CanDeleteUsers  bool `json:"can_delete_users"`
	CanUpdateMovies bool `json:"can_update_movies"`
	CanUpdateRoles  bool `json:"can_update_roles"`
	CanUpdateTags   bool `json:"can_update_tags"`
}

type UpdateRoleRequest struct {
	CanDeleteUsers  *bool `json:"can_delete_users" binding:"omitempty"`
	CanUpdateMovies *bool `json:"can_update_movies" binding:"omitempty"`
	CanUpdateRoles  *bool `json:"can_update_roles" binding:"omitempty"`
	CanUpdateTags   *bool `json:"can_update_tags" binding:"omitempty"`
}
