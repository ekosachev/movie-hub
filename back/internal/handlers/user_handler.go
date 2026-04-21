package handlers

import (
	"log/slog"

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
	_ = router.Group("/users")
	{
		// register routes here
	}
}
