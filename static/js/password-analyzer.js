// Fixed password-analyzer.js
document.addEventListener("DOMContentLoaded", function () {
  // Elementos DOM - Input da senha
  const passwordInput = document.getElementById("password-input");
  const toggleVisibilityBtn = document.getElementById("toggle-visibility-btn");
  const clearBtn = document.getElementById("clear-btn");
  const placeholderMessage = document.getElementById("placeholder-message");
  const analysisResults = document.getElementById("analysis-results");

  // Elementos DOM - Resultados de pontuação
  const scoreValue = document.getElementById("score-value");
  const scoreText = document.getElementById("score-text");
  const scoreIndicatorBar = document.getElementById("score-indicator-bar");
  const crackTime = document.getElementById("crack-time");
  const crackTimeDescription = document.getElementById(
    "crack-time-description"
  );

  // Elementos DOM - Análise detalhada
  const lengthScoreElement = document.getElementById("length-score");
  const lengthFeedback = document.getElementById("length-feedback");
  const lengthBar = document.getElementById("length-bar");
  const complexityScoreElement = document.getElementById("complexity-score");
  const complexityFeedback = document.getElementById("complexity-feedback");
  const complexityBar = document.getElementById("complexity-bar");
  const randomnessScoreElement = document.getElementById("randomness-score");
  const randomnessFeedback = document.getElementById("randomness-feedback");
  const randomnessBar = document.getElementById("randomness-bar");
  const vulnerabilityScoreElement = document.getElementById(
    "vulnerability-score"
  );
  const vulnerabilityFeedback = document.getElementById(
    "vulnerability-feedback"
  );
  const vulnerabilityBar = document.getElementById("vulnerability-bar");
  const vulnerabilitiesList = document.getElementById("vulnerabilities-list");

  // Elementos DOM - Estatísticas
  const statLength = document.getElementById("stat-length");
  const statUppercase = document.getElementById("stat-uppercase");
  const statLowercase = document.getElementById("stat-lowercase");
  const statNumbers = document.getElementById("stat-numbers");
  const statSymbols = document.getElementById("stat-symbols");
  const statUnique = document.getElementById("stat-unique");
  const statEntropy = document.getElementById("stat-entropy");

  // Elementos DOM - Recomendações
  const recommendationsList = document.getElementById("recommendations-list");

  // Lista de senhas comuns (simplificada para exemplo)
  const commonPasswords = [
    "123456",
    "password",
    "123456789",
    "12345678",
    "12345",
    "1234567",
    "1234567890",
    "qwerty",
    "abc123",
    "admin",
    "welcome",
    "monkey",
    "1234",
    "senha",
    "football",
    "123123",
    "admin123",
    "letmein",
    "dragon",
    "iloveyou",
    "sunshine",
    "princess",
    "qwerty123",
    "michael",
    "superman",
    "master",
    "shadow",
    "freedom",
    "baseball",
  ];

  // Padrões comuns
  const patterns = [
    // Sequências de teclado
    /qwert/i,
    /asdf/i,
    /zxcv/i,
    /poiuy/i,
    /lkjh/i,
    /mnbv/i,
    // Sequências numéricas
    /12345/i,
    /23456/i,
    /34567/i,
    /45678/i,
    /56789/i,
    /67890/i,
    // Sequências alfabéticas
    /abcd/i,
    /bcde/i,
    /cdef/i,
    /defg/i,
    /efgh/i,
    /fghi/i,
    /ghij/i,
    // Padrões repetidos
    /(\w)\1{2,}/i,
    // Palindromo
    /(\w)(\w)(\w)(\w)\4\3\2\1/i,
  ];

  // Inicialização
  initializePasswordAnalyzer();

  // Função de inicialização
  function initializePasswordAnalyzer() {
    // Eventos
    passwordInput.addEventListener("input", analyzePassword);
    toggleVisibilityBtn.addEventListener("click", togglePasswordVisibility);
    clearBtn.addEventListener("click", clearPassword);

    // Estado inicial
    clearPassword();
  }

  // Alternar visibilidade da senha
  function togglePasswordVisibility() {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleVisibilityBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
      passwordInput.type = "password";
      toggleVisibilityBtn.innerHTML = '<i class="fas fa-eye"></i>';
    }
  }

  // Limpar campo de senha e resultados
  function clearPassword() {
    passwordInput.value = "";
    placeholderMessage.classList.remove("hidden");
    analysisResults.classList.add("hidden");
  }

  // Analisar senha
  function analyzePassword() {
    const password = passwordInput.value;

    if (!password) {
      placeholderMessage.classList.remove("hidden");
      analysisResults.classList.add("hidden");
      return;
    }

    placeholderMessage.classList.add("hidden");
    analysisResults.classList.remove("hidden");

    // Calcular estatísticas básicas
    const stats = calculatePasswordStats(password);

    // Calcular pontuações
    const lengthPoints = calculateLengthScore(password);
    const complexityPoints = calculateComplexityScore(stats);
    const randomnessPoints = calculateRandomnessScore(password);
    const vulnerabilityPoints = calculateVulnerabilityScore(password);

    // Pontuação total (100 pontos possíveis)
    const totalScore = Math.min(
      100,
      Math.max(
        0,
        lengthPoints + complexityPoints + randomnessPoints + vulnerabilityPoints
      )
    );

    // Atualizar UI com resultados
    updateScoreDisplay(totalScore);
    updateDetailedAnalysis(
      lengthPoints,
      complexityPoints,
      randomnessPoints,
      vulnerabilityPoints,
      password,
      stats
    );
    updateStatistics(stats);
    updateCrackTimeEstimate(totalScore, stats);
    generateRecommendations(
      lengthPoints,
      complexityPoints,
      randomnessPoints,
      vulnerabilityPoints,
      password,
      stats
    );
  }

  // Calcular estatísticas da senha
  function calculatePasswordStats(password) {
    const length = password.length;
    const uppercase = (password.match(/[A-Z]/g) || []).length;
    const lowercase = (password.match(/[a-z]/g) || []).length;
    const numbers = (password.match(/[0-9]/g) || []).length;
    const symbols = (password.match(/[^A-Za-z0-9]/g) || []).length;

    // Calcular unicidade (percentual de caracteres únicos)
    const uniqueChars = new Set(password.split("")).size;
    const uniquePercent = Math.round((uniqueChars / length) * 100) || 0;

    // Calcular entropia
    let charsetSize = 0;
    if (uppercase > 0) charsetSize += 26;
    if (lowercase > 0) charsetSize += 26;
    if (numbers > 0) charsetSize += 10;
    if (symbols > 0) charsetSize += 33;

    const entropy =
      charsetSize > 0
        ? Math.round(Math.log2(Math.pow(charsetSize, length)))
        : 0;

    return {
      length,
      uppercase,
      lowercase,
      numbers,
      symbols,
      uniqueChars,
      uniquePercent,
      entropy,
      charsetSize,
    };
  }

  // Calcular pontuação de comprimento (0-25 pontos)
  function calculateLengthScore(password) {
    const length = password.length;

    // Escala de pontuação para comprimento
    // 0-4: muito curta (0-5 pontos)
    // 5-7: curta (6-10 pontos)
    // 8-11: média (11-15 pontos)
    // 12-15: longa (16-20 pontos)
    // 16+: muito longa (21-25 pontos)

    if (length <= 4) {
      return Math.max(0, length * 1.25);
    } else if (length <= 7) {
      return 5 + (length - 4) * 1.67;
    } else if (length <= 11) {
      return 10 + (length - 7) * 1.25;
    } else if (length <= 15) {
      return 15 + (length - 11) * 1.25;
    } else {
      return Math.min(25, 20 + (length - 15) * 0.5);
    }
  }

  // Calcular pontuação de complexidade (0-25 pontos)
  function calculateComplexityScore(stats) {
    let score = 0;

    // Pontos para diferentes tipos de caracteres (até 16 pontos)
    if (stats.uppercase > 0) score += 4;
    if (stats.lowercase > 0) score += 4;
    if (stats.numbers > 0) score += 4;
    if (stats.symbols > 0) score += 4;

    // Pontos para distribuição de tipos (até 9 pontos)
    // Quanto mais balanceado, melhor
    const totalChars = stats.length;
    if (totalChars > 0) {
      const uppercaseRatio = stats.uppercase / totalChars;
      const lowercaseRatio = stats.lowercase / totalChars;
      const numbersRatio = stats.numbers / totalChars;
      const symbolsRatio = stats.symbols / totalChars;

      // Idealmente, cada tipo teria 25% de representação
      // Quanto mais próximo disso, melhor a pontuação
      const ratios = [
        uppercaseRatio,
        lowercaseRatio,
        numbersRatio,
        symbolsRatio,
      ].filter((r) => r > 0); // Considerar apenas tipos presentes

      if (ratios.length > 1) {
        const idealRatio = 1 / ratios.length;
        const avgDeviation =
          ratios
            .map((r) => Math.abs(r - idealRatio))
            .reduce((sum, val) => sum + val, 0) / ratios.length;

        // Menor desvio = maior pontuação
        score += Math.round(9 * (1 - avgDeviation / idealRatio));
      }
    }

    return score;
  }

  // Calcular pontuação de aleatoriedade (0-25 pontos)
  function calculateRandomnessScore(password) {
    let score = 25; // Começa com pontuação máxima

    // Verificar padrões comuns (até -15 pontos)
    let patternPenalty = 0;
    for (let pattern of patterns) {
      if (pattern.test(password)) {
        patternPenalty += 3;
      }
    }
    patternPenalty = Math.min(15, patternPenalty);
    score -= patternPenalty;

    // Verificar repetições de caracteres (até -5 pontos)
    const charFreq = {};
    for (let char of password) {
      charFreq[char] = (charFreq[char] || 0) + 1;
    }

    const maxFreq = Math.max(...Object.values(charFreq));
    const repeatPenalty = Math.min(5, Math.max(0, maxFreq - 1));
    score -= repeatPenalty;

    // Verificar sequências de casos (até -5 pontos)
    // Ex: todas maiúsculas no início, todos números no final
    let casePenalty = 0;

    // Verificar se todos os números estão no início ou final
    const numbersAtStart = /^[0-9]+[^0-9]/.test(password);
    const numbersAtEnd = /[^0-9][0-9]+$/.test(password);

    if ((numbersAtStart || numbersAtEnd) && password.match(/[0-9]/g)) {
      casePenalty += 2;
    }

    // Verificar se todas as maiúsculas estão no início
    if (/^[A-Z]+[^A-Z]/.test(password) && password.match(/[A-Z]/g)) {
      casePenalty += 2;
    }

    // Verificar se todos os símbolos estão no final
    if (
      /[a-zA-Z0-9][^a-zA-Z0-9]+$/.test(password) &&
      password.match(/[^a-zA-Z0-9]/g)
    ) {
      casePenalty += 1;
    }

    score -= Math.min(5, casePenalty);

    return Math.max(0, score);
  }

  // Calcular pontuação de vulnerabilidade (0-25 pontos)
  function calculateVulnerabilityScore(password) {
    let score = 25; // Começa com pontuação máxima

    // Verificar se é uma senha comum (até -15 pontos)
    if (commonPasswords.includes(password.toLowerCase())) {
      score -= 15;
    }

    // Verificar se contém palavras comuns (até -5 pontos)
    for (let commonPwd of commonPasswords) {
      if (password.toLowerCase().includes(commonPwd)) {
        score -= 5;
        break;
      }
    }

    // Verificar se é uma data (até -5 pontos)
    if (
      /^(19|20)\d\d(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/.test(password) || // AAAAMMDD
      /^(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])(19|20)\d\d$/.test(password) // DDMMAAAA
    ) {
      score -= 5;
    }

    return Math.max(0, score);
  }

  // Atualizar exibição da pontuação
  function updateScoreDisplay(score) {
    // Atualizar valor numérico
    scoreValue.textContent = Math.round(score);

    // Atualizar texto de classificação
    let classification = "";
    let textClass = "";
    let barClass = "";

    if (score < 40) {
      classification = "Fraca";
      textClass = "text-weak";
      barClass = "weak";
    } else if (score < 60) {
      classification = "Razoável";
      textClass = "text-fair";
      barClass = "fair";
    } else if (score < 80) {
      classification = "Boa";
      textClass = "text-good";
      barClass = "good";
    } else {
      classification = "Forte";
      textClass = "text-strong";
      barClass = "strong";
    }

    scoreText.textContent = classification;
    scoreText.className = textClass;

    // Atualizar barra indicadora
    scoreIndicatorBar.className = barClass;

    if (score < 40) {
      scoreIndicatorBar.style.width = "25%";
    } else if (score < 60) {
      scoreIndicatorBar.style.width = "50%";
    } else if (score < 80) {
      scoreIndicatorBar.style.width = "75%";
    } else {
      scoreIndicatorBar.style.width = "100%";
    }
  }

  // Atualizar análise detalhada
  function updateDetailedAnalysis(
    lengthScore,
    complexityScore,
    randomnessScore,
    vulnerabilityScore,
    password,
    stats
  ) {
    // Arredondar pontuações
    const roundedLengthScore = Math.round(lengthScore);
    const roundedComplexityScore = Math.round(complexityScore);
    const roundedRandomnessScore = Math.round(randomnessScore);
    const roundedVulnerabilityScore = Math.round(vulnerabilityScore);

    // Atualizar texto das pontuações
    lengthScoreElement.textContent = `${roundedLengthScore}/25`;
    complexityScoreElement.textContent = `${roundedComplexityScore}/25`;
    randomnessScoreElement.textContent = `${roundedRandomnessScore}/25`;
    vulnerabilityScoreElement.textContent = `${roundedVulnerabilityScore}/25`;

    // Atualizar barras de progresso
    updateScoreBar(lengthBar, roundedLengthScore, 25);
    updateScoreBar(complexityBar, roundedComplexityScore, 25);
    updateScoreBar(randomnessBar, roundedRandomnessScore, 25);
    updateScoreBar(vulnerabilityBar, roundedVulnerabilityScore, 25);

    // Atualizar feedback de comprimento
    if (stats.length < 8) {
      lengthFeedback.textContent =
        "Senha muito curta. Considere usar pelo menos 12 caracteres.";
    } else if (stats.length < 12) {
      lengthFeedback.textContent =
        "Comprimento razoável, mas senhas mais longas são mais seguras.";
    } else if (stats.length < 16) {
      lengthFeedback.textContent =
        "Bom comprimento. Senhas longas são mais difíceis de quebrar.";
    } else {
      lengthFeedback.textContent =
        "Excelente comprimento! Senhas longas aumentam significativamente a segurança.";
    }

    // Atualizar feedback de complexidade
    const typesUsed = [
      stats.uppercase > 0,
      stats.lowercase > 0,
      stats.numbers > 0,
      stats.symbols > 0,
    ].filter(Boolean).length;

    if (typesUsed <= 1) {
      complexityFeedback.textContent =
        "Complexidade muito baixa. Use uma mistura de letras, números e símbolos.";
    } else if (typesUsed === 2) {
      complexityFeedback.textContent =
        "Complexidade básica. Adicione mais tipos de caracteres para maior segurança.";
    } else if (typesUsed === 3) {
      complexityFeedback.textContent =
        "Boa complexidade. Utilizando uma boa variedade de caracteres.";
    } else {
      complexityFeedback.textContent =
        "Excelente complexidade! Usando todos os tipos de caracteres.";
    }

    // Atualizar feedback de aleatoriedade
    if (roundedRandomnessScore < 10) {
      randomnessFeedback.textContent =
        "Padrões óbvios detectados. Evite sequências e repetições.";
    } else if (roundedRandomnessScore < 15) {
      randomnessFeedback.textContent =
        "Alguns padrões detectados. Use caracteres mais aleatórios.";
    } else if (roundedRandomnessScore < 20) {
      randomnessFeedback.textContent =
        "Boa aleatoriedade, mas ainda há espaço para melhoria.";
    } else {
      randomnessFeedback.textContent =
        "Excelente aleatoriedade! Isso torna a senha difícil de adivinhar.";
    }

    // Atualizar feedback de vulnerabilidade e lista de vulnerabilidades
    updateVulnerabilities(password, roundedVulnerabilityScore);
  }

  // Atualizar barra de pontuação
  function updateScoreBar(barElement, score, maxScore) {
    // Limpar conteúdo anterior
    barElement.innerHTML = "";

    // Criar elemento de preenchimento
    const fillElement = document.createElement("div");
    fillElement.className = "score-bar-fill";
    fillElement.style.width = `${(score / maxScore) * 100}%`;

    // Aplicar cor baseada na pontuação
    if (score < maxScore * 0.4) {
      fillElement.style.backgroundColor = "var(--danger)";
    } else if (score < maxScore * 0.6) {
      fillElement.style.backgroundColor = "#F59E0B";
    } else if (score < maxScore * 0.8) {
      fillElement.style.backgroundColor = "#10B981";
    } else {
      fillElement.style.backgroundColor = "#059669";
    }

    barElement.appendChild(fillElement);
  }

  // Atualizar vulnerabilidades
  function updateVulnerabilities(password, vulnerabilityScore) {
    // Limpar lista
    vulnerabilitiesList.innerHTML = "";

    const vulnerabilities = [];

    // Verificar vulnerabilidades comuns
    if (commonPasswords.includes(password.toLowerCase())) {
      vulnerabilities.push({
        icon: "exclamation-triangle",
        message: "Esta é uma senha muito comum e facilmente adivinhável.",
      });
    }

    for (let commonPwd of commonPasswords) {
      if (
        password.toLowerCase().includes(commonPwd) &&
        password.length > commonPwd.length
      ) {
        vulnerabilities.push({
          icon: "exclamation-circle",
          message: `Contém palavra comum: "${commonPwd}"`,
        });
        break;
      }
    }

    // Verificar padrões
    let patternFound = false;
    for (let pattern of patterns) {
      if (pattern.test(password) && !patternFound) {
        vulnerabilities.push({
          icon: "project-diagram",
          message: "Contém sequências ou padrões previsíveis.",
        });
        patternFound = true;
      }
    }

    // Verificar uso de caracteres repetidos
    const charFreq = {};
    for (let char of password) {
      charFreq[char] = (charFreq[char] || 0) + 1;
    }

    const maxFreq = Math.max(...Object.values(charFreq));
    if (maxFreq > 3) {
      const repeatedChar = Object.keys(charFreq).find(
        (k) => charFreq[k] === maxFreq
      );
      vulnerabilities.push({
        icon: "copy",
        message: `Caractere repetido mais de 3 vezes: "${repeatedChar}"`,
      });
    }

    // Verificar se é uma data
    if (
      /^(19|20)\d\d(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/.test(password) ||
      /^(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])(19|20)\d\d$/.test(password)
    ) {
      vulnerabilities.push({
        icon: "calendar",
        message: "A senha parece ser uma data, o que é facilmente adivinhável.",
      });
    }

    // Se não houver vulnerabilidades detectadas
    if (vulnerabilities.length === 0) {
      vulnerabilityFeedback.textContent =
        "Nenhuma vulnerabilidade óbvia detectada. Boa escolha!";

      // Adicionar mensagem positiva para senhas fortes
      if (vulnerabilityScore > 20) {
        const item = document.createElement("div");
        item.className = "vulnerability-item";
        item.innerHTML = `
                    <div class="vulnerability-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <div class="vulnerability-message">
                        Sua senha parece bem protegida contra ataques comuns!
                    </div>
                `;
        vulnerabilitiesList.appendChild(item);
      }
    } else {
      // Atualizar feedback com base no número de vulnerabilidades
      if (vulnerabilities.length === 1) {
        vulnerabilityFeedback.textContent =
          "Uma vulnerabilidade detectada. Considere ajustar sua senha.";
      } else {
        vulnerabilityFeedback.textContent = `${vulnerabilities.length} vulnerabilidades detectadas. Recomendamos criar uma senha mais segura.`;
      }

      // Adicionar itens à lista
      vulnerabilities.forEach((vuln) => {
        const item = document.createElement("div");
        item.className = "vulnerability-item";
        item.innerHTML = `
                    <div class="vulnerability-icon">
                        <i class="fas fa-${vuln.icon}"></i>
                    </div>
                    <div class="vulnerability-message">
                        ${vuln.message}
                    </div>
                `;
        vulnerabilitiesList.appendChild(item);
      });
    }
  }

  // Atualizar estatísticas
  function updateStatistics(stats) {
    statLength.textContent = stats.length;
    statUppercase.textContent = stats.uppercase;
    statLowercase.textContent = stats.lowercase;
    statNumbers.textContent = stats.numbers;
    statSymbols.textContent = stats.symbols;
    statUnique.textContent = `${stats.uniquePercent}%`;
    statEntropy.textContent = `${stats.entropy} bits`;
  }

  // Estimar tempo para quebrar a senha
  function updateCrackTimeEstimate(score, stats) {
    // Usar a entropia para estimar o tempo de quebra
    // Este é um modelo simplificado e aproximado
    const entropy = stats.entropy;

    // Suponha que um atacante pode testar 10^10 senhas por segundo (10 bilhões)
    // log2(10^10) ≈ 33.2
    const attackerStrength = 33.2;

    // Tempo em segundos: 2^(entropy - attackerStrength)
    let seconds = Math.pow(2, Math.max(0, entropy - attackerStrength));

    let timeText = "";
    let description = "";

    if (seconds < 1) {
      timeText = "Instantâneo";
      description = "Esta senha pode ser quebrada imediatamente.";
    } else if (seconds < 60) {
      timeText = `${Math.round(seconds)} segundos`;
      description = "Esta senha seria quebrada em segundos.";
    } else if (seconds < 3600) {
      const minutes = Math.round(seconds / 60);
      timeText = `${minutes} minuto${minutes !== 1 ? "s" : ""}`;
      description = "Esta senha seria quebrada em minutos.";
    } else if (seconds < 86400) {
      const hours = Math.round(seconds / 3600);
      timeText = `${hours} hora${hours !== 1 ? "s" : ""}`;
      description = "Esta senha seria quebrada em algumas horas.";
    } else if (seconds < 2592000) {
      const days = Math.round(seconds / 86400);
      timeText = `${days} dia${days !== 1 ? "s" : ""}`;
      description = "Esta senha levaria dias para ser quebrada.";
    } else if (seconds < 31536000) {
      const months = Math.round(seconds / 2592000);
      timeText = `${months} mês${months !== 1 ? "es" : ""}`;
      description = "Esta senha levaria meses para ser quebrada.";
    } else if (seconds < 315360000) {
      const years = Math.round(seconds / 31536000);
      timeText = `${years} ano${years !== 1 ? "s" : ""}`;
      description = "Esta senha levaria anos para ser quebrada.";
    } else if (seconds < 3153600000) {
      const decades = Math.round(seconds / 315360000);
      timeText = `${decades} década${decades !== 1 ? "s" : ""}`;
      description = "Esta senha levaria décadas para ser quebrada.";
    } else if (seconds < 31536000000) {
      const centuries = Math.round(seconds / 3153600000);
      timeText = `${centuries} século${centuries !== 1 ? "s" : ""}`;
      description = "Esta senha levaria séculos para ser quebrada.";
    } else {
      timeText = "Milhões de anos";
      description =
        "Esta senha é extremamente forte contra ataques de força bruta.";
    }

    // Atualizar UI
    crackTime.textContent = timeText;
    crackTimeDescription.textContent = description;

    // Adicionar classe de cor baseada na força
    crackTime.className = "crack-time";
    if (score < 40) {
      crackTime.classList.add("text-weak");
    } else if (score < 60) {
      crackTime.classList.add("text-fair");
    } else if (score < 80) {
      crackTime.classList.add("text-good");
    } else {
      crackTime.classList.add("text-strong");
    }
  }

  // Gerar recomendações
  function generateRecommendations(
    lengthScore,
    complexityScore,
    randomnessScore,
    vulnerabilityScore,
    password,
    stats
  ) {
    // Limpar lista
    recommendationsList.innerHTML = "";

    const recommendations = [];

    // Recomendações baseadas no comprimento
    if (stats.length < 12) {
      recommendations.push({
        icon: "ruler",
        message:
          "Aumente o comprimento da senha para pelo menos 12 caracteres.",
      });
    }

    // Recomendações baseadas na complexidade
    if (stats.uppercase === 0) {
      recommendations.push({
        icon: "font",
        message: "Adicione letras maiúsculas à sua senha.",
      });
    }

    if (stats.lowercase === 0) {
      recommendations.push({
        icon: "font",
        message: "Adicione letras minúsculas à sua senha.",
      });
    }

    if (stats.numbers === 0) {
      recommendations.push({
        icon: "sort-numeric-down",
        message: "Adicione números à sua senha.",
      });
    }

    if (stats.symbols === 0) {
      recommendations.push({
        icon: "asterisk",
        message: "Adicione símbolos (como !@#$%) à sua senha.",
      });
    }

    // Recomendações baseadas na aleatoriedade
    if (randomnessScore < 15) {
      recommendations.push({
        icon: "random",
        message:
          'Evite sequências comuns (como "abc" ou "123") e padrões de teclado.',
      });
    }

    if (stats.uniquePercent < 70) {
      recommendations.push({
        icon: "copy",
        message: "Evite repetir os mesmos caracteres várias vezes na senha.",
      });
    }

    // Recomendações baseadas na vulnerabilidade
    if (vulnerabilityScore < 15) {
      recommendations.push({
        icon: "shield-alt",
        message:
          "Evite usar palavras comuns, datas ou informações pessoais na senha.",
      });
    }

    // Recomendação geral para senhas fracas
    const totalScore =
      lengthScore + complexityScore + randomnessScore + vulnerabilityScore;
    if (totalScore < 40) {
      recommendations.push({
        icon: "sync",
        message:
          "Esta senha é fraca. Considere gerar uma senha completamente nova e mais forte.",
      });
    }

    // Adicionar recomendações à lista
    if (recommendations.length === 0) {
      // Senha parece boa, adicionar mensagem positiva
      const item = document.createElement("div");
      item.className = "recommendation-item";
      item.innerHTML = `
                <div class="recommendation-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="recommendation-message">
                    Sua senha parece boa! Lembre-se de usar senhas diferentes para cada serviço.
                </div>
            `;
      recommendationsList.appendChild(item);
    } else {
      // Adicionar cada recomendação
      recommendations.forEach((rec) => {
        const item = document.createElement("div");
        item.className = "recommendation-item";
        item.innerHTML = `
                    <div class="recommendation-icon">
                        <i class="fas fa-${rec.icon}"></i>
                    </div>
                    <div class="recommendation-message">
                        ${rec.message}
                    </div>
                `;
        recommendationsList.appendChild(item);
      });
    }
  }
});
