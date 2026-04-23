package dto

type CreateUserRequest struct {
	Username string `json:"username" binding:"required,min=3,max=32"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

type UpdateUserRequest struct {
	Username *string `json:"username" binding:"omitempty,min=3,max=32"`
	Email    *string `json:"email" binding:"omitempty,email"`
}

type UserResponse struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	RoleID   *uint  `json:"role_id,omitempty"`
}
