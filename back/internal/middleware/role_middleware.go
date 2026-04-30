package middleware

import (
	"net/http"
	"slices"

	"github.com/ekosachev/movie-hub/internal/dto"
	"github.com/gin-gonic/gin"
)

func PermissionMiddleware(requiredPermission string) gin.HandlerFunc {
	return func(ctx *gin.Context) {

		permissions, exists := ctx.Get("userPermissions")
		if !exists {
			ctx.AbortWithStatusJSON(http.StatusForbidden, dto.APIResponse{Success: false, Error: "No permissions found"})
			return
		}

		userPerms := permissions.([]string)

		hasPerm := slices.Contains(userPerms, requiredPermission)

		if !hasPerm {
			ctx.AbortWithStatusJSON(http.StatusForbidden, dto.APIResponse{Success: false, Error: "Missing permission " + requiredPermission})
			return
		}

		ctx.Next()
	}
}
