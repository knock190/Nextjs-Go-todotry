package controllers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/knock190/Nextjs-Go-todotry/go-todo-backend/internal/middleware"
	"github.com/knock190/Nextjs-Go-todotry/go-todo-backend/internal/services"
)

type TodoController struct {
	todoService *services.TodoService
}

func NewTodoController(s *services.TodoService) *TodoController {
	return &TodoController{todoService: s}
}

type createTodoRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}

type updateTodoRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Completed   bool   `json:"completed"`
}

// /api/todos 用 (GET, POST)
func (c *TodoController) HandleTodos(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	switch r.Method {
	case http.MethodGet:
		c.listTodos(w, r, userID)
	case http.MethodPost:
		c.createTodo(w, r, userID)
	default:
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	}
}

// /api/todos/{id} 用 (GET, PUT, DELETE)
func (c *TodoController) HandleTodoByID(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	idStr := strings.TrimPrefix(r.URL.Path, "/api/todos/")
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodGet:
		c.getTodo(w, r, userID, uint(id))
	case http.MethodPut:
		c.updateTodo(w, r, userID, uint(id))
	case http.MethodDelete:
		c.deleteTodo(w, r, userID, uint(id))
	default:
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	}
}

func (c *TodoController) listTodos(w http.ResponseWriter, r *http.Request, userID uint) {
	todos, err := c.todoService.List(userID)
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(todos)
}

func (c *TodoController) getTodo(w http.ResponseWriter, r *http.Request, userID, todoID uint) {
	todo, err := c.todoService.GetByID(userID, todoID)
	if err != nil {
		if err == services.ErrTodoNotFound {
			http.Error(w, "not found", http.StatusNotFound)
			return
		}
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(todo)
}

func (c *TodoController) createTodo(w http.ResponseWriter, r *http.Request, userID uint) {
	var req createTodoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}
	if req.Title == "" {
		http.Error(w, "title is required", http.StatusBadRequest)
		return
	}

	todo, err := c.todoService.Create(userID, req.Title, req.Description)
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(todo)
}

func (c *TodoController) updateTodo(w http.ResponseWriter, r *http.Request, userID, todoID uint) {
	var req updateTodoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	todo, err := c.todoService.Update(userID, todoID, req.Title, req.Description, req.Completed)
	if err != nil {
		if err == services.ErrTodoNotFound {
			http.Error(w, "not found", http.StatusNotFound)
			return
		}
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(todo)
}

func (c *TodoController) deleteTodo(w http.ResponseWriter, r *http.Request, userID, todoID uint) {
	if err := c.todoService.Delete(userID, todoID); err != nil {
		if err == services.ErrTodoNotFound {
			http.Error(w, "not found", http.StatusNotFound)
			return
		}
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
