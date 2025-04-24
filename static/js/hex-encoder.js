// static/js/hex-encoder.js - Funcionalidades para a ferramenta de codificação hexadecimal

document.addEventListener("DOMContentLoaded", function () {
  const hexEncoder = document.getElementById("hex-encoder");
  if (!hexEncoder) return;

  const inputText = document.getElementById("input-text");
  const outputText = document.getElementById("output-text");
  const encodeBtn = document.getElementById("encode-btn");
  const clearBtn = document.getElementById("clear-btn");
  const copyBtn = document.getElementById("copy-btn");
  const loadSampleBtn = document.getElementById("load-sample-btn");
  const errorMessage = document.getElementById("error-message");

  // Função para codificar texto para hexadecimal
  const encodeHex = () => {
    try {
      const input = inputText.value;

      if (!input) {
        throw new Error("O texto de entrada não pode estar vazio");
      }

      // Converte cada caractere para seu valor hexadecimal
      let output = "";
      for (let i = 0; i < input.length; i++) {
        const hex = input.charCodeAt(i).toString(16);
        // Garante que cada byte tenha dois caracteres
        output += hex.length === 1 ? "0" + hex : hex;
      }

      // Opcionalmente, adiciona espaços a cada 4 caracteres para melhor legibilidade
      output = output.match(/.{1,4}/g).join(" ");

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
    inputText.value = "SquidCoder.dev - Ferramentas para Desenvolvedores";
    encodeHex();
  };

  // Adiciona event listeners
  if (encodeBtn) encodeBtn.addEventListener("click", encodeHex);
  if (clearBtn) clearBtn.addEventListener("click", clearFields);
  if (copyBtn) copyBtn.addEventListener("click", copyResult);
  if (loadSampleBtn) loadSampleBtn.addEventListener("click", loadSample);

  // Permitir pressionar Enter para codificar
  if (inputText) {
    inputText.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        encodeHex();
      }
    });
  }
});
