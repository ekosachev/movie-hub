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

type CollectionHandler struct {
	Service *services.CollectionService
	Logger  *slog.Logger
}

func NewCollectionHandler(service *services.CollectionService, logger *slog.Logger) *CollectionHandler {
	return &CollectionHandler{
		Service: service,
		Logger:  logger,
	}
}

func (h *CollectionHandler) RegisterRoutes(router *gin.RouterGroup) {
	group := router.Group("/collections")
	{
		group.POST("/", h.Create)
		group.GET("/:id", h.GetByID)
		group.PATCH("/:id", h.Update)
		group.DELETE("/:id", h.Delete)
	}
}

func (h *CollectionHandler) Create(c *gin.Context) {
	var req dto.CreateCollectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.Logger.Warn("Invalid request payload for collection creation", slog.String("error", err.Error()))
		sendError(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	collection := &models.Collection{
		Name:     req.Name,
		IsPublic: req.IsPublic,
		UserID:   req.UserID,
	}

	if err := h.Service.Create(c, collection); err != nil {
		h.Logger.Error("Failed to create collection", slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not create collection")
		return
	}
	resp := dto.CollectionResponse{
		ID:       collection.ID,
		Name:     collection.Name,
		IsPublic: collection.IsPublic,
		UserID:   collection.UserID,
	}
	h.Logger.Info("Collection created", slog.Uint64("collection_id", uint64(collection.ID)))
	c.JSON(http.StatusCreated, dto.APIResponse{Success: true, Data: resp})
}

func (h *CollectionHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		sendError(c, http.StatusBadRequest, "Invalid ID format")
		return
	}
	collections, err := h.Service.Query(c, &models.Collection{Model: gorm.Model{ID: uint(id)}})
	if err != nil {
		h.Logger.Error("Failed to fetch collection", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Error fetching collection")
		return
	}
	if len(collections) == 0 {
		sendError(c, http.StatusNotFound, "Collection not found")
		return
	}
	collection := collections[0]
	resp := dto.CollectionResponse{
		ID:       collection.ID,
		Name:     collection.Name,
		IsPublic: collection.IsPublic,
		UserID:   collection.UserID,
	}
	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: resp})
}

func (h *CollectionHandler) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		sendError(c, http.StatusBadRequest, "Invalid ID format")
		return
	}
	var req dto.UpdateCollectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		sendError(c, http.StatusBadRequest, "Invalid update payload")
		return
	}
	existing, err := h.Service.Query(c, &models.Collection{Model: gorm.Model{ID: uint(id)}})
	if err != nil || len(existing) == 0 {
		sendError(c, http.StatusNotFound, "Collection not found")
		return
	}

	collection := existing[0]
	if req.Name != nil {
		collection.Name = *req.Name
	}
	if req.IsPublic != nil {
		collection.IsPublic = *req.IsPublic
	}

	if _, err := h.Service.Update(c, &models.Collection{Model: gorm.Model{ID: uint(id)}}, collection); err != nil {
		h.Logger.Error("Failed to update collection", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not update collection")
		return
	}

	resp := dto.CollectionResponse{
		ID:       collection.ID,
		Name:     collection.Name,
		IsPublic: collection.IsPublic,
		UserID:   collection.UserID,
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: resp})
}

func (h *CollectionHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		sendError(c, http.StatusBadRequest, "Invalid ID format")
		return
	}

	rows, err := h.Service.Delete(c, &models.Collection{Model: gorm.Model{ID: uint(id)}})
	if err != nil {
		h.Logger.Error("Failed to delete collection", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not delete collection")
		return
	}

	if rows == 0 {
		sendError(c, http.StatusNotFound, "Collection not found")
		return
	}

	h.Logger.Info("Collection deleted", slog.Int("id", id))
	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: "Collection deleted successfully"})
}
