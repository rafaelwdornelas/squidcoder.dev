// static/js/url-encoder.js - Funcionalidades para a ferramenta de codificação URL

document.addEventListener("DOMContentLoaded", function () {
  const urlEncoder = document.getElementById("url-encoder");
  if (!urlEncoder) return;

  const inputText = document.getElementById("input-text");
  const outputText = document.getElementById("output-text");
  const encodeBtn = document.getElementById("encode-btn");
  const clearBtn = document.getElementById("clear-btn");
  const copyBtn = document.getElementById("copy-btn");
  const loadSampleBtn = document.getElementById("load-sample-btn");
  const errorMessage = document.getElementById("error-message");

  // Função para codificar texto para URL
  const encodeURL = () => {
    try {
      const input = inputText.value;

      if (!input) {
        throw new Error("O texto de entrada não pode estar vazio");
      }

      // Codifica o texto para URL
      const encodedText = encodeURIComponent(input);

      // Exibe o resultado
      outputText.textContent = encodedText;
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
    encodeURL();
  };

  // Adiciona event listeners
  if (encodeBtn) encodeBtn.addEventListener("click", encodeURL);
  if (clearBtn) clearBtn.addEventListener("click", clearFields);
  if (copyBtn) copyBtn.addEventListener("click", copyResult);
  if (loadSampleBtn) loadSampleBtn.addEventListener("click", loadSample);

  // Permitir pressionar Enter para codificar
  if (inputText) {
    inputText.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        encodeURL();
      }
    });
  }
});
