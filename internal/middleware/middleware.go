// internal/middleware/middleware.go
package middleware

import (
	"log"
	"net/http"
	"time"
)

// Logger é um middleware que registra informações da requisição
func Logger(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next(w, r)
		log.Printf("%s %s %s %s", r.Method, r.RequestURI, r.RemoteAddr, time.Since(start))
	}
}
