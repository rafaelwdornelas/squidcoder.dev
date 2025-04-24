// static/js/quoted-printable-decoder.js - Funcionalidades para a ferramenta de decodificação Quoted-Printable

document.addEventListener("DOMContentLoaded", function () {
  const qpDecoder = document.getElementById("quoted-printable-decoder");
  if (!qpDecoder) return;

  const inputText = document.getElementById("input-text");
  const outputText = document.getElementById("output-text");
  const decodeBtn = document.getElementById("decode-btn");
  const clearBtn = document.getElementById("clear-btn");
  const copyBtn = document.getElementById("copy-btn");
  const loadSampleBtn = document.getElementById("load-sample-btn");
  const errorMessage = document.getElementById("error-message");

  // Função para decodificar texto Quoted-Printable
  const decodeQuotedPrintable = () => {
    try {
      const input = inputText.value.trim();

      if (!input) {
        throw new Error("O texto de entrada não pode estar vazio");
      }

      // Remove quebras de linha de continuação (=\r\n ou =\n)
      let processedInput = input.replace(/=(\r\n|\n|\r)/g, "");

      // Decodifica os caracteres codificados em formato hexadecimal
      let output = "";
      for (let i = 0; i < processedInput.length; i++) {
        if (processedInput[i] === "=" && i + 2 < processedInput.length) {
          // Verifica se os próximos dois caracteres formam um valor hexadecimal válido
          const hex = processedInput.substr(i + 1, 2);
          if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
            output += String.fromCharCode(parseInt(hex, 16));
            i += 2; // Avança o índice para pular os caracteres hexadecimais
          } else {
            output += processedInput[i];
          }
        } else {
          output += processedInput[i];
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
      "SquidCoder.dev - Ferramentas para Desenvolvedores & Programa=C3=A7=C3=A3o";
    decodeQuotedPrintable();
  };

  // Adiciona event listeners
  if (decodeBtn) decodeBtn.addEventListener("click", decodeQuotedPrintable);
  if (clearBtn) clearBtn.addEventListener("click", clearFields);
  if (copyBtn) copyBtn.addEventListener("click", copyResult);
  if (loadSampleBtn) loadSampleBtn.addEventListener("click", loadSample);

  // Permitir pressionar Enter para decodificar
  if (inputText) {
    inputText.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        decodeQuotedPrintable();
      }
    });
  }
});
