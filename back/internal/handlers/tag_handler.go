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

type TagHandler struct {
	Service *services.TagService
	Logger  *slog.Logger
}

func NewTagHandler(service *services.TagService, logger *slog.Logger) *TagHandler {
	return &TagHandler{
		Service: service,
		Logger:  logger,
	}
}

func (h *TagHandler) RegisterRoutes(router *gin.RouterGroup) {
	group := router.Group("/tags")
	{
		// register routes here
		group.POST("/", h.Create)
		group.GET("/:id", h.GetByID)
		group.PATCH("/:id", h.Update)
		group.DELETE("/:id", h.Delete)
	}
}

func (h *TagHandler) Create(c *gin.Context) {
	var req dto.CreateTagRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		h.Logger.Warn("Invalid request payload for tag creation", slog.String("error", err.Error()))
		sendError(c, http.StatusBadRequest, "Invalid data format: "+err.Error())
		return
	}

	tag := &models.Tag{
		Name: req.Name,
	}

	if err := h.Service.Create(c, tag); err != nil {
		h.Logger.Error("Failed to create tag", slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not create tag")
		return
	}

	resp := dto.TagResponse{
		ID:   tag.ID,
		Name: tag.Name,
	}

	h.Logger.Info("Tag registered successfully", slog.Uint64("tag_id", uint64(tag.ID)))
	c.JSON(http.StatusCreated, dto.APIResponse{Success: true, Data: resp})
}

func (h *TagHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)

	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid tag ID")
		return
	}

	tag, err := h.Service.GetByID(c, uint(id))

	if err != nil {
		h.Logger.Error("Failed to get tag by id", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not get tag")
		return
	}

	if tag == nil {
		h.Logger.Warn("Tag not found", slog.Int("id", id))
		sendError(c, http.StatusNotFound, "Tag not found")
		return
	}

	resp := dto.TagResponse{
		ID:   tag.ID,
		Name: tag.Name,
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: resp})
}

func (h *TagHandler) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)

	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid tag ID")
		return
	}

	var req dto.UpdateTagRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		h.Logger.Warn("Invalid request payload for tag update", slog.String("error", err.Error()))
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	tag, err := h.Service.GetByID(c, uint(id))

	if err != nil {
		h.Logger.Error("Failed to get tag by id", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Internal server error")
		return
	}

	if tag == nil {
		h.Logger.Warn("Tag not found", slog.Int("id", id))
		sendError(c, http.StatusNotFound, "Tag not found")
		return
	}

	if req.Name != nil {
		tag.Name = *req.Name
	}

	if _, err := h.Service.Update(c, &models.Tag{Model: gorm.Model{ID: uint(id)}}, *tag); err != nil {
		h.Logger.Error("Failed to update tag", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not update tag")
		return
	}

	resp := dto.TagResponse{
		ID:   tag.ID,
		Name: tag.Name,
	}

	h.Logger.Info("Tag updated", slog.Uint64("tag_id", uint64(tag.ID)))
	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: resp})
}

func (h *TagHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	if _, err := h.Service.Delete(c, &models.Tag{Model: gorm.Model{ID: uint(id)}}); err != nil {
		h.Logger.Error("Failed to delete a tag", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not delete tag")
		return
	}

	h.Logger.Info("User deleted", slog.Int("user_id", id))
	c.JSON(http.StatusOK, dto.APIResponse{Success: true})
}
