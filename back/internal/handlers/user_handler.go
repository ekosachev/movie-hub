package handlers

import (
	"log/slog"
	"net/http"

	"github.com/ekosachev/movie-hub/internal/dto"
	"github.com/ekosachev/movie-hub/internal/models"
	"github.com/ekosachev/movie-hub/internal/services"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	Service *services.UserService
	Logger  *slog.Logger
}

func NewUserHandler(service *services.UserService, logger *slog.Logger) *UserHandler {
	return &UserHandler{
		Service: service,
		Logger:  logger,
	}
}

func (h *UserHandler) RegisterRoutes(router *gin.RouterGroup) {
	group := router.Group("/users")
	{
		// register routes here
		group.POST("/", h.Register)
	}
}

func (h *UserHandler) Register(c *gin.Context) {
	var req dto.CreateUserRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		h.Logger.Warn("Invalid request payload for restration", slog.String("error", err.Error()))
		sendError(c, http.StatusBadRequest, "Invalid data format: "+err.Error())
		return
	}

	user := &models.User{
		Username:     req.Username,
		EmailAddress: req.Email,
		PasswordHash: req.Password,
	}

	if err := h.Service.Create(c, user); err != nil {
		h.Logger.Error("Failed to create user", slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not create user")
		return
	}

	resp := dto.UserResponse{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.EmailAddress,
		RoleID:   user.RoleID,
	}

	h.Logger.Info("User registered successfully", slog.Uint64("user_id", uint64(user.ID)))
	c.JSON(http.StatusCreated, dto.APIResponse{Success: true, Data: resp})
}
