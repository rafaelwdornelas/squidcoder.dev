// static/js/quoted-printable-encoder.js - Funcionalidades para a ferramenta de codificação Quoted-Printable

document.addEventListener("DOMContentLoaded", function () {
  const qpEncoder = document.getElementById("quoted-printable-encoder");
  if (!qpEncoder) return;

  const inputText = document.getElementById("input-text");
  const outputText = document.getElementById("output-text");
  const encodeBtn = document.getElementById("encode-btn");
  const clearBtn = document.getElementById("clear-btn");
  const copyBtn = document.getElementById("copy-btn");
  const loadSampleBtn = document.getElementById("load-sample-btn");
  const errorMessage = document.getElementById("error-message");

  // Função para codificar texto para Quoted-Printable
  const encodeQuotedPrintable = () => {
    try {
      const input = inputText.value;

      if (!input) {
        throw new Error("O texto de entrada não pode estar vazio");
      }

      // Codificar caracteres especiais para Quoted-Printable
      let output = "";
      const lineLength = 76; // Tamanho máximo de linha recomendado
      let currentLineLength = 0;

      for (let i = 0; i < input.length; i++) {
        const charCode = input.charCodeAt(i);
        let encodedChar = "";

        // Caracteres ASCII imprimíveis (exceto '=') podem ficar sem codificação
        if (charCode >= 33 && charCode <= 126 && charCode !== 61) {
          encodedChar = input[i];
          currentLineLength += 1;
        } else if (charCode === 32 || charCode === 9) {
          // Espaços e tabs no final da linha devem ser codificados
          if (
            i + 1 === input.length ||
            input[i + 1] === "\r" ||
            input[i + 1] === "\n"
          ) {
            encodedChar = `=${charCode
              .toString(16)
              .toUpperCase()
              .padStart(2, "0")}`;
            currentLineLength += 3;
          } else {
            encodedChar = input[i];
            currentLineLength += 1;
          }
        } else {
          // Outros caracteres são codificados como =XX
          encodedChar = `=${charCode
            .toString(16)
            .toUpperCase()
            .padStart(2, "0")}`;
          currentLineLength += 3;
        }

        // Adicionar quebra de linha se necessário
        if (currentLineLength >= lineLength - 3 && i < input.length - 1) {
          output += encodedChar + "=\n";
          currentLineLength = 0;
        } else {
          output += encodedChar;
        }
      }

      // Exibe o resultado
      outputText.textContent = output;
      errorMessage.textContent = "";
      errorMessage.style.display = "none";
    } catch (error) {
      // Exibe mensagem de erro
      errorMessage.textContent = `Erro: ${error.message}`;
      errorMessage.style.display = "block";

      // Esconde mensagem de erro após 5 segundos
      setTimeout(() => {
        errorMessage.style.display = "none";
      }, 5000);
    }
  };

  // Função para limpar os campos
  const clearFields = () => {
    inputText.value = "";
    outputText.textContent = "";
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

    // Cria um elemento temporário para copiar o texto
    const tempInput = document.createElement("textarea");
    tempInput.value = outputText.textContent;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);

    // Feedback visual
    const originalText = copyBtn.textContent;
    copyBtn.textContent = "Copiado! ✓";

    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 2000);
  };

  // Função para carregar exemplo
  const loadSample = () => {
    inputText.value =
      "SquidCoder.dev - Ferramentas para Desenvolvedores & Programação";
    encodeQuotedPrintable();
  };

  // Adiciona event listeners
  if (encodeBtn) encodeBtn.addEventListener("click", encodeQuotedPrintable);
  if (clearBtn) clearBtn.addEventListener("click", clearFields);
  if (copyBtn) copyBtn.addEventListener("click", copyResult);
  if (loadSampleBtn) loadSampleBtn.addEventListener("click", loadSample);

  // Permitir pressionar Enter para codificar
  if (inputText) {
    inputText.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        encodeQuotedPrintable();
      }
    });
  }
});
