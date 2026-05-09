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
		sysListsGroup := group.Group("/me").Use(middleware.AuthMiddleware())
		{
			sysListsGroup.GET("", h.GetSystemLists)
			sysListsGroup.POST("/:list", h.AddToSystemList)
			sysListsGroup.DELETE("/:list/:movieId", h.RemoveFromSystemList)
		}
		group.GET("/:id", h.GetByID)
		protectedGroup := group.Group("/").Use(middleware.AuthMiddleware())
		{
			protectedGroup.POST("/", h.Create)
			protectedGroup.PATCH("/:id", h.Update)
			protectedGroup.DELETE("/:id", h.Delete)
			protectedGroup.POST("/:id/movies", h.AddMovie)
			protectedGroup.DELETE("/:id/movies/:movieId", h.RemoveMovie)
		}
	}
	meGroup := router.Group("/me").Use(middleware.AuthMiddleware())
	{
		meGroup.GET("/collections", h.GetMyCollections)
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
	var movieIDs []uint
	for _, m := range collection.MovieCollection {
		movieIDs = append(movieIDs, m.ID)
	}

	resp := dto.CollectionResponse{
		ID:       collection.ID,
		Name:     collection.Name,
		IsPublic: collection.IsPublic,
		UserID:   collection.UserID,
		MovieIDs: movieIDs,
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
	collection, err := h.Service.GetByID(c.Request.Context(), uint(id))
	if err != nil || collection == nil {
		sendError(c, http.StatusNotFound, "Collection not found")
		return
	}
	userID := int(c.MustGet("userID").(float64))
	var hasUpdatePerm bool
	if permissions, exists := c.Get("userPermissions"); exists {
		if rawSlice, ok := permissions.([]interface{}); ok {
			for _, v := range rawSlice {
				if perm, isString := v.(string); isString && perm == "update_collections" {
					hasUpdatePerm = true
					break
				}
			}
		}
	}

	if int(collection.UserID) != userID && !hasUpdatePerm {
		sendError(c, http.StatusForbidden, "You do not have permission to update this collection")
		return
	}
	var req dto.UpdateCollectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		sendError(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	filter := &models.Collection{Model: gorm.Model{ID: uint(id)}}
	updateData := models.Collection{}

	if req.Name != nil {
		updateData.Name = *req.Name
	}
	if req.IsPublic != nil {
		updateData.IsPublic = *req.IsPublic
	}

	_, err = h.Service.Update(c.Request.Context(), filter, updateData)
	if err != nil {
		h.Logger.Error("Update failed", slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not update collection")
		return
	}
	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: "Updated successfully"})
}

func (h *CollectionHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid collection ID")
		return
	}
	collection, err := h.Service.GetByID(c.Request.Context(), uint(id))
	if err != nil || collection == nil {
		sendError(c, http.StatusNotFound, "Collection not found")
		return
	}
	userID := int(c.MustGet("userID").(float64))
	var hasUpdatePerm bool
	if permissions, exists := c.Get("userPermissions"); exists {
		if rawSlice, ok := permissions.([]interface{}); ok {
			for _, v := range rawSlice {
				if perm, isString := v.(string); isString && perm == "update_collections" {
					hasUpdatePerm = true
					break
				}
			}
		}
	}
	if int(collection.UserID) != userID && !hasUpdatePerm {
		sendError(c, http.StatusForbidden, "Access denied")
		return
	}
	filter := &models.Collection{Model: gorm.Model{ID: uint(id)}}
	if _, err := h.Service.Delete(c.Request.Context(), filter); err != nil {
		h.Logger.Error("Delete failed", slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not delete")
		return
	}
	c.JSON(http.StatusOK, dto.APIResponse{
		Success: true,
		Data:    "Collection deleted successfully",
	})
}

func (h *CollectionHandler) GetMyCollections(c *gin.Context) {
	userID := int(c.MustGet("userID").(float64))
	collections, err := h.Service.GetByUserID(c, uint(userID))
	if err != nil {
		h.Logger.Error("Failed to get user collections", slog.Int("user_id", userID), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not get collections")
		return
	}

	var respData []dto.CollectionResponse
	for _, coll := range collections {
		var movieIDs []uint
		for _, m := range coll.MovieCollection {
			movieIDs = append(movieIDs, m.ID)
		}
		respData = append(respData, dto.CollectionResponse{
			ID:       coll.ID,
			Name:     coll.Name,
			IsPublic: coll.IsPublic,
			UserID:   coll.UserID,
			MovieIDs: movieIDs,
		})
	}
	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: respData})
}

func (h *CollectionHandler) AddMovie(c *gin.Context) {
	collectionID, err := strconv.Atoi(c.Param("id"))
	if err != nil || collectionID <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid collection ID")
		return
	}
	var req dto.AddMovieToCollectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		sendError(c, http.StatusBadRequest, "Invalid data format")
		return
	}
	userID := int(c.MustGet("userID").(float64))
	collection, err := h.Service.GetByID(c, uint(collectionID))

	if err != nil || collection == nil {
		sendError(c, http.StatusNotFound, "Collection not found")
		return
	}
	if collection.UserID != userID {
		sendError(c, http.StatusForbidden, "You can only modify your own collections")
		return
	}
	if err := h.Service.AddMovie(c, uint(collectionID), req.MovieID); err != nil {
		h.Logger.Error("Failed to add movie", slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not add movie to collection")
		return
	}
	c.JSON(http.StatusOK, dto.APIResponse{Success: true})
}

func (h *CollectionHandler) RemoveMovie(c *gin.Context) {
	collectionID, err1 := strconv.Atoi(c.Param("id"))
	movieID, err2 := strconv.Atoi(c.Param("movieId"))

	if err1 != nil || err2 != nil || collectionID <= 0 || movieID <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid IDs")
		return
	}
	userID := int(c.MustGet("userID").(float64))
	collection, err := h.Service.GetByID(c, uint(collectionID))

	if err != nil || collection == nil {
		sendError(c, http.StatusNotFound, "Collection not found")
		return
	}
	if collection.UserID != userID {
		sendError(c, http.StatusForbidden, "You can only modify your own collections")
		return
	}
	if err := h.Service.RemoveMovie(c, uint(collectionID), uint(movieID)); err != nil {
		h.Logger.Error("Failed to remove movie", slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not remove movie from collection")
		return
	}
	c.JSON(http.StatusOK, dto.APIResponse{Success: true})
}

func (h *CollectionHandler) GetSystemLists(c *gin.Context) {
	userID := int(c.MustGet("userID").(float64))
	favorites, watched, watchlist, err := h.Service.GetSystemLists(c, uint(userID))
	if err != nil {
		h.Logger.Error("Failed to get system lists", slog.Int("user_id", userID), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not get system lists")
		return
	}
	if favorites == nil {
		favorites = []uint{}
	}
	if watched == nil {
		watched = []uint{}
	}
	if watchlist == nil {
		watchlist = []uint{}
	}

	resp := dto.SystemListsResponse{
		Favorites: favorites,
		Watched:   watched,
		Watchlist: watchlist,
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: resp})
}

func (h *CollectionHandler) AddToSystemList(c *gin.Context) {
	listType := c.Param("list")
	userID := uint(c.MustGet("userID").(float64))
	var req dto.AddMovieToCollectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		sendError(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	err := h.Service.AddToSystemList(c, userID, listType, req.MovieID)
	if err != nil {
		h.Logger.Error("Failed to add movie to system list", slog.String("list", listType), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not add movie to list")
		return
	}
	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: "Movie added to " + listType})
}

func (h *CollectionHandler) RemoveFromSystemList(c *gin.Context) {
	listType := c.Param("list")
	movieID, _ := strconv.Atoi(c.Param("movieId"))
	userID := uint(c.MustGet("userID").(float64))

	err := h.Service.RemoveFromSystemList(c, userID, listType, uint(movieID))
	if err != nil {
		h.Logger.Error("Failed to remove movie from system list", slog.String("list", listType), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not remove movie from list")
		return
	}
	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: "Movie removed from " + listType})
}
