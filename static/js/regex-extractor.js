// static/js/regex-extractor.js
document.addEventListener("DOMContentLoaded", function () {
  // Elementos da UI
  const regexPatternInput = document.getElementById("regex-pattern");
  const regexFlagsInput = document.getElementById("regex-flags");
  const inputText = document.getElementById("input-text");
  const extractBtn = document.getElementById("extract-btn");
  const highlightBtn = document.getElementById("highlight-btn");
  const clearBtn = document.getElementById("clear-btn");
  const sampleBtn = document.getElementById("sample-btn");
  const copyBtn = document.getElementById("copy-btn");
  const outputContent = document.getElementById("output-content");
  const highlightContainer = document.getElementById("highlight-container");
  const matchCount = document.getElementById("match-count");
  const noMatches = document.getElementById("no-matches");
  const presetPatterns = document.getElementById("preset-patterns");
  const formatOptions = document.querySelectorAll(".format-option");

  // Estado atual
  let currentFormat = "list";
  let extractedMatches = [];

  // Inicialização
  regexFlagsInput.value = "g";
  hideElement(highlightContainer);
  hideElement(noMatches);

  // Event Listeners
  extractBtn.addEventListener("click", extractMatches);
  highlightBtn.addEventListener("click", highlightMatches);
  clearBtn.addEventListener("click", clearAll);
  sampleBtn.addEventListener("click", loadSample);
  copyBtn.addEventListener("click", copyResults);
  presetPatterns.addEventListener("change", loadPresetPattern);

  // Listener para alternar formato de saída
  formatOptions.forEach((option) => {
    option.addEventListener("click", function () {
      formatOptions.forEach((opt) => opt.classList.remove("active"));
      this.classList.add("active");
      currentFormat = this.dataset.format;

      if (extractedMatches.length > 0) {
        displayMatches(extractedMatches);
      }
    });
  });

  // Função para extrair padrões usando regex
  function extractMatches() {
    const pattern = regexPatternInput.value;
    const flags = regexFlagsInput.value;
    const text = inputText.value;

    if (!pattern || !text) {
      showError(
        "Por favor, preencha tanto o padrão regex quanto o texto para análise."
      );
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      extractedMatches = [];

      let match;
      if (flags.includes("g")) {
        extractedMatches = [...text.matchAll(regex)].map((m) => m[0]);
      } else {
        match = text.match(regex);
        if (match) extractedMatches = [match[0]];
      }

      displayMatches(extractedMatches);
      showElement(outputContent);
      hideElement(highlightContainer);

      // Atualizar contador de correspondências
      matchCount.textContent = `(${extractedMatches.length} correspondência${
        extractedMatches.length !== 1 ? "s" : ""
      })`;

      if (extractedMatches.length === 0) {
        showElement(noMatches);
      } else {
        hideElement(noMatches);
      }
    } catch (e) {
      showError(`Erro na expressão regular: ${e.message}`);
    }
  }

  // Função para destacar correspondências no texto
  function highlightMatches() {
    const pattern = regexPatternInput.value;
    const flags = regexFlagsInput.value;
    const text = inputText.value;

    if (!pattern || !text) {
      showError(
        "Por favor, preencha tanto o padrão regex quanto o texto para análise."
      );
      return;
    }

    try {
      const regex = new RegExp(
        pattern,
        flags.includes("g") ? flags : flags + "g"
      );

      // Criar HTML com texto destacado
      const highlightedText = text.replace(
        regex,
        (match) => `<mark class="highlighted-match">${match}</mark>`
      );

      // Exibir texto destacado
      highlightContainer.innerHTML = highlightedText;
      showElement(highlightContainer);
      hideElement(outputContent);
      hideElement(noMatches);
    } catch (e) {
      showError(`Erro na expressão regular: ${e.message}`);
    }
  }

  // Função para exibir as correspondências no formato selecionado
  function displayMatches(matches) {
    if (matches.length === 0) {
      outputContent.innerHTML =
        '<p class="empty-result">Nenhum resultado encontrado.</p>';
      return;
    }

    // Remove duplicatas se necessário
    const uniqueMatches = [...new Set(matches)];

    switch (currentFormat) {
      case "list":
        displayAsList(uniqueMatches);
        break;
      case "csv":
        displayAsCSV(uniqueMatches);
        break;
      case "json":
        displayAsJSON(uniqueMatches);
        break;
    }
  }

  // Exibir como lista
  function displayAsList(matches) {
    const list = document.createElement("ul");
    list.className = "matches-list";

    matches.forEach((match) => {
      const item = document.createElement("li");
      item.className = "match-item";
      item.textContent = match;
      list.appendChild(item);
    });

    outputContent.innerHTML = "";
    outputContent.appendChild(list);
  }

  // Exibir como CSV
  function displayAsCSV(matches) {
    const csvContent = matches.join("\n");

    outputContent.innerHTML = `<pre class="csv-output">${csvContent}</pre>`;
  }

  // Exibir como JSON
  function displayAsJSON(matches) {
    const jsonObj = { matches: matches };
    const jsonContent = JSON.stringify(jsonObj, null, 2);

    outputContent.innerHTML = `<pre class="json-output">${jsonContent}</pre>`;
  }

  // Função para copiar resultados
  function copyResults() {
    if (extractedMatches.length === 0) {
      showMessage("Não há resultados para copiar.");
      return;
    }

    let textToCopy;

    switch (currentFormat) {
      case "list":
        textToCopy = extractedMatches.join("\n");
        break;
      case "csv":
        textToCopy = extractedMatches.join("\n");
        break;
      case "json":
        textToCopy = JSON.stringify({ matches: extractedMatches }, null, 2);
        break;
    }

    navigator.clipboard
      .writeText(textToCopy)
      .then(() =>
        showMessage("Resultados copiados para a área de transferência!")
      )
      .catch((err) => showError("Falha ao copiar: " + err));
  }

  // Carregar padrões pré-definidos
  function loadPresetPattern() {
    const selectedValue = presetPatterns.value;

    if (!selectedValue) return;

    const patterns = {
      email: {
        pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
        flags: "g",
      },
      url: {
        pattern:
          "https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)",
        flags: "gi",
      },
      phone: {
        pattern:
          "\\+?\\d{1,4}?[-.\\s]?\\(?\\d{1,3}?\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}",
        flags: "g",
      },
      ip: {
        pattern:
          "(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)",
        flags: "g",
      },
      date: {
        pattern:
          "(?:0[1-9]|[12][0-9]|3[01])[/.-](?:0[1-9]|1[012])[/.-](?:19|20)\\d\\d",
        flags: "g",
      },
      "html-tag": {
        pattern: "<\\/?[a-z][\\s\\S]*?>",
        flags: "g",
      },
      twitter: {
        pattern: "@[a-zA-Z0-9_]{1,15}",
        flags: "g",
      },
      hashtag: {
        pattern: "#[a-zA-Z0-9_]+",
        flags: "g",
      },
    };

    if (patterns[selectedValue]) {
      regexPatternInput.value = patterns[selectedValue].pattern;
      regexFlagsInput.value = patterns[selectedValue].flags;
    }

    // Resetar seleção para placeholder após carregar o padrão
    setTimeout(() => {
      presetPatterns.selectedIndex = 0;
    }, 500);
  }

  // Carregar exemplo
  function loadSample() {
    inputText.value = `Contato: joão.silva@email.com ou maria_santos@empresa.com.br
Site: https://www.exemplo.com.br/pagina?param=123
Entre em contato pelo telefone +55 (11) 98765-4321 ou 11 9876-5432
IPs do servidor: 192.168.1.1, 10.0.0.1, 172.16.0.1
Data da reunião: 15/03/2023
Código HTML: <div class="container"><h1>Título</h1><p>Parágrafo</p></div>
Siga @usuarioTwitter e curta o post com a #hashtag e #outraTag
`;
    regexPatternInput.value = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}";
    regexFlagsInput.value = "g";
  }

  // Limpar tudo
  function clearAll() {
    regexPatternInput.value = "";
    regexFlagsInput.value = "g";
    inputText.value = "";
    outputContent.innerHTML = "";
    highlightContainer.innerHTML = "";
    hideElement(highlightContainer);
    showElement(outputContent);
    hideElement(noMatches);
    extractedMatches = [];
    matchCount.textContent = "(0 correspondências)";
  }

  // Utilitários de UI
  function showElement(element) {
    element.style.display = "";
  }

  function hideElement(element) {
    element.style.display = "none";
  }

  function showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;

    document.body.appendChild(errorDiv);

    setTimeout(() => {
      errorDiv.classList.add("show");

      setTimeout(() => {
        errorDiv.classList.remove("show");
        setTimeout(() => {
          document.body.removeChild(errorDiv);
        }, 300);
      }, 3000);
    }, 10);
  }

  function showMessage(message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "success-message";
    messageDiv.textContent = message;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      messageDiv.classList.add("show");

      setTimeout(() => {
        messageDiv.classList.remove("show");
        setTimeout(() => {
          document.body.removeChild(messageDiv);
        }, 300);
      }, 2000);
    }, 10);
  }
});
