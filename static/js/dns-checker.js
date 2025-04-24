// static/js/dns-checker.js
document.addEventListener("DOMContentLoaded", function () {
  const dnsChecker = document.getElementById("dns-checker");
  if (!dnsChecker) return;

  // Elementos da interface
  const domainInput = document.getElementById("domain-input");
  const recordTypeSelect = document.getElementById("record-type");
  const checkButton = document.getElementById("check-button");
  const refreshTimeInput = document.getElementById("refresh-time");
  const autoRefreshButton = document.getElementById("auto-refresh");
  const loadingIndicator = document.getElementById("loading-indicator");
  const resultsContainer = document.getElementById("results-container");
  const resultsList = document.getElementById("results-list");
  const errorMessage = document.getElementById("error-message");

  // Variáveis de estado
  let isLoading = false;
  let autoRefreshInterval = null;
  let lastQuery = null;
  let autoRefreshActive = false;

  // Função para obter as bandeiras dos países
  const getCountryCode = (location) => {
    // Mapeamento completo de países para códigos de bandeiras
    const countryMap = {
      "United States": "us",
      US: "us",
      Canada: "ca",
      "Russian Federation": "ru",
      Russia: "ru",
      "South Africa": "za",
      Netherlands: "nl",
      Brazil: "br",
      Germany: "de",
      France: "fr",
      Spain: "es",
      Austria: "at",
      "United Kingdom": "gb",
      Mexico: "mx",
      Australia: "au",
      "New Zealand": "nz",
      Singapore: "sg",
      "South Korea": "kr",
      Korea: "kr",
      China: "cn",
      India: "in",
      Pakistan: "pk",
      Ireland: "ie",
      Bangladesh: "bd",
    };

    // Procurar pelo país no texto de localização
    for (const [country, code] of Object.entries(countryMap)) {
      if (location.includes(country)) {
        return code;
      }
    }

    // Padrão caso não encontre
    return "globe";
  };

  // Função para formatar o tempo de resposta
  const formatResponseTime = (ms) => {
    if (ms < 1000) {
      return `${ms} ms`;
    } else {
      return `${(ms / 1000).toFixed(2)} s`;
    }
  };

  // Função para obter o ícone de status
  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return '<i class="fas fa-check-circle status-icon success"></i>';
      case "error":
        return '<i class="fas fa-times-circle status-icon error"></i>';
      case "no_record":
        return '<i class="fas fa-exclamation-circle status-icon no-record"></i>';
      default:
        return "";
    }
  };

  // Função para renderizar os resultados
  const renderResults = (results) => {
    // Limpar resultados anteriores
    resultsList.innerHTML = "";

    // Ordenar resultados por status (sucesso primeiro) e tempo de resposta
    results.sort((a, b) => {
      if (a.status === "success" && b.status !== "success") return -1;
      if (a.status !== "success" && b.status === "success") return 1;
      return a.response_ms - b.response_ms;
    });

    // Adicionar cada resultado à lista
    results.forEach((result) => {
      const server = result.server;
      const countryCode = getCountryCode(server.location);

      let flagHtml = "";
      if (countryCode !== "globe") {
        flagHtml = `<img src="/static/img/flags/${countryCode}.svg" alt="${server.location}" class="flag-icon">`;
      } else {
        flagHtml = '<i class="fas fa-globe flag-icon"></i>';
      }

      let recordsHtml = "";
      if (result.status === "success") {
        recordsHtml = result.records
          .map((record) => `<div class="record-item">${record}</div>`)
          .join("");
      } else if (result.status === "no_record") {
        recordsHtml =
          '<span class="no-record">Nenhum registro encontrado</span>';
      } else {
        recordsHtml = `<span class="error">${
          result.error || "Erro na consulta"
        }</span>`;
      }

      const responseTimeHtml =
        result.status === "success"
          ? formatResponseTime(result.response_ms)
          : "-";

      const row = document.createElement("div");
      row.className = "dns-result-row";
      row.innerHTML = `
                <div class="dns-column location-col" data-label="Localização">
                    ${flagHtml} ${server.location} ${getStatusIcon(
        result.status
      )}
                </div>
                <div class="dns-column provider-col" data-label="Provedor">
                    ${server.provider}
                </div>
                <div class="dns-column records-col" data-label="Registros">
                    ${recordsHtml}
                </div>
                <div class="dns-column time-col" data-label="Tempo">
                    ${responseTimeHtml}
                </div>
            `;
      resultsList.appendChild(row);
    });

    // Mostrar os resultados
    resultsContainer.style.display = "block";
  };

  // Função para verificar DNS
  const checkDNS = async () => {
    const domain = domainInput.value.trim();
    const recordType = recordTypeSelect.value;

    // Validar entrada
    if (!domain) {
      errorMessage.textContent = "Por favor, insira um domínio válido";
      errorMessage.style.display = "block";
      return;
    }

    // Esconder mensagem de erro se existir
    errorMessage.style.display = "none";

    // Atualizar o estado de carregamento
    isLoading = true;
    loadingIndicator.style.display = "flex";
    resultsContainer.style.display = "none";
    checkButton.disabled = true;

    // Armazenar a consulta atual
    lastQuery = { domain, recordType };

    try {
      // Fazer a requisição para a API
      const response = await fetch("/api/dns/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain: domain,
          recordType: recordType,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const results = await response.json();

      // Renderizar os resultados
      renderResults(results);
    } catch (error) {
      console.error("Erro ao verificar DNS:", error);
      errorMessage.textContent = `Erro ao verificar DNS: ${error.message}`;
      errorMessage.style.display = "block";
    } finally {
      // Atualizar o estado de carregamento
      isLoading = false;
      loadingIndicator.style.display = "none";
      checkButton.disabled = false;
    }
  };

  // Função para iniciar auto-refresh
  const startAutoRefresh = () => {
    // Limpar intervalo anterior se existir
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
    }

    // Obter o tempo de atualização (em segundos)
    const refreshTime = parseInt(refreshTimeInput.value, 10);
    // Validar o tempo de atualização
    if (isNaN(refreshTime) || refreshTime < 5) {
      refreshTimeInput.value = 30; // Valor padrão
      return;
    }

    // Ativar o auto-refresh
    autoRefreshActive = true;
    autoRefreshButton.classList.add("active");

    // Configurar o intervalo (convertido para milissegundos)
    autoRefreshInterval = setInterval(() => {
      // Verificar se há uma consulta anterior e repetir
      if (lastQuery) {
        domainInput.value = lastQuery.domain;
        recordTypeSelect.value = lastQuery.recordType;
        checkDNS();
      }
    }, refreshTime * 1000);
  };

  // Função para parar auto-refresh
  const stopAutoRefresh = () => {
    // Limpar intervalo
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      autoRefreshInterval = null;
    }

    // Desativar o auto-refresh
    autoRefreshActive = false;
    autoRefreshButton.classList.remove("active");
  };

  // Event Listeners
  checkButton.addEventListener("click", checkDNS);

  // Permitir pressionar Enter para enviar o formulário
  domainInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      checkDNS();
    }
  });

  // Toggle auto-refresh
  autoRefreshButton.addEventListener("click", () => {
    if (autoRefreshActive) {
      stopAutoRefresh();
    } else {
      startAutoRefresh();
    }
  });

  // Atualizar intervalo quando o valor mudar
  refreshTimeInput.addEventListener("change", () => {
    if (autoRefreshActive) {
      startAutoRefresh(); // Reiniciar com o novo tempo
    }
  });

  // Inicializar com o domínio na URL se existir
  const urlParams = new URLSearchParams(window.location.search);
  const domainParam = urlParams.get("domain");
  const typeParam = urlParams.get("type");

  if (domainParam) {
    domainInput.value = domainParam;
    // Definir o tipo de registro se fornecido
    if (
      typeParam &&
      recordTypeSelect.querySelector(`option[value="${typeParam}"]`)
    ) {
      recordTypeSelect.value = typeParam;
    }
    // Verificar automaticamente
    checkDNS();
  }
});
