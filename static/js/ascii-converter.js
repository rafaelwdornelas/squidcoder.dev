// static/js/ascii-converter.js
document.addEventListener("DOMContentLoaded", function () {
  // Elementos DOM
  const inputText = document.getElementById("input-text");
  const outputContent = document.getElementById("output-content");
  const convertBtn = document.getElementById("convert-btn");
  const clearBtn = document.getElementById("clear-btn");
  const sampleBtn = document.getElementById("sample-btn");
  const copyBtn = document.getElementById("copy-btn");
  const textToAsciiRadio = document.getElementById("text-to-ascii");
  const asciiToTextRadio = document.getElementById("ascii-to-text");
  const includeNonPrintableCheckbox = document.getElementById(
    "include-non-printable"
  );
  const gridViewCheckbox = document.getElementById("grid-view");
  const includeCharacterCheckbox = document.getElementById("include-character");
  const formatOptions = document.querySelectorAll(".format-option");

  // Estado atual
  let currentFormat = "decimal";
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
      textToAsciiRadio.checked &&
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
    const isTextToAscii = textToAsciiRadio.checked;
    const includeNonPrintable = includeNonPrintableCheckbox.checked;

    if (!text) {
      outputContent.textContent =
        "Por favor, digite ou cole um texto para converter.";
      isProcessing = false;
      return;
    }

    try {
      if (isTextToAscii) {
        convertTextToAscii(text, includeNonPrintable);
      } else {
        convertAsciiToText(text);
      }
    } catch (error) {
      outputContent.textContent = `Erro durante a conversão: ${error.message}`;
    }

    // Reset da flag quando terminar
    isProcessing = false;
  }

  // Converter texto para ASCII
  function convertTextToAscii(text, includeNonPrintable) {
    const chars = Array.from(text);
    const includeCharacter = includeCharacterCheckbox.checked;
    const useGridView = gridViewCheckbox.checked;

    if (useGridView) {
      // Visualização em grade
      outputContent.innerHTML = "";

      chars.forEach((char) => {
        const code = char.charCodeAt(0);
        // Verificar se deve incluir caracteres não imprimíveis
        if (!includeNonPrintable && (code < 32 || code === 127)) {
          return;
        }

        const charItem = document.createElement("div");
        charItem.className = "char-item";

        if (includeCharacter) {
          const charOriginal = document.createElement("div");
          charOriginal.className = "char-original";
          // Exibir um substituto para caracteres de controle
          charOriginal.textContent = code < 32 || code === 127 ? "□" : char;
          charItem.appendChild(charOriginal);
        }

        const charCode = document.createElement("div");
        charCode.className = "char-code";
        charCode.textContent = formatCode(code);
        charItem.appendChild(charCode);

        outputContent.appendChild(charItem);
      });
    } else {
      // Visualização em texto simples
      let output = "";

      chars.forEach((char) => {
        const code = char.charCodeAt(0);
        // Verificar se deve incluir caracteres não imprimíveis
        if (!includeNonPrintable && (code < 32 || code === 127)) {
          return;
        }

        if (includeCharacter && !(code < 32 || code === 127)) {
          output += `'${char}' = `;
        }

        output += formatCode(code) + " ";
      });

      outputContent.textContent =
        output.trim() || "Nenhum caractere compatível encontrado";
    }
  }

  // Formatar código ASCII de acordo com o formato selecionado
  function formatCode(code) {
    switch (currentFormat) {
      case "decimal":
        return code.toString();
      case "hexadecimal":
        return "0x" + code.toString(16).toUpperCase().padStart(2, "0");
      case "binary":
        return "0b" + code.toString(2).padStart(8, "0");
      default:
        return code.toString();
    }
  }

  // Converter ASCII para texto
  function convertAsciiToText(text) {
    // Dependendo do formato atual, analisamos o texto de maneira diferente
    let result = "";

    try {
      // Remover espaços extras e separar os códigos
      const codes = text.trim().split(/\s+/);

      codes.forEach((code) => {
        // Remover partes não numéricas (como aspas, =, etc.)
        code = code.replace(/[^\dx\da-fA-F0-9b]/g, "");

        if (!code) return;

        let value;

        // Interpretar o valor com base no formato
        if (code.startsWith("0x")) {
          // Hexadecimal
          value = parseInt(code.substring(2), 16);
        } else if (code.startsWith("0b")) {
          // Binário
          value = parseInt(code.substring(2), 2);
        } else {
          // Decimal
          value = parseInt(code, 10);
        }

        // Adicionar caractere ao resultado se o valor for válido
        if (!isNaN(value)) {
          result += String.fromCharCode(value);
        }
      });

      outputContent.textContent =
        result || "Nenhum caractere válido encontrado na entrada";
    } catch (error) {
      throw new Error(
        "Formato inválido. Verifique se o texto contém códigos ASCII válidos."
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
    if (textToAsciiRadio.checked) {
      inputText.value = "Hello, World! Caracteres especiais: áéíóú çãõ";
    } else {
      inputText.value = "72 101 108 108 111 44 32 87 111 114 108 100 33";
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
