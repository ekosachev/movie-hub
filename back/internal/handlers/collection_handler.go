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
		group.GET("/:id", h.GetByID)

		protectedGroup := group.Group("/").Use(middleware.AuthMiddleware(), middleware.PermissionMiddleware("update_collections"))
		{
			protectedGroup.POST("/", h.Create)
			protectedGroup.PATCH("/:id", h.Update)
			protectedGroup.DELETE("/:id", h.Delete)
		}
	}
}

func (h *CollectionHandler) Create(c *gin.Context) {
	var req dto.CreateCollectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.Logger.Warn("Invalid request payload for collection creation", slog.String("error", err.Error()))
		sendError(c, http.StatusBadRequest, "Invalid data format: "+err.Error())
		return
	}
	userID := int(c.MustGet("userID").(float64))
	collection := &models.Collection{
		Name:     req.Name,
		IsPublic: req.IsPublic,
		UserID:   userID,
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

	h.Logger.Info("Collection created successfully", slog.Uint64("collection_id", uint64(collection.ID)))
	c.JSON(http.StatusCreated, dto.APIResponse{Success: true, Data: resp})
}

func (h *CollectionHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)

	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid collection ID")
		return
	}

	collection, err := h.Service.GetByID(c, uint(id))

	if err != nil {
		h.Logger.Error("Failed to get collection by id", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not get collection")
		return
	}

	if collection == nil {
		h.Logger.Warn("Collection not found", slog.Int("id", id))
		sendError(c, http.StatusNotFound, "Collection not found")
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

func (h *CollectionHandler) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)

	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid collection ID")
		return
	}
	var req dto.UpdateCollectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.Logger.Warn("Invalid request payload for collection update", slog.String("error", err.Error()))
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	collection, err := h.Service.GetByID(c, uint(id))

	if err != nil {
		h.Logger.Error("Failed to get collection by id", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Internal server error")
		return
	}
	if collection == nil {
		h.Logger.Warn("Collection not found", slog.Int("id", id))
		sendError(c, http.StatusNotFound, "Collection not found")
		return
	}

	userID := int(c.MustGet("userID").(float64))
	if collection.UserID != userID {
		h.Logger.Warn("Access denied: not the owner", slog.Int("user_id", userID), slog.Int("collection_id", id))
		sendError(c, http.StatusForbidden, "You can only update your own collections")
		return
	}
	if req.Name != nil {
		collection.Name = *req.Name
	}
	if req.IsPublic != nil {
		collection.IsPublic = *req.IsPublic
	}

	if _, err := h.Service.Update(c, &models.Collection{Model: gorm.Model{ID: uint(id)}}, *collection); err != nil {
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
	h.Logger.Info("Collection updated", slog.Uint64("collection_id", uint64(collection.ID)))
	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: resp})
}

func (h *CollectionHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid collection ID")
		return
	}
	collection, err := h.Service.GetByID(c, uint(id))
	if err != nil {
		h.Logger.Error("Failed to get collection by id", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Internal server error")
		return
	}
	if collection == nil {
		h.Logger.Warn("Collection not found", slog.Int("id", id))
		sendError(c, http.StatusNotFound, "Collection not found")
		return
	}

	userID := int(c.MustGet("userID").(float64))
	if collection.UserID != userID {
		h.Logger.Warn("Access denied: not the owner", slog.Int("user_id", userID), slog.Int("collection_id", id))
		sendError(c, http.StatusForbidden, "You can only delete your own collections")
		return
	}
	if _, err := h.Service.Delete(c, &models.Collection{Model: gorm.Model{ID: uint(id)}}); err != nil {
		h.Logger.Error("Failed to delete a collection", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not delete collection")
		return
	}
	h.Logger.Info("Collection deleted", slog.Int("collection_id", id))
	c.JSON(http.StatusOK, dto.APIResponse{Success: true})
}
