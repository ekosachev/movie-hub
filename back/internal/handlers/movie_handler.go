package handlers

import (
	"log/slog"
	"net/http"
	"strconv"
	"time"

	"github.com/ekosachev/movie-hub/internal/dto"
	"github.com/ekosachev/movie-hub/internal/middleware"
	"github.com/ekosachev/movie-hub/internal/models"
	"github.com/ekosachev/movie-hub/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type MovieHanlder struct {
	Service        *services.MovieService
	CommentService *services.CommentService
	RateService    *services.RateService
	Logger         *slog.Logger
}

func NewMovieHandler(service *services.MovieService, commentService *services.CommentService, rateService *services.RateService, logger *slog.Logger) *MovieHanlder {
	return &MovieHanlder{
		Service:        service,
		CommentService: commentService,
		RateService:    rateService,
		Logger:         logger,
	}
}

func (h *MovieHanlder) RegisterRoutes(router *gin.RouterGroup) {
	group := router.Group("/movies")
	{
		group.GET("/:id", h.GetByID)
		group.GET("/:id/comments", h.GetAllComments)
		group.GET("/:id/rates", h.GetAllRates)
		group.GET("/search", h.FindWithFilters)

		protectedGroup := group.Group("/").Use(middleware.AuthMiddleware()).Use(middleware.PermissionMiddleware("update_movies"))
		{
			protectedGroup.POST("/", h.Create)
			protectedGroup.PATCH("/:id", h.Update)
			protectedGroup.DELETE("/:id", h.Delete)
		}
	}
}

func (h *MovieHanlder) Create(c *gin.Context) {
	var req dto.CreateMovieRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		h.Logger.Warn("Invalid request payload for creating a movie", slog.String("error", err.Error()))
		sendError(c, http.StatusBadRequest, "Invalid data format: "+err.Error())
		return
	}

	releaseDate, err := time.Parse(time.DateTime, req.ReleaseDate)

	if err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	movie := &models.Movie{
		Title:       req.Title,
		Description: req.Description,
		ReleaseDate: releaseDate,
	}

	if err := h.Service.Create(c, movie); err != nil {
		h.Logger.Error("Failed to create movie", slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not create role")
		return
	}

	resp := dto.MovieResponse{
		ID:          movie.ID,
		Title:       movie.Title,
		Description: movie.Description,
		ReleaseDate: movie.ReleaseDate.Format(time.DateTime),
	}

	h.Logger.Info("Movie created successfully", slog.Uint64("movie_id", uint64(movie.ID)))
	c.JSON(http.StatusCreated, dto.APIResponse{Success: true, Data: resp})
}

func (h *MovieHanlder) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)

	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid movie ID")
		return
	}

	movie, err := h.Service.GetByID(c, uint(id))

	if err != nil {
		h.Logger.Error("Failed to movie role by id", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not get movie")
		return
	}

	if movie == nil {
		h.Logger.Warn("Movie not found", slog.Int("id", id))
		sendError(c, http.StatusNotFound, "Movie not found")
		return
	}

	resp := dto.MovieResponse{
		ID:          movie.ID,
		Title:       movie.Title,
		Description: movie.Description,
		ReleaseDate: movie.ReleaseDate.Format(time.DateTime),
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: resp})
}

func (h *MovieHanlder) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)

	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid movie ID")
		return
	}

	var req dto.UpdateMovieRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		h.Logger.Warn("Invalid request payload for movie update", slog.String("error", err.Error()))
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	movie, err := h.Service.GetByID(c, uint(id))

	if err != nil {
		h.Logger.Error("Failed to get movie by id", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Internal server error")
		return
	}

	if movie == nil {
		h.Logger.Warn("Movie not found", slog.Int("id", id))
		sendError(c, http.StatusNotFound, "Movie not found")
		return
	}

	if req.Title != nil {
		movie.Title = *req.Title
	}

	if req.Description != nil {
		movie.Description = *req.Description
	}

	if req.ReleaseDate != nil {
		releaseDate, err := time.Parse(time.DateTime, *req.ReleaseDate)
		if err != nil {
			sendError(c, http.StatusBadRequest, err.Error())
			return
		}
		movie.ReleaseDate = releaseDate
	}

	if _, err := h.Service.Update(c, &models.Movie{Model: gorm.Model{ID: uint(id)}}, *movie); err != nil {
		h.Logger.Error("Failed to update movie", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not update movie")
		return
	}

	resp := dto.MovieResponse{
		ID:          movie.ID,
		Title:       movie.Title,
		Description: movie.Description,
		ReleaseDate: movie.ReleaseDate.Format(time.DateTime),
	}

	h.Logger.Info("Movie updated", slog.Uint64("movie_id", uint64(movie.ID)))
	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: resp})
}

func (h *MovieHanlder) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid movie ID")
		return
	}

	if _, err := h.Service.Delete(c, &models.Movie{Model: gorm.Model{ID: uint(id)}}); err != nil {
		h.Logger.Error("Failed to delete a movie", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not delete movie")
		return
	}

	h.Logger.Info("Movie deleted", slog.Int("movie_id", id))
	c.JSON(http.StatusOK, dto.APIResponse{Success: true})
}

func (h *MovieHanlder) FindWithFilters(c *gin.Context) {
	var filter *dto.MovieFilterRequest

	if err := c.ShouldBindQuery(filter); err != nil {
		sendError(c, http.StatusBadRequest, "Invalid filter parameters: "+err.Error())
		return
	}

	movies, err := h.Service.FindWithFilters(c, *filter)

	if err != nil {
		h.Logger.Error("Failed to search movies: ", slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Search failed")
		return
	}

	resp := []dto.MovieResponse{}

	for _, movie := range movies {
		resp = append(resp, dto.MovieResponse{
			ID:          movie.ID,
			Title:       movie.Title,
			Description: movie.Description,
			ReleaseDate: movie.ReleaseDate.Format(time.DateOnly),
		})
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: resp})
}

func (h *MovieHanlder) GetAllComments(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)

	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid movie ID")
		return
	}

	comments, err := h.CommentService.GetByMovieID(uint(id))
	if err != nil {
		h.Logger.Error("Failed to fetch comments", "movie_id", id, "error", err)
		sendError(c, http.StatusInternalServerError, "Internal server error")
		return
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: comments})

}

func (h *MovieHanlder) GetAllRates(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)

	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid movie ID")
		return
	}

	rates, err := h.RateService.GetByMovieID(uint(id))
	if err != nil {
		h.Logger.Error("Failed to fetch rates", "movie_id", id, "error", err)
		sendError(c, http.StatusInternalServerError, "Internal server error")
		return
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: rates})

}
