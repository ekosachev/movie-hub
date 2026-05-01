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
)

type MovieCastHandler struct {
	Service *services.MoveCastService
	Logger  *slog.Logger
}

func NewMovieCastHandler(service *services.MoveCastService, logger *slog.Logger) *MovieCastHandler {
	return &MovieCastHandler{
		Service: service,
		Logger:  logger,
	}
}

func (h *MovieCastHandler) RegisterRoutes(router *gin.RouterGroup) {
	group := router.Group("/movie-casts")
	{
		group.GET("/:movie_id/:cast_id", h.GetByIDs)

		protectedGroup := group.Group("/").Use(middleware.AuthMiddleware(), middleware.PermissionMiddleware("manage_cast"))
		{
			protectedGroup.POST("/", h.Create)
			protectedGroup.PATCH("/:movie_id/:cast_id", h.Update)
			protectedGroup.DELETE("/:movie_id/:cast_id", h.Delete)
		}
	}
}

func (h *MovieCastHandler) Create(c *gin.Context) {
	var req dto.CreateMovieCastRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.Logger.Warn("Invalid request payload for movie_cast creation", slog.String("error", err.Error()))
		sendError(c, http.StatusBadRequest, "Invalid data format: "+err.Error())
		return
	}
	movieCast := &models.MovieCast{
		MovieID: req.MovieID,
		CastID:  req.CastID,
		Role:    req.Role,
	}

	if err := h.Service.Create(c, movieCast); err != nil {
		h.Logger.Error("Failed to create movie_cast", slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not create movie_cast relation")
		return
	}
	resp := dto.MovieCastResponse{
		MovieID: movieCast.MovieID,
		CastID:  movieCast.CastID,
		Role:    movieCast.Role,
	}
	h.Logger.Info("MovieCast relation created successfully", slog.Int("movie_id", movieCast.MovieID), slog.Int("cast_id", movieCast.CastID))
	c.JSON(http.StatusCreated, dto.APIResponse{Success: true, Data: resp})
}

func (h *MovieCastHandler) GetByIDs(c *gin.Context) {
	movieID, err1 := strconv.Atoi(c.Param("movie_id"))
	castID, err2 := strconv.Atoi(c.Param("cast_id"))
	if err1 != nil || err2 != nil || movieID <= 0 || castID <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid movie_id or cast_id")
		return
	}
	filter := &models.MovieCast{MovieID: movieID, CastID: castID}
	results, err := h.Service.Query(c, filter)

	if err != nil {
		h.Logger.Error("Failed to get movie_cast", slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not get movie_cast")
		return
	}

	if len(results) == 0 {
		h.Logger.Warn("MovieCast relation not found", slog.Int("movie_id", movieID), slog.Int("cast_id", castID))
		sendError(c, http.StatusNotFound, "MovieCast relation not found")
		return
	}
	movieCast := results[0]
	resp := dto.MovieCastResponse{
		MovieID: movieCast.MovieID,
		CastID:  movieCast.CastID,
		Role:    movieCast.Role,
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: resp})
}

func (h *MovieCastHandler) Update(c *gin.Context) {
	movieID, err1 := strconv.Atoi(c.Param("movie_id"))
	castID, err2 := strconv.Atoi(c.Param("cast_id"))
	if err1 != nil || err2 != nil || movieID <= 0 || castID <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid movie_id or cast_id")
		return
	}
	var req dto.UpdateMovieCastRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.Logger.Warn("Invalid request payload for movie_cast update", slog.String("error", err.Error()))
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	filter := &models.MovieCast{MovieID: movieID, CastID: castID}
	results, err := h.Service.Query(c, filter)
	if err != nil {
		h.Logger.Error("Failed to get movie_cast for update", slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Internal server error")
		return
	}
	if len(results) == 0 {
		h.Logger.Warn("MovieCast relation not found", slog.Int("movie_id", movieID), slog.Int("cast_id", castID))
		sendError(c, http.StatusNotFound, "MovieCast relation not found")
		return
	}

	movieCast := results[0]
	if req.Role != nil {
		movieCast.Role = *req.Role
	}
	if _, err := h.Service.Update(c, filter, movieCast); err != nil {
		h.Logger.Error("Failed to update movie_cast", slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not update movie_cast")
		return
	}
	resp := dto.MovieCastResponse{
		MovieID: movieCast.MovieID,
		CastID:  movieCast.CastID,
		Role:    movieCast.Role,
	}

	h.Logger.Info("MovieCast updated", slog.Int("movie_id", movieID), slog.Int("cast_id", castID))
	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: resp})
}

func (h *MovieCastHandler) Delete(c *gin.Context) {
	movieID, err1 := strconv.Atoi(c.Param("movie_id"))
	castID, err2 := strconv.Atoi(c.Param("cast_id"))

	if err1 != nil || err2 != nil || movieID <= 0 || castID <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid movie_id or cast_id")
		return
	}
	filter := &models.MovieCast{MovieID: movieID, CastID: castID}
	results, err := h.Service.Query(c, filter)
	if err != nil {
		h.Logger.Error("Failed to get movie_cast for deletion", slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Internal server error")
		return
	}
	if len(results) == 0 {
		h.Logger.Warn("MovieCast relation not found", slog.Int("movie_id", movieID), slog.Int("cast_id", castID))
		sendError(c, http.StatusNotFound, "MovieCast relation not found")
		return
	}

	if _, err := h.Service.Delete(c, filter); err != nil {
		h.Logger.Error("Failed to delete movie_cast", slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not delete movie_cast")
		return
	}

	h.Logger.Info("MovieCast deleted", slog.Int("movie_id", movieID), slog.Int("cast_id", castID))
	c.JSON(http.StatusOK, dto.APIResponse{Success: true})
}
