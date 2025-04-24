// static/js/password-generator.js
document.addEventListener("DOMContentLoaded", function () {
  // Elementos DOM - Display da senha
  const passwordOutput = document.getElementById("password-output");
  const toggleVisibilityBtn = document.getElementById("toggle-visibility-btn");
  const copyBtn = document.getElementById("copy-btn");
  const refreshBtn = document.getElementById("refresh-btn");
  const strengthBar = document.getElementById("strength-bar");
  const strengthText = document.getElementById("strength-text");

  // Elementos DOM - Opções de senha
  const passwordLength = document.getElementById("password-length");
  const lengthInput = document.getElementById("length-input");
  const uppercaseOption = document.getElementById("uppercase-option");
  const lowercaseOption = document.getElementById("lowercase-option");
  const numbersOption = document.getElementById("numbers-option");
  const symbolsOption = document.getElementById("symbols-option");
  const excludeSimilarOption = document.getElementById(
    "exclude-similar-option"
  );
  const excludeAmbiguousOption = document.getElementById(
    "exclude-ambiguous-option"
  );
  const requireAllTypesOption = document.getElementById(
    "require-all-types-option"
  );
  const formatOptions = document.querySelectorAll(
    'input[name="password-format"]'
  );
  const generateBtn = document.getElementById("generate-btn");

  // Elementos DOM - Opções específicas de formato
  const patternContainer = document.getElementById("pattern-container");
  const patternInput = document.getElementById("pattern-input");
  const memorableOptions = document.getElementById("memorable-options");
  const wordCount = document.getElementById("word-count");
  const wordSeparator = document.getElementById("word-separator");
  const capitalizeOption = document.getElementById("capitalize-option");
  const includeNumberOption = document.getElementById("include-number-option");
  const pinOptions = document.getElementById("pin-options");
  const pinGroupOption = document.getElementById("pin-group-option");

  // Elementos DOM - Múltiplas senhas
  const multiGenerateBtn = document.getElementById("multi-generate-btn");
  const multipleModal = document.getElementById("multiple-modal");
  const closeModal = document.querySelector(".close-modal");
  const quantityInput = document.getElementById("quantity-input");
  const modalGenerateBtn = document.getElementById("modal-generate-btn");
  const modalCancelBtn = document.getElementById("modal-cancel-btn");
  const generatedPasswordsContainer = document.getElementById(
    "generated-passwords"
  );
  const passwordsList = document.getElementById("passwords-list");
  const copyAllBtn = document.getElementById("copy-all-btn");
  const clearBtn = document.getElementById("clear-btn");

  // Conjuntos de caracteres
  const charSets = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  };

  // Caracteres similares e ambíguos
  const similarChars = "il1LoO0";
  const ambiguousChars = "{}[]()/\\'\"`~,;:.<>";

  // Lista de palavras para senhas memoráveis
  const commonWords = [
    "tempo",
    "ano",
    "dia",
    "vez",
    "fato",
    "mês",
    "ponto",
    "forma",
    "caso",
    "vida",
    "mundo",
    "obra",
    "casa",
    "coisa",
    "tipo",
    "estado",
    "lado",
    "homem",
    "modo",
    "país",
    "número",
    "parte",
    "grupo",
    "lugar",
    "pessoa",
    "nome",
    "momento",
    "senhor",
    "situação",
    "empresa",
    "trabalho",
    "processo",
    "meio",
    "problema",
    "governo",
    "filho",
    "fim",
    "sentido",
    "cidade",
    "projeto",
    "palavra",
    "hora",
    "sistema",
    "valor",
    "caminho",
    "pouco",
    "jogo",
    "povo",
    "exemplo",
    "ideia",
    "cabeça",
    "criança",
    "terra",
    "questão",
    "olho",
    "mulher",
    "direito",
    "poder",
    "centro",
    "livro",
    "direção",
    "festa",
    "mão",
    "música",
    "corpo",
    "base",
    "frente",
    "nível",
    "campo",
    "arte",
    "razão",
    "início",
    "papel",
    "porta",
    "objeto",
    "análise",
    "verdade",
    "idade",
    "força",
    "período",
    "serviço",
    "história",
    "forma",
    "efeito",
    "luz",
    "lei",
    "voz",
    "pé",
    "área",
    "mãe",
  ];

  // Array para armazenar senhas geradas
  let generatedPasswords = [];

  // Inicializar a página
  initializePage();

  // Função de inicialização
  function initializePage() {
    // Gerar uma senha inicial
    generatePassword();

    // Eventos para os elementos
    passwordLength.addEventListener("input", updateLengthInput);
    lengthInput.addEventListener("input", updateLengthSlider);
    toggleVisibilityBtn.addEventListener("click", togglePasswordVisibility);
    copyBtn.addEventListener("click", copyPasswordToClipboard);
    refreshBtn.addEventListener("click", generatePassword);
    generateBtn.addEventListener("click", generatePassword);

    // Eventos para opções de formato
    formatOptions.forEach((option) => {
      option.addEventListener("change", updateFormatOptions);
    });

    // Eventos para geração múltipla
    multiGenerateBtn.addEventListener("click", showMultipleModal);
    closeModal.addEventListener("click", hideMultipleModal);
    modalCancelBtn.addEventListener("click", hideMultipleModal);
    modalGenerateBtn.addEventListener("click", generateMultiplePasswords);
    copyAllBtn.addEventListener("click", copyAllPasswords);
    clearBtn.addEventListener("click", clearPasswords);

    // Fecha o modal ao clicar fora
    window.addEventListener("click", function (event) {
      if (event.target == multipleModal) {
        hideMultipleModal();
      }
    });

    // Inicializar seletores de formato
    updateFormatOptions();

    // Desabilitar opções incompatíveis
    lowercaseOption.addEventListener("change", validateOptions);
    uppercaseOption.addEventListener("change", validateOptions);
    numbersOption.addEventListener("change", validateOptions);
    symbolsOption.addEventListener("change", validateOptions);
  }

  // Atualizar input de comprimento quando o slider muda
  function updateLengthInput() {
    lengthInput.value = passwordLength.value;
    generatePassword();
  }

  // Atualizar slider quando o input de comprimento muda
  function updateLengthSlider() {
    let value = parseInt(lengthInput.value);

    // Validar limites
    if (isNaN(value) || value < 6) {
      value = 6;
    } else if (value > 64) {
      value = 64;
    }

    lengthInput.value = value;
    passwordLength.value = value;
    generatePassword();
  }

  // Alternar visibilidade da senha
  function togglePasswordVisibility() {
    if (passwordOutput.type === "password") {
      passwordOutput.type = "text";
      toggleVisibilityBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
      passwordOutput.type = "password";
      toggleVisibilityBtn.innerHTML = '<i class="fas fa-eye"></i>';
    }
  }

  // Copiar senha para a área de transferência
  function copyPasswordToClipboard() {
    const password = passwordOutput.value;
    if (!password) return;

    navigator.clipboard
      .writeText(password)
      .then(() => {
        // Feedback visual
        const originalIcon = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';

        setTimeout(() => {
          copyBtn.innerHTML = originalIcon;
        }, 1500);
      })
      .catch((err) => {
        console.error("Erro ao copiar para a área de transferência:", err);
      });
  }

  // Atualizar opções de formato
  function updateFormatOptions() {
    const selectedFormat = document.querySelector(
      'input[name="password-format"]:checked'
    ).value;

    // Ocultar todas as opções específicas
    patternContainer.classList.add("hidden");
    memorableOptions.classList.add("hidden");
    pinOptions.classList.add("hidden");

    // Mostrar opções relacionadas ao formato selecionado
    switch (selectedFormat) {
      case "pattern":
        patternContainer.classList.remove("hidden");
        break;
      case "memorable":
        memorableOptions.classList.remove("hidden");
        break;
      case "pin":
        pinOptions.classList.remove("hidden");
        // No modo PIN, desativar outras opções de caracteres
        uppercaseOption.checked = false;
        lowercaseOption.checked = false;
        symbolsOption.checked = false;
        numbersOption.checked = true;
        break;
    }

    validateOptions();
    generatePassword();
  }

  // Validar opções de senha
  function validateOptions() {
    const selectedFormat = document.querySelector(
      'input[name="password-format"]:checked'
    ).value;

    // Se o formato for PIN, forçar apenas números
    if (selectedFormat === "pin") {
      uppercaseOption.checked = false;
      uppercaseOption.disabled = true;

      lowercaseOption.checked = false;
      lowercaseOption.disabled = true;

      symbolsOption.checked = false;
      symbolsOption.disabled = true;

      numbersOption.checked = true;
      numbersOption.disabled = true;

      requireAllTypesOption.checked = false;
      requireAllTypesOption.disabled = true;
    } else {
      uppercaseOption.disabled = false;
      lowercaseOption.disabled = false;
      symbolsOption.disabled = false;
      numbersOption.disabled = false;
      requireAllTypesOption.disabled = false;

      // Garantir que pelo menos um tipo de caractere esteja selecionado
      if (
        !uppercaseOption.checked &&
        !lowercaseOption.checked &&
        !numbersOption.checked &&
        !symbolsOption.checked
      ) {
        // Se nenhum estiver selecionado, forçar letras minúsculas
        lowercaseOption.checked = true;
      }
    }
  }

  // Gerar senha com base nas opções selecionadas
  function generatePassword() {
    const selectedFormat = document.querySelector(
      'input[name="password-format"]:checked'
    ).value;
    let password = "";

    // Escolher o método de geração com base no formato selecionado
    switch (selectedFormat) {
      case "random":
        password = generateRandomPassword();
        break;
      case "memorable":
        password = generateMemorablePassword();
        break;
      case "pin":
        password = generatePinPassword();
        break;
      case "pattern":
        password = generatePatternPassword();
        break;
    }

    // Atualizar exibição
    passwordOutput.value = password;
    updateStrengthIndicator(password);
  }

  // Gerar senha aleatória
  function generateRandomPassword() {
    const length = parseInt(passwordLength.value);
    let charset = "";
    let requiredChars = [];

    // Construir conjunto de caracteres com base nas opções
    if (uppercaseOption.checked) {
      charset += charSets.uppercase;
      requiredChars.push(getRandomChar(charSets.uppercase));
    }

    if (lowercaseOption.checked) {
      charset += charSets.lowercase;
      requiredChars.push(getRandomChar(charSets.lowercase));
    }

    if (numbersOption.checked) {
      charset += charSets.numbers;
      requiredChars.push(getRandomChar(charSets.numbers));
    }

    if (symbolsOption.checked) {
      charset += charSets.symbols;
      requiredChars.push(getRandomChar(charSets.symbols));
    }

    // Excluir caracteres similares
    if (excludeSimilarOption.checked) {
      charset = removeChars(charset, similarChars);
    }

    // Excluir caracteres ambíguos
    if (excludeAmbiguousOption.checked) {
      charset = removeChars(charset, ambiguousChars);
    }

    // Garantir que o conjunto não esteja vazio
    if (charset.length === 0) {
      charset = charSets.lowercase;
    }

    // Gerar senha aleatória
    let password = "";

    // Se precisar incluir todos os tipos selecionados
    if (requireAllTypesOption.checked && requiredChars.length > 0) {
      // Adicionar caracteres requeridos
      password = requiredChars.join("");

      // Completar com caracteres aleatórios
      for (let i = password.length; i < length; i++) {
        password += getRandomChar(charset);
      }

      // Embaralhar a senha
      password = shuffleString(password);
    } else {
      // Gerar totalmente aleatória
      for (let i = 0; i < length; i++) {
        password += getRandomChar(charset);
      }
    }

    return password;
  }

  // Gerar senha memorável
  function generateMemorablePassword() {
    const count = parseInt(wordCount.value) || 4;
    const separator = wordSeparator.value || "-";
    const capitalize = capitalizeOption.checked;
    const includeNumber = includeNumberOption.checked;

    // Selecionar palavras aleatórias
    let words = [];
    for (let i = 0; i < count; i++) {
      let word = commonWords[Math.floor(Math.random() * commonWords.length)];

      // Capitalizar se necessário
      if (capitalize) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }

      words.push(word);
    }

    // Adicionar número se necessário
    if (includeNumber) {
      const num = Math.floor(Math.random() * 1000);
      words.push(num.toString());
    }

    return words.join(separator);
  }

  // Gerar PIN numérico
  function generatePinPassword() {
    const length = parseInt(passwordLength.value);
    const groupDigits = pinGroupOption.checked;

    // Gerar PIN
    let pin = "";
    for (let i = 0; i < length; i++) {
      pin += getRandomChar(charSets.numbers);
    }

    // Agrupar dígitos se necessário (ex: 123-456-789)
    if (groupDigits && length > 3) {
      let formatted = "";
      for (let i = 0; i < pin.length; i++) {
        formatted += pin[i];
        if ((i + 1) % 3 === 0 && i < pin.length - 1) {
          formatted += "-";
        }
      }
      return formatted;
    }

    return pin;
  }

  // Gerar senha baseada em padrão
  function generatePatternPassword() {
    const pattern = patternInput.value || "Aaaa####9999";
    let password = "";

    // Processar cada caractere do padrão
    for (let i = 0; i < pattern.length; i++) {
      const char = pattern[i];

      switch (char) {
        case "A":
          password += getRandomChar(charSets.uppercase);
          break;
        case "a":
          password += getRandomChar(charSets.lowercase);
          break;
        case "9":
          password += getRandomChar(charSets.numbers);
          break;
        case "#":
          password += getRandomChar(charSets.symbols);
          break;
        default:
          password += char;
      }
    }

    return password;
  }

  // Atualizar indicador de força da senha
  function updateStrengthIndicator(password) {
    // Calcular pontuação de força
    const score = calculatePasswordStrength(password);

    // Atualizar barra e texto
    strengthBar.className = "strength-bar";

    if (score < 40) {
      strengthBar.classList.add("weak");
      strengthText.textContent = "Fraca";
    } else if (score < 60) {
      strengthBar.classList.add("fair");
      strengthText.textContent = "Razoável";
    } else if (score < 80) {
      strengthBar.classList.add("good");
      strengthText.textContent = "Boa";
    } else {
      strengthBar.classList.add("strong");
      strengthText.textContent = "Forte";
    }
  }

  // Calcular força da senha
  function calculatePasswordStrength(password) {
    if (!password) return 0;

    let score = 0;
    const length = password.length;

    // Comprimento (até 40 pontos)
    score += Math.min(length * 2, 40);

    // Variedade de caracteres
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);

    // Adicionar pontos por variedade (até 20 pontos)
    const variety =
      (hasUpper ? 5 : 0) +
      (hasLower ? 5 : 0) +
      (hasNumber ? 5 : 0) +
      (hasSymbol ? 5 : 0);
    score += variety;

    // Avaliar sequências e repetições (penalidade até 20 pontos)
    let penalty = 0;

    // Verificar sequências (abc, 123, etc)
    for (let i = 2; i < length; i++) {
      const c1 = password.charCodeAt(i - 2);
      const c2 = password.charCodeAt(i - 1);
      const c3 = password.charCodeAt(i);

      // Sequência ascendente ou descendente
      if (
        (c1 + 1 === c2 && c2 + 1 === c3) ||
        (c1 - 1 === c2 && c2 - 1 === c3)
      ) {
        penalty += 2;
      }
    }

    // Verificar repetições do mesmo caractere
    for (let i = 1; i < length; i++) {
      if (password[i] === password[i - 1]) {
        penalty += 2;
      }
    }

    // Limitar penalidade
    penalty = Math.min(penalty, 20);
    score -= penalty;

    // Entropia (até 40 pontos)
    const charset =
      (hasUpper ? 26 : 0) +
      (hasLower ? 26 : 0) +
      (hasNumber ? 10 : 0) +
      (hasSymbol ? 30 : 0);
    if (charset > 0) {
      // Log base 2 de charset^length (aproximado)
      const entropy = Math.log2(Math.pow(charset, length));
      score += Math.min(entropy, 40);
    }

    // Normalizar para 0-100
    return Math.max(0, Math.min(100, score));
  }

  // Mostrar modal para gerar múltiplas senhas
  function showMultipleModal() {
    multipleModal.classList.add("show");
  }

  // Ocultar modal
  function hideMultipleModal() {
    multipleModal.classList.remove("show");
  }

  // Gerar múltiplas senhas
  function generateMultiplePasswords() {
    const quantity = parseInt(quantityInput.value) || 10;
    const limitedQuantity = Math.min(Math.max(quantity, 1), 50);

    // Gerar senhas
    let newPasswords = [];
    for (let i = 0; i < limitedQuantity; i++) {
      const password = generatePasswordByCurrentOptions();
      newPasswords.push(password);
    }

    // Adicionar à lista
    generatedPasswords = [...newPasswords, ...generatedPasswords];
    updatePasswordsList();

    // Mostrar container de senhas geradas
    generatedPasswordsContainer.classList.remove("hidden");

    // Ocultar modal
    hideMultipleModal();
  }

  // Gerar senha com as opções atuais
  function generatePasswordByCurrentOptions() {
    const selectedFormat = document.querySelector(
      'input[name="password-format"]:checked'
    ).value;
    let password = "";

    switch (selectedFormat) {
      case "random":
        password = generateRandomPassword();
        break;
      case "memorable":
        password = generateMemorablePassword();
        break;
      case "pin":
        password = generatePinPassword();
        break;
      case "pattern":
        password = generatePatternPassword();
        break;
    }

    return password;
  }

  // Atualizar lista de senhas geradas
  function updatePasswordsList() {
    passwordsList.innerHTML = "";

    generatedPasswords.forEach((password, index) => {
      const item = document.createElement("div");
      item.className = "password-item";

      item.innerHTML = `
                <span class="password-text">${password}</span>
                <button class="password-item-copy" title="Copiar senha">
                    <i class="fas fa-copy"></i>
                </button>
            `;

      // Adicionar evento para copiar senha
      const copyBtn = item.querySelector(".password-item-copy");
      copyBtn.addEventListener("click", function () {
        navigator.clipboard.writeText(password).then(() => {
          const icon = copyBtn.querySelector("i");
          icon.className = "fas fa-check";

          setTimeout(() => {
            icon.className = "fas fa-copy";
          }, 1500);
        });
      });

      passwordsList.appendChild(item);
    });
  }

  // Copiar todas as senhas geradas
  function copyAllPasswords() {
    if (generatedPasswords.length === 0) return;

    const text = generatedPasswords.join("\n");

    navigator.clipboard.writeText(text).then(() => {
      // Feedback visual
      const originalText = copyAllBtn.innerHTML;
      copyAllBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';

      setTimeout(() => {
        copyAllBtn.innerHTML = originalText;
      }, 1500);
    });
  }

  // Limpar lista de senhas geradas
  function clearPasswords() {
    generatedPasswords = [];
    passwordsList.innerHTML = "";

    // Ocultar container se não houver senhas
    generatedPasswordsContainer.classList.add("hidden");
  }

  // Funções auxiliares

  // Obter caractere aleatório de um conjunto
  function getRandomChar(charset) {
    return charset.charAt(Math.floor(Math.random() * charset.length));
  }

  // Remover caracteres de um conjunto
  function removeChars(charset, charsToRemove) {
    return charset
      .split("")
      .filter((char) => !charsToRemove.includes(char))
      .join("");
  }

  // Embaralhar string
  function shuffleString(str) {
    const arr = str.split("");
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join("");
  }
});
