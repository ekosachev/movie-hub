package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func main() {
	router := gin.Default()
	router.GET("/health_check", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{
			"message": "Health check: OK",
		})
	})

	router.Run()
}
