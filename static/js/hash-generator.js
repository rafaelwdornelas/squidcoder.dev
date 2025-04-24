// static/js/hash-generator.js - Funcionalidades para a ferramenta de geração de hash

document.addEventListener("DOMContentLoaded", function () {
  const hashGenerator = document.getElementById("hash-generator");
  if (!hashGenerator) return;

  const inputText = document.getElementById("input-text");
  const generateBtn = document.getElementById("generate-btn");
  const clearBtn = document.getElementById("clear-btn");
  const copyBtn = document.getElementById("copy-btn");
  const loadSampleBtn = document.getElementById("load-sample-btn");
  const errorMessage = document.getElementById("error-message");
  const uppercaseCheckbox = document.getElementById("uppercase");

  // Resultados de hash
  const md5Result = document.getElementById("md5-result");
  const sha1Result = document.getElementById("sha1-result");
  const sha256Result = document.getElementById("sha256-result");
  const sha512Result = document.getElementById("sha512-result");

  // Botões para copiar cada hash individual
  const copyHashButtons = document.querySelectorAll(".copy-hash-btn");

  // Função para gerar todos os hashes
  const generateHashes = () => {
    try {
      const input = inputText.value;

      if (!input) {
        throw new Error("O texto de entrada não pode estar vazio");
      }

      // Gerar os diferentes hashes
      const md5Hash = CryptoJS.MD5(input).toString();
      const sha1Hash = CryptoJS.SHA1(input).toString();
      const sha256Hash = sha256(input);
      const sha512Hash = sha512(input);
      const sha3Hash = sha3_256(input);

      // Converter para maiúsculas se necessário
      const formatHash = (hash) => {
        return uppercaseCheckbox.checked
          ? hash.toUpperCase()
          : hash.toLowerCase();
      };

      // Atualizar a exibição
      md5Result.textContent = formatHash(md5Hash);
      sha1Result.textContent = formatHash(sha1Hash);
      sha256Result.textContent = formatHash(sha256Hash);
      sha512Result.textContent = formatHash(sha512Hash);

      // Habilitar botões de cópia
      copyHashButtons.forEach((button) => {
        button.disabled = false;
      });

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
    md5Result.textContent = "-";
    sha1Result.textContent = "-";
    sha256Result.textContent = "-";
    sha512Result.textContent = "-";

    // Desabilitar botões de cópia
    copyHashButtons.forEach((button) => {
      button.disabled = true;
    });

    errorMessage.textContent = "";
    errorMessage.style.display = "none";
  };

  // Função para copiar todos os hashes
  const copyAllHashes = () => {
    if (md5Result.textContent === "-") {
      errorMessage.textContent = "Gere hashes primeiro antes de copiar";
      errorMessage.style.display = "block";

      setTimeout(() => {
        errorMessage.style.display = "none";
      }, 3000);

      return;
    }

    // Criar texto com todos os hashes
    const hashText = `MD5: ${md5Result.textContent}
SHA-1: ${sha1Result.textContent}
SHA-256: ${sha256Result.textContent}
SHA-512: ${sha512Result.textContent}`;

    // Criar elemento temporário para copiar o texto
    const tempInput = document.createElement("textarea");
    tempInput.value = hashText;
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

  // Função para copiar um hash específico
  const copyHash = (hashType) => {
    const hashElements = {
      md5: md5Result,
      sha1: sha1Result,
      sha256: sha256Result,
      sha512: sha512Result,
    };

    const hashElement = hashElements[hashType];

    if (!hashElement || hashElement.textContent === "-") {
      return;
    }

    // Criar elemento temporário para copiar o texto
    const tempInput = document.createElement("textarea");
    tempInput.value = hashElement.textContent;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);

    // Feedback visual
    const button = document.querySelector(
      `.copy-hash-btn[data-hash="${hashType}"]`
    );
    const originalHTML = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i>';

    setTimeout(() => {
      button.innerHTML = originalHTML;
    }, 1000);
  };

  // Função para carregar exemplo
  const loadSample = () => {
    inputText.value =
      "SquidCoder.dev - Ferramenta para gerar hashes de criptografia";
    generateHashes();
  };

  // Adicionar event listeners
  if (generateBtn) generateBtn.addEventListener("click", generateHashes);
  if (clearBtn) clearBtn.addEventListener("click", clearFields);
  if (copyBtn) copyBtn.addEventListener("click", copyAllHashes);
  if (loadSampleBtn) loadSampleBtn.addEventListener("click", loadSample);
  if (uppercaseCheckbox)
    uppercaseCheckbox.addEventListener("change", generateHashes);

  // Event listeners para os botões de cópia individual
  copyHashButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const hashType = button.getAttribute("data-hash");
      copyHash(hashType);
    });
  });

  // Permitir pressionar Enter para gerar
  if (inputText) {
    inputText.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        generateHashes();
      }
    });
  }

  // Desabilitar botões de cópia inicialmente
  copyHashButtons.forEach((button) => {
    button.disabled = true;
  });
});
