package dto

type CreateRoleRequest struct {
	CanCreateMovies   bool `json:"can_create_movies" binding:"required"`
	CanBanUsers       bool `json:"can_ban_users" binding:"required"`
	CanRemoveComments bool `json:"can_remove_comments" binding:"required"`
}

type RoleResponse struct {
	ID                uint `json:"id"`
	CanCreateMovies   bool `json:"can_create_movies" binding:"required"`
	CanBanUsers       bool `json:"can_ban_users" binding:"required"`
	CanRemoveComments bool `json:"can_remove_comments" binding:"required"`
}

type UpdateRoleRequest struct {
	CanCreateMovies   *bool `json:"can_create_movies" binding:"omitempty"`
	CanBanUsers       *bool `json:"can_ban_users" binding:"omitempty"`
	CanRemoveComments *bool `json:"can_remove_comments" binding:"omitempty"`
}
