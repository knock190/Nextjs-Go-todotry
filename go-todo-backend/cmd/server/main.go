package main

import (
	"log"
	"net/http"
	"os"

	"github.com/knock190/Nextjs-Go-todotry/go-todo-backend/internal/controllers"
	"github.com/knock190/Nextjs-Go-todotry/go-todo-backend/internal/database"
	"github.com/knock190/Nextjs-Go-todotry/go-todo-backend/internal/middleware"
	"github.com/knock190/Nextjs-Go-todotry/go-todo-backend/internal/services"
)

func main() {
	db, err := database.InitDB()
	if err != nil {
		log.Fatalf("failed to connect db: %v", err)
	}

	authService := services.NewAuthService(db)
	todoService := services.NewTodoService(db)

	authController := controllers.NewAuthController(authService)
	todoController := controllers.NewTodoController(todoService)

	mux := http.NewServeMux()

	// Health check
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	})

	// Auth
	mux.Handle("/api/auth/register", http.HandlerFunc(authController.SignUp))
	mux.Handle("/api/auth/login", http.HandlerFunc(authController.Login))
	mux.Handle("/api/auth/logout", http.HandlerFunc(authController.Logout))

	// Todo (JWT 必須)
	mux.Handle("/api/todos", middleware.JWTAuth(http.HandlerFunc(todoController.HandleTodos)))
	mux.Handle("/api/todos/", middleware.JWTAuth(http.HandlerFunc(todoController.HandleTodoByID)))

	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server running on :%s\n", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
