package database

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/knock190/Nextjs-Go-todotry/go-todo-backend/internal/models"
	"golang.org/x/crypto/bcrypt"
)

func InitDB() (*gorm.DB, error) {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbName,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// AutoMigrate
	if err := db.AutoMigrate(&models.User{}, &models.Todo{}); err != nil {
		return nil, err
	}

	// シードデータ投入
	if err := seed(db); err != nil {
		return nil, err
	}

	return db, nil
}

func seed(db *gorm.DB) error {
	var count int64
	if err := db.Model(&models.User{}).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		// すでにデータがある場合はスキップ
		return nil
	}

	// デフォルトユーザー作成
	password := "password123"
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user := models.User{
		Name:         "Demo User",
		Email:        "demo@example.com",
		PasswordHash: string(hashed),
	}
	if err := db.Create(&user).Error; err != nil {
		return err
	}

	// Todo シード
	todos := []models.Todo{
		{Title: "First Todo", Description: "This is seeded todo 1", UserID: user.ID},
		{Title: "Second Todo", Description: "This is seeded todo 2", UserID: user.ID},
	}

	if err := db.Create(&todos).Error; err != nil {
		return err
	}

	log.Println("Seed data inserted: demo user & todos")
	return nil
}
