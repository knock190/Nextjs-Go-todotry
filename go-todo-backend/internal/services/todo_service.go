package services

import (
	"errors"

	"gorm.io/gorm"

	"github.com/knock190/Nextjs-Go-todotry/go-todo-backend/internal/models"
)

type TodoService struct {
	db *gorm.DB
}

func NewTodoService(db *gorm.DB) *TodoService {
	return &TodoService{db: db}
}

var ErrTodoNotFound = errors.New("todo not found")

func (s *TodoService) List(userID uint) ([]models.Todo, error) {
	var todos []models.Todo
	err := s.db.Where("user_id = ?", userID).Order("id DESC").Find(&todos).Error
	return todos, err
}

func (s *TodoService) GetByID(userID, todoID uint) (*models.Todo, error) {
	var todo models.Todo
	err := s.db.Where("id = ? AND user_id = ?", todoID, userID).First(&todo).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrTodoNotFound
	}
	return &todo, err
}

func (s *TodoService) Create(userID uint, title, description string) (*models.Todo, error) {
	todo := models.Todo{
		Title:       title,
		Description: description,
		UserID:      userID,
	}
	if err := s.db.Create(&todo).Error; err != nil {
		return nil, err
	}
	return &todo, nil
}

func (s *TodoService) Update(userID, todoID uint, title, description string, completed bool) (*models.Todo, error) {
	todo, err := s.GetByID(userID, todoID)
	if err != nil {
		return nil, err
	}

	todo.Title = title
	todo.Description = description
	todo.Completed = completed

	if err := s.db.Save(todo).Error; err != nil {
		return nil, err
	}
	return todo, nil
}

func (s *TodoService) Delete(userID, todoID uint) error {
	todo, err := s.GetByID(userID, todoID)
	if err != nil {
		return err
	}
	return s.db.Delete(todo).Error
}
