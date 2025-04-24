// static/js/html-decoder.js - Funcionalidades para a ferramenta de decodificação HTML

document.addEventListener("DOMContentLoaded", function () {
  const htmlDecoder = document.getElementById("html-decoder");
  if (!htmlDecoder) return;

  const inputText = document.getElementById("input-text");
  const outputText = document.getElementById("output-text");
  const decodeBtn = document.getElementById("decode-btn");
  const clearBtn = document.getElementById("clear-btn");
  const copyBtn = document.getElementById("copy-btn");
  const loadSampleBtn = document.getElementById("load-sample-btn");
  const errorMessage = document.getElementById("error-message");

  // Função para decodificar entidades HTML
  const decodeHTML = () => {
    try {
      const input = inputText.value.trim();

      if (!input) {
        throw new Error("O texto de entrada não pode estar vazio");
      }

      // Cria um elemento temporário para decodificar HTML
      const tempElement = document.createElement("textarea");
      tempElement.innerHTML = input;
      const decodedText = tempElement.value;

      // Exibe o resultado
      outputText.textContent = decodedText;
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
      "&lt;div class=&quot;exemplo&quot;&gt;SquidCoder.dev - Ferramentas para Desenvolvedores &amp; Programa&ccedil;&atilde;o&lt;/div&gt;";
    decodeHTML();
  };

  // Adiciona event listeners
  if (decodeBtn) decodeBtn.addEventListener("click", decodeHTML);
  if (clearBtn) clearBtn.addEventListener("click", clearFields);
  if (copyBtn) copyBtn.addEventListener("click", copyResult);
  if (loadSampleBtn) loadSampleBtn.addEventListener("click", loadSample);

  // Permitir pressionar Enter para decodificar
  if (inputText) {
    inputText.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        decodeHTML();
      }
    });
  }
});
