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

type RateHandler struct {
	Service *services.RateService
	Logger  *slog.Logger
}

func NewRateHandler(service *services.RateService, logger *slog.Logger) *RateHandler {
	return &RateHandler{
		Service: service,
		Logger:  logger,
	}
}

func (h *RateHandler) RegisterRoutes(router *gin.RouterGroup) {
	group := router.Group("/rates")
	{
		group.GET("/:id", h.GetByID)

		protectedGroup := group.Group("/").Use(middleware.AuthMiddleware())
		{
			protectedGroup.POST("/", h.Create)
			protectedGroup.PATCH("/:id", h.Update)
			protectedGroup.DELETE("/:id", h.Delete)
		}
	}
}

func (h *RateHandler) Create(c *gin.Context) {
	var req dto.CreateRateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.Logger.Warn("Invalid request payload for rate creation", slog.String("error", err.Error()))
		sendError(c, http.StatusBadRequest, "Invalid data format: "+err.Error())
		return
	}
	userID := int(c.MustGet("userID").(float64))
	rate := &models.Rate{
		Plot:       req.Plot,
		Perfomance: req.Perfomance,
		Sfx:        req.Sfx,
		MovieID:    req.MovieID,
		UserID:     userID,
	}
	if err := h.Service.Create(c, rate); err != nil {
		h.Logger.Error("Failed to create rate", slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not create rate")
		return
	}
	resp := dto.RateResponse{
		ID:         rate.ID,
		Plot:       rate.Plot,
		Perfomance: rate.Perfomance,
		Sfx:        rate.Sfx,
		MovieID:    rate.MovieID,
		UserID:     rate.UserID,
	}

	h.Logger.Info("Rate created successfully", slog.Uint64("rate_id", uint64(rate.ID)))
	c.JSON(http.StatusCreated, dto.APIResponse{Success: true, Data: resp})
}

func (h *RateHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid rate ID")
		return
	}
	rate, err := h.Service.GetByID(c, uint(id))
	if err != nil {
		h.Logger.Error("Failed to get rate by id", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not get rate")
		return
	}
	if rate == nil {
		h.Logger.Warn("Rate not found", slog.Int("id", id))
		sendError(c, http.StatusNotFound, "Rate not found")
		return
	}
	resp := dto.RateResponse{
		ID:         rate.ID,
		Plot:       rate.Plot,
		Perfomance: rate.Perfomance,
		Sfx:        rate.Sfx,
		MovieID:    rate.MovieID,
		UserID:     rate.UserID,
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: resp})
}

func (h *RateHandler) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid rate ID")
		return
	}
	var req dto.UpdateRateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.Logger.Warn("Invalid request payload for rate update", slog.String("error", err.Error()))
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}
	rate, err := h.Service.GetByID(c, uint(id))
	if err != nil {
		h.Logger.Error("Failed to get rate by id", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Internal server error")
		return
	}
	if rate == nil {
		h.Logger.Warn("Rate not found", slog.Int("id", id))
		sendError(c, http.StatusNotFound, "Rate not found")
		return
	}
	userID := int(c.MustGet("userID").(float64))
	if rate.UserID != userID {
		h.Logger.Warn("Access denied: not the owner", slog.Int("user_id", userID), slog.Int("rate_id", id))
		sendError(c, http.StatusForbidden, "You can only update your own rates")
		return
	}

	if req.Plot != nil {
		rate.Plot = *req.Plot
	}
	if req.Perfomance != nil {
		rate.Perfomance = *req.Perfomance
	}
	if req.Sfx != nil {
		rate.Sfx = *req.Sfx
	}

	if _, err := h.Service.Update(c, &models.Rate{Model: gorm.Model{ID: uint(id)}}, *rate); err != nil {
		h.Logger.Error("Failed to update rate", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not update rate")
		return
	}

	resp := dto.RateResponse{
		ID:         rate.ID,
		Plot:       rate.Plot,
		Perfomance: rate.Perfomance,
		Sfx:        rate.Sfx,
		MovieID:    rate.MovieID,
		UserID:     rate.UserID,
	}
	h.Logger.Info("Rate updated", slog.Uint64("rate_id", uint64(rate.ID)))
	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: resp})
}

func (h *RateHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid rate ID")
		return
	}
	rate, err := h.Service.GetByID(c, uint(id))
	if err != nil {
		h.Logger.Error("Failed to get rate by id", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Internal server error")
		return
	}
	if rate == nil {
		h.Logger.Warn("Rate not found", slog.Int("id", id))
		sendError(c, http.StatusNotFound, "Rate not found")
		return
	}
	userID := int(c.MustGet("userID").(float64))
	if rate.UserID != userID {
		h.Logger.Warn("Access denied: not the owner", slog.Int("user_id", userID), slog.Int("rate_id", id))
		sendError(c, http.StatusForbidden, "You can only delete your own rates")
		return
	}
	if _, err := h.Service.Delete(c, &models.Rate{Model: gorm.Model{ID: uint(id)}}); err != nil {
		h.Logger.Error("Failed to delete a rate", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not delete rate")
		return
	}
	h.Logger.Info("Rate deleted", slog.Int("rate_id", id))
	c.JSON(http.StatusOK, dto.APIResponse{Success: true})
}
