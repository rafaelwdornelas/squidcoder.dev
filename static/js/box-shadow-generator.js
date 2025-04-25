// static/js/box-shadow-generator.js
document.addEventListener("DOMContentLoaded", function () {
  // Referências dos elementos DOM
  const shadowElement = document.getElementById("shadow-element");
  const cssOutput = document.getElementById("css-output");
  const copyOutputBtn = document.getElementById("copy-output-btn");
  const copyCssBtn = document.getElementById("copy-css-btn");

  // Controles básicos
  const offsetX = document.getElementById("offset-x");
  const offsetXValue = document.getElementById("offset-x-value");
  const offsetY = document.getElementById("offset-y");
  const offsetYValue = document.getElementById("offset-y-value");
  const blurRadius = document.getElementById("blur-radius");
  const blurRadiusValue = document.getElementById("blur-radius-value");
  const spreadRadius = document.getElementById("spread-radius");
  const spreadRadiusValue = document.getElementById("spread-radius-value");
  const shadowColor = document.getElementById("shadow-color");
  const shadowOpacity = document.getElementById("shadow-opacity");
  const shadowOpacityValue = document.getElementById("shadow-opacity-value");
  const insetShadow = document.getElementById("inset-shadow");

  // Controles avançados
  const elementColor = document.getElementById("element-color");
  const elementSize = document.getElementById("element-size");
  const elementSizeValue = document.getElementById("element-size-value");
  const borderRadius = document.getElementById("border-radius");
  const borderRadiusValue = document.getElementById("border-radius-value");
  const elementRotation = document.getElementById("element-rotation");
  const elementRotationValue = document.getElementById(
    "element-rotation-value"
  );
  const showDimensions = document.getElementById("show-dimensions");

  // Elementos de controle de abas
  const controlTabs = document.querySelectorAll(".control-tab");
  const controlPanels = document.querySelectorAll(".control-panel");

  // Elementos de forma e fundo
  const backgroundOptions = document.querySelectorAll(".background-option");
  const shapeOptions = document.querySelectorAll(".shape-option");

  // Elementos de camadas
  const shadowLayers = document.getElementById("shadow-layers");
  const addLayerBtn = document.getElementById("add-layer-btn");

  // Elementos de presets
  const presetItems = document.querySelectorAll(
    ".preset-item:not(.custom-preset-btn)"
  );
  const savePresetBtn = document.getElementById("save-preset-btn");
  const presetModal = document.getElementById("preset-modal");
  const presetName = document.getElementById("preset-name");
  const savePresetConfirm = document.getElementById("save-preset-confirm");
  const cancelPreset = document.getElementById("cancel-preset");
  const loadCustomPresets = document.getElementById("load-custom-presets");
  const customPresetsModal = document.getElementById("custom-presets-modal");
  const customPresetsContainer = document.getElementById(
    "custom-presets-container"
  );
  const closeModals = document.querySelectorAll(".close-modal");

  // Estado das sombras
  let shadowState = {
    activeLayer: 0,
    layers: [
      {
        offsetX: 5,
        offsetY: 5,
        blurRadius: 10,
        spreadRadius: 0,
        color: "#000000",
        opacity: 0.2,
        inset: false,
      },
    ],
    element: {
      shape: "square",
      color: "#ffffff",
      size: 150,
      borderRadius: 0,
      rotation: 0,
    },
    background: "light",
    showDimensions: false,
  };

  // Inicializar
  updateShadow();
  updateElementStyle();
  updateLayersList();

  // Event Listeners
  // Troca de abas
  controlTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      controlTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      const tabId = this.getAttribute("data-tab");
      controlPanels.forEach((panel) => {
        panel.classList.remove("active");
        if (panel.id === tabId + "-controls") {
          panel.classList.add("active");
        }
      });
    });
  });

  // Sliders e inputs de valores
  // Sincroniza slider e input numérico
  function syncSliderWithInput(slider, input, callback) {
    slider.addEventListener("input", function () {
      input.value = this.value;
      if (callback) callback(this.value);
    });

    input.addEventListener("input", function () {
      const value = parseFloat(this.value) || 0;
      const min = parseFloat(slider.min);
      const max = parseFloat(slider.max);
      const validValue = Math.max(min, Math.min(max, value));

      this.value = validValue;
      slider.value = validValue;

      if (callback) callback(validValue);
    });
  }

  // Configurar sliders básicos
  syncSliderWithInput(offsetX, offsetXValue, (value) => {
    shadowState.layers[shadowState.activeLayer].offsetX = value;
    updateShadow();
  });

  syncSliderWithInput(offsetY, offsetYValue, (value) => {
    shadowState.layers[shadowState.activeLayer].offsetY = value;
    updateShadow();
  });

  syncSliderWithInput(blurRadius, blurRadiusValue, (value) => {
    shadowState.layers[shadowState.activeLayer].blurRadius = value;
    updateShadow();
  });

  syncSliderWithInput(spreadRadius, spreadRadiusValue, (value) => {
    shadowState.layers[shadowState.activeLayer].spreadRadius = value;
    updateShadow();
  });

  syncSliderWithInput(shadowOpacity, shadowOpacityValue, (value) => {
    shadowState.layers[shadowState.activeLayer].opacity = value;
    updateShadow();
  });

  // Controles de cor e inset
  shadowColor.addEventListener("input", function () {
    shadowState.layers[shadowState.activeLayer].color = this.value;
    updateShadow();
  });

  insetShadow.addEventListener("change", function () {
    shadowState.layers[shadowState.activeLayer].inset = this.checked;
    updateShadow();
  });

  // Configurar sliders avançados
  syncSliderWithInput(elementSize, elementSizeValue, (value) => {
    shadowState.element.size = value;
    updateElementStyle();
    updateShadow();
  });

  syncSliderWithInput(borderRadius, borderRadiusValue, (value) => {
    shadowState.element.borderRadius = value;
    updateElementStyle();
  });

  syncSliderWithInput(elementRotation, elementRotationValue, (value) => {
    shadowState.element.rotation = value;
    updateElementStyle();
  });

  // Controles de cor e opções do elemento
  elementColor.addEventListener("input", function () {
    shadowState.element.color = this.value;
    updateElementStyle();
  });

  showDimensions.addEventListener("change", function () {
    shadowState.showDimensions = this.checked;
    updateElementStyle();
  });

  // Opções de forma
  shapeOptions.forEach((option) => {
    option.addEventListener("click", function () {
      shapeOptions.forEach((opt) => opt.classList.remove("active"));
      this.classList.add("active");

      const shape = this.getAttribute("data-shape");
      shadowState.element.shape = shape;

      // Ajustar controle de border-radius com base na forma
      const borderRadiusControl = document.getElementById(
        "border-radius-control"
      );
      if (shape === "circle") {
        borderRadiusControl.style.display = "none";
        shadowState.element.borderRadius = shadowState.element.size / 2;
      } else {
        borderRadiusControl.style.display = "block";
        if (shape === "square") {
          borderRadius.value = 0;
          borderRadiusValue.value = 0;
          shadowState.element.borderRadius = 0;
        } else if (shape === "rounded") {
          borderRadius.value = 10;
          borderRadiusValue.value = 10;
          shadowState.element.borderRadius = 10;
        }
      }

      updateElementStyle();
    });
  });

  // Opções de fundo
  backgroundOptions.forEach((option) => {
    option.addEventListener("click", function () {
      backgroundOptions.forEach((opt) => opt.classList.remove("active"));
      this.classList.add("active");

      shadowState.background = this.getAttribute("data-bg");
      updateBackground();
    });
  });

  // Gerenciamento de camadas
  addLayerBtn.addEventListener("click", function () {
    const newLayer = {
      offsetX: 0,
      offsetY: 0,
      blurRadius: 10,
      spreadRadius: 0,
      color: "#000000",
      opacity: 0.2,
      inset: false,
    };

    shadowState.layers.push(newLayer);
    shadowState.activeLayer = shadowState.layers.length - 1;

    updateLayersList();
    updateControlsFromActiveLayer();
    updateShadow();
  });

  shadowLayers.addEventListener("click", function (e) {
    // Seleção de camada
    if (
      e.target.classList.contains("layer-item") ||
      e.target.parentElement.classList.contains("layer-item")
    ) {
      const layerItem = e.target.classList.contains("layer-item")
        ? e.target
        : e.target.parentElement;

      if (
        layerItem.classList.contains("layer-name") ||
        !layerItem.classList.contains("layer-action")
      ) {
        const layerIndex = parseInt(layerItem.getAttribute("data-layer"));
        selectLayer(layerIndex);
      }
    }

    // Duplicar camada
    if (
      e.target.classList.contains("duplicate-layer") ||
      e.target.parentElement.classList.contains("duplicate-layer")
    ) {
      const layerItem = findParentWithClass(e.target, "layer-item");
      if (layerItem) {
        const layerIndex = parseInt(layerItem.getAttribute("data-layer"));
        duplicateLayer(layerIndex);
      }
    }

    // Excluir camada
    if (
      e.target.classList.contains("delete-layer") ||
      e.target.parentElement.classList.contains("delete-layer")
    ) {
      const layerItem = findParentWithClass(e.target, "layer-item");
      if (layerItem) {
        const layerIndex = parseInt(layerItem.getAttribute("data-layer"));
        deleteLayer(layerIndex);
      }
    }
  });

  // Presets
  presetItems.forEach((preset) => {
    preset.addEventListener("click", function () {
      const presetType = this.getAttribute("data-preset");
      loadPreset(presetType);
    });
  });

  // Copiar CSS
  copyOutputBtn.addEventListener("click", function () {
    copyToClipboard(cssOutput.textContent);
  });

  copyCssBtn.addEventListener("click", function () {
    copyToClipboard(getShadowCSS());
  });

  // Gerenciamento de presets personalizados
  savePresetBtn.addEventListener("click", function () {
    presetModal.style.display = "flex";
    presetName.focus();
  });

  savePresetConfirm.addEventListener("click", function () {
    const name = presetName.value.trim();
    if (!name) {
      showMessage("Por favor, digite um nome para o preset.");
      return;
    }

    // Salvar preset no localStorage
    const customPresets = JSON.parse(
      localStorage.getItem("boxShadowPresets") || "[]"
    );

    const newPreset = {
      name,
      layers: JSON.parse(JSON.stringify(shadowState.layers)),
      element: JSON.parse(JSON.stringify(shadowState.element)),
    };

    customPresets.push(newPreset);
    localStorage.setItem("boxShadowPresets", JSON.stringify(customPresets));

    presetModal.style.display = "none";
    presetName.value = "";

    showMessage(`Preset "${name}" salvo com sucesso!`);
  });

  cancelPreset.addEventListener("click", function () {
    presetModal.style.display = "none";
    presetName.value = "";
  });

  loadCustomPresets.addEventListener("click", function () {
    loadCustomPresetsFromStorage();
    customPresetsModal.style.display = "flex";
  });

  closeModals.forEach((btn) => {
    btn.addEventListener("click", function () {
      presetModal.style.display = "none";
      customPresetsModal.style.display = "none";
    });
  });

  // Funções principais
  function updateShadow() {
    const shadowValue = getShadowCSS();
    shadowElement.style.boxShadow = shadowValue;

    // Atualizar visualização da camada ativa
    updateLayerPreview();

    // Atualizar código CSS
    cssOutput.textContent = `.elemento {\n  box-shadow: ${shadowValue};\n}`;
  }

  function getShadowCSS() {
    return shadowState.layers
      .map((layer) => {
        const {
          offsetX,
          offsetY,
          blurRadius,
          spreadRadius,
          color,
          opacity,
          inset,
        } = layer;

        // Converter cor hex para rgba
        const rgbaColor = hexToRgba(color, opacity);

        return `${
          inset ? "inset " : ""
        }${offsetX}px ${offsetY}px ${blurRadius}px ${spreadRadius}px ${rgbaColor}`;
      })
      .join(", ");
  }

  function updateElementStyle() {
    const { size, color, borderRadius, rotation } = shadowState.element;
    const shape = shadowState.element.shape;

    // Tamanho e forma básica
    shadowElement.style.width = `${size}px`;
    shadowElement.style.height = `${size}px`;
    shadowElement.style.backgroundColor = color;

    // Aplicar border-radius com base na forma
    if (shape === "circle") {
      shadowElement.style.borderRadius = "50%";
    } else if (shape === "rounded") {
      shadowElement.style.borderRadius = "10px";
    } else if (shape === "custom") {
      shadowElement.style.borderRadius = `${borderRadius}px`;
    } else {
      shadowElement.style.borderRadius = "0";
    }

    // Rotação
    shadowElement.style.transform = `rotate(${rotation}deg)`;

    // Mostrar dimensões
    if (shadowState.showDimensions) {
      shadowElement.setAttribute("data-dimensions", `${size}px × ${size}px`);
      shadowElement.classList.add("show-dimensions");
    } else {
      shadowElement.classList.remove("show-dimensions");
    }
  }

  function updateBackground() {
    const previewArea = document.querySelector(".shadow-preview-area");

    // Remover classes anteriores
    previewArea.classList.remove(
      "bg-light",
      "bg-dark",
      "bg-gradient",
      "bg-pattern"
    );

    // Adicionar classe apropriada
    previewArea.classList.add(`bg-${shadowState.background}`);
  }

  function updateLayersList() {
    shadowLayers.innerHTML = "";

    shadowState.layers.forEach((layer, index) => {
      const layerItem = document.createElement("div");
      layerItem.className = `layer-item ${
        index === shadowState.activeLayer ? "active" : ""
      }`;
      layerItem.setAttribute("data-layer", index);

      const layerPreview = document.createElement("div");
      layerPreview.className = "layer-preview";

      const layerName = document.createElement("div");
      layerName.className = "layer-name";
      layerName.textContent = `Camada ${index + 1}`;

      const layerActions = document.createElement("div");
      layerActions.className = "layer-actions";
      layerActions.innerHTML = `
                <button class="layer-action duplicate-layer" title="Duplicar">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="layer-action delete-layer" title="Excluir" ${
                  shadowState.layers.length <= 1 ? "disabled" : ""
                }>
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;

      layerItem.appendChild(layerPreview);
      layerItem.appendChild(layerName);
      layerItem.appendChild(layerActions);

      shadowLayers.appendChild(layerItem);
    });

    updateLayerPreview();
  }

  function updateLayerPreview() {
    const layerPreviews = document.querySelectorAll(".layer-preview");
    shadowState.layers.forEach((layer, index) => {
      if (layerPreviews[index]) {
        const {
          offsetX,
          offsetY,
          blurRadius,
          spreadRadius,
          color,
          opacity,
          inset,
        } = layer;
        const previewElement = layerPreviews[index];

        // Aplicar uma versão simplificada da sombra para visualização
        const scale = 0.3; // Fator de escala para a visualização
        const previewShadow = `${inset ? "inset " : ""}${offsetX * scale}px ${
          offsetY * scale
        }px ${blurRadius * scale}px ${spreadRadius * scale}px ${hexToRgba(
          color,
          opacity
        )}`;

        previewElement.style.boxShadow = previewShadow;
      }
    });
  }

  function updateControlsFromActiveLayer() {
    const activeLayer = shadowState.layers[shadowState.activeLayer];

    // Atualizar sliders e inputs com os valores da camada ativa
    offsetX.value = activeLayer.offsetX;
    offsetXValue.value = activeLayer.offsetX;

    offsetY.value = activeLayer.offsetY;
    offsetYValue.value = activeLayer.offsetY;

    blurRadius.value = activeLayer.blurRadius;
    blurRadiusValue.value = activeLayer.blurRadius;

    spreadRadius.value = activeLayer.spreadRadius;
    spreadRadiusValue.value = activeLayer.spreadRadius;

    shadowColor.value = activeLayer.color;

    shadowOpacity.value = activeLayer.opacity;
    shadowOpacityValue.value = activeLayer.opacity;

    insetShadow.checked = activeLayer.inset;
  }

  function selectLayer(index) {
    shadowState.activeLayer = index;

    // Atualizar classes ativas
    document.querySelectorAll(".layer-item").forEach((item, i) => {
      if (i === index) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // Atualizar controles
    updateControlsFromActiveLayer();
  }

  function duplicateLayer(index) {
    const layerToDuplicate = shadowState.layers[index];
    const newLayer = JSON.parse(JSON.stringify(layerToDuplicate));

    // Modificar ligeiramente a posição para ser visível
    newLayer.offsetX += 5;
    newLayer.offsetY += 5;

    // Inserir após a camada original
    shadowState.layers.splice(index + 1, 0, newLayer);
    shadowState.activeLayer = index + 1;

    updateLayersList();
    updateControlsFromActiveLayer();
    updateShadow();
  }

  function deleteLayer(index) {
    if (shadowState.layers.length <= 1) {
      showMessage("Não é possível excluir a única camada.");
      return;
    }

    shadowState.layers.splice(index, 1);

    // Ajustar a camada ativa se necessário
    if (shadowState.activeLayer >= shadowState.layers.length) {
      shadowState.activeLayer = shadowState.layers.length - 1;
    }

    updateLayersList();
    updateControlsFromActiveLayer();
    updateShadow();
  }

  function loadPreset(presetType) {
    const presets = {
      subtle: {
        layers: [
          {
            offsetX: 0,
            offsetY: 2,
            blurRadius: 5,
            spreadRadius: 0,
            color: "#000000",
            opacity: 0.1,
            inset: false,
          },
        ],
        element: {
          shape: "rounded",
          borderRadius: 5,
        },
      },
      medium: {
        layers: [
          {
            offsetX: 0,
            offsetY: 4,
            blurRadius: 8,
            spreadRadius: 0,
            color: "#000000",
            opacity: 0.2,
            inset: false,
          },
        ],
        element: {
          shape: "rounded",
          borderRadius: 5,
        },
      },
      hard: {
        layers: [
          {
            offsetX: 0,
            offsetY: 8,
            blurRadius: 12,
            spreadRadius: 2,
            color: "#000000",
            opacity: 0.3,
            inset: false,
          },
        ],
        element: {
          shape: "rounded",
          borderRadius: 8,
        },
      },
      layered: {
        layers: [
          {
            offsetX: 0,
            offsetY: 2,
            blurRadius: 3,
            spreadRadius: 0,
            color: "#000000",
            opacity: 0.1,
            inset: false,
          },
          {
            offsetX: 0,
            offsetY: 6,
            blurRadius: 10,
            spreadRadius: 0,
            color: "#000000",
            opacity: 0.2,
            inset: false,
          },
        ],
        element: {
          shape: "rounded",
          borderRadius: 8,
        },
      },
      inset: {
        layers: [
          {
            offsetX: 0,
            offsetY: 5,
            blurRadius: 15,
            spreadRadius: -5,
            color: "#000000",
            opacity: 0.3,
            inset: true,
          },
        ],
        element: {
          shape: "rounded",
          borderRadius: 8,
        },
      },
      float: {
        layers: [
          {
            offsetX: 0,
            offsetY: 10,
            blurRadius: 20,
            spreadRadius: -5,
            color: "#000000",
            opacity: 0.2,
            inset: false,
          },
          {
            offsetX: 0,
            offsetY: 4,
            blurRadius: 6,
            spreadRadius: -1,
            color: "#000000",
            opacity: 0.1,
            inset: false,
          },
        ],
        element: {
          shape: "rounded",
          borderRadius: 12,
        },
      },
      neon: {
        layers: [
          {
            offsetX: 0,
            offsetY: 0,
            blurRadius: 10,
            spreadRadius: 2,
            color: "#FF00FF",
            opacity: 0.8,
            inset: false,
          },
          {
            offsetX: 0,
            offsetY: 0,
            blurRadius: 20,
            spreadRadius: 5,
            color: "#0000FF",
            opacity: 0.5,
            inset: false,
          },
        ],
        element: {
          shape: "square",
          borderRadius: 0,
        },
      },
      emboss: {
        layers: [
          {
            offsetX: -5,
            offsetY: -5,
            blurRadius: 10,
            spreadRadius: 0,
            color: "#FFFFFF",
            opacity: 0.5,
            inset: false,
          },
          {
            offsetX: 5,
            offsetY: 5,
            blurRadius: 10,
            spreadRadius: 0,
            color: "#000000",
            opacity: 0.2,
            inset: false,
          },
        ],
        element: {
          shape: "circle",
          color: "#E0E0E0",
        },
      },
    };

    if (presets[presetType]) {
      const preset = presets[presetType];

      // Aplicar camadas
      shadowState.layers = JSON.parse(JSON.stringify(preset.layers));
      shadowState.activeLayer = 0;

      // Aplicar propriedades do elemento
      if (preset.element) {
        const currentElement = shadowState.element;
        // Preservar propriedades não especificadas no preset
        shadowState.element = {
          ...currentElement,
          ...preset.element,
        };
      }

      // Atualizar UI para o elemento
      shapeOptions.forEach((option) => {
        option.classList.remove("active");
        if (option.getAttribute("data-shape") === shadowState.element.shape) {
          option.classList.add("active");
        }
      });

      // Atualizar as propriedades visuais
      elementColor.value = shadowState.element.color || "#ffffff";
      elementSize.value = shadowState.element.size;
      elementSizeValue.value = shadowState.element.size;
      borderRadius.value = shadowState.element.borderRadius;
      borderRadiusValue.value = shadowState.element.borderRadius;

      // Atualizar todas as visualizações
      updateLayersList();
      updateControlsFromActiveLayer();
      updateElementStyle();
      updateShadow();

      showMessage(`Preset "${presetType}" carregado com sucesso!`);
    }
  }

  function loadCustomPresetsFromStorage() {
    const customPresets = JSON.parse(
      localStorage.getItem("boxShadowPresets") || "[]"
    );

    if (customPresets.length === 0) {
      customPresetsContainer.innerHTML = `
                <div class="empty-presets-message">
                    <i class="fas fa-info-circle"></i>
                    <p>Você ainda não salvou nenhum preset personalizado.</p>
                </div>
            `;
      return;
    }

    customPresetsContainer.innerHTML = "";

    customPresets.forEach((preset, index) => {
      // Criar elemento para o preset
      const presetElement = document.createElement("div");
      presetElement.className = "custom-preset-item";

      // Gerar uma prévia do box-shadow
      const previewShadow = preset.layers
        .map((layer) => {
          const {
            offsetX,
            offsetY,
            blurRadius,
            spreadRadius,
            color,
            opacity,
            inset,
          } = layer;
          const scale = 0.15; // Fator de escala menor para a prévia
          return `${inset ? "inset " : ""}${offsetX * scale}px ${
            offsetY * scale
          }px ${blurRadius * scale}px ${spreadRadius * scale}px ${hexToRgba(
            color,
            opacity
          )}`;
        })
        .join(", ");

      // Estilizar a prévia
      const previewBgColor =
        preset.element && preset.element.color
          ? preset.element.color
          : "#ffffff";
      const previewBorderRadius =
        preset.element && preset.element.shape === "circle"
          ? "50%"
          : preset.element && preset.element.borderRadius
          ? `${preset.element.borderRadius * 0.15}px`
          : "0";

      presetElement.innerHTML = `
                <div class="preset-preview" style="background-color: ${previewBgColor}; border-radius: ${previewBorderRadius}; box-shadow: ${previewShadow};"></div>
                <div class="preset-info">
                    <span class="preset-name">${preset.name}</span>
                    <div class="preset-actions">
                        <button class="preset-load-btn" title="Carregar Preset">
                            <i class="fas fa-file-import"></i>
                        </button>
                        <button class="preset-delete-btn" title="Excluir Preset">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;

      // Adicionar ao container
      customPresetsContainer.appendChild(presetElement);

      // Adicionar event listeners para os botões
      const loadBtn = presetElement.querySelector(".preset-load-btn");
      const deleteBtn = presetElement.querySelector(".preset-delete-btn");

      loadBtn.addEventListener("click", () => {
        // Carregar preset
        loadCustomPreset(preset);
        customPresetsModal.style.display = "none";
      });

      deleteBtn.addEventListener("click", () => {
        // Confirmar exclusão
        if (
          confirm(`Tem certeza que deseja excluir o preset "${preset.name}"?`)
        ) {
          deleteCustomPreset(index);
        }
      });
    });
  }

  function loadCustomPreset(preset) {
    // Aplicar camadas
    shadowState.layers = JSON.parse(JSON.stringify(preset.layers));
    shadowState.activeLayer = 0;

    // Aplicar propriedades do elemento
    if (preset.element) {
      shadowState.element = { ...shadowState.element, ...preset.element };
    }

    // Atualizar UI para o elemento
    shapeOptions.forEach((option) => {
      option.classList.remove("active");
      if (option.getAttribute("data-shape") === shadowState.element.shape) {
        option.classList.add("active");
      }
    });

    // Atualizar as propriedades visuais
    elementColor.value = shadowState.element.color;
    elementSize.value = shadowState.element.size;
    elementSizeValue.value = shadowState.element.size;
    borderRadius.value = shadowState.element.borderRadius;
    borderRadiusValue.value = shadowState.element.borderRadius;

    // Atualizar todas as visualizações
    updateLayersList();
    updateControlsFromActiveLayer();
    updateElementStyle();
    updateShadow();

    showMessage(`Preset "${preset.name}" carregado com sucesso!`);
  }

  function deleteCustomPreset(index) {
    const customPresets = JSON.parse(
      localStorage.getItem("boxShadowPresets") || "[]"
    );
    const deletedName = customPresets[index].name;

    customPresets.splice(index, 1);
    localStorage.setItem("boxShadowPresets", JSON.stringify(customPresets));

    // Recarregar lista
    loadCustomPresetsFromStorage();

    showMessage(`Preset "${deletedName}" excluído com sucesso!`);
  }

  // Funções utilitárias
  function hexToRgba(hex, opacity) {
    // Remover # se presente
    hex = hex.replace("#", "");

    // Converter hex para rgb
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Retornar como rgba
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  function findParentWithClass(element, className) {
    while (element && !element.classList.contains(className)) {
      element = element.parentElement;
    }
    return element;
  }

  function copyToClipboard(text) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showMessage("Código CSS copiado para a área de transferência!");
      })
      .catch((err) => {
        console.error("Erro ao copiar: ", err);
        alert(
          "Não foi possível copiar o texto automaticamente. Por favor, copie manualmente."
        );
      });
  }

  function showMessage(msg) {
    const messageElement = document.createElement("div");
    messageElement.className = "toast-message";
    messageElement.textContent = msg;

    document.body.appendChild(messageElement);

    setTimeout(() => {
      messageElement.classList.add("show");

      setTimeout(() => {
        messageElement.classList.remove("show");
        setTimeout(() => {
          document.body.removeChild(messageElement);
        }, 300);
      }, 2000);
    }, 10);
  }
});
