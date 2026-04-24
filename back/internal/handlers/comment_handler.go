package handlers

import (
	"log/slog"
	"net/http"
	"strconv"

	"github.com/ekosachev/movie-hub/internal/dto"
	"github.com/ekosachev/movie-hub/internal/models"
	"github.com/ekosachev/movie-hub/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CommentHandler struct {
	Service *services.CommentService
	Logger  *slog.Logger
}

func NewCommentHandler(service *services.CommentService, logger *slog.Logger) *CommentHandler {
	return &CommentHandler{
		Service: service,
		Logger:  logger,
	}
}

func (h *CommentHandler) RegisterRoutes(router *gin.RouterGroup) {
	group := router.Group("/comments")
	{
		group.POST("/", h.Create)
		group.GET("/:id", h.GetByID)
		group.PATCH("/:id", h.Update)
		group.DELETE("/:id", h.Delete)
	}
}

func (h *CommentHandler) Create(c *gin.Context) {
	var req dto.CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.Logger.Warn("Invalid request payload for comment creation", slog.String("error", err.Error()))
		sendError(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	comment := &models.Comment{
		Content:         req.Content,
		ParentCommentID: req.ParentCommentID,
		UserID:          req.UserID,
		MovieID:         req.MovieID,
	}
	if err := h.Service.Create(c, comment); err != nil {
		h.Logger.Error("Failed to create comment", slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not create comment")
		return
	}
	resp := dto.CommentResponse{
		ID:              comment.ID,
		Content:         comment.Content,
		ParentCommentID: comment.ParentCommentID,
		UserID:          comment.UserID,
		MovieID:         comment.MovieID,
	}
	h.Logger.Info("Comment created", slog.Uint64("comment_id", uint64(comment.ID)))
	c.JSON(http.StatusCreated, dto.APIResponse{Success: true, Data: resp})
}

func (h *CommentHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		sendError(c, http.StatusBadRequest, "Invalid ID format")
		return
	}
	comments, err := h.Service.Query(c, &models.Comment{Model: gorm.Model{ID: uint(id)}})
	if err != nil {
		h.Logger.Error("Failed to fetch comment", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Error fetching comment")
		return
	}
	if len(comments) == 0 {
		sendError(c, http.StatusNotFound, "Comment not found")
		return
	}
	comment := comments[0]
	resp := dto.CommentResponse{
		ID:              comment.ID,
		Content:         comment.Content,
		ParentCommentID: comment.ParentCommentID,
		UserID:          comment.UserID,
		MovieID:         comment.MovieID,
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: resp})
}

func (h *CommentHandler) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		sendError(c, http.StatusBadRequest, "Invalid ID format")
		return
	}
	var req dto.UpdateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		sendError(c, http.StatusBadRequest, "Invalid update payload")
		return
	}

	existing, err := h.Service.Query(c, &models.Comment{Model: gorm.Model{ID: uint(id)}})
	if err != nil || len(existing) == 0 {
		sendError(c, http.StatusNotFound, "Comment not found")
		return
	}
	comment := existing[0]
	if req.Content != nil {
		comment.Content = *req.Content
	}

	if _, err := h.Service.Update(c, &models.Comment{Model: gorm.Model{ID: uint(id)}}, comment); err != nil {
		h.Logger.Error("Failed to update comment", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not update comment")
		return
	}

	resp := dto.CommentResponse{
		ID:              comment.ID,
		Content:         comment.Content,
		ParentCommentID: comment.ParentCommentID,
		UserID:          comment.UserID,
		MovieID:         comment.MovieID,
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: resp})
}

func (h *CommentHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		sendError(c, http.StatusBadRequest, "Invalid ID format")
		return
	}

	rows, err := h.Service.Delete(c, &models.Comment{Model: gorm.Model{ID: uint(id)}})
	if err != nil {
		h.Logger.Error("Failed to delete comment", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not delete comment")
		return
	}

	if rows == 0 {
		sendError(c, http.StatusNotFound, "Comment not found")
		return
	}

	h.Logger.Info("Comment deleted", slog.Int("id", id))
	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: "Comment deleted successfully"})
}
