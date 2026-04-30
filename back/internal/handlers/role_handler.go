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

type RoleHandler struct {
	Service *services.RoleService
	Logger  *slog.Logger
}

func NewRoleHandler(service *services.RoleService, logger *slog.Logger) *RoleHandler {
	return &RoleHandler{
		Service: service,
		Logger:  logger,
	}
}

func (h *RoleHandler) RegisterRoutes(router *gin.RouterGroup) {
	group := router.Group("/roles")
	{
		group.GET("/:id", h.GetByID)

		protectedGroup := group.Group("/").Use(middleware.AuthMiddleware()).Use(middleware.PermissionMiddleware("update_roles"))
		{
			protectedGroup.POST("/", h.Create)
			protectedGroup.PATCH("/:id", h.Update)
			protectedGroup.DELETE("/:id", h.Delete)
		}
	}
}

func (h *RoleHandler) Create(c *gin.Context) {
	var req dto.CreateRoleRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		h.Logger.Warn("Invalid request payload for creating a role", slog.String("error", err.Error()))
		sendError(c, http.StatusBadRequest, "Invalid data format: "+err.Error())
		return
	}

	role := &models.Role{
		CanDeleteUsers:  req.CanDeleteUsers,
		CanUpdateMovies: req.CanUpdateMovies,
		CanUpdateRoles:  req.CanUpdateRoles,
		CanUpdateTags:   req.CanUpdateTags,
	}

	if err := h.Service.Create(c, role); err != nil {
		h.Logger.Error("Failed to create role", slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not create role")
		return
	}

	resp := dto.RoleResponse{
		ID:              role.ID,
		CanDeleteUsers:  role.CanDeleteUsers,
		CanUpdateMovies: role.CanUpdateMovies,
		CanUpdateRoles:  role.CanUpdateRoles,
		CanUpdateTags:   role.CanUpdateTags,
	}

	h.Logger.Info("Role created successfully", slog.Uint64("role_id", uint64(role.ID)))
	c.JSON(http.StatusCreated, dto.APIResponse{Success: true, Data: resp})
}

func (h *RoleHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)

	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid role ID")
		return
	}

	role, err := h.Service.GetByID(c, uint(id))

	if err != nil {
		h.Logger.Error("Failed to get role by id", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not get role")
		return
	}

	if role == nil {
		h.Logger.Warn("Role not found", slog.Int("id", id))
		sendError(c, http.StatusNotFound, "Role not found")
		return
	}

	resp := dto.RoleResponse{
		ID:              role.ID,
		CanDeleteUsers:  role.CanDeleteUsers,
		CanUpdateMovies: role.CanUpdateMovies,
		CanUpdateRoles:  role.CanUpdateRoles,
		CanUpdateTags:   role.CanUpdateTags,
	}

	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: resp})
}

func (h *RoleHandler) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)

	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid role ID")
		return
	}

	var req dto.UpdateRoleRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		h.Logger.Warn("Invalid request payload for role update", slog.String("error", err.Error()))
		sendError(c, http.StatusBadRequest, err.Error())
		return
	}

	role, err := h.Service.GetByID(c, uint(id))

	if err != nil {
		h.Logger.Error("Failed to get role by id", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Internal server error")
		return
	}

	if role == nil {
		h.Logger.Warn("Role not found", slog.Int("id", id))
		sendError(c, http.StatusNotFound, "Role not found")
		return
	}

	if req.CanDeleteUsers != nil {
		role.CanDeleteUsers = *req.CanDeleteUsers
	}
	if req.CanUpdateMovies != nil {
		role.CanUpdateMovies = *req.CanUpdateMovies
	}
	if req.CanUpdateRoles != nil {
		role.CanUpdateRoles = *req.CanUpdateRoles
	}
	if req.CanUpdateTags != nil {
		role.CanUpdateTags = *req.CanUpdateTags
	}

	if _, err := h.Service.Update(c, &models.Role{Model: gorm.Model{ID: uint(id)}}, *role); err != nil {
		h.Logger.Error("Failed to update role", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not update role")
		return
	}

	resp := dto.RoleResponse{
		ID:              role.ID,
		CanDeleteUsers:  role.CanDeleteUsers,
		CanUpdateMovies: role.CanUpdateMovies,
		CanUpdateRoles:  role.CanUpdateRoles,
		CanUpdateTags:   role.CanUpdateTags,
	}

	h.Logger.Info("Role updated", slog.Uint64("role_id", uint64(role.ID)))
	c.JSON(http.StatusOK, dto.APIResponse{Success: true, Data: resp})
}

func (h *RoleHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil || id <= 0 {
		sendError(c, http.StatusBadRequest, "Invalid role ID")
		return
	}

	if _, err := h.Service.Delete(c, &models.Role{Model: gorm.Model{ID: uint(id)}}); err != nil {
		h.Logger.Error("Failed to delete a role", slog.Int("id", id), slog.String("error", err.Error()))
		sendError(c, http.StatusInternalServerError, "Could not delete user")
		return
	}

	h.Logger.Info("Role deleted", slog.Int("user_id", id))
	c.JSON(http.StatusOK, dto.APIResponse{Success: true})
}
