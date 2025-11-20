package services

import (
	"errors"

	"gorm.io/gorm"

	"github.com/knock190/Nextjs-Go-todotry/go-todo-backend/internal/models"
	"github.com/knock190/Nextjs-Go-todotry/go-todo-backend/internal/utils"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	db *gorm.DB
}

func NewAuthService(db *gorm.DB) *AuthService {
	return &AuthService{db: db}
}

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrEmailExists        = errors.New("email already exists")
)

func (s *AuthService) Register(name, email, password string) error {
	var count int64
	if err := s.db.Model(&models.User{}).Where("email = ?", email).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return ErrEmailExists
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user := models.User{
		Name:         name,
		Email:        email,
		PasswordHash: string(hashed),
	}
	return s.db.Create(&user).Error
}

func (s *AuthService) Login(email, password string) (string, error) {
	var user models.User
	if err := s.db.Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", ErrInvalidCredentials
		}
		return "", err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return "", ErrInvalidCredentials
	}

	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		return "", err
	}

	return token, nil
}
