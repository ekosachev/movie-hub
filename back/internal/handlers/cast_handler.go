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

type CastHandler struct {
	Service *services.CastService
	Logger  *slog.Logger
}

func NewCastHandler(service *services.CastService, logger *slog.Logger) *CastHandler {
	return &CastHandler{
		Service: service,
		Logger:  logger,
	}
}

func (h *CastHandler) RegisterRoutes(router *gin.RouterGroup) {
	group := router.Group("/casts")
	{
		group.GET("/:id", h.GetByID)

		protectedGroup := group.Group("/").Use(middleware.AuthMiddleware(), middleware.PermissionMiddleware("manage_cast"))
		{
			protectedGroup.POST("/", h.Create)
			protectedGroup.PATCH("/:id", h.Update)
			protectedGroup.DELETE("/:id", h.Delete)
		}
	}
}

func (h *CastHandler) Create(c *gin.Context) {
	var req dto.CreateCastRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		h.Logger.Warn("Invalid request payload for cast creation", slog.String("error", err.Error()))
		sendError(c, http.StatusBadRequest, "Invalid data format: "+err.Error())
		return
	}
	cast := &models.Cast{
		Name:      req.Name,
		Biography: req.Biography,
		PhotoUrl:  req.PhotoUrl,
	}
	if err := h.Service.Create(c, cast); err != nil {
		h.Logger.Error("Failed to create cast", slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not create cast")
		return
	}
	resp := dto.CastResponse{
		ID:        cast.ID,
		Name:      cast.Name,
		Biography: cast.Biography,
		PhotoUrl:  cast.PhotoUrl,
	}
	h.Logger.Info("Cast created successfully", slog.Uint64("cast_id", uint64(cast.ID)))
	c.JSON(http.StatusCreated, dto.APIResponse{Success: true, Data: resp})
}

func (h *CastHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)

	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid cast ID")
		return
	}
	cast, err := h.Service.GetByID(c, uint(id))
	if err != nil {
		h.Logger.Error("Failed to get cast by id", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not get cast")
		return
	}
	if cast == nil {
		h.Logger.Warn("Cast not found", slog.Int("id", id))
		sendError(c, http.StatusNotFound, "Cast not found")
		return
	}
	resp := dto.CastResponse{
		ID:        cast.ID,
		Name:      cast.Name,
		Biography: cast.Biography,
		PhotoUrl:  cast.PhotoUrl,
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: resp})
}

func (h *CastHandler) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)

	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid cast ID")
		return
	}
	var req dto.UpdateCastRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.Logger.Warn("Invalid request payload for cast update", slog.String("error", err.Error()))
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}
	cast, err := h.Service.GetByID(c, uint(id))
	if err != nil {
		h.Logger.Error("Failed to get cast by id", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Internal server error")
		return
	}
	if cast == nil {
		h.Logger.Warn("Cast not found", slog.Int("id", id))
		sendError(c, http.StatusNotFound, "Cast not found")
		return
	}
	if req.Name != nil {
		cast.Name = *req.Name
	}
	if req.Biography != nil {
		cast.Biography = *req.Biography
	}
	if req.PhotoUrl != nil {
		cast.PhotoUrl = *req.PhotoUrl
	}
	if _, err := h.Service.Update(c, &models.Cast{Model: gorm.Model{ID: uint(id)}}, *cast); err != nil {
		h.Logger.Error("Failed to update cast", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not update cast")
		return
	}

	resp := dto.CastResponse{
		ID:        cast.ID,
		Name:      cast.Name,
		Biography: cast.Biography,
		PhotoUrl:  cast.PhotoUrl,
	}

	h.Logger.Info("Cast updated", slog.Uint64("cast_id", uint64(cast.ID)))
	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: resp})
}

func (h *CastHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid cast ID")
		return
	}
	cast, err := h.Service.GetByID(c, uint(id))
	if err != nil {
		h.Logger.Error("Failed to get cast for deletion", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Internal server error")
		return
	}
	if cast == nil {
		h.Logger.Warn("Cast not found", slog.Int("id", id))
		sendError(c, http.StatusNotFound, "Cast not found")
		return
	}
	if _, err := h.Service.Delete(c, &models.Cast{Model: gorm.Model{ID: uint(id)}}); err != nil {
		h.Logger.Error("Failed to delete cast", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not delete cast")
		return
	}

	h.Logger.Info("Cast deleted", slog.Int("cast_id", id))
	c.JSON(http.StatusOK, dto.APIResponse{Success: true})
}
