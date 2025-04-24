// static/js/hex-decoder.js - Funcionalidades para a ferramenta de decodificação hexadecimal

document.addEventListener("DOMContentLoaded", function () {
  const hexDecoder = document.getElementById("hex-decoder");
  if (!hexDecoder) return;

  const inputText = document.getElementById("input-text");
  const outputText = document.getElementById("output-text");
  const decodeBtn = document.getElementById("decode-btn");
  const clearBtn = document.getElementById("clear-btn");
  const copyBtn = document.getElementById("copy-btn");
  const loadSampleBtn = document.getElementById("load-sample-btn");
  const errorMessage = document.getElementById("error-message");

  // Função para decodificar texto hexadecimal
  const decodeHex = () => {
    try {
      const input = inputText.value.trim().replace(/\s+/g, "");

      if (!input) {
        throw new Error("O texto de entrada não pode estar vazio");
      }

      // Verifica se é um texto hexadecimal válido
      if (!/^[0-9A-Fa-f]+$/.test(input)) {
        throw new Error("O texto contém caracteres não-hexadecimais");
      }

      // Verifica se tem um número par de caracteres
      if (input.length % 2 !== 0) {
        throw new Error(
          "O texto hexadecimal deve ter um número par de caracteres"
        );
      }

      // Converte de hexadecimal para texto
      let output = "";
      for (let i = 0; i < input.length; i += 2) {
        const hexPair = input.substr(i, 2);
        const decimal = parseInt(hexPair, 16);
        output += String.fromCharCode(decimal);
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
      "53717569 64436f6465722e646576202d204665727261 6d656e7461732070617261204465 73656e766f6c7665646f726573";
    decodeHex();
  };

  // Adiciona event listeners
  if (decodeBtn) decodeBtn.addEventListener("click", decodeHex);
  if (clearBtn) clearBtn.addEventListener("click", clearFields);
  if (copyBtn) copyBtn.addEventListener("click", copyResult);
  if (loadSampleBtn) loadSampleBtn.addEventListener("click", loadSample);

  // Permitir pressionar Enter para decodificar
  if (inputText) {
    inputText.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        decodeHex();
      }
    });
  }
});
