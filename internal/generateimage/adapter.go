package generateimage

// CreateToolImageData converte uma ferramenta do tipo principal para o tipo do gerador de imagens
func CreateToolImageData(id, name, description, category, icon string) Tool {
	return Tool{
		ID:          id,
		Name:        name,
		Description: description,
		Category:    category,
		Icon:        icon,
	}
}
