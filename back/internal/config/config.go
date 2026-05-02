package config

import (
	"log"
	"os"
	"strconv"
	"sync"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost               string
	DBPort               string
	DBUser               string
	DBPassword           string
	DBName               string
	DBTimezone           string
	JWTSecret            string
	JWTExpirationSeconds int
	AdminPassword        string
}

var (
	instance *Config
	once     sync.Once
)

func LoadConfig() *Config {
	once.Do(func() {
		if err := godotenv.Load(); err != nil {
			log.Println("Предупреждение: .env файл не найден, используются переменные окружения")
		}
		instance = &Config{
			DBHost:               getEnv("DB_HOST", ""),
			DBPort:               getEnv("DB_PORT", ""),
			DBUser:               getEnv("DB_USER", ""),
			DBPassword:           getEnv("DB_PASSWORD", ""),
			DBName:               getEnv("DB_NAME", ""),
			DBTimezone:           getEnv("DB_TIMEZONE", "UTC"),
			JWTSecret:            getEnv("JWT_SECRET", ""),
			JWTExpirationSeconds: getEnvAsInt("JWT_EXPIRATION_SECONDS", 3600),
			AdminPassword:        getEnv("ADMIN_PASSWORD", ""),
		}
	})
	return instance
}

func GetConfig() *Config {
	if instance == nil {
		return LoadConfig()
	}
	return instance
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := getEnv(key, "")
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultValue
}
