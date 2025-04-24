// static/js/unicode-converter.js
document.addEventListener("DOMContentLoaded", function () {
  // Elementos DOM
  const inputText = document.getElementById("input-text");
  const outputContent = document.getElementById("output-content");
  const convertBtn = document.getElementById("convert-btn");
  const clearBtn = document.getElementById("clear-btn");
  const sampleBtn = document.getElementById("sample-btn");
  const copyBtn = document.getElementById("copy-btn");
  const textToUnicodeRadio = document.getElementById("text-to-unicode");
  const unicodeToTextRadio = document.getElementById("unicode-to-text");
  const includeSurrogatePairsCheckbox = document.getElementById(
    "include-surrogate-pairs"
  );
  const gridViewCheckbox = document.getElementById("grid-view");
  const includeCharacterCheckbox = document.getElementById("include-character");
  const formatOptions = document.querySelectorAll(".format-option");

  // Estado atual
  let currentFormat = "u-notation";
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
      textToUnicodeRadio.checked &&
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
    const isTextToUnicode = textToUnicodeRadio.checked;
    const includeSurrogatePairs = includeSurrogatePairsCheckbox.checked;

    if (!text) {
      outputContent.textContent =
        "Por favor, digite ou cole um texto para converter.";
      isProcessing = false;
      return;
    }

    try {
      if (isTextToUnicode) {
        convertTextToUnicode(text, includeSurrogatePairs);
      } else {
        convertUnicodeToText(text);
      }
    } catch (error) {
      outputContent.textContent = `Erro durante a conversão: ${error.message}`;
    }

    // Reset da flag quando terminar
    isProcessing = false;
  }

  // Converter texto para códigos Unicode
  function convertTextToUnicode(text, includeSurrogatePairs) {
    const useGridView = gridViewCheckbox.checked;
    const includeCharacter = includeCharacterCheckbox.checked;

    if (useGridView) {
      // Visualização em grade
      outputContent.innerHTML = "";

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        let codePoint = text.codePointAt(i);

        // Verificar se é um par substituto (surrogate pair)
        const isSurrogatePair = codePoint > 0xffff;

        // Se for um par substituto e não queremos incluí-los, pule
        if (isSurrogatePair && !includeSurrogatePairs) {
          continue;
        }

        // Se for um par substituto, avance o índice para pular o segundo caractere do par
        if (isSurrogatePair) {
          i++; // Avançar para pular o segundo caractere do par
        }

        const charItem = document.createElement("div");
        charItem.className = "char-item";

        if (includeCharacter) {
          const charOriginal = document.createElement("div");
          charOriginal.className = "char-original";
          // Usar o caractere original para exibição
          charOriginal.textContent = isSurrogatePair
            ? String.fromCodePoint(codePoint)
            : char;
          charItem.appendChild(charOriginal);
        }

        const charCode = document.createElement("div");
        charCode.className = "char-code";
        charCode.textContent = formatUnicode(codePoint);
        charItem.appendChild(charCode);

        outputContent.appendChild(charItem);
      }
    } else {
      // Visualização em texto simples
      let output = "";

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        let codePoint = text.codePointAt(i);

        // Verificar se é um par substituto (surrogate pair)
        const isSurrogatePair = codePoint > 0xffff;

        // Se for um par substituto e não queremos incluí-los, pule
        if (isSurrogatePair && !includeSurrogatePairs) {
          continue;
        }

        // Se for um par substituto, avance o índice para pular o segundo caractere do par
        if (isSurrogatePair) {
          i++; // Avançar para pular o segundo caractere do par
        }

        if (includeCharacter) {
          output += `'${
            isSurrogatePair ? String.fromCodePoint(codePoint) : char
          }' = `;
        }

        output += formatUnicode(codePoint) + " ";
      }

      outputContent.textContent =
        output.trim() || "Nenhum caractere compatível encontrado";
    }
  }

  // Formatar código Unicode de acordo com o formato selecionado
  function formatUnicode(codePoint) {
    const hex = codePoint
      .toString(16)
      .toUpperCase()
      .padStart(codePoint <= 0xffff ? 4 : 6, "0");

    switch (currentFormat) {
      case "u-notation":
        return `U+${hex}`;
      case "html-entity":
        return `&#x${hex};`;
      case "js-escape":
        return codePoint <= 0xffff ? `\\u${hex}` : `\\u{${hex}}`;
      case "css-escape":
        return `\\${hex} `;
      default:
        return `U+${hex}`;
    }
  }

  // Converter códigos Unicode para texto
  function convertUnicodeToText(text) {
    let result = "";

    try {
      // Identificar o formato e converter adequadamente

      // Formato U+XXXX
      const uNotationRegex = /U\+([0-9A-Fa-f]{4,6})/g;

      // Formato HTML &#xXXXX;
      const htmlEntityRegex = /&#x([0-9A-Fa-f]{1,6});/g;

      // Formato JS \uXXXX ou \u{XXXX}
      const jsEscapeRegex = /\\u(?:{([0-9A-Fa-f]{1,6})}|([0-9A-Fa-f]{4}))/g;

      // Formato CSS \XXXX
      const cssEscapeRegex = /\\([0-9A-Fa-f]{1,6})\s?/g;

      // Fazer uma cópia do texto original para manipulação
      let textCopy = text;

      // Substituir todos os padrões pelo caractere correspondente
      // Processamos cada padrão separadamente para evitar interferência

      // U+ Notation
      let matchesFound = false;
      textCopy = textCopy.replace(uNotationRegex, (match, hex) => {
        matchesFound = true;
        return String.fromCodePoint(parseInt(hex, 16));
      });

      // Se nenhuma correspondência for encontrada, tentar o próximo formato
      if (!matchesFound) {
        // HTML Entity
        textCopy = text.replace(htmlEntityRegex, (match, hex) => {
          matchesFound = true;
          return String.fromCodePoint(parseInt(hex, 16));
        });
      }

      // Se ainda nenhuma correspondência, tentar o próximo
      if (!matchesFound) {
        // JS Escape
        textCopy = text.replace(jsEscapeRegex, (match, hex1, hex2) => {
          matchesFound = true;
          const hex = hex1 || hex2;
          return String.fromCodePoint(parseInt(hex, 16));
        });
      }

      // Se ainda nenhuma correspondência, tentar o último
      if (!matchesFound) {
        // CSS Escape
        textCopy = text.replace(cssEscapeRegex, (match, hex) => {
          matchesFound = true;
          return String.fromCodePoint(parseInt(hex, 16));
        });
      }

      // Se não houver nenhuma correspondência, tente interpretar como códigos hexadecimais simples
      if (!matchesFound) {
        const hexCodes = text.match(/[0-9A-Fa-f]{4,6}/g);
        if (hexCodes) {
          result = hexCodes
            .map((hex) => String.fromCodePoint(parseInt(hex, 16)))
            .join("");
          matchesFound = true;
        }
      } else {
        result = textCopy;
      }

      if (!matchesFound) {
        throw new Error(
          "Formato não reconhecido. Use notação U+XXXX, &#xXXXX;, \\uXXXX ou códigos hexadecimais."
        );
      }

      outputContent.textContent =
        result || "Nenhum caractere válido encontrado na entrada";
    } catch (error) {
      throw new Error(
        "Formato inválido. Verifique se o texto contém códigos Unicode válidos."
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
    if (textToUnicodeRadio.checked) {
      inputText.value = "Hello, 世界! Caracteres especiais: áéíóú çãõ 😊 🌍";
    } else {
      inputText.value =
        "U+0048 U+0065 U+006C U+006C U+006F U+002C U+0020 U+4E16 U+754C U+0021";
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
