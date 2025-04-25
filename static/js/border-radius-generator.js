// static/js/border-radius-generator.js
document.addEventListener("DOMContentLoaded", function () {
  // Referências dos elementos DOM
  const elementPreview = document.getElementById("element-preview");
  const cssOutput = document.getElementById("css-output");
  const copyOutputBtn = document.getElementById("copy-output-btn");
  const copyCssBtn = document.getElementById("copy-css-btn");
  const resetRadiusBtn = document.getElementById("reset-radius-btn");

  // Controles de tamanho e cor
  const elementWidth = document.getElementById("element-width");
  const elementHeight = document.getElementById("element-height");
  const elementColor = document.getElementById("element-color");

  // Controles de modo de borda
  const allCornersBtn = document.getElementById("all-corners-btn");
  const individualCornersBtn = document.getElementById(
    "individual-corners-btn"
  );
  const allCornersControl = document.getElementById("all-corners-control");
  const individualCornersControl = document.getElementById(
    "individual-corners-control"
  );

  // Controles de borda
  const allCornersRange = document.getElementById("all-corners-range");
  const allCornersValue = document.getElementById("all-corners-value");
  const topLeftRange = document.getElementById("top-left-range");
  const topLeftValue = document.getElementById("top-left-value");
  const topRightRange = document.getElementById("top-right-range");
  const topRightValue = document.getElementById("top-right-value");
  const bottomRightRange = document.getElementById("bottom-right-range");
  const bottomRightValue = document.getElementById("bottom-right-value");
  const bottomLeftRange = document.getElementById("bottom-left-range");
  const bottomLeftValue = document.getElementById("bottom-left-value");

  // Alças para arrastar cantos
  const radiusHandles = document.querySelectorAll(".radius-handle");

  // Controles de unidade
  const unitButtons = document.querySelectorAll(".unit-btn");

  // Controles de formato (elíptico)
  const enableElliptical = document.getElementById("enable-elliptical");
  const ellipticalControls = document.getElementById("elliptical-controls");

  // Controles de valores elípticos
  const topLeftH = document.getElementById("top-left-h");
  const topLeftV = document.getElementById("top-left-v");
  const topRightH = document.getElementById("top-right-h");
  const topRightV = document.getElementById("top-right-v");
  const bottomRightH = document.getElementById("bottom-right-h");
  const bottomRightV = document.getElementById("bottom-right-v");
  const bottomLeftH = document.getElementById("bottom-left-h");
  const bottomLeftV = document.getElementById("bottom-left-v");

  // Controles de formato de código
  const formatButtons = document.querySelectorAll(".format-btn");

  // Controles de forma
  const shapeOptions = document.querySelectorAll(".shape-option");

  // Estado do border-radius
  let radiusState = {
    unit: "px",
    mode: "all", // 'all' ou 'individual'
    corners: {
      "top-left": 20,
      "top-right": 20,
      "bottom-right": 20,
      "bottom-left": 20,
    },
    elliptical: false,
    ellipticalValues: {
      "top-left": { h: 20, v: 20 },
      "top-right": { h: 20, v: 20 },
      "bottom-right": { h: 20, v: 20 },
      "bottom-left": { h: 20, v: 20 },
    },
    element: {
      width: 200,
      height: 200,
      color: "#3B82F6",
      shape: "square",
    },
    codeFormat: "shorthand", // 'shorthand' ou 'longhand'
  };

  // Inicializar
  updatePreview();
  updateCSSOutput();

  // Event Listeners
  // Modo de borda
  allCornersBtn.addEventListener("click", function () {
    setRadiusMode("all");
  });

  individualCornersBtn.addEventListener("click", function () {
    setRadiusMode("individual");
  });

  // Controles de unidade
  unitButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const unit = this.getAttribute("data-unit");
      setUnit(unit);
    });
  });

  // Slider de todas as bordas
  allCornersRange.addEventListener("input", function () {
    const value = parseInt(this.value);
    setAllCorners(value);
  });

  // Sliders individuais
  topLeftRange.addEventListener("input", function () {
    setCorner("top-left", parseInt(this.value));
  });

  topRightRange.addEventListener("input", function () {
    setCorner("top-right", parseInt(this.value));
  });

  bottomRightRange.addEventListener("input", function () {
    setCorner("bottom-right", parseInt(this.value));
  });

  bottomLeftRange.addEventListener("input", function () {
    setCorner("bottom-left", parseInt(this.value));
  });

  // Formato elíptico
  enableElliptical.addEventListener("change", function () {
    radiusState.elliptical = this.checked;
    ellipticalControls.style.display = this.checked ? "block" : "none";
    updatePreview();
    updateCSSOutput();
  });

  // Inputs de valores elípticos
  const ellipticalInputs = [
    topLeftH,
    topLeftV,
    topRightH,
    topRightV,
    bottomRightH,
    bottomRightV,
    bottomLeftH,
    bottomLeftV,
  ];

  ellipticalInputs.forEach((input) => {
    input.addEventListener("input", function () {
      const id = this.id;
      const value = parseInt(this.value) || 0;

      // Extrair informações do ID (ex: "top-left-h")
      const parts = id.split("-");
      const corner = parts[0] + "-" + parts[1];
      const dimension = parts[2]; // 'h' ou 'v'

      radiusState.ellipticalValues[corner][dimension] = value;
      updatePreview();
      updateCSSOutput();
    });
  });

  // Tamanho e cor do elemento
  elementWidth.addEventListener("input", function () {
    radiusState.element.width = parseInt(this.value) || 200;
    updatePreview();
  });

  elementHeight.addEventListener("input", function () {
    radiusState.element.height = parseInt(this.value) || 200;
    updatePreview();
  });

  elementColor.addEventListener("input", function () {
    radiusState.element.color = this.value;
    updatePreview();
  });

  // Formato do código
  formatButtons.forEach((button) => {
    button.addEventListener("click", function () {
      formatButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
      radiusState.codeFormat = this.getAttribute("data-format");
      updateCSSOutput();
    });
  });

  // Arrastar alças
  radiusHandles.forEach((handle) => {
    makeHandleDraggable(handle);
  });

  // Reset de bordas
  resetRadiusBtn.addEventListener("click", resetRadius);

  // Copiar CSS
  copyOutputBtn.addEventListener("click", function () {
    copyToClipboard(cssOutput.textContent);
  });

  copyCssBtn.addEventListener("click", function () {
    copyToClipboard(getBorderRadiusCSS(radiusState.codeFormat === "longhand"));
  });

  // Opções de forma
  shapeOptions.forEach((option) => {
    option.addEventListener("click", function () {
      shapeOptions.forEach((opt) => opt.classList.remove("active"));
      this.classList.add("active");

      const shape = this.getAttribute("data-shape");
      radiusState.element.shape = shape;

      // Ajustar dimensões com base na forma
      if (shape === "square") {
        elementHeight.value = elementWidth.value;
        radiusState.element.height = radiusState.element.width;
      } else if (shape === "circle") {
        elementHeight.value = elementWidth.value;
        radiusState.element.height = radiusState.element.width;
        setAllCorners(50, "%");
      } else if (shape === "rectangle") {
        elementHeight.value = Math.round(radiusState.element.width * 0.6);
        radiusState.element.height = Math.round(
          radiusState.element.width * 0.6
        );
      }

      updatePreview();
      updateCSSOutput();
    });
  });

  // Presets
  const presetItems = document.querySelectorAll(".preset-item");
  presetItems.forEach((item) => {
    item.addEventListener("click", function () {
      const preset = this.getAttribute("data-preset");
      applyPreset(preset);
    });
  });

  // Funções principais
  function setRadiusMode(mode) {
    radiusState.mode = mode;

    // Atualizar UI
    if (mode === "all") {
      allCornersBtn.classList.add("active");
      individualCornersBtn.classList.remove("active");
      allCornersControl.style.display = "block";
      individualCornersControl.style.display = "none";
    } else {
      allCornersBtn.classList.remove("active");
      individualCornersBtn.classList.add("active");
      allCornersControl.style.display = "none";
      individualCornersControl.style.display = "block";
    }
  }

  function setUnit(unit) {
    radiusState.unit = unit;

    // Atualizar UI
    unitButtons.forEach((btn) => {
      if (btn.getAttribute("data-unit") === unit) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    updateValueDisplays();
    updateCSSOutput();
  }

  function setAllCorners(value, unit) {
    if (unit && unit !== radiusState.unit) {
      setUnit(unit);
    }

    radiusState.corners["top-left"] = value;
    radiusState.corners["top-right"] = value;
    radiusState.corners["bottom-right"] = value;
    radiusState.corners["bottom-left"] = value;

    // Atualizar UI
    allCornersRange.value = value;
    topLeftRange.value = value;
    topRightRange.value = value;
    bottomRightRange.value = value;
    bottomLeftRange.value = value;

    // Se o modo elíptico estiver ativo, atualizar também valores elípticos
    if (radiusState.elliptical) {
      for (const corner in radiusState.ellipticalValues) {
        radiusState.ellipticalValues[corner].h = value;
        radiusState.ellipticalValues[corner].v = value;
      }
      updateEllipticalInputs();
    }

    updateValueDisplays();
    updatePreview();
    updateCSSOutput();
  }

  function setCorner(corner, value) {
    radiusState.corners[corner] = value;

    // Atualizar UI
    updateValueDisplays();
    updatePreview();
    updateCSSOutput();

    // Se o modo elíptico estiver ativo, atualizar também valores elípticos
    if (radiusState.elliptical) {
      radiusState.ellipticalValues[corner].h = value;
      radiusState.ellipticalValues[corner].v = value;
      updateEllipticalInputs();
    }
  }

  function updateValueDisplays() {
    const unit = radiusState.unit;
    allCornersValue.textContent = `${radiusState.corners["top-left"]}${unit}`;
    topLeftValue.textContent = `${radiusState.corners["top-left"]}${unit}`;
    topRightValue.textContent = `${radiusState.corners["top-right"]}${unit}`;
    bottomRightValue.textContent = `${radiusState.corners["bottom-right"]}${unit}`;
    bottomLeftValue.textContent = `${radiusState.corners["bottom-left"]}${unit}`;
  }

  function updateEllipticalInputs() {
    topLeftH.value = radiusState.ellipticalValues["top-left"].h;
    topLeftV.value = radiusState.ellipticalValues["top-left"].v;
    topRightH.value = radiusState.ellipticalValues["top-right"].h;
    topRightV.value = radiusState.ellipticalValues["top-right"].v;
    bottomRightH.value = radiusState.ellipticalValues["bottom-right"].h;
    bottomRightV.value = radiusState.ellipticalValues["bottom-right"].v;
    bottomLeftH.value = radiusState.ellipticalValues["bottom-left"].h;
    bottomLeftV.value = radiusState.ellipticalValues["bottom-left"].v;
  }

  function updatePreview() {
    const { width, height, color } = radiusState.element;

    // Atualizar dimensões e cor
    elementPreview.style.width = `${width}px`;
    elementPreview.style.height = `${height}px`;
    elementPreview.style.backgroundColor = color;

    // Atualizar border-radius
    elementPreview.style.borderRadius = getBorderRadiusCSS();
  }

  function updateCSSOutput() {
    const isLonghand = radiusState.codeFormat === "longhand";
    const cssValue = getBorderRadiusCSS(isLonghand);

    if (isLonghand) {
      cssOutput.textContent = `.elemento {\n  ${cssValue}\n}`;
    } else {
      cssOutput.textContent = `.elemento {\n  border-radius: ${cssValue};\n}`;
    }
  }

  function getBorderRadiusCSS(longhand = false) {
    const unit = radiusState.unit;
    let cssValue = "";

    if (radiusState.elliptical) {
      const values = radiusState.ellipticalValues;

      if (longhand) {
        cssValue = `border-top-left-radius: ${values["top-left"].h}${unit} ${values["top-left"].v}${unit};\n  border-top-right-radius: ${values["top-right"].h}${unit} ${values["top-right"].v}${unit};\n  border-bottom-right-radius: ${values["bottom-right"].h}${unit} ${values["bottom-right"].v}${unit};\n  border-bottom-left-radius: ${values["bottom-left"].h}${unit} ${values["bottom-left"].v}${unit};`;
      } else {
        cssValue = `${values["top-left"].h}${unit} ${values["top-right"].h}${unit} ${values["bottom-right"].h}${unit} ${values["bottom-left"].h}${unit} / ${values["top-left"].v}${unit} ${values["top-right"].v}${unit} ${values["bottom-right"].v}${unit} ${values["bottom-left"].v}${unit}`;
      }
    } else {
      const topLeft = `${radiusState.corners["top-left"]}${unit}`;
      const topRight = `${radiusState.corners["top-right"]}${unit}`;
      const bottomRight = `${radiusState.corners["bottom-right"]}${unit}`;
      const bottomLeft = `${radiusState.corners["bottom-left"]}${unit}`;

      if (longhand) {
        cssValue = `border-top-left-radius: ${topLeft};\n  border-top-right-radius: ${topRight};\n  border-bottom-right-radius: ${bottomRight};\n  border-bottom-left-radius: ${bottomLeft};`;
      } else {
        // Verificar se podemos simplificar a notação shorthand
        if (
          topLeft === topRight &&
          topRight === bottomRight &&
          bottomRight === bottomLeft
        ) {
          // Todos os cantos são iguais
          cssValue = topLeft;
        } else if (topLeft === bottomRight && topRight === bottomLeft) {
          // Cantos opostos são iguais
          cssValue = `${topLeft} ${topRight}`;
        } else {
          // Todos os cantos são diferentes
          cssValue = `${topLeft} ${topRight} ${bottomRight} ${bottomLeft}`;
        }
      }
    }

    return cssValue;
  }

  function resetRadius() {
    setAllCorners(20);

    // Resetar modo elíptico
    enableElliptical.checked = false;
    radiusState.elliptical = false;
    ellipticalControls.style.display = "none";

    // Resetar valores elípticos
    for (const corner in radiusState.ellipticalValues) {
      radiusState.ellipticalValues[corner].h = 20;
      radiusState.ellipticalValues[corner].v = 20;
    }
    updateEllipticalInputs();

    // Atualizar visualização
    updatePreview();
    updateCSSOutput();
  }

  function makeHandleDraggable(handle) {
    let isDragging = false;
    const corner = handle.getAttribute("data-corner");

    handle.addEventListener("mousedown", startDrag);
    handle.addEventListener("touchstart", startDrag, { passive: false });

    function startDrag(e) {
      e.preventDefault();
      isDragging = true;

      // Ativar modo individual se estiver no modo 'all'
      if (radiusState.mode === "all") {
        setRadiusMode("individual");
      }

      // Adicionar event listeners para movimento
      document.addEventListener("mousemove", drag);
      document.addEventListener("touchmove", drag, { passive: false });
      document.addEventListener("mouseup", stopDrag);
      document.addEventListener("touchend", stopDrag);
    }

    function drag(e) {
      if (!isDragging) return;
      e.preventDefault();

      // Obter coordenadas do mouse ou toque
      const clientX = e.clientX || e.touches[0].clientX;
      const clientY = e.clientY || e.touches[0].clientY;

      // Obter posição e dimensões do elemento
      const rect = elementPreview.getBoundingClientRect();

      // Calcular distância do canto correspondente
      let distance;
      if (corner === "top-left") {
        distance = Math.sqrt(
          Math.pow(clientX - rect.left, 2) + Math.pow(clientY - rect.top, 2)
        );
      } else if (corner === "top-right") {
        distance = Math.sqrt(
          Math.pow(clientX - rect.right, 2) + Math.pow(clientY - rect.top, 2)
        );
      } else if (corner === "bottom-right") {
        distance = Math.sqrt(
          Math.pow(clientX - rect.right, 2) + Math.pow(clientY - rect.bottom, 2)
        );
      } else if (corner === "bottom-left") {
        distance = Math.sqrt(
          Math.pow(clientX - rect.left, 2) + Math.pow(clientY - rect.bottom, 2)
        );
      }

      // Converter distância em valor de raio (máximo 200)
      let radius = Math.min(200, Math.max(0, Math.round(distance)));

      // Definir o raio para este canto
      setCorner(corner, radius);

      // Atualizar slider correspondente
      const slider = document.getElementById(`${corner}-range`);
      if (slider) {
        slider.value = radius;
      }
    }

    function stopDrag() {
      isDragging = false;
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("touchmove", drag);
      document.removeEventListener("mouseup", stopDrag);
      document.removeEventListener("touchend", stopDrag);
    }
  }

  function applyPreset(preset) {
    const presets = {
      rounded: {
        corners: {
          "top-left": 10,
          "top-right": 10,
          "bottom-right": 10,
          "bottom-left": 10,
        },
        elliptical: false,
      },
      pill: {
        corners: {
          "top-left": 50,
          "top-right": 50,
          "bottom-right": 50,
          "bottom-left": 50,
        },
        shape: "rectangle",
        width: 250,
        height: 100,
        elliptical: false,
      },
      circle: {
        corners: {
          "top-left": 50,
          "top-right": 50,
          "bottom-right": 50,
          "bottom-left": 50,
        },
        shape: "square",
        unit: "%",
        elliptical: false,
      },
      "top-corners": {
        corners: {
          "top-left": 20,
          "top-right": 20,
          "bottom-right": 0,
          "bottom-left": 0,
        },
        elliptical: false,
      },
      "bottom-corners": {
        corners: {
          "top-left": 0,
          "top-right": 0,
          "bottom-right": 20,
          "bottom-left": 20,
        },
        elliptical: false,
      },
      "left-corners": {
        corners: {
          "top-left": 20,
          "top-right": 0,
          "bottom-right": 0,
          "bottom-left": 20,
        },
        elliptical: false,
      },
      "right-corners": {
        corners: {
          "top-left": 0,
          "top-right": 20,
          "bottom-right": 20,
          "bottom-left": 0,
        },
        elliptical: false,
      },
      diagonal: {
        corners: {
          "top-left": 50,
          "top-right": 0,
          "bottom-right": 50,
          "bottom-left": 0,
        },
        elliptical: false,
      },
      wave: {
        corners: {
          "top-left": 40,
          "top-right": 10,
          "bottom-right": 40,
          "bottom-left": 10,
        },
        elliptical: false,
      },
      fancy: {
        corners: {
          "top-left": 70,
          "top-right": 15,
          "bottom-right": 50,
          "bottom-left": 5,
        },
        elliptical: true,
        ellipticalValues: {
          "top-left": { h: 70, v: 20 },
          "top-right": { h: 15, v: 50 },
          "bottom-right": { h: 50, v: 5 },
          "bottom-left": { h: 5, v: 70 },
        },
      },
    };

    if (presets[preset]) {
      const presetData = presets[preset];

      // Aplicar cantos
      if (presetData.corners) {
        for (const corner in presetData.corners) {
          radiusState.corners[corner] = presetData.corners[corner];
        }

        // Atualizar UI para sliders
        for (const corner in presetData.corners) {
          const slider = document.getElementById(`${corner}-range`);
          if (slider) {
            slider.value = presetData.corners[corner];
          }
        }

        // Atualizar slider "todos os cantos" se todos os valores forem iguais
        const allEqual = Object.values(presetData.corners).every(
          (val) => val === Object.values(presetData.corners)[0]
        );
        if (allEqual) {
          allCornersRange.value = Object.values(presetData.corners)[0];
        }
      }

      // Aplicar unidade
      if (presetData.unit) {
        setUnit(presetData.unit);
      } else {
        setUnit("px");
      }

      // Aplicar modo elíptico
      if (presetData.hasOwnProperty("elliptical")) {
        enableElliptical.checked = presetData.elliptical;
        radiusState.elliptical = presetData.elliptical;
        ellipticalControls.style.display = presetData.elliptical
          ? "block"
          : "none";

        // Aplicar valores elípticos se disponíveis
        if (presetData.elliptical && presetData.ellipticalValues) {
          for (const corner in presetData.ellipticalValues) {
            radiusState.ellipticalValues[corner] = {
              ...presetData.ellipticalValues[corner],
            };
          }
          updateEllipticalInputs();
        }
      }

      // Aplicar forma
      if (presetData.shape) {
        radiusState.element.shape = presetData.shape;
        shapeOptions.forEach((option) => {
          if (option.getAttribute("data-shape") === presetData.shape) {
            option.classList.add("active");
          } else {
            option.classList.remove("active");
          }
        });
      }

      // Aplicar dimensões
      if (presetData.width) {
        radiusState.element.width = presetData.width;
        elementWidth.value = presetData.width;
      }

      if (presetData.height) {
        radiusState.element.height = presetData.height;
        elementHeight.value = presetData.height;
      }

      // Atualizar visualização
      updateValueDisplays();
      updatePreview();
      updateCSSOutput();

      // Ativar modo individual se os cantos forem diferentes
      const allEqual = Object.values(radiusState.corners).every(
        (val) => val === Object.values(radiusState.corners)[0]
      );
      if (!allEqual) {
        setRadiusMode("individual");
      }
    }
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
