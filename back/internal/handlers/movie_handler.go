package handlers

import (
	"fmt"
	"log/slog"
	"net/http"
	"path/filepath"
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
	TagService     *services.TagService
	CommentService *services.CommentService
	RateService    *services.RateService
	Logger         *slog.Logger
}

func NewMovieHandler(
	service *services.MovieService,
	tagService *services.TagService,
	commentService *services.CommentService,
	rateService *services.RateService,
	logger *slog.Logger,
) *MovieHanlder {
	return &MovieHanlder{
		Service:        service,
		TagService:     tagService,
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
		group.GET("/:id/average-rating", h.GetAverageRating)
		group.GET("/:id/casts", h.GetCasts)

		protectedGroup := group.Group("/").Use(middleware.AuthMiddleware()).Use(middleware.PermissionMiddleware("update_movies"))
		{
			protectedGroup.POST("/", h.Create)
			protectedGroup.PATCH("/:id", h.Update)
			protectedGroup.DELETE("/:id", h.Delete)
			protectedGroup.POST("/:id", h.UploadPoster)
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

	releaseDate, err := time.Parse(time.DateOnly, req.ReleaseDate)

	if err != nil {
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	tags := make([]*models.Tag, len(req.TagIDs))

	for i, v := range req.TagIDs {
		tag, err := h.TagService.GetByID(c, v)
		if err != nil {
			sendError(c, http.StatusInternalServerError, "Internal server error")
			h.Logger.Error("Failed to get tag by id", slog.Uint64("tag_id", uint64(v)), slog.String("error", err.Error()))
			return
		}
		if tag == nil {
			sendError(c, http.StatusNotFound, fmt.Sprintf("Tag with id %v does not exist", v))
			return
		}
		tags[i] = tag
	}

	movie := &models.Movie{
		Title:       req.Title,
		Description: req.Description,
		ReleaseDate: releaseDate,
		Tag:         tags,
	}

	if err := h.Service.Create(c, movie); err != nil {
		h.Logger.Error("Failed to create movie", slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not create movie")
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
		h.Logger.Error("Failed to get movie by id", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Internal server error")
		return
	}

	if movie == nil {
		h.Logger.Warn("Movie not found", slog.Int("id", id))
		sendError(c, http.StatusNotFound, "Movie not found")
		return
	}
	var tags []dto.TagResponse
	for _, t := range movie.Tag {
		tags = append(tags, dto.TagResponse{
			ID:   t.ID,
			Name: t.Name,
		})
	}
	var castResp []dto.MovieActorResponse
	for _, mc := range movie.MovieCasts {
		castResp = append(castResp, dto.MovieActorResponse{
			ID:       mc.Cast.ID,
			Name:     mc.Cast.Name,
			PhotoUrl: mc.Cast.PhotoUrl,
			Role:     mc.Role,
		})
	}
	if tags == nil {
		tags = []dto.TagResponse{}
	}
	if castResp == nil {
		castResp = []dto.MovieActorResponse{}
	}

	resp := dto.MovieResponse{
		ID:          movie.ID,
		Title:       movie.Title,
		Description: movie.Description,
		ReleaseDate: movie.ReleaseDate.Format("2006-01-02"),
		PosterPath:  movie.PosterPath,
		Tags:        tags,
		Cast:        castResp,
	}
	c.JSON(http.StatusOK, dto.APIResponse{
		Success: true,
		Data:    resp,
	})
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

	if len(req.TagIDs) > 0 {
		tags := make([]*models.Tag, len(req.TagIDs))
		for i, v := range req.TagIDs {
			tag, err := h.TagService.GetByID(c, v)
			if err != nil {
				h.Logger.Error("Failed to get tag by id", slog.Uint64("id", uint64(v)), slog.String("error", err.Error()))
				sendError(c, http.StatusInternalServerError, "Internal server error")
				return
			}
			if tag == nil {
				sendError(c, http.StatusNotFound, fmt.Sprintf("Tag with id %v does not exist", v))
				return
			}
			tags[i] = tag
		}

		movie.Tag = tags
	}

	if _, err := h.Service.Update(c, &models.Movie{Model: gorm.Model{ID: uint(id)}}, *movie); err != nil {
		h.Logger.Error("Failed to update movie", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not update movie")
		return
	}

	tags := make([]dto.TagResponse, len(movie.Tag))

	for i, v := range movie.Tag {
		tags[i] = dto.TagResponse{
			ID:   v.ID,
			Name: v.Name,
		}
	}

	resp := dto.MovieResponse{
		ID:          movie.ID,
		Title:       movie.Title,
		Description: movie.Description,
		ReleaseDate: movie.ReleaseDate.Format(time.DateTime),
		Tags:        tags,
		PosterPath:  movie.PosterPath,
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
	var filter dto.MovieFilterRequest

	if err := c.ShouldBindQuery(&filter); err != nil {
		sendError(c, http.StatusBadRequest, "Invalid filter parameters: "+err.Error())
		return
	}

	movies, count, err := h.Service.FindWithFilters(c, filter)

	if err != nil {
		h.Logger.Error("Failed to search movies: ", slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Search failed")
		return
	}

	resp := make([]dto.MovieResponse, len(movies))

	for i, movie := range movies {
		tags := make([]dto.TagResponse, len(movie.Tag))
		for j, tag := range movie.Tag {
			tags[j] = dto.TagResponse{
				ID:   tag.ID,
				Name: tag.Name,
			}
		}

		rating, err := h.RateService.GetAverageRating(c, movie.ID)
		if err != nil {
			h.Logger.Error("Failed to get average rating for movie", slog.String("error", err.Error()))
			sendError(c, http.StatusInternalServerError, "Internal server error")
			return
		}

		resp[i] = dto.MovieResponse{
			ID:            movie.ID,
			Title:         movie.Title,
			Description:   movie.Description,
			ReleaseDate:   movie.ReleaseDate.Format(time.DateOnly),
			Tags:          tags,
			PosterPath:    movie.PosterPath,
			AverageRaging: rating.OverallAverage,
		}
	}

	c.JSON(http.StatusOK, dto.APIResponse{
		Success: true,
		Data: dto.PaginatedResponse{
			Count:  uint(count),
			Offset: filter.Offset,
			Items:  resp,
		},
	})
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

func (h *MovieHanlder) UploadPoster(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)

	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid movie ID")
		return
	}

	file, err := c.FormFile("poster")
	if err != nil {
		sendError(c, http.StatusBadRequest, "No file uploaded")
		return
	}

	filename := "movie_" + strconv.FormatInt(int64(id), 10) + filepath.Ext(file.Filename)
	savePath := filepath.Join("uploads", "posters", filename)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		sendError(c, http.StatusInternalServerError, "Failed to save file")
		return
	}

	fullUrl := "/static/posters/" + filename

	update := models.Movie{PosterPath: fullUrl}
	_, err = h.Service.Update(c, &models.Movie{Model: gorm.Model{ID: uint(id)}}, update)

	if err != nil {
		sendError(c, http.StatusInternalServerError, "Internal server error")
		h.Logger.Error("Failed to update movie", slog.String("error", err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: map[string]string{
		"poster_url": fullUrl,
	}})
}

func (h *MovieHanlder) GetAverageRating(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, dto.APIResponse{Success: false, Error: "Invalid movie ID"})
		return
	}

	result, err := h.RateService.GetAverageRating(c.Request.Context(), uint(id))
	if err != nil {
		h.Logger.Error("Failed to get average rating", "error", err)
		c.JSON(http.StatusInternalServerError, dto.APIResponse{Success: false, Error: "Internal server error"})
		return
	}

	c.JSON(http.StatusOK, dto.APIResponse{
		Success: true,
		Data:    result,
	})
}

func (h *MovieHanlder) GetCasts(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid movie ID")
		return
	}
	casts, err := h.Service.GetMovieCasts(c.Request.Context(), uint(id))
	if err != nil {
		h.Logger.Error("Failed to fetch movie casts", slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Internal server error")
		return
	}
	c.JSON(http.StatusOK, dto.APIResponse{
		Success: true,
		Data:    casts,
	})
}
