// internal/templates/templates.go
package templates

import (
	"html/template"
	"net/http"
	"path/filepath"
)

// Manager gerencia os templates HTML
type Manager struct {
	templates *template.Template
}

// Init inicializa e carrega todos os templates
func Init() (*Manager, error) {
	// Definir funções de template
	funcMap := template.FuncMap{
		"safeHTML": func(s string) template.HTML {
			return template.HTML(s)
		},
	}

	// Carregar templates
	tmpl := template.New("").Funcs(funcMap)

	// Caminhos para procurar templates
	patterns := []string{
		"templates/layout/*.html",
		"templates/pages/*.html",
		"templates/components/*.html",
		"templates/tools/*.html",
	}

	// Carregar todos os templates
	for _, pattern := range patterns {
		paths, err := filepath.Glob(pattern)
		if err != nil {
			return nil, err
		}

		for _, path := range paths {
			_, err := tmpl.ParseFiles(path)
			if err != nil {
				return nil, err
			}
		}
	}

	return &Manager{templates: tmpl}, nil
}

// Render renderiza um template específico
func (m *Manager) Render(w http.ResponseWriter, name string, data interface{}) {
	// Configurar cabeçalhos
	w.Header().Set("Content-Type", "text/html; charset=utf-8")

	// Definir o template de conteúdo
	contentTmpl := m.templates.Lookup(name)
	if contentTmpl == nil {
		http.Error(w, "Template não encontrado: "+name, http.StatusInternalServerError)
		return
	}

	// Criar um template temporário para o conteúdo
	layoutTmpl, err := m.templates.Clone()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Definir o template de conteúdo como "content"
	_, err = layoutTmpl.AddParseTree("content", contentTmpl.Tree)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Renderizar o template base com os dados
	err = layoutTmpl.ExecuteTemplate(w, "base.html", data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
