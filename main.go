// main.go - Versão com suporte a templates parciais
package main

import (
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"squidcoder/internal/handlers"
	"squidcoder/internal/seo"
	"strings"
	"time"
)

// Tool representa uma ferramenta
type Tool struct {
	ID          string
	Name        string
	Description string
	Icon        string
	Route       string
}

// PageData contém os dados para renderizar as páginas
type PageData struct {
	Title       string
	Description string
	Tools       []Tool
	Theme       string
}

// TemplateRenderer gerencia a renderização de templates
type TemplateRenderer struct {
	partialsCache map[string]string // Cache de templates parciais
}

// RedirectToHTTPS é um middleware que redireciona HTTP para HTTPS
func RedirectToHTTPS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Verifica se a requisição é via Cloudflare e não está usando HTTPS
		if r.Header.Get("CF-Visitor") == `{"scheme":"http"}` ||
			r.Header.Get("X-Forwarded-Proto") == "http" {

			// Constrói a URL HTTPS
			httpsURL := "https://" + r.Host + r.RequestURI

			// Adiciona cabeçalho para indicar redirecionamento permanente para HTTPS
			w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")

			// Redireciona para HTTPS
			http.Redirect(w, r, httpsURL, http.StatusMovedPermanently)
			return
		}

		// Se já estiver em HTTPS, continua normalmente
		next.ServeHTTP(w, r)
	})
}

// SecurityHeaders é um middleware que adiciona cabeçalhos de segurança
func SecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Proteção contra XSS com permissão ampliada para fontes do Cloudflare e analytics
		w.Header().Set("Content-Security-Policy",
			"default-src 'self'; "+
				"script-src 'self' https://cdnjs.cloudflare.com https://www.googletagmanager.com https://static.cloudflareinsights.com https://www.google-analytics.com 'unsafe-inline' 'unsafe-eval'; "+
				"style-src 'self' https://cdnjs.cloudflare.com 'unsafe-inline'; "+
				"img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com; "+
				"font-src 'self' https://cdnjs.cloudflare.com; "+
				"connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://static.cloudflareinsights.com")

		w.Header().Set("X-XSS-Protection", "1; mode=block")
		w.Header().Set("X-Content-Type-Options", "nosniff")

		// Definir explicitamente a política de referenciamento para permitir analytics
		w.Header().Set("Referrer-Policy", "no-referrer-when-downgrade")

		w.Header().Set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
		w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
		w.Header().Set("X-Frame-Options", "SAMEORIGIN")

		next.ServeHTTP(w, r)
	})
}

// NewTemplateRenderer cria um novo renderizador de templates
func NewTemplateRenderer() (*TemplateRenderer, error) {
	// Carregar templates parciais
	partialsCache := make(map[string]string)

	// Ler o diretório de partials
	files, err := filepath.Glob("templates/partials/*.html")
	if err != nil {
		return nil, err
	}

	// Carregar cada arquivo parcial
	for _, file := range files {
		content, err := ioutil.ReadFile(file)
		if err != nil {
			return nil, err
		}

		// Extrair o nome do arquivo sem o caminho e extensão
		baseName := filepath.Base(file)
		name := strings.TrimSuffix(baseName, filepath.Ext(baseName))

		// Armazenar o conteúdo no cache
		partialsCache[name] = string(content)
	}

	return &TemplateRenderer{
		partialsCache: partialsCache,
	}, nil
}

// RenderTemplate renderiza um template com partials
func (tr *TemplateRenderer) RenderTemplate(w http.ResponseWriter, templatePath string, data interface{}) {
	// Ler o conteúdo do template
	content, err := ioutil.ReadFile(templatePath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Substituir marcadores de inclusão por conteúdo real
	templateStr := string(content)
	for name, partial := range tr.partialsCache {
		placeholder := fmt.Sprintf("{{include \"%s\"}}", name)
		templateStr = strings.Replace(templateStr, placeholder, partial, -1)
	}

	// Compilar o template
	tmpl, err := template.New("page").Parse(templateStr)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Definir cabeçalhos
	w.Header().Set("Content-Type", "text/html; charset=utf-8")

	// Renderizar o template final
	err = tmpl.Execute(w, data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func main() {
	// Lista de ferramentas
	tools := []Tool{
		{
			ID:          "json-formatter",
			Name:        "Formatador JSON",
			Description: "Formate, valide e visualize JSON facilmente",
			Icon:        "code",
			Route:       "/tools/json-formatter",
		},
		{
			ID:          "color-picker",
			Name:        "Seletor de Cores",
			Description: "Selecione e converta cores entre diferentes formatos",
			Icon:        "palette",
			Route:       "/tools/color-picker",
		},
		{
			ID:          "markdown-editor",
			Name:        "Editor Markdown",
			Description: "Edite e visualize markdown em tempo real",
			Icon:        "file-alt",
			Route:       "/tools/markdown-editor",
		},
		{
			ID:          "dns-checker",
			Name:        "Verificador de DNS",
			Description: "Verifique a propagação de DNS em vários servidores pelo mundo",
			Icon:        "network-wired",
			Route:       "/tools/dns-checker",
		},
		// Adicionar as novas ferramentas abaixo
		{
			ID:          "base64-decoder",
			Name:        "Decodificador Base64",
			Description: "Decodifique texto em Base64 para seu formato original",
			Icon:        "exchange-alt",
			Route:       "/tools/base64-decoder",
		},
		{
			ID:          "base64-encoder",
			Name:        "Codificador Base64",
			Description: "Codifique texto para formato Base64",
			Icon:        "exchange-alt",
			Route:       "/tools/base64-encoder",
		},
		{
			ID:          "hex-decoder",
			Name:        "Decodificador Hex",
			Description: "Decodifique texto em formato hexadecimal para seu formato original",
			Icon:        "exchange-alt",
			Route:       "/tools/hex-decoder",
		},
		{
			ID:          "hex-encoder",
			Name:        "Codificador Hex",
			Description: "Codifique texto para formato hexadecimal",
			Icon:        "exchange-alt",
			Route:       "/tools/hex-encoder",
		},
		{
			ID:          "url-decoder",
			Name:        "Decodificador URL",
			Description: "Decodifique texto codificado em URL para formato legível",
			Icon:        "link",
			Route:       "/tools/url-decoder",
		},
		{
			ID:          "url-encoder",
			Name:        "Codificador URL",
			Description: "Codifique texto para formato seguro para URLs",
			Icon:        "link",
			Route:       "/tools/url-encoder",
		},
		{
			ID:          "html-decoder",
			Name:        "Decodificador HTML",
			Description: "Converta entidades HTML para caracteres normais",
			Icon:        "code",
			Route:       "/tools/html-decoder",
		},
		{
			ID:          "html-encoder",
			Name:        "Codificador HTML",
			Description: "Converta caracteres para entidades HTML",
			Icon:        "code",
			Route:       "/tools/html-encoder",
		},
		{
			ID:          "quoted-printable-decoder",
			Name:        "Decodificador Printable Citado",
			Description: "Converta texto em formato Quoted-Printable para texto normal",
			Icon:        "quote-left",
			Route:       "/tools/quoted-printable-decoder",
		},
		{
			ID:          "quoted-printable-encoder",
			Name:        "Codificador Printable Citado",
			Description: "Converta texto normal para formato Quoted-Printable",
			Icon:        "quote-right",
			Route:       "/tools/quoted-printable-encoder",
		},
		{
			ID:          "email-extractor",
			Name:        "Extrator de Emails",
			Description: "Extraia todos os endereços de email de um texto",
			Icon:        "at",
			Route:       "/tools/email-extractor",
		},
		{
			ID:          "remove-duplicates",
			Name:        "Remover Linhas Repetidas",
			Description: "Remova linhas duplicadas de uma lista de texto",
			Icon:        "clone",
			Route:       "/tools/remove-duplicates",
		},
		{
			ID:          "list-sorter",
			Name:        "Ordenador de Listas",
			Description: "Ordene uma lista de texto alfabética ou numericamente",
			Icon:        "sort-alpha-down",
			Route:       "/tools/list-sorter",
		},
		{
			ID:          "list-randomizer",
			Name:        "Randomizador de Listas",
			Description: "Embaralhe uma lista de texto de forma aleatória",
			Icon:        "random",
			Route:       "/tools/list-randomizer",
		},
		{
			ID:          "hash-generator",
			Name:        "Gerador de Hash",
			Description: "Gere hashes MD5, SHA-1, SHA-256 e outros para verificar integridade de dados",
			Icon:        "key",
			Route:       "/tools/hash-generator",
		},
		{
			ID:          "jwt-decoder",
			Name:        "Decodificador JWT",
			Description: "Decodifique tokens JWT (JSON Web Token) e visualize payload e cabeçalhos",
			Icon:        "unlock-alt",
			Route:       "/tools/jwt-decoder",
		},
		{
			ID:          "text-case-converter",
			Name:        "Conversor de Texto para Caixa Alta/Baixa",
			Description: "Converta texto para MAIÚSCULAS, minúsculas, Capitalizado, e invertido",
			Icon:        "font",
			Route:       "/tools/text-case-converter",
		},
		{
			ID:          "csv-json-converter",
			Name:        "Conversor CSV/JSON",
			Description: "Converta dados entre formatos CSV e JSON facilmente",
			Icon:        "exchange-alt",
			Route:       "/tools/csv-json-converter",
		},
		{
			ID:          "unit-converter",
			Name:        "Conversor de Unidades",
			Description: "Converta entre diferentes unidades de temperatura, peso, volume e distância",
			Icon:        "exchange-alt",
			Route:       "/tools/unit-converter",
		},
		{
			ID:          "date-diff-calculator",
			Name:        "Calculadora de Diferença entre Datas",
			Description: "Calcule a diferença em dias, semanas, meses e anos entre duas datas",
			Icon:        "calendar-alt",
			Route:       "/tools/date-diff-calculator",
		},
		{
			ID:          "cpf-cnpj-validator",
			Name:        "Criador e Validador de CPF/CNPJ",
			Description: "Crie CPFs e CNPJs válidos ou verifique a validade de um número existente",
			Icon:        "id-card",
			Route:       "/tools/cpf-cnpj-validator",
		},
		{
			ID:          "uuid-generator",
			Name:        "Gerador de UUID",
			Description: "Gere identificadores únicos universais (UUIDs) em diferentes versões",
			Icon:        "fingerprint",
			Route:       "/tools/uuid-generator",
		},
		{
			ID:          "password-generator",
			Name:        "Gerador de Senhas Seguras",
			Description: "Crie senhas fortes e seguras para suas contas online",
			Icon:        "key",
			Route:       "/tools/password-generator",
		},
		{
			ID:          "password-strength-analyzer",
			Name:        "Analisador de Força de Senhas",
			Description: "Verifique a força e segurança de suas senhas",
			Icon:        "shield-alt",
			Route:       "/tools/password-strength-analyzer",
		},
		{
			ID:          "ascii-converter",
			Name:        "Conversor de Texto para Código ASCII",
			Description: "Converta texto para códigos ASCII e vice-versa",
			Icon:        "font",
			Route:       "/tools/ascii-converter",
		},
		{
			ID:          "unicode-converter",
			Name:        "Conversor de Texto para Unicode",
			Description: "Converta texto para códigos Unicode e vice-versa",
			Icon:        "globe",
			Route:       "/tools/unicode-converter",
		},
		{
			ID:          "octal-converter",
			Name:        "Conversor de Texto para Código Octal",
			Description: "Converta texto para códigos octais e vice-versa",
			Icon:        "exchange-alt",
			Route:       "/tools/octal-converter",
		},
	}

	// Configuração para SEO (sitemap.xml e robots.txt)
	baseURL := "https://squidcoder.dev" // Substitua pelo seu domínio real
	seoConfig := seo.Config{
		BaseURL:    baseURL,
		LastMod:    time.Now(),
		ChangeFreq: "weekly",
		Priority:   "0.8",
	}

	// Extrair rotas das ferramentas
	var routes []string
	for _, tool := range tools {
		routes = append(routes, tool.Route)
	}

	// Inicializar o renderizador de templates
	templateRenderer, err := NewTemplateRenderer()
	if err != nil {
		log.Fatalf("Erro ao inicializar o renderizador de templates: %v", err)
	}

	// Configurar rotas
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}

		data := PageData{
			Title:       "SquidCoder.dev - Ferramentas para Desenvolvedores",
			Description: "Ferramentas gratuitas e eficientes para desenvolvedores",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/index.html", data)
	})

	http.HandleFunc("/tools", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Ferramentas | SquidCoder.dev",
			Description: "Lista de ferramentas disponíveis",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/tools.html", data)
	})

	http.HandleFunc("/tools/json-formatter", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Formatador JSON | SquidCoder.dev",
			Description: "Formate, valide e visualize JSON facilmente",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/json-formatter.html", data)
	})

	http.HandleFunc("/tools/color-picker", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Seletor de Cores | SquidCoder.dev",
			Description: "Selecione e converta cores entre diferentes formatos",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/color-picker.html", data)
	})

	http.HandleFunc("/tools/markdown-editor", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Editor Markdown | SquidCoder.dev",
			Description: "Edite e visualize markdown em tempo real",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/markdown-editor.html", data)
	})

	// Adicionar às rotas HTTP no main.go
	http.HandleFunc("/tools/dns-checker", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Verificador de DNS | SquidCoder.dev",
			Description: "Verifique a propagação de DNS em vários servidores pelo mundo",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/dns-checker.html", data)
	})

	// Adicionar a API para DNS
	http.HandleFunc("/api/dns/check", handlers.HandleDNSCheck)
	http.HandleFunc("/api/dns/servers", handlers.GetDNSServers)

	http.HandleFunc("/tools/base64-decoder", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Decodificador Base64 | SquidCoder.dev",
			Description: "Decodifique texto em Base64 para seu formato original",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/base64-decoder.html", data)
	})

	http.HandleFunc("/tools/base64-encoder", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Codificador Base64 | SquidCoder.dev",
			Description: "Codifique texto para formato Base64",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/base64-encoder.html", data)
	})

	http.HandleFunc("/tools/hex-decoder", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Decodificador Hexadecimal | SquidCoder.dev",
			Description: "Decodifique texto em formato hexadecimal para seu formato original",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/hex-decoder.html", data)
	})

	http.HandleFunc("/tools/hex-encoder", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Codificador Hexadecimal | SquidCoder.dev",
			Description: "Codifique texto para formato hexadecimal",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/hex-encoder.html", data)
	})

	http.HandleFunc("/tools/url-decoder", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Decodificador URL | SquidCoder.dev",
			Description: "Decodifique texto codificado em URL para formato legível",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/url-decoder.html", data)
	})

	http.HandleFunc("/tools/url-encoder", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Codificador URL | SquidCoder.dev",
			Description: "Codifique texto para formato seguro para URLs",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/url-encoder.html", data)
	})

	http.HandleFunc("/tools/html-decoder", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Decodificador HTML | SquidCoder.dev",
			Description: "Converta entidades HTML para caracteres normais",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/html-decoder.html", data)
	})

	http.HandleFunc("/tools/html-encoder", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Codificador HTML | SquidCoder.dev",
			Description: "Converta caracteres para entidades HTML",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/html-encoder.html", data)
	})

	http.HandleFunc("/tools/quoted-printable-decoder", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Decodificador Printable Citado | SquidCoder.dev",
			Description: "Converta texto em formato Quoted-Printable para texto normal",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/quoted-printable-decoder.html", data)
	})

	http.HandleFunc("/tools/quoted-printable-encoder", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Codificador Printable Citado | SquidCoder.dev",
			Description: "Converta texto normal para formato Quoted-Printable",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/quoted-printable-encoder.html", data)
	})

	http.HandleFunc("/tools/email-extractor", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Extrator de Emails | SquidCoder.dev",
			Description: "Extraia todos os endereços de email de um texto",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/email-extractor.html", data)
	})

	http.HandleFunc("/tools/remove-duplicates", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Remover Linhas Repetidas | SquidCoder.dev",
			Description: "Remova linhas duplicadas de uma lista de texto",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/remove-duplicates.html", data)
	})

	http.HandleFunc("/tools/list-sorter", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Ordenador de Listas | SquidCoder.dev",
			Description: "Ordene uma lista de texto alfabética ou numericamente",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/list-sorter.html", data)
	})

	http.HandleFunc("/tools/list-randomizer", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Randomizador de Listas | SquidCoder.dev",
			Description: "Embaralhe uma lista de texto de forma aleatória",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/list-randomizer.html", data)
	})

	http.HandleFunc("/tools/hash-generator", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Gerador de Hash | SquidCoder.dev",
			Description: "Gere hashes MD5, SHA-1, SHA-256 e outros para verificar integridade de dados",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/hash-generator.html", data)
	})

	http.HandleFunc("/tools/jwt-decoder", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Decodificador JWT | SquidCoder.dev",
			Description: "Decodifique tokens JWT (JSON Web Token) e visualize payload e cabeçalhos",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/jwt-decoder.html", data)
	})

	http.HandleFunc("/tools/text-case-converter", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Conversor de Texto para Caixa Alta/Baixa | SquidCoder.dev",
			Description: "Converta texto para MAIÚSCULAS, minúsculas, Capitalizado, e invertido",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/text-case-converter.html", data)
	})

	http.HandleFunc("/tools/csv-json-converter", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Conversor CSV/JSON | SquidCoder.dev",
			Description: "Converta dados entre formatos CSV e JSON facilmente",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/csv-json-converter.html", data)
	})

	http.HandleFunc("/tools/unit-converter", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Conversor de Unidades | SquidCoder.dev",
			Description: "Converta entre diferentes unidades de temperatura, peso, volume e distância",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/unit-converter.html", data)
	})

	http.HandleFunc("/tools/date-diff-calculator", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Calculadora de Diferença entre Datas | SquidCoder.dev",
			Description: "Calcule a diferença em dias, semanas, meses e anos entre duas datas",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/date-diff-calculator.html", data)
	})

	http.HandleFunc("/tools/cpf-cnpj-validator", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Criador e Validador de CPF/CNPJ | SquidCoder.dev",
			Description: "Crie CPFs e CNPJs válidos ou verifique a validade de um número existente",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/cpf-cnpj-validator.html", data)
	})

	http.HandleFunc("/tools/uuid-generator", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Gerador de UUID | SquidCoder.dev",
			Description: "Gere identificadores únicos universais (UUIDs) em diferentes versões",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/uuid-generator.html", data)
	})

	http.HandleFunc("/tools/password-generator", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Gerador de Senhas Seguras | SquidCoder.dev",
			Description: "Crie senhas fortes e seguras para suas contas online",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/password-generator.html", data)
	})

	http.HandleFunc("/tools/password-strength-analyzer", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Analisador de Força de Senhas | SquidCoder.dev",
			Description: "Verifique a força e segurança de suas senhas",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/password-strength-analyzer.html", data)
	})

	http.HandleFunc("/tools/ascii-converter", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Conversor de Texto para Código ASCII | SquidCoder.dev",
			Description: "Converta texto para códigos ASCII e vice-versa",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/ascii-converter.html", data)
	})

	http.HandleFunc("/tools/unicode-converter", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Conversor de Texto para Unicode | SquidCoder.dev",
			Description: "Converta texto para códigos Unicode e vice-versa",
			Tools:       tools,
			Theme:       "dark",
		}

		templateRenderer.RenderTemplate(w, "templates/unicode-converter.html", data)
	})

	http.HandleFunc("/tools/octal-converter", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:       "Conversor de Texto para Código Octal | SquidCoder.dev",
			Description: "Converta texto para códigos octais e vice-versa",
			Tools:       tools,
			Theme:       "dark",
		}
		templateRenderer.RenderTemplate(w, "templates/octal-converter.html", data)
	})

	// Rota para a configuração do tema
	http.HandleFunc("/set-theme", func(w http.ResponseWriter, r *http.Request) {
		theme := r.URL.Query().Get("theme")
		if theme != "light" && theme != "dark" {
			theme = "dark" // Tema padrão
		}

		// Configurar cookie para o tema
		http.SetCookie(w, &http.Cookie{
			Name:  "theme",
			Value: theme,
			Path:  "/",
		})

		// Redirecionar de volta para a página anterior
		referer := r.Header.Get("Referer")
		if referer == "" {
			referer = "/"
		}

		http.Redirect(w, r, referer, http.StatusSeeOther)
	})

	// Rotas para sitemap.xml e robots.txt
	http.HandleFunc("/sitemap.xml", seo.GenerateSitemap(routes, seoConfig))
	http.HandleFunc("/robots.txt", seo.GenerateRobots(baseURL))

	// Configurar arquivos estáticos
	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	// Iniciar servidor
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	fmt.Printf("Servidor iniciado em http://localhost:%s\n", port)
	// Use o middleware para garantir o redirecionamento para HTTPS
	handler := http.DefaultServeMux
	secureHandler := SecurityHeaders(RedirectToHTTPS(handler))

	// Iniciar o servidor
	log.Printf("Servidor iniciado em http://localhost:%s (HTTPS gerenciado pelo Cloudflare) e (com proteções de segurança)\n", port)
	log.Fatal(http.ListenAndServe(":"+port, secureHandler))
}
