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

type ReactionHandler struct {
	Service *services.ReactionService
	Logger  *slog.Logger
}

func NewReactionHandler(service *services.ReactionService, logger *slog.Logger) *ReactionHandler {
	return &ReactionHandler{
		Service: service,
		Logger:  logger,
	}
}

func (h *ReactionHandler) RegisterRoutes(router *gin.RouterGroup) {
	group := router.Group("/reactions")
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

func (h *ReactionHandler) Create(c *gin.Context) {
	var req dto.CreateReactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.Logger.Warn("Invalid request payload for reaction creation", slog.String("error", err.Error()))
		sendError(c, http.StatusBadRequest, "Invalid data format: "+err.Error())
		return
	}
	userID := int(c.MustGet("userID").(float64))
	reaction := &models.Reaction{
		IsPositive: *req.IsPositive,
		CommentID:  req.CommentID,
		UserID:     userID,
	}
	if err := h.Service.Create(c, reaction); err != nil {
		h.Logger.Error("Failed to create reaction", slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not create reaction")
		return
	}
	resp := dto.ReactionResponse{
		ID:         reaction.ID,
		IsPositive: reaction.IsPositive,
		UserID:     reaction.UserID,
		CommentID:  reaction.CommentID,
	}
	h.Logger.Info("Reaction created successfully", slog.Uint64("reaction_id", uint64(reaction.ID)))
	c.JSON(http.StatusCreated, dto.APIResponse{Success: true, Data: resp})
}

func (h *ReactionHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid reaction ID")
		return
	}
	reaction, err := h.Service.GetByID(c, uint(id))
	if err != nil {
		h.Logger.Error("Failed to get reaction by id", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not get reaction")
		return
	}
	if reaction == nil {
		h.Logger.Warn("Reaction not found", slog.Int("id", id))
		sendError(c, http.StatusNotFound, "Reaction not found")
		return
	}
	resp := dto.ReactionResponse{
		ID:         reaction.ID,
		IsPositive: reaction.IsPositive,
		UserID:     reaction.UserID,
		CommentID:  reaction.CommentID,
	}
	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: resp})
}

func (h *ReactionHandler) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid reaction ID")
		return
	}
	var req dto.UpdateReactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.Logger.Warn("Invalid request payload for reaction update", slog.String("error", err.Error()))
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}
	reaction, err := h.Service.GetByID(c, uint(id))
	if err != nil {
		h.Logger.Error("Failed to get reaction by id", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Internal server error")
		return
	}
	if reaction == nil {
		h.Logger.Warn("Reaction not found", slog.Int("id", id))
		sendError(c, http.StatusNotFound, "Reaction not found")
		return
	}
	userID := int(c.MustGet("userID").(float64))
	if reaction.UserID != userID {
		h.Logger.Warn("Access denied: not the owner", slog.Int("user_id", userID), slog.Int("reaction_id", id))
		sendError(c, http.StatusForbidden, "You can only update your own reactions")
		return
	}
	if req.IsPositive != nil {
		reaction.IsPositive = *req.IsPositive
	}
	if _, err := h.Service.Update(c, &models.Reaction{Model: gorm.Model{ID: uint(id)}}, *reaction); err != nil {
		h.Logger.Error("Failed to update reaction", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not update reaction")
		return
	}
	resp := dto.ReactionResponse{
		ID:         reaction.ID,
		IsPositive: reaction.IsPositive,
		UserID:     reaction.UserID,
		CommentID:  reaction.CommentID,
	}

	h.Logger.Info("Reaction updated", slog.Uint64("reaction_id", uint64(reaction.ID)))
	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: resp})
}

func (h *ReactionHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid reaction ID")
		return
	}
	reaction, err := h.Service.GetByID(c, uint(id))
	if err != nil {
		h.Logger.Error("Failed to get reaction for deletion", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Internal server error")
		return
	}
	if reaction == nil {
		h.Logger.Warn("Reaction not found", slog.Int("id", id))
		sendError(c, http.StatusNotFound, "Reaction not found")
		return
	}
	userID := int(c.MustGet("userID").(float64))
	if reaction.UserID != userID {
		h.Logger.Warn("Access denied for reaction deletion", slog.Int("user_id", userID), slog.Int("reaction_id", id))
		sendError(c, http.StatusForbidden, "You can only delete your own reactions")
		return
	}
	if _, err := h.Service.Delete(c, &models.Reaction{Model: gorm.Model{ID: uint(id)}}); err != nil {
		h.Logger.Error("Failed to delete reaction", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not delete reaction")
		return
	}
	h.Logger.Info("Reaction deleted", slog.Int("reaction_id", id))
	c.JSON(http.StatusOK, dto.APIResponse{Success: true})
}
