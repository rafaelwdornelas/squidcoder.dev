// static/js/uuid-generator.js
document.addEventListener("DOMContentLoaded", function () {
  // Elementos DOM
  const versionSelect = document.getElementById("uuid-version");
  const namespaceContainer = document.getElementById("namespace-container");
  const namespaceSelect = document.getElementById("namespace-select");
  const customNamespace = document.getElementById("custom-namespace");
  const nameContainer = document.getElementById("name-container");
  const nameInput = document.getElementById("name-input");
  const generateBtn = document.getElementById("generate-btn");
  const quantitySelect = document.getElementById("quantity-select");
  const uppercaseOption = document.getElementById("uppercase-option");
  const bracesOption = document.getElementById("braces-option");
  const hyphensOption = document.getElementById("hyphens-option");
  const copyFormatRadios = document.querySelectorAll(
    'input[name="copy-format"]'
  );
  const uuidList = document.getElementById("uuid-list");
  const copyAllBtn = document.getElementById("copy-all-btn");
  const clearBtn = document.getElementById("clear-btn");

  // UUIDs de namespace predefinidos (RFC 4122)
  const namespaces = {
    namespaceURL: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
    namespaceDNS: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    namespaceOID: "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
    namespaceX500: "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
  };

  // Array para armazenar UUIDs gerados
  let generatedUUIDs = [];

  // Eventos
  versionSelect.addEventListener("change", updateControls);
  namespaceSelect.addEventListener("change", updateCustomNamespace);
  generateBtn.addEventListener("click", generateUUIDs);
  copyAllBtn.addEventListener("click", copyAllUUIDs);
  clearBtn.addEventListener("click", clearUUIDs);

  // Inicializar controles
  updateControls();

  // Atualizar controles com base na versão selecionada
  function updateControls() {
    const version = versionSelect.value;

    // Ocultar controles de namespace e nome por padrão
    namespaceContainer.classList.add("hidden");
    nameContainer.classList.add("hidden");

    // Mostrar controles relevantes com base na versão
    if (version === "3" || version === "5") {
      namespaceContainer.classList.remove("hidden");
      nameContainer.classList.remove("hidden");
      updateCustomNamespace();
    }
  }

  // Atualizar visibilidade do input de namespace personalizado
  function updateCustomNamespace() {
    if (namespaceSelect.value === "custom") {
      customNamespace.classList.remove("hidden");
    } else {
      customNamespace.classList.add("hidden");
    }
  }

  // Gerar UUIDs
  function generateUUIDs() {
    const version = versionSelect.value;
    const quantity = parseInt(quantitySelect.value);
    const uppercase = uppercaseOption.checked;
    const braces = bracesOption.checked;
    const hyphens = hyphensOption.checked;

    // Array para armazenar novos UUIDs
    let newUUIDs = [];

    // Gerar a quantidade solicitada de UUIDs
    for (let i = 0; i < quantity; i++) {
      let uuid;

      try {
        // Gerar UUID com base na versão selecionada
        switch (version) {
          case "0":
            // UUID v0 (customizado - usaremos todos zeros exceto o nibble de versão)
            uuid = "00000000-0000-0000-0000-000000000000";
            break;
          case "1":
            // UUID v1 (baseado em timestamp)
            uuid = generateTimestampUUID();
            break;
          case "3":
            // UUID v3 (namespace + nome, MD5)
            const namespace3 = getNamespace();
            const name3 = nameInput.value.trim() || "exemplo.com";
            uuid = generateNamespacedUUID(name3, namespace3, 3);
            break;
          case "4":
            // UUID v4 (aleatório)
            uuid = generateRandomUUID();
            break;
          case "5":
            // UUID v5 (namespace + nome, SHA-1)
            const namespace5 = getNamespace();
            const name5 = nameInput.value.trim() || "exemplo.com";
            uuid = generateNamespacedUUID(name5, namespace5, 5);
            break;
          case "6":
            // UUID v6 (reordenado baseado em tempo)
            uuid = generateUUIDv6();
            break;
          case "7":
            // UUID v7 (baseado em Unix Epoch)
            uuid = generateUUIDv7();
            break;
          case "8":
            // UUID v8 (personalizado)
            uuid = generateUUIDv8();
            break;
          case "Nil":
            // UUID Nil (todos zeros)
            uuid = "00000000-0000-0000-0000-000000000000";
            break;
          case "namespaceURL":
            uuid = namespaces.namespaceURL;
            break;
          case "namespaceDNS":
            uuid = namespaces.namespaceDNS;
            break;
          case "namespaceOID":
            uuid = namespaces.namespaceOID;
            break;
          case "namespaceX500":
            uuid = namespaces.namespaceX500;
            break;
          default:
            uuid = generateRandomUUID();
        }
      } catch (error) {
        console.error("Erro ao gerar UUID:", error);
        uuid = generateRandomUUID();
      }

      // Aplicar formatação
      uuid = formatUUID(uuid, uppercase, braces, hyphens);
      newUUIDs.push(uuid);
    }

    // Adicionar ao início da lista
    generatedUUIDs = [...newUUIDs, ...generatedUUIDs];
    updateUUIDList();
  }

  // Implementação nativa de UUID v4 (aleatório)
  function generateRandomUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  // Implementação nativa de UUID v1 (baseado em timestamp)
  function generateTimestampUUID() {
    // Obter timestamp em milissegundos
    const now = new Date();
    const timestamp = now.getTime();
    const timeLow = ((timestamp & 0xffffffff) >>> 0)
      .toString(16)
      .padStart(8, "0");
    const timeMid = (((timestamp >> 32) & 0xffff) >>> 0)
      .toString(16)
      .padStart(4, "0");
    const timeHiAndVersion = (
      (((timestamp >> 48) & 0x0fff) >>> 0) |
      0x1000
    ).toString(16);

    // Gerar bytes aleatórios para o clock_seq e node
    const clockSeqHiAndReserved = ((Math.random() * 0x3f) | 0x80)
      .toString(16)
      .padStart(2, "0");
    const clockSeqLow = Math.floor(Math.random() * 0xff)
      .toString(16)
      .padStart(2, "0");

    // Gerar node (48 bits) aleatoriamente
    const node = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, "0")
    ).join("");

    return `${timeLow}-${timeMid}-${timeHiAndVersion}-${clockSeqHiAndReserved}${clockSeqLow}-${node}`;
  }

  // Implementação simplificada para UUIDs baseados em namespace (v3/v5)
  function generateNamespacedUUID(name, namespace, version) {
    // Para simplificar, usamos uma derivação baseada em hash do nome e namespace
    const combinedStr = `${namespace}-${name}-${Date.now()}`;
    const hash = simpleHash(combinedStr);

    // Construir UUID usando o hash
    let template;
    if (version === 3) {
      template = "xxxxxxxxxxxx3xxxyxxxxxxxxxxxxxxx";
    } else {
      // version 5
      template = "xxxxxxxxxxxx5xxxyxxxxxxxxxxxxxxx";
    }

    let result = "";
    let hashIndex = 0;

    for (let i = 0; i < template.length; i++) {
      const char = template[i];
      if (char === "x") {
        // Usar um caractere do hash
        result += hash[hashIndex % hash.length];
        hashIndex++;
      } else if (char === "y") {
        // O bit de variante deve ser 10xx
        const hexChar = parseInt(hash[hashIndex % hash.length], 16);
        result += ((hexChar & 0x3) | 0x8).toString(16);
        hashIndex++;
      } else {
        // Manter o caractere (número da versão ou hífen)
        result += char;
      }
    }

    // Formatar como UUID
    return result.replace(
      /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
      "$1-$2-$3-$4-$5"
    );
  }

  // Função de hash simples para gerar UUIDs baseados em namespace
  function simpleHash(str) {
    let hash = "";
    for (let i = 0; i < 32; i++) {
      const charCode = str.charCodeAt(i % str.length);
      const timeValue = Date.now() % 256;
      const combinedValue = (charCode * 31 + timeValue + i) % 16;
      hash += combinedValue.toString(16);
    }
    return hash;
  }

  // Obter namespace com base na seleção
  function getNamespace() {
    const selection = namespaceSelect.value;

    if (selection === "custom") {
      const customValue = customNamespace.value.trim();
      if (isValidUUID(customValue)) {
        return customValue;
      } else {
        // Fallback para namespace URL se o valor personalizado for inválido
        return namespaces.namespaceURL;
      }
    } else {
      return namespaces[selection];
    }
  }

  // Verificar se uma string é um UUID válido
  function isValidUUID(str) {
    const regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(str);
  }

  // Gerar UUID v6 (reordenado baseado em tempo)
  function generateUUIDv6() {
    // Obter um UUID v1 básico
    const v1 = generateTimestampUUID();

    const parts = v1.split("-");

    // Reordenar partes do timestamp para melhor ordenação
    // Formato: time_high-time_mid-version_time_low-clock_seq-node
    const timeHigh = parts[2].substr(1) + parts[1];
    const timeMid = parts[0].substr(0, 4);
    const timeLow = parts[0].substr(4);

    // Montar UUID v6
    return `${timeHigh}-${timeMid}-6${timeLow}-${parts[3]}-${parts[4]}`;
  }

  // Gerar UUID v7 (baseado em Unix Epoch)
  function generateUUIDv7() {
    // Obter timestamp em milissegundos
    const timestamp = Date.now();

    // Converter para hexadecimal e preencher com zeros à esquerda
    const hex = timestamp.toString(16).padStart(12, "0");

    // Gerar 16 caracteres aleatórios para a parte restante
    const random = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");

    // Montar UUID v7
    return `${hex.slice(
      0,
      8
    )}-${hex.slice(8, 12)}-7${random.slice(0, 3)}-${(parseInt(random.slice(3, 4), 16) & 0x3) | 0x8}${random.slice(4, 7)}-${random.slice(7)}`;
  }

  // Gerar UUID v8 (personalizado)
  function generateUUIDv8() {
    // Gerar 32 caracteres hexadecimais aleatórios
    const hex = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");

    // Montar UUID v8 com o nibble de versão e variante
    return `${hex.slice(
      0,
      8
    )}-${hex.slice(8, 12)}-8${hex.slice(13, 16)}-${(parseInt(hex.slice(16, 17), 16) & 0x3) | 0x8}${hex.slice(17, 20)}-${hex.slice(20)}`;
  }

  // Formatar UUID com base nas opções selecionadas
  function formatUUID(uuid, uppercase, braces, hyphens) {
    // Remover hifens se necessário
    if (!hyphens) {
      uuid = uuid.replace(/-/g, "");
    }

    // Converter para maiúsculas se necessário
    if (uppercase) {
      uuid = uuid.toUpperCase();
    }

    // Adicionar chaves se necessário
    if (braces) {
      uuid = `{${uuid}}`;
    }

    return uuid;
  }

  // Atualizar a lista de UUIDs na interface
  function updateUUIDList() {
    if (generatedUUIDs.length === 0) {
      uuidList.innerHTML =
        '<p class="empty-message">Clique em "Gerar UUID" para criar novos UUIDs.</p>';
      return;
    }

    // Limpar lista atual
    uuidList.innerHTML = "";

    // Adicionar cada UUID à lista
    generatedUUIDs.forEach((uuid, index) => {
      const item = document.createElement("div");
      item.className = "uuid-item";
      item.dataset.uuid = uuid;

      item.innerHTML = `
                <span class="uuid-text">${uuid}</span>
                <button class="uuid-item-copy" title="Copiar UUID">
                    <i class="fas fa-copy"></i>
                </button>
            `;

      // Adicionar evento para copiar UUID individual
      const copyBtn = item.querySelector(".uuid-item-copy");
      copyBtn.addEventListener("click", function () {
        copyUUID(uuid);

        // Feedback visual
        const icon = copyBtn.querySelector("i");
        icon.className = "fas fa-check";

        setTimeout(() => {
          icon.className = "fas fa-copy";
        }, 1500);
      });

      uuidList.appendChild(item);
    });
  }

  // Copiar UUID para a área de transferência
  function copyUUID(uuid) {
    const format = getSelectedCopyFormat();
    let textToCopy = uuid;

    // Formatar o texto a ser copiado com base no formato selecionado
    if (format === "array") {
      textToCopy = `'${uuid}'`;
    } else if (format === "json") {
      textToCopy = `"${uuid}"`;
    }

    navigator.clipboard.writeText(textToCopy).catch((err) => {
      console.error("Erro ao copiar para a área de transferência:", err);
    });
  }

  // Copiar todos os UUIDs para a área de transferência
  function copyAllUUIDs() {
    if (generatedUUIDs.length === 0) return;

    const format = getSelectedCopyFormat();
    let textToCopy = "";

    // Formatar o texto a ser copiado com base no formato selecionado
    if (format === "plain") {
      textToCopy = generatedUUIDs.join("\n");
    } else if (format === "array") {
      textToCopy = `[\n  ${generatedUUIDs
        .map((uuid) => `'${uuid}'`)
        .join(",\n  ")}\n]`;
    } else if (format === "json") {
      textToCopy = `[\n  ${generatedUUIDs
        .map((uuid) => `"${uuid}"`)
        .join(",\n  ")}\n]`;
    }

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        // Feedback visual
        const originalText = copyAllBtn.innerHTML;
        copyAllBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';

        setTimeout(() => {
          copyAllBtn.innerHTML = originalText;
        }, 1500);
      })
      .catch((err) => {
        console.error("Erro ao copiar para a área de transferência:", err);
      });
  }

  // Obter formato de cópia selecionado
  function getSelectedCopyFormat() {
    for (const radio of copyFormatRadios) {
      if (radio.checked) {
        return radio.value;
      }
    }
    return "plain";
  }

  // Limpar todos os UUIDs
  function clearUUIDs() {
    generatedUUIDs = [];
    updateUUIDList();
  }
});
