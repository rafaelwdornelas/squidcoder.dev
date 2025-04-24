// static/js/text-case-converter.js - Funcionalidades para o conversor de caixa alta/baixa

document.addEventListener("DOMContentLoaded", function () {
  const textCaseConverter = document.getElementById("text-case-converter");
  if (!textCaseConverter) return;

  const inputText = document.getElementById("input-text");
  const outputText = document.getElementById("output-text");
  const uppercaseBtn = document.getElementById("uppercase-btn");
  const lowercaseBtn = document.getElementById("lowercase-btn");
  const capitalizeBtn = document.getElementById("capitalize-btn");
  const invertBtn = document.getElementById("invert-btn");
  const copyBtn = document.getElementById("copy-btn");
  const clearBtn = document.getElementById("clear-btn");
  const errorMessage = document.getElementById("error-message");

  // Função para converter para maiúsculas
  const convertToUppercase = () => {
    processConversion((text) => text.toUpperCase());
    markActiveButton(uppercaseBtn);
  };

  // Função para converter para minúsculas
  const convertToLowercase = () => {
    processConversion((text) => text.toLowerCase());
    markActiveButton(lowercaseBtn);
  };

  // Função para capitalizar
  const convertToCapitalized = () => {
    processConversion((text) => {
      return text
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    });
    markActiveButton(capitalizeBtn);
  };

  // Função para inverter a capitalização
  const convertToInverted = () => {
    processConversion((text) => {
      return text
        .split("")
        .map((char) => {
          if (char === char.toUpperCase()) {
            return char.toLowerCase();
          } else {
            return char.toUpperCase();
          }
        })
        .join("");
    });
    markActiveButton(invertBtn);
  };

  // Função para processar a conversão
  const processConversion = (conversionFunc) => {
    try {
      const input = inputText.value;

      if (!input) {
        throw new Error("Por favor, insira um texto para converter");
      }

      const result = conversionFunc(input);

      // Exibir o resultado
      outputText.textContent = result;
      errorMessage.textContent = "";
      errorMessage.style.display = "none";
    } catch (error) {
      // Exibir mensagem de erro
      errorMessage.textContent = `Erro: ${error.message}`;
      errorMessage.style.display = "block";

      // Esconder mensagem de erro após 5 segundos
      setTimeout(() => {
        errorMessage.style.display = "none";
      }, 5000);
    }
  };

  // Função para marcar o botão ativo
  const markActiveButton = (activeButton) => {
    // Remover classe active de todos os botões
    [uppercaseBtn, lowercaseBtn, capitalizeBtn, invertBtn].forEach((btn) => {
      btn.classList.remove("active");
    });

    // Adicionar classe active ao botão ativo
    activeButton.classList.add("active");
  };

  // Função para limpar os campos
  const clearFields = () => {
    inputText.value = "";
    outputText.textContent = "";
    errorMessage.textContent = "";
    errorMessage.style.display = "none";

    // Remover classe active de todos os botões
    [uppercaseBtn, lowercaseBtn, capitalizeBtn, invertBtn].forEach((btn) => {
      btn.classList.remove("active");
    });
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

    // Criar elemento temporário para copiar o texto
    const tempInput = document.createElement("textarea");
    tempInput.value = outputText.textContent;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);

    // Feedback visual
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';

    setTimeout(() => {
      copyBtn.innerHTML = originalText;
    }, 2000);
  };

  // Adicionar event listeners
  if (uppercaseBtn) uppercaseBtn.addEventListener("click", convertToUppercase);
  if (lowercaseBtn) lowercaseBtn.addEventListener("click", convertToLowercase);
  if (capitalizeBtn)
    capitalizeBtn.addEventListener("click", convertToCapitalized);
  if (invertBtn) invertBtn.addEventListener("click", convertToInverted);
  if (copyBtn) copyBtn.addEventListener("click", copyResult);
  if (clearBtn) clearBtn.addEventListener("click", clearFields);

  // Permitir processamento ao pressionar Enter com Ctrl
  if (inputText) {
    inputText.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        convertToUppercase(); // Converter para maiúsculas por padrão
      }
    });
  }
});
