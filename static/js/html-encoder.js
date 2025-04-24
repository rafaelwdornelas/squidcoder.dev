// static/js/html-encoder.js - Funcionalidades para a ferramenta de codificação HTML

document.addEventListener("DOMContentLoaded", function () {
  const htmlEncoder = document.getElementById("html-encoder");
  if (!htmlEncoder) return;

  const inputText = document.getElementById("input-text");
  const outputText = document.getElementById("output-text");
  const encodeBtn = document.getElementById("encode-btn");
  const clearBtn = document.getElementById("clear-btn");
  const copyBtn = document.getElementById("copy-btn");
  const loadSampleBtn = document.getElementById("load-sample-btn");
  const errorMessage = document.getElementById("error-message");

  // Função para codificar texto para entidades HTML
  const encodeHTML = () => {
    try {
      const input = inputText.value;

      if (!input) {
        throw new Error("O texto de entrada não pode estar vazio");
      }

      // Codifica os caracteres especiais para entidades HTML
      const encodedText = input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/ç/g, "&ccedil;")
        .replace(/Ç/g, "&Ccedil;")
        .replace(/á/g, "&aacute;")
        .replace(/à/g, "&agrave;")
        .replace(/â/g, "&acirc;")
        .replace(/ã/g, "&atilde;")
        .replace(/é/g, "&eacute;")
        .replace(/ê/g, "&ecirc;")
        .replace(/í/g, "&iacute;")
        .replace(/ó/g, "&oacute;")
        .replace(/ô/g, "&ocirc;")
        .replace(/õ/g, "&otilde;")
        .replace(/ú/g, "&uacute;")
        .replace(/ü/g, "&uuml;");

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
      '<div class="exemplo">SquidCoder.dev - Ferramentas para Desenvolvedores & Programação</div>';
    encodeHTML();
  };

  // Adiciona event listeners
  if (encodeBtn) encodeBtn.addEventListener("click", encodeHTML);
  if (clearBtn) clearBtn.addEventListener("click", clearFields);
  if (copyBtn) copyBtn.addEventListener("click", copyResult);
  if (loadSampleBtn) loadSampleBtn.addEventListener("click", loadSample);

  // Permitir pressionar Enter para codificar
  if (inputText) {
    inputText.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        encodeHTML();
      }
    });
  }
});
