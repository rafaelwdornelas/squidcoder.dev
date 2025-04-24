// static/js/list-randomizer.js - Funcionalidades para a ferramenta de randomização de listas

document.addEventListener("DOMContentLoaded", function () {
  const listRandomizer = document.getElementById("list-randomizer");
  if (!listRandomizer) return;

  const inputText = document.getElementById("input-text");
  const outputText = document.getElementById("output-text");
  const randomizeBtn = document.getElementById("randomize-btn");
  const clearBtn = document.getElementById("clear-btn");
  const copyBtn = document.getElementById("copy-btn");
  const loadSampleBtn = document.getElementById("load-sample-btn");
  const errorMessage = document.getElementById("error-message");
  const lineCount = document.getElementById("line-count");

  // Função para embaralhar uma lista
  const shuffleArray = (array) => {
    // Implementação do algoritmo Fisher-Yates para embaralhamento
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Troca de elementos
    }
    return array;
  };

  // Função para randomizar a lista
  const randomizeList = () => {
    try {
      const input = inputText.value;

      if (!input) {
        throw new Error("O texto de entrada não pode estar vazio");
      }

      // Dividir o texto em linhas e filtrar linhas vazias
      let lines = input.split("\n").filter((line) => line.trim() !== "");

      // Embaralhar as linhas
      lines = shuffleArray(lines);

      // Atualizar contador
      lineCount.textContent = `${lines.length} linhas`;

      // Exibir resultados
      outputText.textContent = lines.join("\n");

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
    lineCount.textContent = "0 linhas";
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
    inputText.value = `Item 1
Item 2
Item 3
Item 4
Item 5
Item 6
Item 7
Item 8
Item 9
Item 10
Item 11
Item 12
Item 13
Item 14
Item 15`;
    randomizeList();
  };

  // Adicionar event listeners
  if (randomizeBtn) randomizeBtn.addEventListener("click", randomizeList);
  if (clearBtn) clearBtn.addEventListener("click", clearFields);
  if (copyBtn) copyBtn.addEventListener("click", copyResult);
  if (loadSampleBtn) loadSampleBtn.addEventListener("click", loadSample);

  // Permitir pressionar Enter para processar
  if (inputText) {
    inputText.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        randomizeList();
      }
    });
  }
});
