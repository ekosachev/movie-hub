package handlers

import (
	"log/slog"
	"net/http"
	"strconv"

	"github.com/ekosachev/movie-hub/internal/dto"
	"github.com/ekosachev/movie-hub/internal/middleware"
	"github.com/ekosachev/movie-hub/internal/models"
	"github.com/ekosachev/movie-hub/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
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
		protectedGroup := group.Group("/").Use(middleware.AuthMiddleware())
		{
			protectedGroup.GET("/:id", h.GetByID)
			protectedGroup.PATCH("/:id", h.Update)
			protectedGroup.DELETE("/:id", h.Delete)
		}
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

func (h *UserHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)

	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	user, err := h.Service.GetByID(c, uint(id))

	if err != nil {
		h.Logger.Error("Failed to get user by id", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not get user")
		return
	}

	if user == nil {
		h.Logger.Warn("User not found", slog.Int("id", id))
		sendError(c, http.StatusNotFound, "User not found")
		return
	}

	resp := dto.UserResponse{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.EmailAddress,
		RoleID:   user.RoleID,
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: resp})
}

func (h *UserHandler) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)

	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	var req dto.UpdateUserRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		h.Logger.Warn("Invalid request payload for user update", slog.String("error", err.Error()))
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	user, err := h.Service.GetByID(c, uint(id))

	if err != nil {
		h.Logger.Error("Failed to get user by id", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Internal server error")
		return
	}

	if user == nil {
		h.Logger.Warn("User not found", slog.Int("id", id))
		sendError(c, http.StatusNotFound, "User not found")
		return
	}

	if req.Username != nil {
		user.Username = *req.Username
	}

	if req.Email != nil {
		user.EmailAddress = *req.Email
	}

	if _, err := h.Service.Update(c, &models.User{Model: gorm.Model{ID: uint(id)}}, *user); err != nil {
		h.Logger.Error("Failed to update user", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not update user")
		return
	}

	resp := dto.UserResponse{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.EmailAddress,
		RoleID:   user.RoleID,
	}

	h.Logger.Info("User updated", slog.Uint64("user_id", uint64(user.ID)))
	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: resp})
}

func (h *UserHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	if _, err := h.Service.Delete(c, &models.User{Model: gorm.Model{ID: uint(id)}}); err != nil {
		h.Logger.Error("Failed to delete a user", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not delete user")
		return
	}

	h.Logger.Info("User deleted", slog.Int("user_id", id))
	c.JSON(http.StatusOK, dto.APIResponse{Success: true})
}
