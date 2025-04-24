// static/js/remove-duplicates.js - Funcionalidades para a ferramenta de remoção de linhas duplicadas

document.addEventListener("DOMContentLoaded", function () {
  const removeDuplicates = document.getElementById("remove-duplicates");
  if (!removeDuplicates) return;

  const inputText = document.getElementById("input-text");
  const outputText = document.getElementById("output-text");
  const removeBtn = document.getElementById("remove-btn");
  const clearBtn = document.getElementById("clear-btn");
  const copyBtn = document.getElementById("copy-btn");
  const loadSampleBtn = document.getElementById("load-sample-btn");
  const errorMessage = document.getElementById("error-message");
  const statsInfo = document.getElementById("stats-info");

  // Opções de configuração
  const caseSensitive = document.getElementById("case-sensitive");
  const trimWhitespace = document.getElementById("trim-whitespace");

  // Função para remover linhas duplicadas
  const removeDuplicateLines = () => {
    try {
      const input = inputText.value;

      if (!input) {
        throw new Error("O texto de entrada não pode estar vazio");
      }

      // Dividir o texto em linhas
      const lines = input.split("\n");
      const totalLines = lines.length;

      // Set para armazenar linhas únicas
      const uniqueLines = new Set();
      // Array para preservar a ordem original
      const resultLines = [];

      // Processar cada linha
      lines.forEach((line) => {
        // Preparar a linha para comparação
        let processedLine = line;

        // Trim se a opção estiver ativada
        if (trimWhitespace.checked) {
          processedLine = line.trim();
        }

        // Converter para minúsculas se não for case-sensitive
        if (!caseSensitive.checked) {
          processedLine = processedLine.toLowerCase();
        }

        // Verificar se a linha já existe no conjunto
        if (!uniqueLines.has(processedLine)) {
          uniqueLines.add(processedLine);
          resultLines.push(line); // Adicionar a linha original, não a processada
        }
      });

      // Atualizar estatísticas
      const uniqueCount = resultLines.length;
      statsInfo.textContent = `${uniqueCount} linhas únicas de ${totalLines} totais`;

      // Exibir resultados
      outputText.textContent = resultLines.join("\n");

      errorMessage.textContent = "";
      errorMessage.style.display = "none";
    } catch (error) {
      // Exibir mensagem de erro
      errorMessage.textContent = `Erro: ${error.message}`;
      errorMessage.style.display = "block";

      // Esconder mensagem de erro após 5 segundos
      setTimeout(() => {
        errorMessage.style.display = "none";
      }, 5000);
    }
  };

  // Função para limpar os campos
  const clearFields = () => {
    inputText.value = "";
    outputText.textContent = "";
    statsInfo.textContent = "0 linhas únicas de 0 totais";
    errorMessage.textContent = "";
    errorMessage.style.display = "none";
  };

  // Função para copiar o resultado
  const copyResult = () => {
    if (!outputText.textContent) {
      errorMessage.textContent = "Não há nada para copiar";
      errorMessage.style.display = "block";

      setTimeout(() => {
        errorMessage.style.display = "none";
      }, 3000);

      return;
    }

    // Criar elemento temporário para copiar o texto
    const tempInput = document.createElement("textarea");
    tempInput.value = outputText.textContent;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);

    // Feedback visual
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';

    setTimeout(() => {
      copyBtn.innerHTML = originalText;
    }, 2000);
  };

  // Função para carregar exemplo
  const loadSample = () => {
    inputText.value = `Maçã
Banana
Laranja
maçã
Morango
Uva
Banana
Pêssego
Laranja
Abacaxi
Melancia
melancia
Uva
Pêssego
Banana`;
    removeDuplicateLines();
  };

  // Adicionar event listeners
  if (removeBtn) removeBtn.addEventListener("click", removeDuplicateLines);
  if (clearBtn) clearBtn.addEventListener("click", clearFields);
  if (copyBtn) copyBtn.addEventListener("click", copyResult);
  if (loadSampleBtn) loadSampleBtn.addEventListener("click", loadSample);

  // Event listeners para as opções
  if (caseSensitive)
    caseSensitive.addEventListener("change", removeDuplicateLines);
  if (trimWhitespace)
    trimWhitespace.addEventListener("change", removeDuplicateLines);

  // Permitir pressionar Enter para processar
  if (inputText) {
    inputText.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        removeDuplicateLines();
      }
    });
  }
});
