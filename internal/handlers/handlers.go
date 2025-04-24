// internal/handlers/handlers.go - Versão melhorada
package handlers

import (
	"net/http"

	"squidcoder/internal/config"
	"squidcoder/internal/templates"

	"github.com/gorilla/mux"
)

// ThemeGetter é uma função que obtém o tema atual
type ThemeGetter func(r *http.Request, defaultTheme string) string

// Handler gerencia os handlers HTTP
type Handler struct {
	templates   *templates.Manager
	config      *config.Config
	themeGetter ThemeGetter
}

// New cria uma nova instância de Handler
func New(t *templates.Manager, c *config.Config, tg ThemeGetter) *Handler {
	return &Handler{
		templates:   t,
		config:      c,
		themeGetter: tg,
	}
}

// Home manipula a página inicial
func (h *Handler) Home(w http.ResponseWriter, r *http.Request) {
	data := map[string]interface{}{
		"Title":       h.config.AppName,
		"Description": h.config.Description,
		"Tools":       h.config.Tools,
		"Theme":       h.themeGetter(r, h.config.DefaultTheme),
	}

	h.templates.Render(w, "index.html", data)
}

// ToolsList manipula a página de listagem de ferramentas
func (h *Handler) ToolsList(w http.ResponseWriter, r *http.Request) {
	data := map[string]interface{}{
		"Title":       "Ferramentas | " + h.config.AppName,
		"Description": "Ferramentas gratuitas para desenvolvedores",
		"Tools":       h.config.Tools,
		"Theme":       h.themeGetter(r, h.config.DefaultTheme),
	}

	h.templates.Render(w, "tools.html", data)
}

// ToolDetail manipula a página de detalhes de uma ferramenta específica
func (h *Handler) ToolDetail(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	toolID := vars["id"]

	// Encontrar a ferramenta
	var selectedTool *config.Tool
	for _, tool := range h.config.Tools {
		if tool.ID == toolID {
			selectedTool = &tool
			break
		}
	}

	// Ferramenta não encontrada
	if selectedTool == nil {
		http.NotFound(w, r)
		return
	}

	// Renderizar a página da ferramenta
	templateName := "tools/" + toolID + ".html"

	data := map[string]interface{}{
		"Title":       selectedTool.Name + " | " + h.config.AppName,
		"Description": selectedTool.Description,
		"Tool":        selectedTool,
		"Theme":       h.themeGetter(r, h.config.DefaultTheme),
	}

	h.templates.Render(w, templateName, data)
}

// JsonFormatter manipula a ferramenta de formatação JSON
func (h *Handler) JsonFormatter(w http.ResponseWriter, r *http.Request) {
	data := map[string]interface{}{
		"Title":       "Formatador JSON | " + h.config.AppName,
		"Description": "Formate, valide e visualize JSON facilmente",
		"Theme":       h.themeGetter(r, h.config.DefaultTheme),
	}

	h.templates.Render(w, "tools/json-formatter.html", data)
}

// ColorPicker manipula a ferramenta de seleção de cores
func (h *Handler) ColorPicker(w http.ResponseWriter, r *http.Request) {
	data := map[string]interface{}{
		"Title":       "Seletor de Cores | " + h.config.AppName,
		"Description": "Selecione e converta cores entre diferentes formatos",
		"Theme":       h.themeGetter(r, h.config.DefaultTheme),
	}

	h.templates.Render(w, "tools/color-picker.html", data)
}

// MarkdownEditor manipula a ferramenta de edição de markdown
func (h *Handler) MarkdownEditor(w http.ResponseWriter, r *http.Request) {
	data := map[string]interface{}{
		"Title":       "Editor Markdown | " + h.config.AppName,
		"Description": "Edite e visualize markdown em tempo real",
		"Theme":       h.themeGetter(r, h.config.DefaultTheme),
	}

	h.templates.Render(w, "tools/markdown-editor.html", data)
}
