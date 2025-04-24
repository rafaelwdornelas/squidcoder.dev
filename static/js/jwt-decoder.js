// static/js/jwt-decoder.js - Funcionalidades para a ferramenta de decodificação JWT

document.addEventListener("DOMContentLoaded", function () {
  const jwtDecoder = document.getElementById("jwt-decoder");
  if (!jwtDecoder) return;

  const inputText = document.getElementById("input-text");
  const decodeBtn = document.getElementById("decode-btn");
  const clearBtn = document.getElementById("clear-btn");
  const copyBtn = document.getElementById("copy-btn");
  const loadSampleBtn = document.getElementById("load-sample-btn");
  const errorMessage = document.getElementById("error-message");

  // Resultados
  const headerResult = document.getElementById("header-result");
  const payloadResult = document.getElementById("payload-result");
  const signatureResult = document.getElementById("signature-result");
  const verificationIcon = document.getElementById("verification-icon");
  const verificationMessage = document.getElementById("verification-message");

  // Tabs
  const headerTab = document.getElementById("header-tab");
  const payloadTab = document.getElementById("payload-tab");
  const signatureTab = document.getElementById("signature-tab");

  // Conteúdo das tabs
  const headerContent = document.getElementById("jwt-header-content");
  const payloadContent = document.getElementById("jwt-payload-content");
  const signatureContent = document.getElementById("jwt-signature-content");

  // Função para trocar entre as tabs
  const switchTab = (activeTab) => {
    // Remover classe active de todas as tabs e conteúdos
    [headerTab, payloadTab, signatureTab].forEach((tab) => {
      tab.classList.remove("active");
    });

    [headerContent, payloadContent, signatureContent].forEach((content) => {
      content.classList.remove("active");
    });

    // Adicionar classe active à tab selecionada e seu conteúdo
    if (activeTab === "header") {
      headerTab.classList.add("active");
      headerContent.classList.add("active");
    } else if (activeTab === "payload") {
      payloadTab.classList.add("active");
      payloadContent.classList.add("active");
    } else if (activeTab === "signature") {
      signatureTab.classList.add("active");
      signatureContent.classList.add("active");
    }
  };

  // Função para decodificar string base64URL
  const decodeBase64URL = (str) => {
    // Converter base64url para base64 padrão
    let input = str.replace(/-/g, "+").replace(/_/g, "/");

    // Adicionar padding se necessário
    const pad = input.length % 4;
    if (pad) {
      if (pad === 1) {
        throw new Error("String base64URL inválida");
      }
      input += new Array(5 - pad).join("=");
    }

    // Decodificar a string base64
    try {
      const decoded = atob(input);
      return decoded;
    } catch (e) {
      throw new Error("Falha ao decodificar base64URL: " + e.message);
    }
  };

  // Função para formatar JSON com indentação
  const formatJSON = (jsonString) => {
    try {
      const obj = JSON.parse(jsonString);
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      return jsonString;
    }
  };

  // Função para verificar se uma string é um JSON válido
  const isValidJSON = (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Função para decodificar token JWT
  const decodeJWT = () => {
    try {
      const token = inputText.value.trim();

      if (!token) {
        throw new Error("O token JWT não pode estar vazio");
      }

      // Dividir o token nas três partes
      const parts = token.split(".");

      if (parts.length !== 3) {
        throw new Error(
          "Token JWT inválido. Deve ter três partes separadas por pontos."
        );
      }

      // Decodificar header (primeira parte)
      let headerJSON;
      try {
        const headerDecoded = decodeBase64URL(parts[0]);
        headerJSON = formatJSON(headerDecoded);

        if (!isValidJSON(headerDecoded)) {
          throw new Error("Header não é um JSON válido");
        }

        // Exibir header formatado
        headerResult.innerHTML = `<pre>${headerJSON}</pre>`;
      } catch (e) {
        headerResult.innerHTML = `<div class="error-text">Erro ao decodificar o header: ${e.message}</div>`;
      }

      // Decodificar payload (segunda parte)
      let payloadJSON;
      try {
        const payloadDecoded = decodeBase64URL(parts[1]);
        payloadJSON = formatJSON(payloadDecoded);

        if (!isValidJSON(payloadDecoded)) {
          throw new Error("Payload não é um JSON válido");
        }

        // Exibir payload formatado
        payloadResult.innerHTML = `<pre>${payloadJSON}</pre>`;

        // Analisar datas do payload
        const payload = JSON.parse(payloadDecoded);
        let payloadInfo = '<div class="jwt-info">';

        // Verificar campos de data comuns e exibi-los formatados
        if (payload.exp) {
          const expDate = new Date(payload.exp * 1000);
          payloadInfo += `<div class="jwt-date"><strong>Expira em:</strong> ${expDate.toLocaleString()}</div>`;
        }

        if (payload.iat) {
          const iatDate = new Date(payload.iat * 1000);
          payloadInfo += `<div class="jwt-date"><strong>Emitido em:</strong> ${iatDate.toLocaleString()}</div>`;
        }

        if (payload.nbf) {
          const nbfDate = new Date(payload.nbf * 1000);
          payloadInfo += `<div class="jwt-date"><strong>Válido a partir de:</strong> ${nbfDate.toLocaleString()}</div>`;
        }

        payloadInfo += "</div>";

        // Adicionar informações extras abaixo do payload
        if (payload.exp || payload.iat || payload.nbf) {
          payloadResult.innerHTML += payloadInfo;
        }

        // Verificar a expiração
        if (payload.exp) {
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp < now) {
            payloadResult.innerHTML +=
              '<div class="jwt-expiration expired"><i class="fas fa-exclamation-triangle"></i> Este token está expirado</div>';
          } else {
            const timeLeft = payload.exp - now;
            const days = Math.floor(timeLeft / 86400);
            const hours = Math.floor((timeLeft % 86400) / 3600);
            const minutes = Math.floor((timeLeft % 3600) / 60);

            let expiresIn = "";
            if (days > 0) expiresIn += `${days} dia(s) `;
            if (hours > 0) expiresIn += `${hours} hora(s) `;
            if (minutes > 0) expiresIn += `${minutes} minuto(s)`;
            if (!expiresIn) expiresIn = "menos de um minuto";

            payloadResult.innerHTML += `<div class="jwt-expiration valid"><i class="fas fa-check-circle"></i> Válido (expira em ${expiresIn})</div>`;
          }
        }
      } catch (e) {
        payloadResult.innerHTML = `<div class="error-text">Erro ao decodificar o payload: ${e.message}</div>`;
      }

      // Exibir a assinatura (terceira parte)
      signatureResult.innerHTML = `<div class="signature-text">${parts[2]}</div>`;

      // Atualizar ícone de verificação
      verificationIcon.innerHTML = '<i class="fas fa-info-circle"></i>';
      verificationMessage.textContent =
        "Assinatura presente, mas não verificada";
      verificationMessage.className = "verification-neutral";

      errorMessage.textContent = "";
      errorMessage.style.display = "none";

      // Ativar a tab de payload por padrão após decodificação
      switchTab("payload");
    } catch (error) {
      // Exibir mensagem de erro
      errorMessage.textContent = `Erro: ${error.message}`;
      errorMessage.style.display = "block";

      // Limpar resultados
      headerResult.innerHTML =
        '<p class="jwt-placeholder">O cabeçalho JWT será mostrado aqui após a decodificação.</p>';
      payloadResult.innerHTML =
        '<p class="jwt-placeholder">O payload JWT será mostrado aqui após a decodificação.</p>';
      signatureResult.innerHTML =
        '<p class="jwt-placeholder">A assinatura JWT codificada em base64 será mostrada aqui.</p>';

      // Atualizar ícone de verificação
      verificationIcon.innerHTML = '<i class="fas fa-question-circle"></i>';
      verificationMessage.textContent = "Token não verificado";
      verificationMessage.className = "";

      // Esconder mensagem de erro após 5 segundos
      setTimeout(() => {
        errorMessage.style.display = "none";
      }, 5000);
    }
  };

  // Função para limpar os campos
  const clearFields = () => {
    inputText.value = "";
    headerResult.innerHTML =
      '<p class="jwt-placeholder">O cabeçalho JWT será mostrado aqui após a decodificação.</p>';
    payloadResult.innerHTML =
      '<p class="jwt-placeholder">O payload JWT será mostrado aqui após a decodificação.</p>';
    signatureResult.innerHTML =
      '<p class="jwt-placeholder">A assinatura JWT codificada em base64 será mostrada aqui.</p>';

    // Atualizar ícone de verificação
    verificationIcon.innerHTML = '<i class="fas fa-question-circle"></i>';
    verificationMessage.textContent = "Token não verificado";
    verificationMessage.className = "";

    errorMessage.textContent = "";
    errorMessage.style.display = "none";

    // Voltar para a primeira tab
    switchTab("header");
  };

  // Função para copiar o payload
  const copyPayload = () => {
    // Verificar se temos um payload decodificado
    if (payloadResult.querySelector("pre")) {
      // Obter o texto do payload
      const payloadText = payloadResult.querySelector("pre").textContent;

      // Criar elemento temporário para copiar o texto
      const tempInput = document.createElement("textarea");
      tempInput.value = payloadText;
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
    } else {
      errorMessage.textContent =
        "Decodifique um token JWT primeiro antes de copiar";
      errorMessage.style.display = "block";

      setTimeout(() => {
        errorMessage.style.display = "none";
      }, 3000);
    }
  };

  // Função para carregar exemplo
  const loadSample = () => {
    // Um token JWT de exemplo (expirado)
    inputText.value =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlNxdWlkQ29kZXIiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTY1MTY5MTIyMn0.6YCWcHcBDmN6zOgRTnkvwAMXpUqRhhiCxQKnJczLVuM";
    decodeJWT();
  };

  // Adicionar event listeners
  if (decodeBtn) decodeBtn.addEventListener("click", decodeJWT);
  if (clearBtn) clearBtn.addEventListener("click", clearFields);
  if (copyBtn) copyBtn.addEventListener("click", copyPayload);
  if (loadSampleBtn) loadSampleBtn.addEventListener("click", loadSample);

  // Event listeners para as tabs
  headerTab.addEventListener("click", () => switchTab("header"));
  payloadTab.addEventListener("click", () => switchTab("payload"));
  signatureTab.addEventListener("click", () => switchTab("signature"));

  // Permitir pressionar Enter para decodificar
  if (inputText) {
    inputText.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        decodeJWT();
      }
    });
  }
});
