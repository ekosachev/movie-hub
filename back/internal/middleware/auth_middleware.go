package middleware

import (
	"github.com/ekosachev/movie-hub/internal/config"
	"github.com/ekosachev/movie-hub/internal/dto"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware() gin.HandlerFunc {
	var cfg = config.GetConfig()
	var secretKey = []byte(cfg.JWTSecret)
	return func(ctx *gin.Context) {
		authHeader := ctx.GetHeader("Authorization")
		if authHeader == "" {
			ctx.AbortWithStatusJSON(401, dto.APIResponse{Success: false, Error: "Authorization header required"})
			return
		}

		tokenString := authHeader[7:] // remove "Bearer: " prefix

		token, _ := jwt.Parse(tokenString, func(t *jwt.Token) (any, error) {
			return secretKey, nil
		})

		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			ctx.Set("userID", claims["sub"])
			ctx.Set("userPermissions", claims["permissions"])
			ctx.Next()
		} else {
			ctx.AbortWithStatusJSON(401, dto.APIResponse{Success: false, Error: "Invalid token"})
		}
	}
}
