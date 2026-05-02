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

type CommentHandler struct {
	Service     *services.CommentService
	UserService *services.UserService
	Logger      *slog.Logger
}

func NewCommentHandler(service *services.CommentService, userService *services.UserService, logger *slog.Logger) *CommentHandler {
	return &CommentHandler{
		Service:     service,
		UserService: userService,
		Logger:      logger,
	}
}

func (h *CommentHandler) RegisterRoutes(router *gin.RouterGroup) {
	group := router.Group("/comments")
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

func (h *CommentHandler) Create(c *gin.Context) {
	var req dto.CreateCommentRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		h.Logger.Warn("Invalid request payload for comment creation", slog.String("error", err.Error()))
		sendError(c, http.StatusBadRequest, "Invalid data format: "+err.Error())
		return
	}
	userID := int(c.MustGet("userID").(float64))
	comment := &models.Comment{
		Content:         req.Content,
		ParentCommentID: req.ParentCommentID,
		UserID:          userID,
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
		UserID:          comment.UserID,
		MovieID:         comment.MovieID,
		ParentCommentID: comment.ParentCommentID,
	}
	h.Logger.Info("Comment created successfully", slog.Uint64("comment_id", uint64(comment.ID)))
	c.JSON(http.StatusCreated, dto.APIResponse{Success: true, Data: resp})
}

func (h *CommentHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid comment ID")
		return
	}
	comment, err := h.Service.GetByID(c, uint(id))
	if err != nil {
		h.Logger.Error("Failed to get comment by id", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not get comment")
		return
	}
	if comment == nil {
		h.Logger.Warn("Comment not found", slog.Int("id", id))
		sendError(c, http.StatusNotFound, "Comment not found")
		return
	}

	user, err := h.UserService.GetByID(c, uint(comment.UserID))

	if err != nil {
		h.Logger.Error("Failed to get author of comment", slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Internal server error")
	}

	resp := dto.CommentResponse{
		ID:              comment.ID,
		Content:         comment.Content,
		UserID:          comment.UserID,
		MovieID:         comment.MovieID,
		ParentCommentID: comment.ParentCommentID,
		Username:        user.Username,
	}
	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: resp})
}

func (h *CommentHandler) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid comment ID")
		return
	}
	var req dto.UpdateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.Logger.Warn("Invalid request payload for comment update", slog.String("error", err.Error()))
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}
	comment, err := h.Service.GetByID(c, uint(id))
	if err != nil {
		h.Logger.Error("Failed to get comment by id", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Internal server error")
		return
	}
	if comment == nil {
		h.Logger.Warn("Comment not found", slog.Int("id", id))
		sendError(c, http.StatusNotFound, "Comment not found")
		return
	}
	userID := int(c.MustGet("userID").(float64))
	var hasManagePerm bool
	if permissions, exists := c.Get("userPermissions"); exists {
		if rawSlice, ok := permissions.([]interface{}); ok {
			for _, v := range rawSlice {
				if perm, isString := v.(string); isString && perm == "manage_comments" {
					hasManagePerm = true
					break
				}
			}
		}
	}
	if int(comment.UserID) != userID && !hasManagePerm {
		h.Logger.Warn("Access denied: not the owner and no admin rights", slog.Int("user_id", userID), slog.Int("comment_id", id))
		sendError(c, http.StatusForbidden, "You do not have permission to update this comment")
		return
	}
	if req.Content != nil {
		comment.Content = *req.Content
	}
	if _, err := h.Service.Update(c, &models.Comment{Model: gorm.Model{ID: uint(id)}}, *comment); err != nil {
		h.Logger.Error("Failed to update comment", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not update comment")
		return
	}
	resp := dto.CommentResponse{
		ID:              comment.ID,
		Content:         comment.Content,
		UserID:          comment.UserID,
		MovieID:         comment.MovieID,
		ParentCommentID: comment.ParentCommentID,
	}
	h.Logger.Info("Comment updated", slog.Uint64("comment_id", uint64(comment.ID)))
	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: resp})
}

func (h *CommentHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid comment ID")
		return
	}
	comment, err := h.Service.GetByID(c, uint(id))
	if err != nil {
		h.Logger.Error("Failed to get comment by id", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Internal server error")
		return
	}

	if comment == nil {
		h.Logger.Warn("Comment not found", slog.Int("id", id))
		sendError(c, http.StatusNotFound, "Comment not found")
		return
	}

	userID := int(c.MustGet("userID").(float64))
	var hasManagePerm bool
	if permissions, exists := c.Get("userPermissions"); exists {
		if rawSlice, ok := permissions.([]interface{}); ok {
			for _, v := range rawSlice {
				if perm, isString := v.(string); isString && perm == "manage_comments" {
					hasManagePerm = true
					break
				}
			}
		}
	}
	if int(comment.UserID) != userID && !hasManagePerm {
		h.Logger.Warn("Access denied: not the owner and no admin rights", slog.Int("user_id", userID), slog.Int("comment_id", id))
		sendError(c, http.StatusForbidden, "You do not have permission to delete this comment")
		return
	}
	if _, err := h.Service.Delete(c, &models.Comment{Model: gorm.Model{ID: uint(id)}}); err != nil {
		h.Logger.Error("Failed to delete a comment", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not delete comment")
		return
	}
	h.Logger.Info("Comment deleted", slog.Int("comment_id", id))
	c.JSON(http.StatusOK, dto.APIResponse{Success: true})
}
