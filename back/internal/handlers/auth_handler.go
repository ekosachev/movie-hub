package handlers

import (
	"log/slog"
	"net/http"

	"github.com/ekosachev/movie-hub/internal/dto"
	"github.com/ekosachev/movie-hub/internal/middleware"
	"github.com/ekosachev/movie-hub/internal/services"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	Service *services.AuthService
	Logger  *slog.Logger
}

func NewAuthHandler(service *services.AuthService, logger *slog.Logger) *AuthHandler {
	return &AuthHandler{
		Service: service,
		Logger:  logger,
	}
}

func (h *AuthHandler) RegisterRoutes(router *gin.RouterGroup) {
	group := router.Group("/auth")
	{
		// register routes here
		group.POST("/login", h.Login)

		protectedGroup := group.Group("/").Use(middleware.AuthMiddleware())
		{
			protectedGroup.GET("/permissions", h.GetPermissions)
			protectedGroup.GET("/me", h.GetCurrentUser)
		}
	}
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	token, err := h.Service.Login(c, req.Email, req.Password)

	if err != nil {
		sendError(c, http.StatusInternalServerError, "Internal Server Error")
		h.Logger.Error("Failed to authenticate user", slog.String("error", err.Error()))
		return
	}

	if token == "" {
		sendError(c, http.StatusUnauthorized, "Incorrect email or password")
		return
	}

	c.JSON(http.StatusOK, dto.LoginResponse{Token: token})
}

func (h *AuthHandler) GetPermissions(c *gin.Context) {
	userPerms, exists := c.Get("userPermissions")

	if !exists {
		sendError(c, http.StatusUnauthorized, "Permissions not found")
		return
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: userPerms})
}

func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
	userID, exists := c.Get("userID")

	if !exists {
		sendError(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	user, err := h.Service.UserRepo.GetByID(c, uint(userID.(float64)))

	if err != nil {
		sendError(c, http.StatusInternalServerError, "Internal server error")
		h.Logger.Error("Failed to get user by ID", slog.String("error", err.Error()))
		return
	}

	if user == nil {
		sendError(c, http.StatusNotFound, "User not found")
		h.Logger.Error("Failed to find current user", slog.Any("id", userID))
		return
	}

	c.JSON(http.StatusOK, dto.UserResponse{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.EmailAddress,
		RoleID:   user.RoleID,
	})
}
