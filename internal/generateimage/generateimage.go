package generateimage

import (
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"image/png"
	"log"
	"os"
	"path/filepath"
)

// Tool representa a estrutura de uma ferramenta para geração de imagem
type Tool struct {
	ID          string
	Name        string
	Description string
	Category    string
	Icon        string
}

// GenerateToolImage cria uma imagem para uma ferramenta caso ela não exista
func GenerateToolImage(tool Tool, imageDir string) error {
	// Definir o caminho da imagem
	imagePath := filepath.Join(imageDir, tool.ID+".png")

	// Verificar se a imagem já existe
	if _, err := os.Stat(imagePath); err == nil {
		// Arquivo já existe, não é necessário criar
		return nil
	}

	// Garantir que o diretório exista
	err := os.MkdirAll(imageDir, 0755)
	if err != nil {
		return fmt.Errorf("erro ao criar diretório %s: %v", imageDir, err)
	}

	// Criar uma nova imagem de 1200x630 pixels (tamanho recomendado para redes sociais)
	width, height := 1200, 630
	img := image.NewRGBA(image.Rect(0, 0, width, height))

	// Escolher a cor de fundo baseada na categoria da ferramenta
	var bgColor color.RGBA
	switch tool.Category {
	case "formatação":
		bgColor = color.RGBA{20, 130, 220, 255} // Azul
	case "design":
		bgColor = color.RGBA{220, 60, 120, 255} // Rosa
	case "texto":
		bgColor = color.RGBA{60, 180, 120, 255} // Verde
	case "rede":
		bgColor = color.RGBA{80, 80, 200, 255} // Azul escuro
	case "codificação":
		bgColor = color.RGBA{220, 130, 20, 255} // Laranja
	case "segurança":
		bgColor = color.RGBA{70, 70, 70, 255} // Cinza escuro
	case "dados":
		bgColor = color.RGBA{100, 80, 180, 255} // Roxo
	case "cálculos":
		bgColor = color.RGBA{200, 180, 20, 255} // Amarelo
	default:
		bgColor = color.RGBA{60, 130, 190, 255} // Azul padrão
	}

	// Preencher o fundo
	draw.Draw(img, img.Bounds(), &image.Uniform{bgColor}, image.Point{}, draw.Src)

	// Criar gradiente sutil (simplificado)
	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			alpha := uint8(float64(x) / float64(width) * 30)
			c := img.RGBAAt(x, y)
			c.R = uint8(min(int(c.R)+int(alpha), 255))
			c.G = uint8(min(int(c.G)+int(alpha), 255))
			c.B = uint8(min(int(c.B)+int(alpha), 255))
			img.SetRGBA(x, y, c)
		}
	}

	// Salvar a imagem como PNG
	file, err := os.Create(imagePath)
	if err != nil {
		return fmt.Errorf("erro ao criar arquivo de imagem %s: %v", imagePath, err)
	}
	defer file.Close()

	err = png.Encode(file, img)
	if err != nil {
		return fmt.Errorf("erro ao codificar imagem PNG %s: %v", imagePath, err)
	}

	log.Printf("Imagem gerada para a ferramenta %s: %s", tool.Name, imagePath)
	return nil
}

// GenerateAllToolImages verifica e gera imagens para todas as ferramentas
func GenerateAllToolImages(tools []Tool, staticDir string) {
	// Diretório onde as imagens serão armazenadas
	imageDir := filepath.Join(staticDir, "img", "tools")

	// Contadores para logging
	var created, existing int

	// Processar cada ferramenta
	for _, tool := range tools {
		imagePath := filepath.Join(imageDir, tool.ID+".png")

		// Verificar se a imagem existe
		if _, err := os.Stat(imagePath); err == nil {
			existing++
			continue // Imagem já existe, pular para a próxima
		}

		// Gerar a imagem
		err := GenerateToolImage(tool, imageDir)
		if err != nil {
			log.Printf("AVISO: Não foi possível gerar imagem para %s: %v", tool.Name, err)
		} else {
			created++
		}
	}

	// Gerar imagem de capa para a página de ferramentas se não existir
	toolsCoverPath := filepath.Join(staticDir, "img", "tools-cover.png")
	if _, err := os.Stat(toolsCoverPath); os.IsNotExist(err) {
		// Criar o diretório se não existir
		toolsImgDir := filepath.Join(staticDir, "img")
		os.MkdirAll(toolsImgDir, 0755)

		// Criar imagem de capa
		img := image.NewRGBA(image.Rect(0, 0, 1200, 630))
		bgColor := color.RGBA{40, 100, 160, 255}
		draw.Draw(img, img.Bounds(), &image.Uniform{bgColor}, image.Point{}, draw.Src)

		// Salvar imagem
		file, err := os.Create(toolsCoverPath)
		if err == nil {
			defer file.Close()
			png.Encode(file, img)
			log.Printf("Imagem de capa da página de ferramentas criada: %s", toolsCoverPath)
		}
	}

	log.Printf("Verificação de imagens concluída: %d existentes, %d criadas", existing, created)
}

// Função auxiliar min para uso no gradiente
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
