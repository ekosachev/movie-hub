package handlers

import (
	"github.com/ekosachev/movie-hub/internal/services"
	"log/slog"
)

type UserHandler struct {
	service *services.UserService
	logger  *slog.Logger
}
