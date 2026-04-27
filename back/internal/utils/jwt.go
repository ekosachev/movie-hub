package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var secretKey = []byte("my-super-secret-key")

func GenerateToken(userID uint, permissions []string) (string, error) {
	claims := jwt.MapClaims{
		"sub":         userID,
		"exp":         time.Now().Add(time.Hour * 24).Unix(),
		"permissions": permissions,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secretKey)
}
