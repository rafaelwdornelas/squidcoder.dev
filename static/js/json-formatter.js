// static/js/json-formatter.js - Funcionalidades para a ferramenta de formatação JSON

document.addEventListener("DOMContentLoaded", function () {
  const jsonFormatter = document.getElementById("json-formatter");
  if (!jsonFormatter) return;

  const jsonInput = document.getElementById("json-input");
  const formatBtn = document.getElementById("format-btn");
  const minifyBtn = document.getElementById("minify-btn");
  const clearBtn = document.getElementById("clear-btn");
  const copyBtn = document.getElementById("copy-btn");
  const loadSampleBtn = document.getElementById("load-sample-btn");
  const errorMessage = document.getElementById("error-message");

  // Formatar JSON
  const formatJson = () => {
    try {
      const json = JSON.parse(jsonInput.value);
      jsonInput.value = JSON.stringify(json, null, 2);
      errorMessage.textContent = "";
      errorMessage.classList.remove("show");
    } catch (error) {
      errorMessage.textContent = `Erro: ${error.message}`;
      errorMessage.classList.add("show");

      // Esconder mensagem de erro após 5 segundos
      setTimeout(() => {
        errorMessage.classList.remove("show");
      }, 5000);
    }
  };

  // Minificar JSON
  const minifyJson = () => {
    try {
      const json = JSON.parse(jsonInput.value);
      jsonInput.value = JSON.stringify(json);
      errorMessage.textContent = "";
      errorMessage.classList.remove("show");
    } catch (error) {
      errorMessage.textContent = `Erro: ${error.message}`;
      errorMessage.classList.add("show");

      // Esconder mensagem de erro após 5 segundos
      setTimeout(() => {
        errorMessage.classList.remove("show");
      }, 5000);
    }
  };

  // Limpar entrada
  const clearJson = () => {
    jsonInput.value = "";
    errorMessage.textContent = "";
    errorMessage.classList.remove("show");
  };

  // Copiar para a área de transferência
  const copyJson = () => {
    jsonInput.select();
    document.execCommand("copy");

    // Feedback visual
    const originalText = copyBtn.textContent;
    copyBtn.textContent = "Copiado! ✓";

    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 2000);
  };

  // Carregar exemplo
  const loadSample = () => {
    const sample = {
      nome: "SquidCoder",
      versao: "1.0.0",
      descricao: "Ferramentas gratuitas para desenvolvedores",
      ferramentas: [
        {
          id: "json-formatter",
          nome: "Formatador JSON",
          descricao: "Formate, valide e visualize JSON facilmente",
        },
        {
          id: "color-picker",
          nome: "Seletor de Cores",
          descricao: "Selecione e converta cores entre diferentes formatos",
        },
        {
          id: "markdown-editor",
          nome: "Editor Markdown",
          descricao: "Edite e visualize markdown em tempo real",
        },
      ],
      configuracoes: {
        temaInicial: "dark",
        lingua: "pt-BR",
        versaoApi: "v1",
      },
    };

    jsonInput.value = JSON.stringify(sample, null, 2);
  };

  // Adicionar event listeners
  if (formatBtn) formatBtn.addEventListener("click", formatJson);
  if (minifyBtn) minifyBtn.addEventListener("click", minifyJson);
  if (clearBtn) clearBtn.addEventListener("click", clearJson);
  if (copyBtn) copyBtn.addEventListener("click", copyJson);
  if (loadSampleBtn) loadSampleBtn.addEventListener("click", loadSample);
});
