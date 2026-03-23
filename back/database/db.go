package database

import (
	"fmt"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect_to_db(
	host string,
	user string,
	password string,
	dbname string,
	port string,
	time_zone string,
) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=%s",
		host,
		user,
		password,
		dbname,
		port,
		time_zone,
	)
	db, err := gorm.Open(postgres.Open(dsn))

	if err != nil {
		return nil, err
	}

	db.AutoMigrate()

	return db, nil
}
