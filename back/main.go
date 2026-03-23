package main

import (
	"log/slog"
	"net/http"
	"os"

	"github.com/ekosachev/movie-hub/database"
	"github.com/gin-gonic/gin"
)

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

	router := gin.Default()
	router.GET("/health_check", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{
			"message": "Health check: OK",
		})
	})

	_, err := database.Connect_to_db("postgres_db", "myuser", "mypassword", "mydb", "5432", "Europe/Moscow")
	if err != nil {
		logger.Error("Could not connect to database", "error", err.Error())
		return
	}

	logger.Info("Database connection successfull")
	router.Run()
}
