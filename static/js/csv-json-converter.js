// static/js/csv-json-converter.js - Funcionalidades para o conversor CSV/JSON

document.addEventListener("DOMContentLoaded", function () {
  const csvJsonConverter = document.getElementById("csv-json-converter");
  if (!csvJsonConverter) return;

  // Elementos da interface
  const inputText = document.getElementById("input-text");
  const outputText = document.getElementById("output-text");
  const csvToJsonBtn = document.getElementById("csv-to-json-btn");
  const jsonToCsvBtn = document.getElementById("json-to-csv-btn");
  const convertBtn = document.getElementById("convert-btn");
  const copyBtn = document.getElementById("copy-btn");
  const clearBtn = document.getElementById("clear-btn");
  const errorMessage = document.getElementById("error-message");

  // Elementos de opção CSV
  const delimiterSelect = document.getElementById("delimiter-select");
  const headerCheckbox = document.getElementById("header-checkbox");
  const csvOptions = document.getElementById("csv-options");

  // Elementos de opção JSON
  const prettyCheckbox = document.getElementById("pretty-checkbox");
  const arrayCheckbox = document.getElementById("array-checkbox");
  const jsonOptions = document.getElementById("json-options");

  // Labels
  const inputLabel = document.getElementById("input-label");
  const outputLabel = document.getElementById("output-label");

  // Modo ativo (csv-to-json é o padrão)
  let mode = "csv-to-json";

  // Função para alternar o modo
  const switchMode = (newMode) => {
    mode = newMode;

    if (mode === "csv-to-json") {
      csvToJsonBtn.classList.add("active");
      jsonToCsvBtn.classList.remove("active");
      csvOptions.style.display = "flex";
      jsonOptions.style.display = "none";
      inputLabel.textContent = "CSV:";
      outputLabel.textContent = "JSON:";
      inputText.placeholder = `Cole seus dados CSV aqui...
Exemplo:
nome,idade,profissão
João,30,programador
Maria,25,designer
Carlos,35,gerente`;
    } else {
      jsonToCsvBtn.classList.add("active");
      csvToJsonBtn.classList.remove("active");
      jsonOptions.style.display = "flex";
      csvOptions.style.display = "none";
      inputLabel.textContent = "JSON:";
      outputLabel.textContent = "CSV:";
      inputText.placeholder = `Cole seus dados JSON aqui...
Exemplo:
[
  {
    "nome": "João",
    "idade": 30,
    "profissão": "programador"
  },
  {
    "nome": "Maria",
    "idade": 25,
    "profissão": "designer"
  }
]`;
    }

    // Limpar a saída
    outputText.textContent = "";
  };

  // Função para converter CSV para JSON
  const csvToJson = () => {
    try {
      const input = inputText.value.trim();

      if (!input) {
        throw new Error("Por favor, insira dados CSV para converter");
      }

      // Obter delimitador
      let delimiter = delimiterSelect.value;
      if (delimiter === "\\t") delimiter = "\t";

      // Configurações do parse
      const config = {
        delimiter: delimiter,
        header: headerCheckbox.checked,
        skipEmptyLines: true,
      };

      // Usar PapaParse para converter CSV para JSON
      const result = Papa.parse(input, config);

      if (result.errors && result.errors.length > 0) {
        throw new Error(`Erro ao analisar CSV: ${result.errors[0].message}`);
      }

      // Formatar a saída JSON
      const indent = prettyCheckbox.checked ? 2 : null;
      const jsonOutput = JSON.stringify(result.data, null, indent);

      // Exibir o resultado
      outputText.textContent = jsonOutput;

      // Limpar mensagem de erro se houver
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

  // Função para converter JSON para CSV
  const jsonToCsv = () => {
    try {
      const input = inputText.value.trim();

      if (!input) {
        throw new Error("Por favor, insira dados JSON para converter");
      }

      // Analisar o JSON
      let jsonData;
      try {
        jsonData = JSON.parse(input);
      } catch (e) {
        throw new Error("JSON inválido: " + e.message);
      }

      // Verificar se o JSON é um array ou um objeto único
      if (!Array.isArray(jsonData) && typeof jsonData === "object") {
        jsonData = [jsonData]; // Converter objeto único em array
      } else if (!Array.isArray(jsonData)) {
        throw new Error("O JSON deve ser um objeto ou um array de objetos");
      }

      // Obter delimitador
      let delimiter = delimiterSelect.value;
      if (delimiter === "\\t") delimiter = "\t";

      // Configurações para unparse (JSON para CSV)
      const config = {
        delimiter: delimiter,
        header: true, // Sempre usar cabeçalhos para JSON para CSV
      };

      // Usar PapaParse para converter JSON para CSV
      const csvOutput = Papa.unparse(jsonData, config);

      // Exibir o resultado
      outputText.textContent = csvOutput;

      // Limpar mensagem de erro se houver
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

  // Função para realizar a conversão com base no modo atual
  const convert = () => {
    if (mode === "csv-to-json") {
      csvToJson();
    } else {
      jsonToCsv();
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

  // Adicionar event listeners para os botões de modo
  if (csvToJsonBtn)
    csvToJsonBtn.addEventListener("click", () => switchMode("csv-to-json"));
  if (jsonToCsvBtn)
    jsonToCsvBtn.addEventListener("click", () => switchMode("json-to-csv"));

  // Adicionar event listeners para os botões de ação
  if (convertBtn) convertBtn.addEventListener("click", convert);
  if (copyBtn) copyBtn.addEventListener("click", copyResult);
  if (clearBtn) clearBtn.addEventListener("click", clearFields);

  // Event listeners para opções
  // Event listeners para opções
  if (prettyCheckbox) {
    prettyCheckbox.addEventListener("change", () => {
      if (outputText.textContent && mode === "csv-to-json") convert();
    });
  }

  if (arrayCheckbox) {
    arrayCheckbox.addEventListener("change", () => {
      if (outputText.textContent && mode === "json-to-csv") convert();
    });
  }

  if (delimiterSelect) {
    delimiterSelect.addEventListener("change", () => {
      if (outputText.textContent) convert();
    });
  }

  if (headerCheckbox) {
    headerCheckbox.addEventListener("change", () => {
      if (outputText.textContent && mode === "csv-to-json") convert();
    });
  }

  // Permitir processamento ao pressionar Enter com Ctrl
  if (inputText) {
    inputText.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        convert();
      }
    });
  }

  // Inicializar interface
  switchMode("csv-to-json");
});
