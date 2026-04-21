package handlers

import (
	"github.com/ekosachev/movie-hub/internal/services"
	"log/slog"
)

type UserHandler struct {
	Service *services.UserService
	Logger  *slog.Logger
}

func NewUserHandler(service services.UserService, logger *slog.Logger) *UserHandler {
	return &UserHandler{
		Service: &service,
		Logger:  logger,
	}
}
