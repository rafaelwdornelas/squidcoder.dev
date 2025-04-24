// static/js/octal-converter.js
document.addEventListener("DOMContentLoaded", function () {
  // Elementos DOM
  const inputText = document.getElementById("input-text");
  const outputContent = document.getElementById("output-content");
  const convertBtn = document.getElementById("convert-btn");
  const clearBtn = document.getElementById("clear-btn");
  const sampleBtn = document.getElementById("sample-btn");
  const copyBtn = document.getElementById("copy-btn");
  const textToOctalRadio = document.getElementById("text-to-octal");
  const octalToTextRadio = document.getElementById("octal-to-text");
  const useLeadingZerosCheckbox = document.getElementById("use-leading-zeros");
  const gridViewCheckbox = document.getElementById("grid-view");
  const includeCharacterCheckbox = document.getElementById("include-character");
  const formatOptions = document.querySelectorAll(".format-option");

  // Estado atual
  let currentFormat = "standard";
  let isProcessing = false; // Flag para evitar recursão

  // Eventos
  convertBtn.addEventListener("click", performConversion);
  clearBtn.addEventListener("click", clearAll);
  sampleBtn.addEventListener("click", loadSample);
  copyBtn.addEventListener("click", copyOutput);

  // Evento para alternar visualização
  gridViewCheckbox.addEventListener("change", function () {
    // Apenas atualiza a classe CSS sem reconverter
    if (gridViewCheckbox.checked) {
      outputContent.classList.add("grid-view");
    } else {
      outputContent.classList.remove("grid-view");
    }

    // Somente reconverte se não estiver em processamento
    if (
      outputContent.textContent.trim() &&
      textToOctalRadio.checked &&
      !isProcessing
    ) {
      performConversion();
    }
  });

  // Eventos para as opções de formato
  formatOptions.forEach((option) => {
    option.addEventListener("click", function () {
      // Impedir reconversão recursiva durante alteração de formato
      if (isProcessing) return;

      // Remover classe ativa de todas as opções
      formatOptions.forEach((opt) => opt.classList.remove("active"));

      // Adicionar classe ativa à opção clicada
      this.classList.add("active");

      // Atualizar formato atual
      currentFormat = this.dataset.format;

      // Reconverter com o novo formato se houver conteúdo
      if (
        outputContent.textContent.trim() &&
        !outputContent.textContent.includes("Por favor")
      ) {
        performConversion();
      }
    });
  });

  // Função para realizar a conversão
  function performConversion() {
    // Evitar recursão
    if (isProcessing) return;
    isProcessing = true;

    const text = inputText.value;
    const isTextToOctal = textToOctalRadio.checked;
    const useLeadingZeros = useLeadingZerosCheckbox.checked;

    if (!text) {
      outputContent.textContent =
        "Por favor, digite ou cole um texto para converter.";
      isProcessing = false;
      return;
    }

    try {
      if (isTextToOctal) {
        convertTextToOctal(text, useLeadingZeros);
      } else {
        convertOctalToText(text);
      }
    } catch (error) {
      outputContent.textContent = `Erro durante a conversão: ${error.message}`;
    }

    // Reset da flag quando terminar
    isProcessing = false;
  }

  // Converter texto para código octal
  function convertTextToOctal(text, useLeadingZeros) {
    const useGridView = gridViewCheckbox.checked;
    const includeCharacter = includeCharacterCheckbox.checked;

    if (useGridView) {
      // Visualização em grade
      outputContent.innerHTML = "";

      Array.from(text).forEach((char) => {
        const code = char.charCodeAt(0);

        const charItem = document.createElement("div");
        charItem.className = "char-item";

        if (includeCharacter) {
          const charOriginal = document.createElement("div");
          charOriginal.className = "char-original";
          charOriginal.textContent = char;
          charItem.appendChild(charOriginal);
        }

        const charCode = document.createElement("div");
        charCode.className = "char-code";
        charCode.textContent = formatOctal(code, useLeadingZeros);
        charItem.appendChild(charCode);

        outputContent.appendChild(charItem);
      });
    } else {
      // Visualização em texto simples
      let output = "";

      Array.from(text).forEach((char) => {
        const code = char.charCodeAt(0);

        if (includeCharacter) {
          output += `'${char}' = `;
        }

        output += formatOctal(code, useLeadingZeros) + " ";
      });

      outputContent.textContent =
        output.trim() || "Nenhum caractere compatível encontrado";
    }
  }

  // Formatar código octal de acordo com o formato selecionado
  function formatOctal(code, useLeadingZeros) {
    // Converter para octal
    let octal = code.toString(8);

    // Adicionar zeros à esquerda se necessário
    if (useLeadingZeros) {
      octal = octal.padStart(3, "0");
    }

    switch (currentFormat) {
      case "standard":
        return octal;
      case "prefixed":
        return "\\" + octal;
      case "spaced":
        return octal + " ";
      default:
        return octal;
    }
  }

  // Converter código octal para texto
  function convertOctalToText(text) {
    let result = "";

    try {
      let matchesFound = false;

      // Formato prefixado \NNN
      if (text.includes("\\")) {
        const matches = text.match(/\\([0-7]{1,3})/g);
        if (matches && matches.length > 0) {
          matchesFound = true;
          result = matches
            .map((code) => {
              const octalValue = code.substring(1);
              return String.fromCharCode(parseInt(octalValue, 8));
            })
            .join("");
        }
      }

      // Se não encontrou no formato prefixado, tenta formato simples ou espaçado
      if (!matchesFound) {
        const matches = text.match(/([0-7]{1,3})/g);
        if (matches && matches.length > 0) {
          matchesFound = true;
          result = matches
            .map((code) => {
              return String.fromCharCode(parseInt(code, 8));
            })
            .join("");
        }
      }

      if (!matchesFound) {
        throw new Error(
          "Formato não reconhecido. Use valores octais como 141 ou \\141."
        );
      }

      outputContent.textContent =
        result || "Nenhum caractere válido encontrado na entrada";
    } catch (error) {
      throw new Error(
        "Formato inválido. Verifique se o texto contém códigos octais válidos."
      );
    }
  }

  // Limpar entrada e saída
  function clearAll() {
    inputText.value = "";
    outputContent.innerHTML = "";
  }

  // Carregar exemplo
  function loadSample() {
    if (textToOctalRadio.checked) {
      inputText.value = "Hello, World!";
    } else {
      inputText.value = "110 145 154 154 157 054 040 127 157 162 154 144 041";
    }
    performConversion();
  }

  // Copiar saída para a área de transferência
  function copyOutput() {
    const content = outputContent.textContent;

    if (!content) return;

    navigator.clipboard
      .writeText(content)
      .then(() => {
        // Feedback visual
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';

        setTimeout(() => {
          copyBtn.innerHTML = originalText;
        }, 1500);
      })
      .catch((err) => {
        console.error("Erro ao copiar:", err);
      });
  }
});
