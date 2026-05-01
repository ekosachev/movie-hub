package main

import (
	"log/slog"
	"net/http"
	"os"

	"github.com/ekosachev/movie-hub/internal/database"
	"github.com/ekosachev/movie-hub/internal/handlers"
	"github.com/ekosachev/movie-hub/internal/repositories"
	"github.com/ekosachev/movie-hub/internal/services"
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

	db, err := database.Connect_to_db("postgres_db", "myuser", "mypassword", "mydb", "5432", "Europe/Moscow")
	if err != nil {
		logger.Error("Could not connect to database", "error", err.Error())
		return
	}

	logger.Info("Database connection successfull")

	userRepo := repositories.NewUserRepository(db)
	userService := services.NewUserService(userRepo)
	userHandler := handlers.NewUserHandler(userService, logger)

	rateRepo := repositories.NewRateRepository(db)
	rateService := services.NewRateService(rateRepo)
	rateHandler := handlers.NewRateHandler(rateService, logger)

	commentRepo := repositories.NewCommentRepository(db)
	commentService := services.NewCommentService(commentRepo)
	commentHandler := handlers.NewCommentHandler(commentService, userService, logger)

	collectionRepo := repositories.NewCollectionRepository(db)
	collectionService := services.NewCollectionService(collectionRepo)
	collectionHandler := handlers.NewCollectionHandler(collectionService, logger)

	roleRepo := repositories.NewRoleRepository(db)
	roleService := services.NewRoleService(roleRepo)
	roleHanlder := handlers.NewRoleHandler(roleService, logger)

	movieRepo := repositories.NewMovieRepository(db)
	movieService := services.NewMovieService(movieRepo)
	movieHandler := handlers.NewMovieHandler(movieService, logger)

	tagRepo := repositories.NewTagRepository(db)
	tagService := services.NewTagService(tagRepo)
	tagHandler := handlers.NewTagHandler(tagService, logger)

	castRepo := repositories.NewCastRepository(db)
	castService := services.NewCastService(castRepo)
	castHandler := handlers.NewCastHandler(castService, logger)

	movieCastRepo := repositories.NewMovieCastRepository(db)
	movieCastService := services.NewMovieCastService(movieCastRepo)
	movieCastHandler := handlers.NewMovieCastHandler(movieCastService, logger)

	reactionRepo := repositories.NewReactionRepository(db)
	reactionService := services.NewReactionService(reactionRepo)
	reactionHandler := handlers.NewReactionHandler(reactionService, logger)

	authService := services.NewAuthService(*userRepo, *roleRepo)
	authHandler := handlers.NewAuthHandler(authService, logger)

	group := router.Group("/api/v1")
	{
		userHandler.RegisterRoutes(group)
		rateHandler.RegisterRoutes(group)
		commentHandler.RegisterRoutes(group)
		collectionHandler.RegisterRoutes(group)
		authHandler.RegisterRoutes(group)
		roleHanlder.RegisterRoutes(group)
		movieHandler.RegisterRoutes(group)
		tagHandler.RegisterRoutes(group)
		castHandler.RegisterRoutes(group)
		movieCastHandler.RegisterRoutes(group)
		reactionHandler.RegisterRoutes(group)

	}

	router.Run()
}
