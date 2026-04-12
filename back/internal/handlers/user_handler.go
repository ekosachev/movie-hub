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
	service services.UserService
	logger  slog.Logger
}

func NewUserHandler(service services.UserService, logger slog.Logger) *UserHandler {
	return &UserHandler{
		service: service,
		logger:  logger,
	}
}

func (h *UserHandler) RegisterRoutes(router *gin.RouterGroup, path string) {
	group := router.Group(path)

	{
		group.POST("/create", h.CreateUser)
	}
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
