package database

import (
	"log"
	"log/slog"

	"github.com/ekosachev/movie-hub/internal/models"
	"github.com/ekosachev/movie-hub/internal/utils"
	"gorm.io/gorm"
)

func Seed(db *gorm.DB, logger *slog.Logger) {
	var adminRole models.Role

	err := db.Where(models.Role{Name: "admin"}).FirstOrCreate(&adminRole, models.Role{
		Name:                 "admin",
		CanDeleteUsers:       true,
		CanUpdateMovies:      true,
		CanUpdateRoles:       true,
		CanUpdateTags:        true,
		CanUpdateCollections: true,
		CanManageCast:        true,
		CanManageComments:    true,
	}).Error

	if err != nil {
		log.Fatalf("Could not seed roles: %v", err)
	}

	var adminCount int64

	db.Model(&models.User{}).Where("role_id = ?", adminRole.ID).Count(&adminCount)

	if adminCount == 0 {
		hashedPassword, _ := utils.HashPassword("super-secret-password")

		admin := models.User{
			Username:     "admin",
			EmailAddress: "admin@example.com",
			PasswordHash: hashedPassword,
			RoleID:       &adminRole.ID,
		}

		if err := db.Create(&admin).Error; err != nil {
			logger.Warn("Could not create default admin")
		} else {
			logger.Info("Default admin account created")
		}
	}
}
