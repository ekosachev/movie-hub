package dto

type CreateUserRequest struct {
	Username     string `json:"username" binding:"required,alphaunicode"`
	EmailAddress string `json:"email_address" binding:"required,email"`
	Password     string `json:"password" binding:"required,alphanumunicode"`
}
