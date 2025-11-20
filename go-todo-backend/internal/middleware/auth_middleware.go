package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/knock190/Nextjs-Go-todotry/go-todo-backend/internal/utils"
)

type contextKey string

const ContextUserIDKey contextKey = "userID"

func GetUserIDFromContext(ctx context.Context) (uint, bool) {
	id, ok := ctx.Value(ContextUserIDKey).(uint)
	return id, ok
}

func JWTAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth := r.Header.Get("Authorization")
		if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(auth, "Bearer ")
		claims, err := utils.ParseToken(tokenString)
		if err != nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), ContextUserIDKey, claims.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
