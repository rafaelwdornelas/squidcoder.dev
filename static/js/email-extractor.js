// static/js/email-extractor.js - Funcionalidades para a ferramenta de extração de emails

document.addEventListener("DOMContentLoaded", function () {
  const emailExtractor = document.getElementById("email-extractor");
  if (!emailExtractor) return;

  const inputText = document.getElementById("input-text");
  const outputText = document.getElementById("output-text");
  const extractBtn = document.getElementById("extract-btn");
  const clearBtn = document.getElementById("clear-btn");
  const copyBtn = document.getElementById("copy-btn");
  const loadSampleBtn = document.getElementById("load-sample-btn");
  const errorMessage = document.getElementById("error-message");
  const emailCount = document.getElementById("email-count");

  // Função para extrair emails de um texto
  const extractEmails = () => {
    try {
      const input = inputText.value;

      if (!input) {
        throw new Error("O texto de entrada não pode estar vazio");
      }

      // Regex para encontrar emails
      // Esta regex detecta a maioria dos emails válidos, mas é uma versão simplificada
      const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
      const emails = input.match(emailRegex) || [];

      // Remover duplicatas
      const uniqueEmails = [...new Set(emails)];

      // Atualizar contador
      emailCount.textContent = uniqueEmails.length;

      // Exibir resultados
      if (uniqueEmails.length > 0) {
        outputText.textContent = uniqueEmails.join("\n");
      } else {
        outputText.textContent = "Nenhum endereço de email encontrado.";
      }

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

  // Função para limpar os campos
  const clearFields = () => {
    inputText.value = "";
    outputText.textContent = "";
    emailCount.textContent = "0";
    errorMessage.textContent = "";
    errorMessage.style.display = "none";
  };

  // Função para copiar o resultado
  const copyResult = () => {
    if (
      !outputText.textContent ||
      outputText.textContent === "Nenhum endereço de email encontrado."
    ) {
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

  // Função para carregar exemplo
  const loadSample = () => {
    inputText.value = `Contatos da equipe de desenvolvimento:
João Silva <joao.silva@empresa.com>
Maria Santos (maria_santos@gmail.com)
support@squidcoder.dev
contato@exemplo.com.br
Pedro Oliveira [pedro1234@hotmail.com]
Entre em contato pelo formulário ou pelo email dev-team@squidcoder.dev
Nosso endereço é: Av. Central, 123 - Centro
dev-team@squidcoder.dev (este email está duplicado)
joao.silva@empresa.com (este email está duplicado)`;
    extractEmails();
  };

  // Adicionar event listeners
  if (extractBtn) extractBtn.addEventListener("click", extractEmails);
  if (clearBtn) clearBtn.addEventListener("click", clearFields);
  if (copyBtn) copyBtn.addEventListener("click", copyResult);
  if (loadSampleBtn) loadSampleBtn.addEventListener("click", loadSample);

  // Permitir pressionar Enter para extrair
  if (inputText) {
    inputText.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        extractEmails();
      }
    });
  }
});
