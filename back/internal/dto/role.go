package dto

type CreateRoleRequest struct {
	Name                 string `json:"name" binding:"required,min=3"`
	CanDeleteUsers       bool   `json:"can_delete_users" binding:"required"`
	CanUpdateMovies      bool   `json:"can_update_movies" binding:"required"`
	CanUpdateRoles       bool   `json:"can_update_roles" binding:"required"`
	CanUpdateTags        bool   `json:"can_update_tags" binding:"required"`
	CanUpdateCollections bool   `json:"can_update_collections" binding:"required"`
	CanManageCast        bool   `json:"can_manage_cast" binding:"required"`
	CanManageComments    bool   `json:"can_manage_comments" binding:"required"`
}

type RoleResponse struct {
	ID                   uint   `json:"id"`
	Name                 string `json:"name"`
	CanDeleteUsers       bool   `json:"can_delete_users"`
	CanUpdateMovies      bool   `json:"can_update_movies"`
	CanUpdateRoles       bool   `json:"can_update_roles"`
	CanUpdateTags        bool   `json:"can_update_tags"`
	CanUpdateCollections bool   `json:"can_update_collections" binding:"required"`
	CanManageCast        bool   `json:"can_manage_cast" binding:"required"`
	CanManageComments    bool   `json:"can_manage_comments" binding:"required"`
}

type UpdateRoleRequest struct {
	Name                 *string `json:"name" binding:"min=3"`
	CanDeleteUsers       *bool   `json:"can_delete_users" binding:"omitempty"`
	CanUpdateMovies      *bool   `json:"can_update_movies" binding:"omitempty"`
	CanUpdateRoles       *bool   `json:"can_update_roles" binding:"omitempty"`
	CanUpdateTags        *bool   `json:"can_update_tags" binding:"omitempty"`
	CanUpdateCollections *bool   `json:"can_update_collections" binding:"omitempty"`
	CanManageCast        *bool   `json:"can_manage_cast" binding:"omitempty"`
	CanManageComments    *bool   `json:"can_manage_comments" binding:"omitempty"`
}
