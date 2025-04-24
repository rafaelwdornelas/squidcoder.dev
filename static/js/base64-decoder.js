// static/js/base64-decoder.js - Funcionalidades para a ferramenta de decodificação Base64

document.addEventListener("DOMContentLoaded", function () {
  const base64Decoder = document.getElementById("base64-decoder");
  if (!base64Decoder) return;

  const inputText = document.getElementById("input-text");
  const outputText = document.getElementById("output-text");
  const decodeBtn = document.getElementById("decode-btn");
  const clearBtn = document.getElementById("clear-btn");
  const copyBtn = document.getElementById("copy-btn");
  const loadSampleBtn = document.getElementById("load-sample-btn");
  const errorMessage = document.getElementById("error-message");

  // Função para decodificar texto Base64
  const decodeBase64 = () => {
    try {
      const input = inputText.value.trim();

      if (!input) {
        throw new Error("O texto de entrada não pode estar vazio");
      }

      // Tenta decodificar o texto Base64
      const decodedText = atob(input);

      // Exibe o resultado
      outputText.textContent = decodedText;
      errorMessage.textContent = "";
      errorMessage.style.display = "none";
    } catch (error) {
      // Exibe mensagem de erro
      errorMessage.textContent = `Erro: ${
        error.message || "Texto Base64 inválido"
      }`;
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
      "U3F1aWRDb2Rlci5kZXYgLSBGZXJyYW1lbnRhcyBwYXJhIERlc2Vudm9sdmVkb3Jlcw==";
    decodeBase64();
  };

  // Adiciona event listeners
  if (decodeBtn) decodeBtn.addEventListener("click", decodeBase64);
  if (clearBtn) clearBtn.addEventListener("click", clearFields);
  if (copyBtn) copyBtn.addEventListener("click", copyResult);
  if (loadSampleBtn) loadSampleBtn.addEventListener("click", loadSample);

  // Permitir pressionar Enter para decodificar
  if (inputText) {
    inputText.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        decodeBase64();
      }
    });
  }
});
