package handlers

import (
	"log/slog"
	"net/http"

	"github.com/ekosachev/movie-hub/internal/dto"
	"github.com/ekosachev/movie-hub/internal/models"
	"github.com/ekosachev/movie-hub/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type UserHandler struct {
	service services.BaseService[models.User]
	logger  slog.Logger
}

func NewUserHandler(service services.BaseService[models.User], logger slog.Logger) *UserHandler {
	return &UserHandler{
		service: service,
		logger:  logger,
	}
}

func (h *UserHandler) RegisterRoutes(router *gin.RouterGroup, path string) {

}

func (h *UserHandler) CreateUser(c *gin.Context) {
	var req dto.CreateUserRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user := &models.User{
		Model:        gorm.Model{},
		EmailAddress: req.EmailAddress,
		Username:     req.Username,
		PasswordHash: req.Password,
	}

	if err := h.service.Create(c, user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		h.logger.Error("Error when creating a user", "error", err.Error())
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User Created"})
}
