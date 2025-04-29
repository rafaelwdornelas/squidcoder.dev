// internal/seo/seo.go
package seo

import (
	"fmt"
	"net/http"
	"strings"
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

		// Início do XML com namespaces adicionais para imagens e vídeos
		fmt.Fprint(w, `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`)

		// URL da página inicial com maior prioridade e imagem
		fmt.Fprintf(w, `
  <url>
    <loc>%s</loc>
    <lastmod>%s</lastmod>
    <changefreq>%s</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>%s/static/img/logo.svg</image:loc>
      <image:title>SquidCoder.dev Logo</image:title>
      <image:caption>SquidCoder.dev - Ferramentas gratuitas para desenvolvedores</image:caption>
    </image:image>
    <xhtml:link rel="alternate" hreflang="pt" href="%s" />
    <xhtml:link rel="alternate" hreflang="en" href="%s/en" />
    <xhtml:link rel="alternate" hreflang="es" href="%s/es" />
  </url>`, config.BaseURL, lastMod, config.ChangeFreq, config.BaseURL, config.BaseURL, config.BaseURL, config.BaseURL)

		// URL da página de ferramentas
		fmt.Fprintf(w, `
  <url>
    <loc>%s/tools</loc>
    <lastmod>%s</lastmod>
    <changefreq>%s</changefreq>
    <priority>0.9</priority>
    <image:image>
      <image:loc>%s/static/img/tools-cover.png</image:loc>
      <image:title>Ferramentas para Desenvolvedores</image:title>
      <image:caption>Explore nossa coleção de ferramentas gratuitas para desenvolvedores</image:caption>
    </image:image>
    <xhtml:link rel="alternate" hreflang="pt" href="%s/tools" />
    <xhtml:link rel="alternate" hreflang="en" href="%s/en/tools" />
    <xhtml:link rel="alternate" hreflang="es" href="%s/es/tools" />
  </url>`, config.BaseURL, lastMod, config.ChangeFreq, config.BaseURL, config.BaseURL, config.BaseURL, config.BaseURL)

		// URLs para cada ferramenta com mais informações
		for i, route := range routes {
			// Extrair o nome da ferramenta da rota (simplificado para exemplo)
			toolName := strings.TrimPrefix(route, "/tools/")
			toolName = strings.ReplaceAll(toolName, "-", " ")

			// Calcular prioridade dinamicamente com base na posição
			// Ferramentas mais populares (primeiras da lista) têm prioridade maior
			priority := 0.8
			if i < 10 {
				priority = 0.8 - (float64(i) * 0.01)
			} else {
				priority = 0.7 - (float64(i-10) * 0.005)
			}

			// Formatar a prioridade como string com uma casa decimal
			priorityStr := fmt.Sprintf("%.1f", priority)

			fmt.Fprintf(w, `
  <url>
    <loc>%s%s</loc>
    <lastmod>%s</lastmod>
    <changefreq>%s</changefreq>
    <priority>%s</priority>
    <image:image>
      <image:loc>%s/static/img/tools/%s.png</image:loc>
      <image:title>%s</image:title>
      <image:caption>Ferramenta online gratuita para %s</image:caption>
    </image:image>
    <xhtml:link rel="alternate" hreflang="pt" href="%s%s" />
    <xhtml:link rel="alternate" hreflang="en" href="%s/en%s" />
    <xhtml:link rel="alternate" hreflang="es" href="%s/es%s" />
  </url>`, config.BaseURL, route, lastMod, config.ChangeFreq, priorityStr,
				config.BaseURL, toolName, toolName, toolName,
				config.BaseURL, route, config.BaseURL, route, config.BaseURL, route)
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
