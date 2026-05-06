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
		}
	}
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
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
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: userPerms})
}
