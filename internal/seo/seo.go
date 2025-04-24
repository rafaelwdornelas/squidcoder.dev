// internal/seo/seo.go
package seo

import (
	"fmt"
	"net/http"
	"time"
)

// Config contém as configurações para geração do sitemap e robots.txt
type Config struct {
	BaseURL    string
	LastMod    time.Time
	ChangeFreq string
	Priority   string
}

// GenerateSitemap gera o sitemap XML com base nas ferramentas disponíveis
func GenerateSitemap(routes []string, config Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/xml")

		// Formatar data da última modificação
		lastMod := config.LastMod.Format("2006-01-02")

		// Início do XML
		fmt.Fprint(w, `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`)

		// URL da página inicial
		fmt.Fprintf(w, `
  <url>
    <loc>%s</loc>
    <lastmod>%s</lastmod>
    <changefreq>%s</changefreq>
    <priority>1.0</priority>
  </url>`, config.BaseURL, lastMod, config.ChangeFreq)

		// URL da página de ferramentas
		fmt.Fprintf(w, `
  <url>
    <loc>%s/tools</loc>
    <lastmod>%s</lastmod>
    <changefreq>%s</changefreq>
    <priority>0.9</priority>
  </url>`, config.BaseURL, lastMod, config.ChangeFreq)

		// URLs para cada rota
		for _, route := range routes {
			fmt.Fprintf(w, `
  <url>
    <loc>%s%s</loc>
    <lastmod>%s</lastmod>
    <changefreq>%s</changefreq>
    <priority>%s</priority>
  </url>`, config.BaseURL, route, lastMod, config.ChangeFreq, config.Priority)
		}

		// Fim do XML
		fmt.Fprint(w, `
</urlset>`)
	}
}

// GenerateRobots gera o arquivo robots.txt
func GenerateRobots(baseURL string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain")

		robotsTxt := fmt.Sprintf(`User-agent: *
Allow: /

# Sitemap location
Sitemap: %s/sitemap.xml
`, baseURL)

		fmt.Fprint(w, robotsTxt)
	}
}
