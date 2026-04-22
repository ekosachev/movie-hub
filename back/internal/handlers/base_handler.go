package handlers

import (
	"github.com/ekosachev/movie-hub/internal/dto"
	"github.com/gin-gonic/gin"
)

func sendError(c *gin.Context, status int, errMessage string) {
	c.JSON(status, dto.APIResponse{
		Success: false,
		Error:   errMessage,
	})
}
