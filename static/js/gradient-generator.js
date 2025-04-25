// static/js/gradient-generator.js
document.addEventListener("DOMContentLoaded", function () {
  // Referencias dos elementos DOM
  const gradientPreview = document.getElementById("gradient-preview");
  const cssOutput = document.getElementById("css-output");
  const copyOutputBtn = document.getElementById("copy-output-btn");
  const copyCssBtn = document.getElementById("copy-css-btn");
  const colorStopsBar = document.getElementById("color-stops-bar");
  const colorPicker = document.getElementById("color-picker");
  const colorPosition = document.getElementById("color-position");
  const addColorBtn = document.getElementById("add-color-btn");
  const removeColorBtn = document.getElementById("remove-color-btn");
  const angleInput = document.getElementById("angle-input");
  const directionBtns = document.querySelectorAll(".direction-btn");
  const gradientTypes = document.querySelectorAll(".gradient-type");
  const linearControls = document.getElementById("linear-controls");
  const radialControls = document.getElementById("radial-controls");
  const conicControls = document.getElementById("conic-controls");
  const radialShape = document.getElementById("radial-shape");
  const radialPosition = document.getElementById("radial-position");
  const radialSize = document.getElementById("radial-size");
  const conicPosition = document.getElementById("conic-position");
  const conicAngle = document.getElementById("conic-angle");
  const repeatGradient = document.getElementById("repeat-gradient");
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

  // Estado do gradiente
  let gradientState = {
    type: "linear",
    angle: 90,
    direction: "custom",
    colorStops: [
      { color: "#FF5F6D", position: 0 },
      { color: "#FFC371", position: 100 },
    ],
    radial: {
      shape: "circle",
      position: "center",
      size: "farthest-corner",
    },
    conic: {
      position: "center",
      angle: 0,
    },
    repeat: "",
  };

  let activeColorStop = null;

  // Inicializar
  updateGradient();
  renderColorStops();

  // Event Listeners
  // Tipo de gradiente
  gradientTypes.forEach((type) => {
    type.addEventListener("click", function () {
      gradientTypes.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      const gradientType = this.getAttribute("data-type");
      gradientState.type = gradientType;

      // Mostrar controles específicos para o tipo
      linearControls.style.display =
        gradientType === "linear" ? "block" : "none";
      radialControls.style.display =
        gradientType === "radial" ? "block" : "none";
      conicControls.style.display = gradientType === "conic" ? "block" : "none";

      updateGradient();
    });
  });

  // Direção do gradiente linear
  directionBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      directionBtns.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      const direction = this.getAttribute("data-angle");
      gradientState.direction = direction;

      if (direction === "custom") {
        gradientState.direction = "custom";
        // Não atualiza o ângulo aqui, mantendo o valor atual
      } else {
        gradientState.direction = direction;
      }

      updateGradient();
    });
  });

  // Ângulo personalizado
  angleInput.addEventListener("input", function () {
    const angle = parseInt(this.value) || 0;
    gradientState.angle = Math.max(0, Math.min(359, angle));

    // Garantir que estamos no modo de ângulo personalizado
    directionBtns.forEach((btn) => btn.classList.remove("active"));
    document
      .querySelector('.direction-btn[data-angle="custom"]')
      .classList.add("active");
    gradientState.direction = "custom";

    updateGradient();
  });

  // Configurações do gradiente radial
  radialShape.addEventListener("change", function () {
    gradientState.radial.shape = this.value;
    updateGradient();
  });

  radialPosition.addEventListener("change", function () {
    gradientState.radial.position = this.value;
    updateGradient();
  });

  radialSize.addEventListener("change", function () {
    gradientState.radial.size = this.value;
    updateGradient();
  });

  // Configurações do gradiente cônico
  conicPosition.addEventListener("change", function () {
    gradientState.conic.position = this.value;
    updateGradient();
  });

  conicAngle.addEventListener("input", function () {
    const angle = parseInt(this.value) || 0;
    gradientState.conic.angle = Math.max(0, Math.min(359, angle));
    updateGradient();
  });

  // Opção de repetição
  repeatGradient.addEventListener("change", function () {
    gradientState.repeat = this.value;
    updateGradient();
  });

  // Adicionar cor
  addColorBtn.addEventListener("click", function () {
    // Definir uma posição intermediária entre as cores existentes
    const positions = gradientState.colorStops
      .map((stop) => stop.position)
      .sort((a, b) => a - b);
    const minPos = positions[0];
    const maxPos = positions[positions.length - 1];

    // Calcular a posição intermediária
    let newPosition;
    if (positions.length <= 1) {
      newPosition = 50;
    } else {
      // Encontrar o maior espaço entre paradas de cor
      let maxGap = 0;
      let gapPosition = 50;

      for (let i = 0; i < positions.length - 1; i++) {
        const gap = positions[i + 1] - positions[i];
        if (gap > maxGap) {
          maxGap = gap;
          gapPosition = positions[i] + gap / 2;
        }
      }

      newPosition = Math.round(gapPosition);
    }

    // Gerar uma cor intermediária (pode ser melhorado)
    const newColor = getRandomColor();

    gradientState.colorStops.push({
      color: newColor,
      position: newPosition,
    });

    renderColorStops();
    updateGradient();
  });

  // Remover cor selecionada
  removeColorBtn.addEventListener("click", function () {
    if (!activeColorStop || gradientState.colorStops.length <= 2) {
      showMessage("É necessário pelo menos duas cores no gradiente.");
      return;
    }

    const index = gradientState.colorStops.findIndex(
      (stop) =>
        stop.color === activeColorStop.getAttribute("data-color") &&
        stop.position ===
          parseInt(activeColorStop.getAttribute("data-position"))
    );

    if (index !== -1) {
      gradientState.colorStops.splice(index, 1);
      renderColorStops();
      updateGradient();
      activeColorStop = null;
    }
  });

  // Manipulação das paradas de cor
  colorStopsBar.addEventListener("click", function (e) {
    if (e.target.classList.contains("color-stop")) {
      selectColorStop(e.target);
    }
  });

  // Edição de cor e posição
  colorPicker.addEventListener("input", function () {
    if (!activeColorStop) return;

    const index = gradientState.colorStops.findIndex(
      (stop) =>
        stop.color === activeColorStop.getAttribute("data-color") &&
        stop.position ===
          parseInt(activeColorStop.getAttribute("data-position"))
    );

    if (index !== -1) {
      gradientState.colorStops[index].color = this.value;
      activeColorStop.style.backgroundColor = this.value;
      activeColorStop.setAttribute("data-color", this.value);
      updateGradient();
    }
  });

  colorPosition.addEventListener("input", function () {
    if (!activeColorStop) return;

    const position = parseInt(this.value) || 0;
    const newPosition = Math.max(0, Math.min(100, position));

    const index = gradientState.colorStops.findIndex(
      (stop) =>
        stop.color === activeColorStop.getAttribute("data-color") &&
        stop.position ===
          parseInt(activeColorStop.getAttribute("data-position"))
    );

    if (index !== -1) {
      gradientState.colorStops[index].position = newPosition;
      activeColorStop.style.left = newPosition + "%";
      activeColorStop.setAttribute("data-position", newPosition);
      updateGradient();
    }
  });

  // Presets de gradiente
  presetItems.forEach((preset) => {
    preset.addEventListener("click", function () {
      const colors = this.getAttribute("data-colors").split(",");

      // Configurar cores do gradiente
      gradientState.colorStops = colors.map((color, index) => {
        const position =
          index === 0
            ? 0
            : index === colors.length - 1
            ? 100
            : Math.round(index * (100 / (colors.length - 1)));
        return { color, position };
      });

      renderColorStops();
      updateGradient();
    });
  });

  // Copiar CSS
  copyOutputBtn.addEventListener("click", function () {
    copyToClipboard(cssOutput.textContent);
  });

  copyCssBtn.addEventListener("click", function () {
    copyToClipboard(getGradientCSS());
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
      localStorage.getItem("gradientPresets") || "[]"
    );

    const newPreset = {
      name,
      colors: gradientState.colorStops.map((stop) => stop.color).join(","),
      type: gradientState.type,
      angle: gradientState.angle,
      direction: gradientState.direction,
      radial: gradientState.radial,
      conic: gradientState.conic,
      repeat: gradientState.repeat,
    };

    customPresets.push(newPreset);
    localStorage.setItem("gradientPresets", JSON.stringify(customPresets));

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

  // Funções auxiliares
  function updateGradient() {
    // Ordenar as paradas de cor por posição
    gradientState.colorStops.sort((a, b) => a.position - b.position);

    // Atualizar a visualização do gradiente e o código CSS
    const gradientCSS = getGradientCSS();
    gradientPreview.style.background = gradientCSS;
    cssOutput.textContent = `.elemento {\n  background: ${gradientCSS};\n}`;
  }

  function getGradientCSS() {
    // Montar a string com as paradas de cor
    const colorStopsString = gradientState.colorStops
      .map((stop) => `${stop.color} ${stop.position}%`)
      .join(", ");

    let gradientCSS = "";

    switch (gradientState.type) {
      case "linear":
        // Formatar a direção ou ângulo
        let direction;
        if (gradientState.direction === "custom") {
          direction = `${gradientState.angle}deg`;
        } else {
          direction = gradientState.direction;
        }

        gradientCSS = `${gradientState.repeat}linear-gradient(${direction}, ${colorStopsString})`;
        break;

      case "radial":
        const radialShape = gradientState.radial.shape;
        const radialSize = gradientState.radial.size;
        const radialPosition = gradientState.radial.position;

        gradientCSS = `${gradientState.repeat}radial-gradient(${radialShape} ${radialSize} at ${radialPosition}, ${colorStopsString})`;
        break;

      case "conic":
        const conicPosition = gradientState.conic.position;
        const conicAngle = gradientState.conic.angle;

        gradientCSS = `${gradientState.repeat}conic-gradient(from ${conicAngle}deg at ${conicPosition}, ${colorStopsString})`;
        break;
    }

    return gradientCSS;
  }

  function renderColorStops() {
    // Limpar color stops existentes
    colorStopsBar.innerHTML = "";

    // Adicionar novos color stops
    gradientState.colorStops.forEach((stop) => {
      const colorStopElement = document.createElement("div");
      colorStopElement.className = "color-stop";
      colorStopElement.style.backgroundColor = stop.color;
      colorStopElement.style.left = `${stop.position}%`;
      colorStopElement.setAttribute("data-color", stop.color);
      colorStopElement.setAttribute("data-position", stop.position);

      colorStopsBar.appendChild(colorStopElement);

      // Permitir arraste das paradas de cor
      makeDraggable(colorStopElement);
    });

    // Se não há color stop ativo, selecione o primeiro
    if (!activeColorStop && colorStopsBar.firstChild) {
      selectColorStop(colorStopsBar.firstChild);
    }
  }

  function selectColorStop(colorStop) {
    // Remover seleção anterior
    document.querySelectorAll(".color-stop").forEach((stop) => {
      stop.classList.remove("active");
    });

    // Definir nova seleção
    colorStop.classList.add("active");
    activeColorStop = colorStop;

    // Atualizar controles
    const color = colorStop.getAttribute("data-color");
    const position = colorStop.getAttribute("data-position");

    colorPicker.value = color;
    colorPosition.value = position;
  }

  function makeDraggable(element) {
    let isDragging = false;
    let initialX, initialLeft;

    element.addEventListener("mousedown", startDrag);
    element.addEventListener("touchstart", startDrag, { passive: false });

    function startDrag(e) {
      e.preventDefault();
      isDragging = true;

      if (e.type === "touchstart") {
        initialX = e.touches[0].clientX;
      } else {
        initialX = e.clientX;
      }

      initialLeft = parseFloat(element.style.left);

      // Selecionar este color stop
      selectColorStop(element);

      document.addEventListener("mousemove", drag);
      document.addEventListener("touchmove", drag, { passive: false });
      document.addEventListener("mouseup", stopDrag);
      document.addEventListener("touchend", stopDrag);
    }

    function drag(e) {
      if (!isDragging) return;

      let clientX;
      if (e.type === "touchmove") {
        clientX = e.touches[0].clientX;
        e.preventDefault(); // Prevenir rolagem durante arraste
      } else {
        clientX = e.clientX;
      }

      const containerRect = colorStopsBar.getBoundingClientRect();
      const containerWidth = containerRect.width;

      const deltaX = clientX - initialX;
      let newLeftPx = (initialLeft * containerWidth) / 100 + deltaX;

      // Limitar ao container
      newLeftPx = Math.max(0, Math.min(containerWidth, newLeftPx));

      // Converter para porcentagem
      const newLeftPercent = (newLeftPx / containerWidth) * 100;

      // Atualizar posição visual
      element.style.left = `${newLeftPercent}%`;

      // Atualizar posição no estado e atributo
      const position = Math.round(newLeftPercent);
      element.setAttribute("data-position", position);

      // Atualizar campo de posição
      colorPosition.value = position;

      // Atualizar no estado
      const index = gradientState.colorStops.findIndex(
        (stop) =>
          stop.color === element.getAttribute("data-color") &&
          stop.position === parseInt(element.getAttribute("data-position"))
      );

      if (index !== -1) {
        gradientState.colorStops[index].position = position;
      }

      updateGradient();
    }

    function stopDrag() {
      isDragging = false;
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("touchmove", drag);
      document.removeEventListener("mouseup", stopDrag);
      document.removeEventListener("touchend", stopDrag);
    }
  }

  function loadCustomPresetsFromStorage() {
    const customPresets = JSON.parse(
      localStorage.getItem("gradientPresets") || "[]"
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
      // Criar o elemento de visualização do preset
      const presetElement = document.createElement("div");
      presetElement.className = "custom-preset-item";

      // Gerar um gradiente de exemplo para o preset
      let previewStyle = "";
      if (preset.type === "linear") {
        const direction =
          preset.direction === "custom"
            ? `${preset.angle}deg`
            : preset.direction;
        previewStyle = `linear-gradient(${direction}, ${preset.colors.replace(
          /,/g,
          ", "
        )})`;
      } else if (preset.type === "radial") {
        const { shape, size, position } = preset.radial;
        previewStyle = `radial-gradient(${shape} ${size} at ${position}, ${preset.colors.replace(
          /,/g,
          ", "
        )})`;
      } else if (preset.type === "conic") {
        const { position, angle } = preset.conic;
        previewStyle = `conic-gradient(from ${angle}deg at ${position}, ${preset.colors.replace(
          /,/g,
          ", "
        )})`;
      }

      presetElement.style.background = previewStyle;

      // Adicionar conteúdo
      presetElement.innerHTML = `
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
        loadPreset(preset);
        customPresetsModal.style.display = "none";
      });

      deleteBtn.addEventListener("click", () => {
        // Confirmar exclusão
        if (
          confirm(`Tem certeza que deseja excluir o preset "${preset.name}"?`)
        ) {
          deletePreset(index);
        }
      });
    });
  }

  function loadPreset(preset) {
    // Configurar tipo
    gradientState.type = preset.type;

    // Atualizar UI para o tipo
    gradientTypes.forEach((type) => {
      type.classList.remove("active");
      if (type.getAttribute("data-type") === preset.type) {
        type.classList.add("active");
      }
    });

    // Mostrar controles específicos para o tipo
    linearControls.style.display = preset.type === "linear" ? "block" : "none";
    radialControls.style.display = preset.type === "radial" ? "block" : "none";
    conicControls.style.display = preset.type === "conic" ? "block" : "none";

    // Configurar direção/ângulo (linear)
    if (preset.type === "linear") {
      gradientState.direction = preset.direction;
      gradientState.angle = preset.angle;

      // Atualizar UI
      directionBtns.forEach((btn) => {
        btn.classList.remove("active");
        if (btn.getAttribute("data-angle") === preset.direction) {
          btn.classList.add("active");
        }
      });

      if (preset.direction === "custom") {
        document
          .querySelector('.direction-btn[data-angle="custom"]')
          .classList.add("active");
        angleInput.value = preset.angle;
      }
    }

    // Configurar opções radiais
    if (preset.type === "radial") {
      gradientState.radial = { ...preset.radial };

      // Atualizar UI
      radialShape.value = preset.radial.shape;
      radialPosition.value = preset.radial.position;
      radialSize.value = preset.radial.size;
    }

    // Configurar opções cônicas
    if (preset.type === "conic") {
      gradientState.conic = { ...preset.conic };

      // Atualizar UI
      conicPosition.value = preset.conic.position;
      conicAngle.value = preset.conic.angle;
    }

    // Configurar repetição
    gradientState.repeat = preset.repeat;
    repeatGradient.value = preset.repeat;

    // Configurar paradas de cor
    const colors = preset.colors.split(",");
    gradientState.colorStops = colors.map((color, index) => {
      const position =
        index === 0
          ? 0
          : index === colors.length - 1
          ? 100
          : Math.round(index * (100 / (colors.length - 1)));
      return { color, position };
    });

    // Atualizar UI
    renderColorStops();
    updateGradient();

    showMessage(`Preset "${preset.name}" carregado com sucesso!`);
  }

  function deletePreset(index) {
    const customPresets = JSON.parse(
      localStorage.getItem("gradientPresets") || "[]"
    );
    const deletedName = customPresets[index].name;

    customPresets.splice(index, 1);
    localStorage.setItem("gradientPresets", JSON.stringify(customPresets));

    // Recarregar lista
    loadCustomPresetsFromStorage();

    showMessage(`Preset "${deletedName}" excluído com sucesso!`);
  }

  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
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
