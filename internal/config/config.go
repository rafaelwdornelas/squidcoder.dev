// internal/config/config.go
package config

import (
	"encoding/json"
	"os"
)

// Config contém as configurações da aplicação
type Config struct {
	AppName      string `json:"app_name"`
	Description  string `json:"description"`
	DefaultTheme string `json:"default_theme"`
	Tools        []Tool `json:"tools"`
}

// Tool representa uma ferramenta disponível no site
type Tool struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	Route       string `json:"route"`
}

// Load carrega as configurações do arquivo ou usa valores padrão
func Load() (*Config, error) {
	cfg := &Config{
		AppName:      "SquidCoder.dev",
		Description:  "Ferramentas gratuitas para desenvolvedores",
		DefaultTheme: "dark",
		Tools: []Tool{
			{
				ID:          "json-formatter",
				Name:        "Formatador JSON",
				Description: "Formate, valide e visualize JSON facilmente",
				Icon:        "code-json",
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
				Icon:        "markdown",
				Route:       "/tools/markdown-editor",
			},
		},
	}

	// Se existir um arquivo de configuração, carregue-o
	if _, err := os.Stat("config.json"); err == nil {
		file, err := os.Open("config.json")
		if err != nil {
			return cfg, nil // Retorne config padrão se não conseguir abrir o arquivo
		}
		defer file.Close()

		decoder := json.NewDecoder(file)
		if err := decoder.Decode(cfg); err != nil {
			return cfg, nil // Retorne config padrão se não conseguir decodificar
		}
	}

	return cfg, nil
}
