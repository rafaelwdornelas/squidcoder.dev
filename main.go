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
	"squidcoder/internal/generateimage"
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
	Keywords    string   // Palavras-chave específicas da ferramenta
	ImageURL    string   // URL da imagem para compartilhamento
	Category    string   // Categoria da ferramenta (codificação, formatação, etc.)
	RelatedIDs  []string // IDs de ferramentas relacionadas
}

// PageData contém os dados para renderizar as páginas
type PageData struct {
	Title         string
	Description   string
	Tools         []Tool
	Theme         string
	Canonical     string // URL canônica da página
	Keywords      string // Palavras-chave relevantes
	ImageURL      string // URL da imagem de compartilhamento
	PublishedDate string // Data de publicação
	ModifiedDate  string // Data de última modificação
	CurrentTool   *Tool  // Ferramenta atual (se estiver em uma página de ferramenta)
	RelatedTools  []Tool // Ferramentas relacionadas
	BaseURL       string // URL base do site
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

		// Adicione precarregamento para recursos críticos
		w.Header().Set("Link", "</static/css/style.css>; rel=preload; as=style, </static/img/logo.svg>; rel=preload; as=image")

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
	// URL base do site
	baseURL := "https://squidcoder.dev"

	// Lista de ferramentas
	tools := []Tool{
		{
			ID:          "json-formatter",
			Name:        "Formatador JSON",
			Description: "Formate, valide e visualize JSON facilmente",
			Icon:        "code",
			Route:       "/tools/json-formatter",
			Keywords:    "formatador json, validador json, editor json, parser json, json beautifier, pretty json",
			ImageURL:    baseURL + "/static/img/tools/json-formatter.png",
			Category:    "formatação",
			RelatedIDs:  []string{"csv-json-converter"},
		},
		{
			ID:          "color-picker",
			Name:        "Seletor de Cores",
			Description: "Selecione e converta cores entre diferentes formatos",
			Icon:        "palette",
			Route:       "/tools/color-picker",
			Keywords:    "seletor de cores, conversor cores, cores hex, cores rgb, paleta cores, color picker",
			ImageURL:    baseURL + "/static/img/tools/color-picker.png",
			Category:    "design",
			RelatedIDs:  []string{"gradient-generator"},
		},
		{
			ID:          "markdown-editor",
			Name:        "Editor Markdown",
			Description: "Edite e visualize markdown em tempo real",
			Icon:        "file-alt",
			Route:       "/tools/markdown-editor",
			Keywords:    "editor markdown, visualizador markdown, preview markdown, formatador texto, markdown online",
			ImageURL:    baseURL + "/static/img/tools/markdown-editor.png",
			Category:    "texto",
			RelatedIDs:  []string{"text-case-converter"},
		},
		{
			ID:          "dns-checker",
			Name:        "Verificador de DNS",
			Description: "Verifique a propagação de DNS em vários servidores pelo mundo",
			Icon:        "network-wired",
			Route:       "/tools/dns-checker",
			Keywords:    "verificador dns, propagação dns, consulta dns, servidores dns, dns lookup",
			ImageURL:    baseURL + "/static/img/tools/dns-checker.png",
			Category:    "rede",
			RelatedIDs:  []string{},
		},
		{
			ID:          "base64-decoder",
			Name:        "Decodificador Base64",
			Description: "Decodifique texto em Base64 para seu formato original",
			Icon:        "exchange-alt",
			Route:       "/tools/base64-decoder",
			Keywords:    "decoder base64, decodificador base64, converter base64, base64 para texto",
			ImageURL:    baseURL + "/static/img/tools/base64-decoder.png",
			Category:    "codificação",
			RelatedIDs:  []string{"base64-encoder"},
		},
		{
			ID:          "base64-encoder",
			Name:        "Codificador Base64",
			Description: "Codifique texto para formato Base64",
			Icon:        "exchange-alt",
			Route:       "/tools/base64-encoder",
			Keywords:    "encoder base64, codificador base64, converter para base64, texto para base64",
			ImageURL:    baseURL + "/static/img/tools/base64-encoder.png",
			Category:    "codificação",
			RelatedIDs:  []string{"base64-decoder"},
		},
		{
			ID:          "hex-decoder",
			Name:        "Decodificador Hex",
			Description: "Decodifique texto em formato hexadecimal para seu formato original",
			Icon:        "exchange-alt",
			Route:       "/tools/hex-decoder",
			Keywords:    "decodificador hex, hexadecimal converter, hex to text, conversor hexadecimal",
			ImageURL:    baseURL + "/static/img/tools/hex-decoder.png",
			Category:    "codificação",
			RelatedIDs:  []string{"hex-encoder"},
		},
		{
			ID:          "hex-encoder",
			Name:        "Codificador Hex",
			Description: "Codifique texto para formato hexadecimal",
			Icon:        "exchange-alt",
			Route:       "/tools/hex-encoder",
			Keywords:    "codificador hex, texto para hexadecimal, text to hex, converter para hexadecimal",
			ImageURL:    baseURL + "/static/img/tools/hex-encoder.png",
			Category:    "codificação",
			RelatedIDs:  []string{"hex-decoder"},
		},
		{
			ID:          "url-decoder",
			Name:        "Decodificador URL",
			Description: "Decodifique texto codificado em URL para formato legível",
			Icon:        "link",
			Route:       "/tools/url-decoder",
			Keywords:    "decodificador url, url decode, converter url encoded, url encoding remover",
			ImageURL:    baseURL + "/static/img/tools/url-decoder.png",
			Category:    "codificação",
			RelatedIDs:  []string{"url-encoder"},
		},
		{
			ID:          "url-encoder",
			Name:        "Codificador URL",
			Description: "Codifique texto para formato seguro para URLs",
			Icon:        "link",
			Route:       "/tools/url-encoder",
			Keywords:    "codificador url, url encode, converter para url, url encoding",
			ImageURL:    baseURL + "/static/img/tools/url-encoder.png",
			Category:    "codificação",
			RelatedIDs:  []string{"url-decoder"},
		},
		{
			ID:          "html-decoder",
			Name:        "Decodificador HTML",
			Description: "Converta entidades HTML para caracteres normais",
			Icon:        "code",
			Route:       "/tools/html-decoder",
			Keywords:    "decodificador html, html entities converter, html decode, converter entidades html",
			ImageURL:    baseURL + "/static/img/tools/html-decoder.png",
			Category:    "codificação",
			RelatedIDs:  []string{"html-encoder"},
		},
		{
			ID:          "html-encoder",
			Name:        "Codificador HTML",
			Description: "Converta caracteres para entidades HTML",
			Icon:        "code",
			Route:       "/tools/html-encoder",
			Keywords:    "codificador html, converter para entidades html, html entities, html encode",
			ImageURL:    baseURL + "/static/img/tools/html-encoder.png",
			Category:    "codificação",
			RelatedIDs:  []string{"html-decoder"},
		},
		{
			ID:          "quoted-printable-decoder",
			Name:        "Decodificador Printable Citado",
			Description: "Converta texto em formato Quoted-Printable para texto normal",
			Icon:        "quote-left",
			Route:       "/tools/quoted-printable-decoder",
			Keywords:    "decodificador quoted-printable, converter quoted-printable, quoted printable decode",
			ImageURL:    baseURL + "/static/img/tools/quoted-printable-decoder.png",
			Category:    "codificação",
			RelatedIDs:  []string{"quoted-printable-encoder"},
		},
		{
			ID:          "quoted-printable-encoder",
			Name:        "Codificador Printable Citado",
			Description: "Converta texto normal para formato Quoted-Printable",
			Icon:        "quote-right",
			Route:       "/tools/quoted-printable-encoder",
			Keywords:    "codificador quoted-printable, converter para quoted-printable, quoted printable encode",
			ImageURL:    baseURL + "/static/img/tools/quoted-printable-encoder.png",
			Category:    "codificação",
			RelatedIDs:  []string{"quoted-printable-decoder"},
		},
		{
			ID:          "email-extractor",
			Name:        "Extrator de Emails",
			Description: "Extraia todos os endereços de email de um texto",
			Icon:        "at",
			Route:       "/tools/email-extractor",
			Keywords:    "extrator email, extrair emails de texto, encontrar emails, coletar emails",
			ImageURL:    baseURL + "/static/img/tools/email-extractor.png",
			Category:    "texto",
			RelatedIDs:  []string{"regex-extractor"},
		},
		{
			ID:          "remove-duplicates",
			Name:        "Remover Linhas Repetidas",
			Description: "Remova linhas duplicadas de uma lista de texto",
			Icon:        "clone",
			Route:       "/tools/remove-duplicates",
			Keywords:    "remover duplicatas, eliminar linhas repetidas, remover duplicados, linhas únicas",
			ImageURL:    baseURL + "/static/img/tools/remove-duplicates.png",
			Category:    "texto",
			RelatedIDs:  []string{"list-sorter"},
		},
		{
			ID:          "list-sorter",
			Name:        "Ordenador de Listas",
			Description: "Ordene uma lista de texto alfabética ou numericamente",
			Icon:        "sort-alpha-down",
			Route:       "/tools/list-sorter",
			Keywords:    "ordenador de listas, ordenar texto, classificar linhas, ordenar alfabeticamente",
			ImageURL:    baseURL + "/static/img/tools/list-sorter.png",
			Category:    "texto",
			RelatedIDs:  []string{"remove-duplicates", "list-randomizer"},
		},
		{
			ID:          "list-randomizer",
			Name:        "Randomizador de Listas",
			Description: "Embaralhe uma lista de texto de forma aleatória",
			Icon:        "random",
			Route:       "/tools/list-randomizer",
			Keywords:    "randomizador listas, embaralhar texto, aleatorizar linhas, shuffle lista",
			ImageURL:    baseURL + "/static/img/tools/list-randomizer.png",
			Category:    "texto",
			RelatedIDs:  []string{"list-sorter"},
		},
		{
			ID:          "hash-generator",
			Name:        "Gerador de Hash",
			Description: "Gere hashes MD5, SHA-1, SHA-256 e outros para verificar integridade de dados",
			Icon:        "key",
			Route:       "/tools/hash-generator",
			Keywords:    "gerador hash, md5 generator, sha1, sha256, hash calculator, verificação integridade",
			ImageURL:    baseURL + "/static/img/tools/hash-generator.png",
			Category:    "segurança",
			RelatedIDs:  []string{"password-generator"},
		},
		{
			ID:          "jwt-decoder",
			Name:        "Decodificador JWT",
			Description: "Decodifique tokens JWT (JSON Web Token) e visualize payload e cabeçalhos",
			Icon:        "unlock-alt",
			Route:       "/tools/jwt-decoder",
			Keywords:    "decodificador jwt, jwt decode, json web token, token jwt, visualizador jwt",
			ImageURL:    baseURL + "/static/img/tools/jwt-decoder.png",
			Category:    "segurança",
			RelatedIDs:  []string{"json-formatter"},
		},
		{
			ID:          "text-case-converter",
			Name:        "Conversor de Texto para Caixa Alta/Baixa",
			Description: "Converta texto para MAIÚSCULAS, minúsculas, Capitalizado, e invertido",
			Icon:        "font",
			Route:       "/tools/text-case-converter",
			Keywords:    "conversor caixa alta baixa, maiúsculas minúsculas, capitalizar texto, inverter caixa",
			ImageURL:    baseURL + "/static/img/tools/text-case-converter.png",
			Category:    "texto",
			RelatedIDs:  []string{"markdown-editor"},
		},
		{
			ID:          "csv-json-converter",
			Name:        "Conversor CSV/JSON",
			Description: "Converta dados entre formatos CSV e JSON facilmente",
			Icon:        "exchange-alt",
			Route:       "/tools/csv-json-converter",
			Keywords:    "conversor csv json, csv para json, json para csv, converter dados tabulares",
			ImageURL:    baseURL + "/static/img/tools/csv-json-converter.png",
			Category:    "dados",
			RelatedIDs:  []string{"json-formatter"},
		},
		{
			ID:          "unit-converter",
			Name:        "Conversor de Unidades",
			Description: "Converta entre diferentes unidades de temperatura, peso, volume e distância",
			Icon:        "exchange-alt",
			Route:       "/tools/unit-converter",
			Keywords:    "conversor unidades, converter temperatura, converter peso, converter distância, medidas",
			ImageURL:    baseURL + "/static/img/tools/unit-converter.png",
			Category:    "cálculos",
			RelatedIDs:  []string{"date-diff-calculator"},
		},
		{
			ID:          "date-diff-calculator",
			Name:        "Calculadora de Diferença entre Datas",
			Description: "Calcule a diferença em dias, semanas, meses e anos entre duas datas",
			Icon:        "calendar-alt",
			Route:       "/tools/date-diff-calculator",
			Keywords:    "calculadora datas, diferença entre datas, dias entre datas, intervalo data",
			ImageURL:    baseURL + "/static/img/tools/date-diff-calculator.png",
			Category:    "cálculos",
			RelatedIDs:  []string{"unit-converter"},
		},
		{
			ID:          "cpf-cnpj-validator",
			Name:        "Criador e Validador de CPF/CNPJ",
			Description: "Crie CPFs e CNPJs válidos ou verifique a validade de um número existente",
			Icon:        "id-card",
			Route:       "/tools/cpf-cnpj-validator",
			Keywords:    "validador cpf cnpj, verificar cpf, verificar cnpj, gerador cpf, gerador cnpj",
			ImageURL:    baseURL + "/static/img/tools/cpf-cnpj-validator.png",
			Category:    "dados",
			RelatedIDs:  []string{"uuid-generator"},
		},
		{
			ID:          "uuid-generator",
			Name:        "Gerador de UUID",
			Description: "Gere identificadores únicos universais (UUIDs) em diferentes versões",
			Icon:        "fingerprint",
			Route:       "/tools/uuid-generator",
			Keywords:    "gerador uuid, uuid v4, uuid v1, guid, identificador único, uuid generator",
			ImageURL:    baseURL + "/static/img/tools/uuid-generator.png",
			Category:    "dados",
			RelatedIDs:  []string{"cpf-cnpj-validator"},
		},
		{
			ID:          "password-generator",
			Name:        "Gerador de Senhas Seguras",
			Description: "Crie senhas fortes e seguras para suas contas online",
			Icon:        "key",
			Route:       "/tools/password-generator",
			Keywords:    "gerador senha, senhas seguras, senha forte, criar senha, password generator",
			ImageURL:    baseURL + "/static/img/tools/password-generator.png",
			Category:    "segurança",
			RelatedIDs:  []string{"password-strength-analyzer"},
		},
		{
			ID:          "password-strength-analyzer",
			Name:        "Analisador de Força de Senhas",
			Description: "Verifique a força e segurança de suas senhas",
			Icon:        "shield-alt",
			Route:       "/tools/password-strength-analyzer",
			Keywords:    "analisador senha, verificar força senha, segurança senha, password strength",
			ImageURL:    baseURL + "/static/img/tools/password-strength-analyzer.png",
			Category:    "segurança",
			RelatedIDs:  []string{"password-generator"},
		},
		{
			ID:          "ascii-converter",
			Name:        "Conversor de Texto para Código ASCII",
			Description: "Converta texto para códigos ASCII e vice-versa",
			Icon:        "font",
			Route:       "/tools/ascii-converter",
			Keywords:    "conversor ascii, texto para ascii, ascii para texto, códigos ascii, tabela ascii",
			ImageURL:    baseURL + "/static/img/tools/ascii-converter.png",
			Category:    "codificação",
			RelatedIDs:  []string{"unicode-converter", "octal-converter"},
		},
		{
			ID:          "unicode-converter",
			Name:        "Conversor de Texto para Unicode",
			Description: "Converta texto para códigos Unicode e vice-versa",
			Icon:        "globe",
			Route:       "/tools/unicode-converter",
			Keywords:    "conversor unicode, texto para unicode, unicode para texto, códigos unicode",
			ImageURL:    baseURL + "/static/img/tools/unicode-converter.png",
			Category:    "codificação",
			RelatedIDs:  []string{"ascii-converter", "octal-converter"},
		},
		{
			ID:          "octal-converter",
			Name:        "Conversor de Texto para Código Octal",
			Description: "Converta texto para códigos octais e vice-versa",
			Icon:        "exchange-alt",
			Route:       "/tools/octal-converter",
			Keywords:    "conversor octal, texto para octal, octal para texto, códigos octais, sistema octal",
			ImageURL:    baseURL + "/static/img/tools/octal-converter.png",
			Category:    "codificação",
			RelatedIDs:  []string{"ascii-converter", "unicode-converter"},
		},
		{
			ID:          "regex-extractor",
			Name:        "Regex Extractor",
			Description: "Extraia padrões de texto usando expressões regulares",
			Icon:        "search",
			Route:       "/tools/regex-extractor",
			Keywords:    "extrator regex, expressões regulares, extrair padrões, regex matcher, regex tester",
			ImageURL:    baseURL + "/static/img/tools/regex-extractor.png",
			Category:    "texto",
			RelatedIDs:  []string{"email-extractor"},
		},
		{
			ID:          "gradient-generator",
			Name:        "Gerador de Gradientes CSS",
			Description: "Crie e personalize gradientes CSS para seus projetos",
			Icon:        "palette",
			Route:       "/tools/gradient-generator",
			Keywords:    "gerador gradiente, css gradient, gradiente linear, gradiente radial, gradiente css",
			ImageURL:    baseURL + "/static/img/tools/gradient-generator.png",
			Category:    "design",
			RelatedIDs:  []string{"color-picker", "box-shadow-generator", "border-radius-generator"},
		},
		{
			ID:          "box-shadow-generator",
			Name:        "Gerador de Box-Shadow CSS",
			Description: "Crie e personalize sombras para seus elementos",
			Icon:        "square-shadow",
			Route:       "/tools/box-shadow-generator",
			Keywords:    "gerador box-shadow, css sombra, box shadow css, sombra elemento, shadow generator",
			ImageURL:    baseURL + "/static/img/tools/box-shadow-generator.png",
			Category:    "design",
			RelatedIDs:  []string{"gradient-generator", "border-radius-generator"},
		},
		{
			ID:          "border-radius-generator",
			Name:        "Gerador de Border Radius CSS",
			Description: "Crie bordas arredondadas personalizadas para os seus elementos",
			Icon:        "border-radius",
			Route:       "/tools/border-radius-generator",
			Keywords:    "gerador border-radius, cantos arredondados css, bordas arredondadas, radius css",
			ImageURL:    baseURL + "/static/img/tools/border-radius-generator.png",
			Category:    "design",
			RelatedIDs:  []string{"box-shadow-generator", "gradient-generator"},
		},
		{
			ID:          "flexbox-grid-generator",
			Name:        "Gerador de Flexbox/Grids CSS",
			Description: "Crie layouts responsivos com Flexbox e CSS Grid facilmente",
			Icon:        "grid",
			Route:       "/tools/flexbox-grid-generator",
			Keywords:    "gerador flexbox, css grid generator, layout responsive, flexbox playground, grid css",
			ImageURL:    baseURL + "/static/img/tools/flexbox-grid-generator.png",
			Category:    "design",
			RelatedIDs:  []string{"gradient-generator", "box-shadow-generator", "border-radius-generator"},
		},
	}

	// Verificar e gerar imagens para as ferramentas
	staticDir := "static"
	var toolImages []generateimage.Tool

	// Converter as ferramentas para o formato do gerador de imagens
	for _, tool := range tools {
		toolImages = append(toolImages, generateimage.CreateToolImageData(
			tool.ID,
			tool.Name,
			tool.Description,
			tool.Category,
			tool.Icon,
		))
	}

	// Gerar as imagens
	generateimage.GenerateAllToolImages(toolImages, staticDir)

	// Configuração para SEO (sitemap.xml e robots.txt)
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
			Title:         "SquidCoder.dev - Ferramentas para Desenvolvedores",
			Description:   "Ferramentas gratuitas e eficientes para desenvolvedores",
			Tools:         tools,
			Theme:         getThemeFromRequest(r, "dark"),
			Canonical:     "https://squidcoder.dev/",
			Keywords:      "ferramentas para desenvolvedores, ferramentas de código, ferramentas web, formatador json, seletor de cores, editor markdown",
			ImageURL:      "https://squidcoder.dev/static/img/logo.svg",
			PublishedDate: "2023-01-01",
			ModifiedDate:  time.Now().Format("2006-01-02"),
		}

		templateRenderer.RenderTemplate(w, "templates/index.html", data)
	})

	http.HandleFunc("/tools", func(w http.ResponseWriter, r *http.Request) {
		data := PageData{
			Title:         "Ferramentas | SquidCoder.dev",
			Description:   "Lista de ferramentas disponíveis para desenvolvedores",
			Tools:         tools,
			Theme:         getThemeFromRequest(r, "dark"),
			Canonical:     "https://squidcoder.dev/tools",
			Keywords:      "ferramentas web, ferramentas desenvolvedor, utilidades de código, ferramentas online gratuitas",
			ImageURL:      "https://squidcoder.dev/static/img/tools-cover.png",
			PublishedDate: "2023-01-01",
			ModifiedDate:  time.Now().Format("2006-01-02"),
		}

		templateRenderer.RenderTemplate(w, "templates/tools.html", data)
	})

	// Configurar rota única para todas as ferramentas
	for _, tool := range tools {
		// Criamos uma cópia da ferramenta para uso dentro da closure
		toolCopy := tool

		http.HandleFunc(tool.Route, func(w http.ResponseWriter, r *http.Request) {
			// Criar keywords específicas para a ferramenta
			keywords := fmt.Sprintf("ferramenta %s, %s online, %s grátis, squidcoder",
				toolCopy.Name, toolCopy.Name, toolCopy.Name)

			// Gerar URL canônica
			canonical := fmt.Sprintf("https://squidcoder.dev%s", toolCopy.Route)

			// Gerar URL da imagem
			imageURL := fmt.Sprintf("https://squidcoder.dev/static/img/tools/%s.png", toolCopy.ID)

			data := PageData{
				Title:         toolCopy.Name + " | SquidCoder.dev",
				Description:   toolCopy.Description,
				Tools:         tools,
				Theme:         getThemeFromRequest(r, "dark"),
				Canonical:     canonical,
				Keywords:      keywords,
				ImageURL:      imageURL,
				PublishedDate: "2023-01-01", // Data quando a ferramenta foi publicada
				ModifiedDate:  time.Now().Format("2006-01-02"),
			}

			templatePath := fmt.Sprintf("templates/%s.html", toolCopy.ID)
			templateRenderer.RenderTemplate(w, templatePath, data)
		})
	}

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

// Função auxiliar para obter o tema a partir da requisição
func getThemeFromRequest(r *http.Request, defaultTheme string) string {
	cookie, err := r.Cookie("theme")
	if err == nil && cookie.Value != "" {
		if cookie.Value == "light" || cookie.Value == "dark" {
			return cookie.Value
		}
	}
	return defaultTheme
}
