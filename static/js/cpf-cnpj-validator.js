// static/js/cpf-cnpj-validator.js
document.addEventListener("DOMContentLoaded", function () {
  // Elementos DOM - Modo de Validação
  const tabs = document.querySelectorAll(".validator-tab");
  const tabContents = document.querySelectorAll(".validator-content");
  const documentTypeRadios = document.querySelectorAll(
    'input[name="document-type"]'
  );
  const documentInput = document.getElementById("document-input");
  const validateBtn = document.getElementById("validate-btn");
  const clearBtn = document.getElementById("clear-btn");
  const resultContainer = document.getElementById("result-container");
  const validationDetails = document.getElementById("validation-details");

  // Elementos DOM - Modo de Geração
  const generateDocumentTypeRadios = document.querySelectorAll(
    'input[name="generate-document-type"]'
  );
  const formattedOption = document.getElementById("formatted-option");
  const stateSelector = document.getElementById("state-selector");
  const stateSelect = document.getElementById("state-select");
  const generateBtn = document.getElementById("generate-btn");
  const generateMultipleBtn = document.getElementById("generate-multiple-btn");
  const documentList = document.getElementById("document-list");
  const copyAllBtn = document.getElementById("copy-all-btn");
  const clearAllBtn = document.getElementById("clear-all-btn");

  // Elementos DOM - Modal
  const multipleModal = document.getElementById("multiple-modal");
  const closeModal = document.querySelector(".close-modal");
  const quantityInput = document.getElementById("quantity-input");
  const modalFormattedOption = document.getElementById(
    "modal-formatted-option"
  );
  const modalLineBreakOption = document.getElementById(
    "modal-line-break-option"
  );
  const modalGenerateBtn = document.getElementById("modal-generate-btn");
  const modalCancelBtn = document.getElementById("modal-cancel-btn");

  // Estado atual da aplicação
  let currentDocument = "";
  let currentDocumentType = "cpf";
  let generatedDocuments = [];

  // Alternar entre as abas
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remover classe ativa de todas as abas
      tabs.forEach((t) => t.classList.remove("active"));

      // Adicionar classe ativa à aba clicada
      tab.classList.add("active");

      // Ocultar todos os conteúdos
      tabContents.forEach((content) => {
        content.classList.add("hidden");
      });

      // Mostrar o conteúdo correspondente à aba ativa
      const activeMode = tab.dataset.mode;
      document.getElementById(activeMode + "-mode").classList.remove("hidden");
    });
  });

  // Alternar entre os tipos de documento
  documentTypeRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      currentDocumentType = radio.value;
      updateDocumentInputPlaceholder();
    });
  });

  // Alternar entre os tipos de documento para geração
  generateDocumentTypeRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      const type = radio.value;

      // Mostrar ou ocultar o seletor de estado para CPF
      if (type === "cpf") {
        stateSelector.style.display = "block";
      } else {
        stateSelector.style.display = "none";
      }
    });
  });

  // Validar o documento
  validateBtn.addEventListener("click", () => {
    const document = documentInput.value.trim();

    if (!document) {
      showValidationResult(
        false,
        "Por favor, digite um documento para validar."
      );
      return;
    }

    // Verificar se o documento é válido
    if (currentDocumentType === "cpf") {
      const validation = validateCPF(document);
      showValidationResult(validation.isValid, validation.message);
      showValidationDetails(validation);
    } else {
      const validation = validateCNPJ(document);
      showValidationResult(validation.isValid, validation.message);
      showValidationDetails(validation);
    }
  });

  // Limpar o campo de documento
  clearBtn.addEventListener("click", () => {
    documentInput.value = "";
    resetValidationResult();
  });

  // Gerar documento
  generateBtn.addEventListener("click", () => {
    const type = document.querySelector(
      'input[name="generate-document-type"]:checked'
    ).value;
    const formatted = formattedOption.checked;
    const state = stateSelect.value;

    let generatedDocument = "";

    if (type === "cpf") {
      generatedDocument = generateCPF(formatted, state);
    } else {
      generatedDocument = generateCNPJ(formatted);
    }

    addGeneratedDocument(generatedDocument);
  });

  // Abrir modal para gerar múltiplos documentos
  generateMultipleBtn.addEventListener("click", () => {
    multipleModal.classList.add("show");
  });

  // Fechar modal
  closeModal.addEventListener("click", () => {
    multipleModal.classList.remove("show");
  });

  modalCancelBtn.addEventListener("click", () => {
    multipleModal.classList.remove("show");
  });

  // Clicar fora do modal para fechar
  window.addEventListener("click", (e) => {
    if (e.target === multipleModal) {
      multipleModal.classList.remove("show");
    }
  });

  // Gerar múltiplos documentos
  modalGenerateBtn.addEventListener("click", () => {
    const quantity = parseInt(quantityInput.value) || 10;
    const type = document.querySelector(
      'input[name="generate-document-type"]:checked'
    ).value;
    const formatted = modalFormattedOption.checked;
    const lineBreak = modalLineBreakOption.checked;
    const state = stateSelect.value;

    // Limitar a quantidade (1-50)
    const limitedQuantity = Math.min(Math.max(quantity, 1), 50);

    let documents = [];

    for (let i = 0; i < limitedQuantity; i++) {
      if (type === "cpf") {
        documents.push(generateCPF(formatted, state));
      } else {
        documents.push(generateCNPJ(formatted));
      }
    }

    // Adicionar documentos à lista
    addGeneratedDocuments(documents, lineBreak);

    // Fechar modal
    multipleModal.classList.remove("show");
  });

  // Copiar todos os documentos gerados
  copyAllBtn.addEventListener("click", () => {
    if (generatedDocuments.length === 0) return;

    const text = generatedDocuments.join("\n");
    copyToClipboard(text);

    // Feedback visual
    const originalText = copyAllBtn.innerHTML;
    copyAllBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';

    setTimeout(() => {
      copyAllBtn.innerHTML = originalText;
    }, 2000);
  });

  // Limpar todos os documentos gerados
  clearAllBtn.addEventListener("click", () => {
    clearGeneratedDocuments();
  });

  // Atualizar placeholder do input de documento
  function updateDocumentInputPlaceholder() {
    if (currentDocumentType === "cpf") {
      documentInput.placeholder = "Ex: 123.456.789-09 ou 12345678909";
    } else {
      documentInput.placeholder = "Ex: 12.345.678/0001-90 ou 12345678000190";
    }
  }

  // Mostrar resultado da validação
  function showValidationResult(isValid, message) {
    resultContainer.className = "result-container";
    resultContainer.classList.add(isValid ? "valid" : "invalid");

    const icon = resultContainer.querySelector(".result-icon");
    icon.innerHTML = isValid
      ? '<i class="fas fa-check-circle"></i>'
      : '<i class="fas fa-times-circle"></i>';

    const messageElement = resultContainer.querySelector(".result-message");
    messageElement.textContent = message;
  }

  // Mostrar detalhes da validação
  function showValidationDetails(validation) {
    if (!validation.details || validation.details.length === 0) {
      validationDetails.classList.remove("show");
      return;
    }

    let detailsHtml = `<h4>${
      validation.isValid ? "Passos da verificação:" : "Problemas encontrados:"
    }</h4>`;
    detailsHtml += "<ul>";

    validation.details.forEach((detail) => {
      const className = detail.valid ? "valid-step" : "invalid-step";
      const icon = detail.valid
        ? '<i class="fas fa-check"></i>'
        : '<i class="fas fa-times"></i>';
      detailsHtml += `<li class="${className}">${icon} ${detail.message}</li>`;
    });

    detailsHtml += "</ul>";
    validationDetails.innerHTML = detailsHtml;
    validationDetails.classList.add("show");
  }

  // Resetar resultado da validação
  function resetValidationResult() {
    resultContainer.className = "result-container";

    const icon = resultContainer.querySelector(".result-icon");
    icon.innerHTML = '<i class="fas fa-question-circle"></i>';

    const messageElement = resultContainer.querySelector(".result-message");
    messageElement.textContent =
      "Digite um documento e clique em validar para verificar sua validade.";

    validationDetails.classList.remove("show");
  }

  // Adicionar documento gerado à lista
  function addGeneratedDocument(document) {
    if (!document) return;

    generatedDocuments.push(document);
    updateDocumentList();
  }

  // Adicionar múltiplos documentos à lista
  function addGeneratedDocuments(documents, lineBreak = true) {
    if (!documents || documents.length === 0) return;

    generatedDocuments = [...generatedDocuments, ...documents];
    updateDocumentList(lineBreak);
  }

  // Atualizar a lista de documentos
  function updateDocumentList(lineBreak = true) {
    if (generatedDocuments.length === 0) {
      documentList.innerHTML =
        '<div class="empty-list">Clique no botão gerar para criar documentos</div>';
      copyAllBtn.disabled = true;
      clearAllBtn.disabled = true;
      return;
    }

    const separator = lineBreak ? "\n" : " ";
    documentList.textContent = generatedDocuments.join(separator);

    copyAllBtn.disabled = false;
    clearAllBtn.disabled = false;
  }

  // Limpar a lista de documentos
  function clearGeneratedDocuments() {
    generatedDocuments = [];
    updateDocumentList();
  }

  // Copiar texto para a área de transferência
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch((err) => {
      console.error("Erro ao copiar texto: ", err);
    });
  }

  // Validar CPF
  function validateCPF(cpf) {
    const details = [];

    // Remover caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, "");

    // Verificar se tem 11 dígitos
    if (cleanCPF.length !== 11) {
      details.push({
        valid: false,
        message: "CPF deve conter 11 dígitos numéricos.",
      });
      return {
        isValid: false,
        message: "CPF inválido: número incorreto de dígitos.",
        details,
      };
    }

    details.push({
      valid: true,
      message: "CPF contém 11 dígitos numéricos.",
    });

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) {
      details.push({
        valid: false,
        message: "CPF inválido: todos os dígitos são iguais.",
      });
      return {
        isValid: false,
        message: "CPF inválido: todos os dígitos são iguais.",
        details,
      };
    }

    details.push({
      valid: true,
      message: "Os dígitos não são todos iguais.",
    });

    // Calcular primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }

    let remainder = 11 - (sum % 11);
    let firstVerifier = remainder === 10 || remainder === 11 ? 0 : remainder;

    if (parseInt(cleanCPF.charAt(9)) !== firstVerifier) {
      details.push({
        valid: false,
        message: `Primeiro dígito verificador inválido: esperado ${firstVerifier}, encontrado ${cleanCPF.charAt(
          9
        )}.`,
      });
      return {
        isValid: false,
        message: "CPF inválido: dígito verificador incorreto.",
        details,
      };
    }

    details.push({
      valid: true,
      message: "Primeiro dígito verificador válido.",
    });

    // Calcular segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }

    remainder = 11 - (sum % 11);
    let secondVerifier = remainder === 10 || remainder === 11 ? 0 : remainder;

    if (parseInt(cleanCPF.charAt(10)) !== secondVerifier) {
      details.push({
        valid: false,
        message: `Segundo dígito verificador inválido: esperado ${secondVerifier}, encontrado ${cleanCPF.charAt(
          10
        )}.`,
      });
      return {
        isValid: false,
        message: "CPF inválido: dígito verificador incorreto.",
        details,
      };
    }

    details.push({
      valid: true,
      message: "Segundo dígito verificador válido.",
    });

    // Verificar a região fiscal (9º dígito)
    const regionDigit = parseInt(cleanCPF.charAt(8));
    let region = "";

    switch (regionDigit) {
      case 0:
        region = "RS";
        break;
      case 1:
        region = "DF, GO, MS, MT, TO";
        break;
      case 2:
        region = "AC, AM, AP, PA, RO, RR";
        break;
      case 3:
        region = "CE, MA, PI";
        break;
      case 4:
        region = "AL, PB, PE, RN";
        break;
      case 5:
        region = "BA, SE";
        break;
      case 6:
        region = "MG";
        break;
      case 7:
        region = "ES, RJ";
        break;
      case 8:
        region = "SP";
        break;
      case 9:
        region = "PR, SC";
        break;
    }

    details.push({
      valid: true,
      message: `Região fiscal do CPF: ${region} (dígito ${regionDigit}).`,
    });

    // CPF válido
    return {
      isValid: true,
      message: "CPF válido.",
      details,
    };
  }

  // Validar CNPJ
  function validateCNPJ(cnpj) {
    const details = [];

    // Remover caracteres não numéricos
    const cleanCNPJ = cnpj.replace(/\D/g, "");

    // Verificar se tem 14 dígitos
    if (cleanCNPJ.length !== 14) {
      details.push({
        valid: false,
        message: "CNPJ deve conter 14 dígitos numéricos.",
      });
      return {
        isValid: false,
        message: "CNPJ inválido: número incorreto de dígitos.",
        details,
      };
    }

    details.push({
      valid: true,
      message: "CNPJ contém 14 dígitos numéricos.",
    });

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
      details.push({
        valid: false,
        message: "CNPJ inválido: todos os dígitos são iguais.",
      });
      return {
        isValid: false,
        message: "CNPJ inválido: todos os dígitos são iguais.",
        details,
      };
    }

    details.push({
      valid: true,
      message: "Os dígitos não são todos iguais.",
    });

    // Calcular primeiro dígito verificador
    let sum = 0;
    let multiplier = 5;

    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanCNPJ.charAt(i)) * multiplier;
      multiplier = multiplier === 2 ? 9 : multiplier - 1;
    }

    let remainder = sum % 11;
    let firstVerifier = remainder < 2 ? 0 : 11 - remainder;

    if (parseInt(cleanCNPJ.charAt(12)) !== firstVerifier) {
      details.push({
        valid: false,
        message: `Primeiro dígito verificador inválido: esperado ${firstVerifier}, encontrado ${cleanCNPJ.charAt(
          12
        )}.`,
      });
      return {
        isValid: false,
        message: "CNPJ inválido: dígito verificador incorreto.",
        details,
      };
    }

    details.push({
      valid: true,
      message: "Primeiro dígito verificador válido.",
    });

    // Calcular segundo dígito verificador
    sum = 0;
    multiplier = 6;

    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleanCNPJ.charAt(i)) * multiplier;
      multiplier = multiplier === 2 ? 9 : multiplier - 1;
    }

    remainder = sum % 11;
    let secondVerifier = remainder < 2 ? 0 : 11 - remainder;

    if (parseInt(cleanCNPJ.charAt(13)) !== secondVerifier) {
      details.push({
        valid: false,
        message: `Segundo dígito verificador inválido: esperado ${secondVerifier}, encontrado ${cleanCNPJ.charAt(
          13
        )}.`,
      });
      return {
        isValid: false,
        message: "CNPJ inválido: dígito verificador incorreto.",
        details,
      };
    }

    details.push({
      valid: true,
      message: "Segundo dígito verificador válido.",
    });

    // Verificar classificação (matriz/filial)
    const classification = cleanCNPJ.substring(8, 12);
    let classType = "";

    if (classification === "0001") {
      classType = "Matriz";
    } else {
      classType = `Filial (${classification})`;
    }

    details.push({
      valid: true,
      message: `Classificação do CNPJ: ${classType}.`,
    });

    // CNPJ válido
    return {
      isValid: true,
      message: "CNPJ válido.",
      details,
    };
  }

  // Gerar CPF aleatório
  function generateCPF(formatted = true, stateCode = "") {
    // Gerar 9 dígitos aleatórios
    let cpf = "";
    for (let i = 0; i < 8; i++) {
      cpf += Math.floor(Math.random() * 10).toString();
    }

    // Se um estado for especificado, usar o dígito correspondente
    if (stateCode) {
      let regionDigit = 0;
      switch (stateCode) {
        case "df-go-ms-mt-to":
          regionDigit = 1;
          break;
        case "ac-am-ap-pa-ro-rr":
          regionDigit = 2;
          break;
        case "ce-ma-pi":
          regionDigit = 3;
          break;
        case "al-pb-pe-rn":
          regionDigit = 4;
          break;
        case "ba-se":
          regionDigit = 5;
          break;
        case "mg":
          regionDigit = 6;
          break;
        case "es-rj":
          regionDigit = 7;
          break;
        case "sp":
          regionDigit = 8;
          break;
        case "pr-sc":
          regionDigit = 9;
          break;
        case "rs":
          regionDigit = 0;
          break;
        default:
          regionDigit = Math.floor(Math.random() * 10).toString();
      }
      cpf += regionDigit;
    } else {
      // Caso contrário, gerar aleatoriamente
      cpf += Math.floor(Math.random() * 10).toString();
    }

    // Calcular primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }

    let remainder = 11 - (sum % 11);
    let firstVerifier = remainder === 10 || remainder === 11 ? 0 : remainder;
    cpf += firstVerifier;

    // Calcular segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }

    remainder = 11 - (sum % 11);
    let secondVerifier = remainder === 10 || remainder === 11 ? 0 : remainder;
    cpf += secondVerifier;

    // Formatar CPF (XXX.XXX.XXX-XX)
    if (formatted) {
      cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    return cpf;
  }

  // Gerar CNPJ aleatório
  function generateCNPJ(formatted = true) {
    // Gerar 8 dígitos aleatórios (base do CNPJ)
    let cnpj = "";
    for (let i = 0; i < 8; i++) {
      cnpj += Math.floor(Math.random() * 10).toString();
    }

    // Adicionar 0001 (indicando matriz)
    cnpj += "0001";

    // Calcular primeiro dígito verificador
    let sum = 0;
    let multiplier = 5;

    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj.charAt(i)) * multiplier;
      multiplier = multiplier === 2 ? 9 : multiplier - 1;
    }

    let remainder = sum % 11;
    let firstVerifier = remainder < 2 ? 0 : 11 - remainder;
    cnpj += firstVerifier;

    // Calcular segundo dígito verificador
    sum = 0;
    multiplier = 6;

    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpj.charAt(i)) * multiplier;
      multiplier = multiplier === 2 ? 9 : multiplier - 1;
    }

    remainder = sum % 11;
    let secondVerifier = remainder < 2 ? 0 : 11 - remainder;
    cnpj += secondVerifier;

    // Formatar CNPJ (XX.XXX.XXX/XXXX-XX)
    if (formatted) {
      cnpj = cnpj.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
      );
    }

    return cnpj;
  }

  // Inicializar
  function init() {
    updateDocumentInputPlaceholder();

    // Configurações iniciais
    if (
      document.querySelector('input[name="generate-document-type"]:checked')
        .value === "cpf"
    ) {
      stateSelector.style.display = "block";
    } else {
      stateSelector.style.display = "none";
    }
  }

  // Iniciar
  init();
});
