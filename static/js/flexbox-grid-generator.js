// static/js/flexbox-grid-generator.js
document.addEventListener("DOMContentLoaded", function () {
  // Referências dos elementos DOM
  const layoutPreview = document.getElementById("layout-preview");
  const cssOutput = document.getElementById("css-output");
  const copyOutputBtn = document.getElementById("copy-output-btn");

  // Seletores de layout
  const layoutTypes = document.querySelectorAll(".layout-type");
  const flexboxControls = document.getElementById("flexbox-controls");
  const gridControls = document.getElementById("grid-controls");

  // Controles de dispositivo
  const deviceBtns = document.querySelectorAll(".device-btn");
  const layoutPreviewContainer = document.querySelector(
    ".layout-preview-container"
  );

  // Controles de itens
  const addItemBtn = document.getElementById("add-item-btn");
  const removeItemBtn = document.getElementById("remove-item-btn");
  const resetLayoutBtn = document.getElementById("reset-layout-btn");

  // Abas
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  const presetTabBtns = document.querySelectorAll(".preset-tab-btn");
  const presetTabContents = document.querySelectorAll(".preset-tab-content");

  // Controles de formato de código
  const formatBtns = document.querySelectorAll(".format-btn");

  // Modal de construtor de grid
  const gridBuilderModal = document.getElementById("grid-builder-modal");
  const columnsBuilderBtn = document.getElementById("columns-builder-btn");
  const rowsBuilderBtn = document.getElementById("rows-builder-btn");
  const closeModalBtns = document.querySelectorAll(".close-modal");
  const builderTypes = document.querySelectorAll(".builder-type");
  const gridUnit = document.getElementById("grid-unit");
  const gridCount = document.getElementById("grid-count");
  const gridValueSliders = document.getElementById("grid-value-sliders");
  const templateOutput = document.getElementById("template-output");
  const builderPreviewGrid = document.getElementById("builder-preview-grid");
  const applyTemplateBtn = document.getElementById("apply-template");
  const cancelTemplateBtn = document.getElementById("cancel-template");

  // Presets de layout
  const presetItems = document.querySelectorAll(".preset-item");

  // Estado do layout
  let layoutState = {
    type: "flexbox", // 'flexbox' ou 'grid'
    container: {
      flexbox: {
        direction: "row",
        wrap: "wrap",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        alignContent: "flex-start",
        gap: 10,
      },
      grid: {
        templateColumns: "repeat(3, 1fr)",
        templateRows: "auto",
        gap: 10,
        columnGap: 10,
        rowGap: 10,
        justifyItems: "stretch",
        alignItems: "stretch",
        justifyContent: "start",
        alignContent: "start",
      },
    },
    items: [
      {
        id: 1,
        flexGrow: 0,
        flexShrink: 1,
        flexBasis: "auto",
        alignSelf: "auto",
        order: 0,
        gridColumnStart: "auto",
        gridColumnEnd: "auto",
        gridRowStart: "auto",
        gridRowEnd: "auto",
        justifySelf: "auto",
        alignSelf: "auto",
        gridArea: "",
      },
      {
        id: 2,
        flexGrow: 0,
        flexShrink: 1,
        flexBasis: "auto",
        alignSelf: "auto",
        order: 0,
        gridColumnStart: "auto",
        gridColumnEnd: "auto",
        gridRowStart: "auto",
        gridRowEnd: "auto",
        justifySelf: "auto",
        alignSelf: "auto",
        gridArea: "",
      },
      {
        id: 3,
        flexGrow: 0,
        flexShrink: 1,
        flexBasis: "auto",
        alignSelf: "auto",
        order: 0,
        gridColumnStart: "auto",
        gridColumnEnd: "auto",
        gridRowStart: "auto",
        gridRowEnd: "auto",
        justifySelf: "auto",
        alignSelf: "auto",
        gridArea: "",
      },
      {
        id: 4,
        flexGrow: 0,
        flexShrink: 1,
        flexBasis: "auto",
        alignSelf: "auto",
        order: 0,
        gridColumnStart: "auto",
        gridColumnEnd: "auto",
        gridRowStart: "auto",
        gridRowEnd: "auto",
        justifySelf: "auto",
        alignSelf: "auto",
        gridArea: "",
      },
      {
        id: 5,
        flexGrow: 0,
        flexShrink: 1,
        flexBasis: "auto",
        alignSelf: "auto",
        order: 0,
        gridColumnStart: "auto",
        gridColumnEnd: "auto",
        gridRowStart: "auto",
        gridRowEnd: "auto",
        justifySelf: "auto",
        alignSelf: "auto",
        gridArea: "",
      },
    ],
    device: {
      width: "100%",
    },
    codeFormat: "css",
    activeItem: null,
    gridBuilder: {
      type: "columns", // 'columns' ou 'rows'
      unit: "fr",
      count: 3,
      values: [1, 1, 1],
    },
  };

  // Inicializar
  updatePreview();
  updateCSSOutput();

  // Event Listeners
  // Tipo de layout
  layoutTypes.forEach((type) => {
    type.addEventListener("click", function () {
      layoutTypes.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      layoutState.type = this.getAttribute("data-type");

      // Mostrar controles específicos para o tipo
      if (layoutState.type === "flexbox") {
        flexboxControls.style.display = "block";
        gridControls.style.display = "none";

        // Resetar seleção de item ativo
        layoutState.activeItem = null;
        updateItemSelection();
      } else {
        flexboxControls.style.display = "none";
        gridControls.style.display = "block";

        // Resetar seleção de item ativo
        layoutState.activeItem = null;
        updateItemSelection();
      }

      updatePreview();
      updateCSSOutput();
    });
  });

  // Botões de dispositivo
  deviceBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      deviceBtns.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      layoutState.device.width = this.getAttribute("data-width");
      layoutPreviewContainer.style.width = layoutState.device.width;
    });
  });

  // Adicionar item
  addItemBtn.addEventListener("click", function () {
    const newId = layoutState.items.length + 1;
    layoutState.items.push({
      id: newId,
      flexGrow: 0,
      flexShrink: 1,
      flexBasis: "auto",
      alignSelf: "auto",
      order: 0,
      gridColumnStart: "auto",
      gridColumnEnd: "auto",
      gridRowStart: "auto",
      gridRowEnd: "auto",
      justifySelf: "auto",
      alignSelf: "auto",
      gridArea: "",
    });

    renderItems();
    updatePreview();
    updateCSSOutput();
  });

  // Remover item
  removeItemBtn.addEventListener("click", function () {
    if (layoutState.items.length > 1) {
      layoutState.items.pop();

      // Resetar seleção de item ativo se o item removido estava selecionado
      if (layoutState.activeItem >= layoutState.items.length) {
        layoutState.activeItem = null;
      }

      renderItems();
      updateItemSelection();
      updatePreview();
      updateCSSOutput();
    } else {
      showMessage("É necessário ter pelo menos um item no layout.");
    }
  });

  // Resetar layout
  resetLayoutBtn.addEventListener("click", function () {
    if (layoutState.type === "flexbox") {
      resetFlexboxLayout();
    } else {
      resetGridLayout();
    }

    renderItems();
    updateItemSelection();
    updatePreview();
    updateCSSOutput();
  });

  // Abas
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const tabGroup = this.closest(".tabs-header");
      const tabs = tabGroup.querySelectorAll(".tab-btn");
      tabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      const tabId = this.getAttribute("data-tab");
      const tabContents =
        this.closest(".controls-tabs").querySelectorAll(".tab-content");
      tabContents.forEach((content) => {
        content.classList.remove("active");
      });

      document.getElementById(tabId + "-tab").classList.add("active");
    });
  });

  // Abas de presets
  presetTabBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      presetTabBtns.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      const tabId = this.getAttribute("data-tab");
      presetTabContents.forEach((content) => {
        content.classList.remove("active");
      });

      document.getElementById(tabId + "-tab").classList.add("active");
    });
  });

  // Formato de código
  formatBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      formatBtns.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      layoutState.codeFormat = this.getAttribute("data-format");
      updateCSSOutput();
    });
  });

  // Controles Flexbox
  document
    .getElementById("flex-direction")
    .addEventListener("change", function () {
      layoutState.container.flexbox.direction = this.value;
      updatePreview();
      updateCSSOutput();
    });

  document.getElementById("flex-wrap").addEventListener("change", function () {
    layoutState.container.flexbox.wrap = this.value;
    updatePreview();
    updateCSSOutput();
  });

  document
    .getElementById("justify-content")
    .addEventListener("change", function () {
      layoutState.container.flexbox.justifyContent = this.value;
      updatePreview();
      updateCSSOutput();
    });

  document
    .getElementById("align-items")
    .addEventListener("change", function () {
      layoutState.container.flexbox.alignItems = this.value;
      updatePreview();
      updateCSSOutput();
    });

  document
    .getElementById("align-content")
    .addEventListener("change", function () {
      layoutState.container.flexbox.alignContent = this.value;
      updatePreview();
      updateCSSOutput();
    });

  document.getElementById("flex-gap").addEventListener("input", function () {
    const value = parseInt(this.value);
    document.getElementById("flex-gap-value").textContent = value + "px";
    layoutState.container.flexbox.gap = value;
    updatePreview();
    updateCSSOutput();
  });

  // Controles Flexbox - Todos os itens
  document
    .getElementById("align-self-all")
    .addEventListener("change", function () {
      const value = this.value;
      layoutState.items.forEach((item) => (item.alignSelf = value));
      updatePreview();
      updateCSSOutput();
    });

  document
    .getElementById("flex-grow-all")
    .addEventListener("input", function () {
      const value = parseInt(this.value) || 0;
      layoutState.items.forEach((item) => (item.flexGrow = value));
      updatePreview();
      updateCSSOutput();
    });

  document
    .getElementById("flex-shrink-all")
    .addEventListener("input", function () {
      const value = parseInt(this.value) || 1;
      layoutState.items.forEach((item) => (item.flexShrink = value));
      updatePreview();
      updateCSSOutput();
    });

  document
    .getElementById("flex-basis-all")
    .addEventListener("input", function () {
      let value = this.value;
      const unit = document.getElementById("flex-basis-unit-all").value;

      if (value === "auto") {
        layoutState.items.forEach((item) => (item.flexBasis = "auto"));
      } else {
        if (unit) {
          value = value + unit;
        }
        layoutState.items.forEach((item) => (item.flexBasis = value));
      }

      updatePreview();
      updateCSSOutput();
    });

  document
    .getElementById("flex-basis-unit-all")
    .addEventListener("change", function () {
      const value = document.getElementById("flex-basis-all").value;

      if (value === "auto") {
        layoutState.items.forEach((item) => (item.flexBasis = "auto"));
      } else {
        const unit = this.value;
        const newValue = unit ? value + unit : value;
        layoutState.items.forEach((item) => (item.flexBasis = newValue));
      }

      updatePreview();
      updateCSSOutput();
    });

  // Controles Flexbox - Item individual
  document.getElementById("align-self").addEventListener("change", function () {
    if (layoutState.activeItem !== null) {
      const item = layoutState.items[layoutState.activeItem];
      item.alignSelf = this.value;
      updatePreview();
      updateCSSOutput();
    }
  });

  document.getElementById("flex-grow").addEventListener("input", function () {
    if (layoutState.activeItem !== null) {
      const item = layoutState.items[layoutState.activeItem];
      item.flexGrow = parseInt(this.value) || 0;
      updatePreview();
      updateCSSOutput();
    }
  });

  document.getElementById("flex-shrink").addEventListener("input", function () {
    if (layoutState.activeItem !== null) {
      const item = layoutState.items[layoutState.activeItem];
      item.flexShrink = parseInt(this.value) || 1;
      updatePreview();
      updateCSSOutput();
    }
  });

  document.getElementById("flex-basis").addEventListener("input", function () {
    if (layoutState.activeItem !== null) {
      const item = layoutState.items[layoutState.activeItem];
      let value = this.value;
      const unit = document.getElementById("flex-basis-unit").value;

      if (value === "auto") {
        item.flexBasis = "auto";
      } else {
        if (unit) {
          value = value + unit;
        }
        item.flexBasis = value;
      }

      updatePreview();
      updateCSSOutput();
    }
  });

  document
    .getElementById("flex-basis-unit")
    .addEventListener("change", function () {
      if (layoutState.activeItem !== null) {
        const item = layoutState.items[layoutState.activeItem];
        const value = document.getElementById("flex-basis").value;

        if (value === "auto") {
          item.flexBasis = "auto";
        } else {
          const unit = this.value;
          const newValue = unit ? value + unit : value;
          item.flexBasis = newValue;
        }

        updatePreview();
        updateCSSOutput();
      }
    });

  document.getElementById("flex-order").addEventListener("input", function () {
    if (layoutState.activeItem !== null) {
      const item = layoutState.items[layoutState.activeItem];
      item.order = parseInt(this.value) || 0;
      updatePreview();
      updateCSSOutput();
    }
  });

  // Controles Grid
  document
    .getElementById("grid-template-columns")
    .addEventListener("input", function () {
      layoutState.container.grid.templateColumns = this.value;
      updatePreview();
      updateCSSOutput();
    });

  document
    .getElementById("grid-template-rows")
    .addEventListener("input", function () {
      layoutState.container.grid.templateRows = this.value;
      updatePreview();
      updateCSSOutput();
    });

  document.getElementById("grid-gap").addEventListener("input", function () {
    const value = parseInt(this.value);
    document.getElementById("grid-gap-value").textContent = value + "px";
    layoutState.container.grid.gap = value;

    // Também atualizar column-gap e row-gap para manter sincronizado
    document.getElementById("grid-column-gap").value = value;
    document.getElementById("grid-column-gap-value").textContent = value + "px";
    layoutState.container.grid.columnGap = value;

    document.getElementById("grid-row-gap").value = value;
    document.getElementById("grid-row-gap-value").textContent = value + "px";
    layoutState.container.grid.rowGap = value;

    updatePreview();
    updateCSSOutput();
  });

  document
    .getElementById("grid-column-gap")
    .addEventListener("input", function () {
      const value = parseInt(this.value);
      document.getElementById("grid-column-gap-value").textContent =
        value + "px";
      layoutState.container.grid.columnGap = value;
      updatePreview();
      updateCSSOutput();
    });

  document
    .getElementById("grid-row-gap")
    .addEventListener("input", function () {
      const value = parseInt(this.value);
      document.getElementById("grid-row-gap-value").textContent = value + "px";
      layoutState.container.grid.rowGap = value;
      updatePreview();
      updateCSSOutput();
    });

  document
    .getElementById("justify-items")
    .addEventListener("change", function () {
      layoutState.container.grid.justifyItems = this.value;
      updatePreview();
      updateCSSOutput();
    });

  document
    .getElementById("align-grid-items")
    .addEventListener("change", function () {
      layoutState.container.grid.alignItems = this.value;
      updatePreview();
      updateCSSOutput();
    });

  document
    .getElementById("justify-grid-content")
    .addEventListener("change", function () {
      layoutState.container.grid.justifyContent = this.value;
      updatePreview();
      updateCSSOutput();
    });

  document
    .getElementById("align-grid-content")
    .addEventListener("change", function () {
      layoutState.container.grid.alignContent = this.value;
      updatePreview();
      updateCSSOutput();
    });

  // Controles Grid - Todos os itens
  document
    .getElementById("justify-self-all")
    .addEventListener("change", function () {
      const value = this.value;
      layoutState.items.forEach((item) => (item.justifySelf = value));
      updatePreview();
      updateCSSOutput();
    });

  document
    .getElementById("align-self-grid-all")
    .addEventListener("change", function () {
      const value = this.value;
      layoutState.items.forEach((item) => (item.alignSelf = value));
      updatePreview();
      updateCSSOutput();
    });

  // Controles Grid - Item individual
  document
    .getElementById("grid-column-start")
    .addEventListener("input", function () {
      if (layoutState.activeItem !== null) {
        const item = layoutState.items[layoutState.activeItem];
        item.gridColumnStart = this.value;
        updatePreview();
        updateCSSOutput();
      }
    });

  document
    .getElementById("grid-column-end")
    .addEventListener("input", function () {
      if (layoutState.activeItem !== null) {
        const item = layoutState.items[layoutState.activeItem];
        item.gridColumnEnd = this.value;
        updatePreview();
        updateCSSOutput();
      }
    });

  document
    .getElementById("grid-row-start")
    .addEventListener("input", function () {
      if (layoutState.activeItem !== null) {
        const item = layoutState.items[layoutState.activeItem];
        item.gridRowStart = this.value;
        updatePreview();
        updateCSSOutput();
      }
    });

  document
    .getElementById("grid-row-end")
    .addEventListener("input", function () {
      if (layoutState.activeItem !== null) {
        const item = layoutState.items[layoutState.activeItem];
        item.gridRowEnd = this.value;
        updatePreview();
        updateCSSOutput();
      }
    });

  document
    .getElementById("justify-self")
    .addEventListener("change", function () {
      if (layoutState.activeItem !== null) {
        const item = layoutState.items[layoutState.activeItem];
        item.justifySelf = this.value;
        updatePreview();
        updateCSSOutput();
      }
    });

  document
    .getElementById("align-self-grid")
    .addEventListener("change", function () {
      if (layoutState.activeItem !== null) {
        const item = layoutState.items[layoutState.activeItem];
        item.alignSelf = this.value;
        updatePreview();
        updateCSSOutput();
      }
    });

  document.getElementById("grid-area").addEventListener("input", function () {
    if (layoutState.activeItem !== null) {
      const item = layoutState.items[layoutState.activeItem];
      item.gridArea = this.value;
      updatePreview();
      updateCSSOutput();
    }
  });

  // Modal de construtor de grid
  columnsBuilderBtn.addEventListener("click", function () {
    openGridBuilder("columns");
  });

  rowsBuilderBtn.addEventListener("click", function () {
    openGridBuilder("rows");
  });

  closeModalBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      gridBuilderModal.style.display = "none";
    });
  });

  builderTypes.forEach((type) => {
    type.addEventListener("click", function () {
      builderTypes.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      const builderType = this.getAttribute("data-type");
      layoutState.gridBuilder.type = builderType;
      updateGridBuilder();
    });
  });

  gridUnit.addEventListener("change", function () {
    layoutState.gridBuilder.unit = this.value;
    updateGridBuilder();
  });

  gridCount.addEventListener("input", function () {
    const count = parseInt(this.value) || 1;
    layoutState.gridBuilder.count = Math.max(1, Math.min(12, count));

    // Ajustar array de valores
    while (layoutState.gridBuilder.values.length < count) {
      layoutState.gridBuilder.values.push(1);
    }

    if (layoutState.gridBuilder.values.length > count) {
      layoutState.gridBuilder.values = layoutState.gridBuilder.values.slice(
        0,
        count
      );
    }

    updateGridBuilder();
  });

  applyTemplateBtn.addEventListener("click", function () {
    // Aplicar o template ao campo apropriado
    if (layoutState.gridBuilder.type === "columns") {
      document.getElementById("grid-template-columns").value =
        templateOutput.value;
      layoutState.container.grid.templateColumns = templateOutput.value;
    } else {
      document.getElementById("grid-template-rows").value =
        templateOutput.value;
      layoutState.container.grid.templateRows = templateOutput.value;
    }

    updatePreview();
    updateCSSOutput();
    gridBuilderModal.style.display = "none";
  });

  cancelTemplateBtn.addEventListener("click", function () {
    gridBuilderModal.style.display = "none";
  });

  // Presets
  presetItems.forEach((preset) => {
    preset.addEventListener("click", function () {
      const presetType = this.getAttribute("data-preset");

      if (presetType) {
        applyPreset(presetType);
      }
    });
  });

  // Clicar nos itens de preview para seleção
  layoutPreview.addEventListener("click", function (e) {
    if (e.target.classList.contains("preview-item")) {
      const index = Array.from(layoutPreview.children).indexOf(e.target);

      if (index !== -1) {
        layoutState.activeItem = index;
        updateItemSelection();

        // Mudar para a aba de item individual
        if (layoutState.type === "flexbox") {
          document
            .querySelector('.tab-btn[data-tab="individual-item"]')
            .click();
        } else {
          document
            .querySelector('.tab-btn[data-tab="individual-grid-item"]')
            .click();
        }
      }
    }
  });

  // Copiar código CSS
  copyOutputBtn.addEventListener("click", function () {
    copyToClipboard(cssOutput.textContent);
  });

  // Funções principais
  function updatePreview() {
    // Limpar estilos existentes
    layoutPreview.removeAttribute("style");

    if (layoutState.type === "flexbox") {
      // Aplicar propriedades flexbox
      const flex = layoutState.container.flexbox;
      layoutPreview.style.display = "flex";
      layoutPreview.style.flexDirection = flex.direction;
      layoutPreview.style.flexWrap = flex.wrap;
      layoutPreview.style.justifyContent = flex.justifyContent;
      layoutPreview.style.alignItems = flex.alignItems;
      layoutPreview.style.alignContent = flex.alignContent;
      layoutPreview.style.gap = `${flex.gap}px`;

      // Aplicar propriedades aos itens
      Array.from(layoutPreview.children).forEach((item, index) => {
        if (index < layoutState.items.length) {
          const itemData = layoutState.items[index];
          item.style.flexGrow = itemData.flexGrow;
          item.style.flexShrink = itemData.flexShrink;
          item.style.flexBasis = itemData.flexBasis;
          item.style.alignSelf = itemData.alignSelf;
          item.style.order = itemData.order;
        }
      });
    } else {
      // Aplicar propriedades grid
      const grid = layoutState.container.grid;
      layoutPreview.style.display = "grid";
      layoutPreview.style.gridTemplateColumns = grid.templateColumns;
      layoutPreview.style.gridTemplateRows = grid.templateRows;
      layoutPreview.style.gap = `${grid.gap}px`;
      layoutPreview.style.columnGap = `${grid.columnGap}px`;
      layoutPreview.style.rowGap = `${grid.rowGap}px`;
      layoutPreview.style.justifyItems = grid.justifyItems;
      layoutPreview.style.alignItems = grid.alignItems;
      layoutPreview.style.justifyContent = grid.justifyContent;
      layoutPreview.style.alignContent = grid.alignContent;

      // Aplicar propriedades aos itens
      Array.from(layoutPreview.children).forEach((item, index) => {
        if (index < layoutState.items.length) {
          const itemData = layoutState.items[index];

          if (itemData.gridArea) {
            item.style.gridArea = itemData.gridArea;
          } else {
            item.style.gridColumnStart = itemData.gridColumnStart;
            item.style.gridColumnEnd = itemData.gridColumnEnd;
            item.style.gridRowStart = itemData.gridRowStart;
            item.style.gridRowEnd = itemData.gridRowEnd;
          }

          item.style.justifySelf = itemData.justifySelf;
          item.style.alignSelf = itemData.alignSelf;
        }
      });
    }
  }

  function updateCSSOutput() {
    let cssText = "";

    if (layoutState.codeFormat === "css") {
      cssText = generateCSS();
    } else {
      cssText = generateSCSS();
    }

    cssOutput.textContent = cssText;
  }

  function generateCSS() {
    let css = "";

    if (layoutState.type === "flexbox") {
      // CSS para o container
      const flex = layoutState.container.flexbox;
      css += ".container {\n";
      css += "  display: flex;\n";
      css += `  flex-direction: ${flex.direction};\n`;
      css += `  flex-wrap: ${flex.wrap};\n`;
      css += `  justify-content: ${flex.justifyContent};\n`;
      css += `  align-items: ${flex.alignItems};\n`;
      css += `  align-content: ${flex.alignContent};\n`;
      css += `  gap: ${flex.gap}px;\n`;
      css += "}\n\n";

      // CSS para os itens
      // Verificar se todos os itens têm as mesmas propriedades
      const allSameProps = allItemsHaveSameFlexProps();

      if (allSameProps) {
        // CSS para todos os itens
        const item = layoutState.items[0];
        css += ".item {\n";

        if (item.flexGrow !== 0) {
          css += `  flex-grow: ${item.flexGrow};\n`;
        }

        if (item.flexShrink !== 1) {
          css += `  flex-shrink: ${item.flexShrink};\n`;
        }

        if (item.flexBasis !== "auto") {
          css += `  flex-basis: ${item.flexBasis};\n`;
        }

        if (item.alignSelf !== "auto") {
          css += `  align-self: ${item.alignSelf};\n`;
        }

        if (item.order !== 0) {
          css += `  order: ${item.order};\n`;
        }

        css += "}\n";
      } else {
        // CSS para itens individuais
        layoutState.items.forEach((item, index) => {
          css += `.item:nth-child(${index + 1}) {\n`;

          if (item.flexGrow !== 0) {
            css += `  flex-grow: ${item.flexGrow};\n`;
          }

          if (item.flexShrink !== 1) {
            css += `  flex-shrink: ${item.flexShrink};\n`;
          }

          if (item.flexBasis !== "auto") {
            css += `  flex-basis: ${item.flexBasis};\n`;
          }

          if (item.alignSelf !== "auto") {
            css += `  align-self: ${item.alignSelf};\n`;
          }

          if (item.order !== 0) {
            css += `  order: ${item.order};\n`;
          }

          css += "}\n";
        });
      }
    } else {
      // CSS para o container grid
      const grid = layoutState.container.grid;
      css += ".container {\n";
      css += "  display: grid;\n";
      css += `  grid-template-columns: ${grid.templateColumns};\n`;

      if (grid.templateRows !== "auto") {
        css += `  grid-template-rows: ${grid.templateRows};\n`;
      }

      if (grid.gap === grid.columnGap && grid.gap === grid.rowGap) {
        css += `  gap: ${grid.gap}px;\n`;
      } else {
        css += `  column-gap: ${grid.columnGap}px;\n`;
        css += `  row-gap: ${grid.rowGap}px;\n`;
      }

      if (grid.justifyItems !== "stretch") {
        css += `  justify-items: ${grid.justifyItems};\n`;
      }

      if (grid.alignItems !== "stretch") {
        css += `  align-items: ${grid.alignItems};\n`;
      }

      if (grid.justifyContent !== "start") {
        css += `  justify-content: ${grid.justifyContent};\n`;
      }

      if (grid.alignContent !== "start") {
        css += `  align-content: ${grid.alignContent};\n`;
      }

      css += "}\n\n";

      // CSS para os itens
      // Verificar se algum item tem propriedades personalizadas
      let hasCustomProps = false;

      layoutState.items.forEach((item) => {
        if (
          item.gridColumnStart !== "auto" ||
          item.gridColumnEnd !== "auto" ||
          item.gridRowStart !== "auto" ||
          item.gridRowEnd !== "auto" ||
          item.justifySelf !== "auto" ||
          item.alignSelf !== "auto" ||
          item.gridArea !== ""
        ) {
          hasCustomProps = true;
        }
      });

      if (hasCustomProps) {
        layoutState.items.forEach((item, index) => {
          let hasProperties = false;

          // Somente adicionar regra CSS se o item tiver propriedades definidas
          if (
            item.gridArea !== "" ||
            item.gridColumnStart !== "auto" ||
            item.gridColumnEnd !== "auto" ||
            item.gridRowStart !== "auto" ||
            item.gridRowEnd !== "auto" ||
            item.justifySelf !== "auto" ||
            item.alignSelf !== "auto"
          ) {
            css += `.item:nth-child(${index + 1}) {\n`;

            if (item.gridArea !== "") {
              css += `  grid-area: ${item.gridArea};\n`;
              hasProperties = true;
            } else {
              if (item.gridColumnStart !== "auto") {
                css += `  grid-column-start: ${item.gridColumnStart};\n`;
                hasProperties = true;
              }

              if (item.gridColumnEnd !== "auto") {
                css += `  grid-column-end: ${item.gridColumnEnd};\n`;
                hasProperties = true;
              }

              if (item.gridRowStart !== "auto") {
                css += `  grid-row-start: ${item.gridRowStart};\n`;
                hasProperties = true;
              }

              if (item.gridRowEnd !== "auto") {
                css += `  grid-row-end: ${item.gridRowEnd};\n`;
                hasProperties = true;
              }
            }

            if (item.justifySelf !== "auto") {
              css += `  justify-self: ${item.justifySelf};\n`;
              hasProperties = true;
            }

            if (item.alignSelf !== "auto") {
              css += `  align-self: ${item.alignSelf};\n`;
              hasProperties = true;
            }

            if (hasProperties) {
              css += "}\n\n";
            } else {
              // Remove a regra CSS vazia
              css = css.substring(
                0,
                css.lastIndexOf(`.item:nth-child(${index + 1}) {\n`)
              );
            }
          }
        });
      }
    }

    return css;
  }

  function generateSCSS() {
    let scss = "";

    if (layoutState.type === "flexbox") {
      // SCSS para o container
      const flex = layoutState.container.flexbox;
      scss += ".container {\n";
      scss += "  display: flex;\n";
      scss += `  flex-direction: ${flex.direction};\n`;
      scss += `  flex-wrap: ${flex.wrap};\n`;
      scss += `  justify-content: ${flex.justifyContent};\n`;
      scss += `  align-items: ${flex.alignItems};\n`;
      scss += `  align-content: ${flex.alignContent};\n`;
      scss += `  gap: ${flex.gap}px;\n\n`;

      // SCSS aninhado para os itens
      scss += "  .item {\n";

      // Verificar se todos os itens têm as mesmas propriedades
      const allSameProps = allItemsHaveSameFlexProps();

      if (allSameProps) {
        // SCSS para todos os itens
        const item = layoutState.items[0];

        if (item.flexGrow !== 0) {
          scss += `    flex-grow: ${item.flexGrow};\n`;
        }

        if (item.flexShrink !== 1) {
          scss += `    flex-shrink: ${item.flexShrink};\n`;
        }

        if (item.flexBasis !== "auto") {
          scss += `    flex-basis: ${item.flexBasis};\n`;
        }

        if (item.alignSelf !== "auto") {
          scss += `    align-self: ${item.alignSelf};\n`;
        }

        if (item.order !== 0) {
          scss += `    order: ${item.order};\n`;
        }
      } else {
        // SCSS para itens individuais
        layoutState.items.forEach((item, index) => {
          scss += `    &:nth-child(${index + 1}) {\n`;

          if (item.flexGrow !== 0) {
            scss += `      flex-grow: ${item.flexGrow};\n`;
          }

          if (item.flexShrink !== 1) {
            scss += `      flex-shrink: ${item.flexShrink};\n`;
          }

          if (item.flexBasis !== "auto") {
            scss += `      flex-basis: ${item.flexBasis};\n`;
          }

          if (item.alignSelf !== "auto") {
            scss += `      align-self: ${item.alignSelf};\n`;
          }

          if (item.order !== 0) {
            scss += `      order: ${item.order};\n`;
          }

          scss += "    }\n";
        });
      }

      scss += "  }\n";
      scss += "}\n";
    } else {
      // SCSS para o container grid
      const grid = layoutState.container.grid;
      scss += ".container {\n";
      scss += "  display: grid;\n";
      scss += `  grid-template-columns: ${grid.templateColumns};\n`;

      if (grid.templateRows !== "auto") {
        scss += `  grid-template-rows: ${grid.templateRows};\n`;
      }

      if (grid.gap === grid.columnGap && grid.gap === grid.rowGap) {
        scss += `  gap: ${grid.gap}px;\n`;
      } else {
        scss += `  column-gap: ${grid.columnGap}px;\n`;
        scss += `  row-gap: ${grid.rowGap}px;\n`;
      }

      if (grid.justifyItems !== "stretch") {
        scss += `  justify-items: ${grid.justifyItems};\n`;
      }

      if (grid.alignItems !== "stretch") {
        scss += `  align-items: ${grid.alignItems};\n`;
      }

      if (grid.justifyContent !== "start") {
        scss += `  justify-content: ${grid.justifyContent};\n`;
      }

      if (grid.alignContent !== "start") {
        scss += `  align-content: ${grid.alignContent};\n`;
      }

      scss += "\n";

      // SCSS aninhado para os itens
      scss += "  .item {\n";

      // Verificar se algum item tem propriedades personalizadas
      let hasCustomProps = false;

      layoutState.items.forEach((item) => {
        if (
          item.gridColumnStart !== "auto" ||
          item.gridColumnEnd !== "auto" ||
          item.gridRowStart !== "auto" ||
          item.gridRowEnd !== "auto" ||
          item.justifySelf !== "auto" ||
          item.alignSelf !== "auto" ||
          item.gridArea !== ""
        ) {
          hasCustomProps = true;
        }
      });

      if (hasCustomProps) {
        layoutState.items.forEach((item, index) => {
          let hasProperties = false;

          // Somente adicionar regra SCSS se o item tiver propriedades definidas
          if (
            item.gridArea !== "" ||
            item.gridColumnStart !== "auto" ||
            item.gridColumnEnd !== "auto" ||
            item.gridRowStart !== "auto" ||
            item.gridRowEnd !== "auto" ||
            item.justifySelf !== "auto" ||
            item.alignSelf !== "auto"
          ) {
            scss += `    &:nth-child(${index + 1}) {\n`;

            if (item.gridArea !== "") {
              scss += `      grid-area: ${item.gridArea};\n`;
              hasProperties = true;
            } else {
              if (item.gridColumnStart !== "auto") {
                scss += `      grid-column-start: ${item.gridColumnStart};\n`;
                hasProperties = true;
              }

              if (item.gridColumnEnd !== "auto") {
                scss += `      grid-column-end: ${item.gridColumnEnd};\n`;
                hasProperties = true;
              }

              if (item.gridRowStart !== "auto") {
                scss += `      grid-row-start: ${item.gridRowStart};\n`;
                hasProperties = true;
              }

              if (item.gridRowEnd !== "auto") {
                scss += `      grid-row-end: ${item.gridRowEnd};\n`;
                hasProperties = true;
              }
            }

            if (item.justifySelf !== "auto") {
              scss += `      justify-self: ${item.justifySelf};\n`;
              hasProperties = true;
            }

            if (item.alignSelf !== "auto") {
              scss += `      align-self: ${item.alignSelf};\n`;
              hasProperties = true;
            }

            if (hasProperties) {
              scss += "    }\n";
            }
          }
        });
      }

      scss += "  }\n";
      scss += "}\n";
    }

    return scss;
  }

  function renderItems() {
    // Limpar preview
    layoutPreview.innerHTML = "";

    // Adicionar itens
    layoutState.items.forEach((item) => {
      const itemElement = document.createElement("div");
      itemElement.className = "preview-item";
      itemElement.textContent = item.id;
      layoutPreview.appendChild(itemElement);
    });
  }

  function updateItemSelection() {
    // Remover seleção anterior
    Array.from(layoutPreview.children).forEach((item) => {
      item.classList.remove("selected");
    });

    // Adicionar seleção ao item ativo
    if (
      layoutState.activeItem !== null &&
      layoutState.activeItem < layoutPreview.children.length
    ) {
      layoutPreview.children[layoutState.activeItem].classList.add("selected");

      // Atualizar controles com valores do item selecionado
      const item = layoutState.items[layoutState.activeItem];

      if (layoutState.type === "flexbox") {
        // Mostrar controles de item individual
        document.querySelector(".select-item-message").style.display = "none";
        document.querySelector(
          "#individual-item-tab .item-controls"
        ).style.display = "block";

        // Atualizar valores dos controles
        document.getElementById("align-self").value = item.alignSelf;
        document.getElementById("flex-grow").value = item.flexGrow;
        document.getElementById("flex-shrink").value = item.flexShrink;

        // Tratar flex-basis e sua unidade
        if (item.flexBasis === "auto") {
          document.getElementById("flex-basis").value = "auto";
          document.getElementById("flex-basis-unit").value = "";
        } else {
          // Extrair valor e unidade
          const match = item.flexBasis.match(/^([0-9.]+)(.*)$/);
          if (match) {
            document.getElementById("flex-basis").value = match[1];
            document.getElementById("flex-basis-unit").value = match[2] || "";
          } else {
            document.getElementById("flex-basis").value = item.flexBasis;
            document.getElementById("flex-basis-unit").value = "";
          }
        }

        document.getElementById("flex-order").value = item.order;
      } else {
        // Mostrar controles de item individual
        document.querySelector(".select-item-message").style.display = "none";
        document.querySelector(
          "#individual-grid-item-tab .item-controls"
        ).style.display = "block";

        // Atualizar valores dos controles
        document.getElementById("grid-column-start").value =
          item.gridColumnStart;
        document.getElementById("grid-column-end").value = item.gridColumnEnd;
        document.getElementById("grid-row-start").value = item.gridRowStart;
        document.getElementById("grid-row-end").value = item.gridRowEnd;
        document.getElementById("justify-self").value = item.justifySelf;
        document.getElementById("align-self-grid").value = item.alignSelf;
        document.getElementById("grid-area").value = item.gridArea;
      }
    } else {
      // Esconder controles de item individual
      const selectMessages = document.querySelectorAll(".select-item-message");
      const itemControls = document.querySelectorAll(".item-controls");

      selectMessages.forEach((msg) => (msg.style.display = "flex"));
      itemControls.forEach((ctrl) => (ctrl.style.display = "none"));
    }
  }

  function allItemsHaveSameFlexProps() {
    if (layoutState.items.length <= 1) {
      return true;
    }

    const firstItem = layoutState.items[0];

    return layoutState.items.every(
      (item) =>
        item.flexGrow === firstItem.flexGrow &&
        item.flexShrink === firstItem.flexShrink &&
        item.flexBasis === firstItem.flexBasis &&
        item.alignSelf === firstItem.alignSelf &&
        item.order === firstItem.order
    );
  }

  function openGridBuilder(type) {
    layoutState.gridBuilder.type = type;

    // Atualizar UI
    builderTypes.forEach((t) => {
      if (t.getAttribute("data-type") === type) {
        t.classList.add("active");
      } else {
        t.classList.remove("active");
      }
    });

    // Obter valores atuais
    let template;
    if (type === "columns") {
      template = layoutState.container.grid.templateColumns;
    } else {
      template = layoutState.container.grid.templateRows;
    }

    // Tentar extrair valores do template
    let unit = "fr";
    let count = 3;
    let values = [1, 1, 1];

    // Verificar se o template usa repeat()
    const repeatMatch = template.match(/repeat\((\d+),\s*(\d+)([a-z%]+)\)/);
    if (repeatMatch) {
      count = parseInt(repeatMatch[1]);
      values = Array(count).fill(parseInt(repeatMatch[2]));
      unit = repeatMatch[3];
    } else {
      // Tentar extrair valores separados por espaço
      const parts = template.trim().split(/\s+/);
      count = parts.length;

      // Extrair valores e unidade
      values = [];
      const valueMatches = parts.map((part) =>
        part.match(/^([0-9.]+)([a-z%]*)$/)
      );

      if (valueMatches.every((match) => match)) {
        unit = valueMatches[0][2] || "fr"; // Usar primeira unidade encontrada
        values = valueMatches.map((match) => parseFloat(match[1]));
      }
    }

    // Atualizar estado
    layoutState.gridBuilder.unit = unit;
    layoutState.gridBuilder.count = count;
    layoutState.gridBuilder.values = values;

    // Atualizar UI
    gridUnit.value = unit;
    gridCount.value = count;

    updateGridBuilder();
    gridBuilderModal.style.display = "flex";
  }

  function updateGridBuilder() {
    const { unit, count, values, type } = layoutState.gridBuilder;

    // Atualizar sliders
    gridValueSliders.innerHTML = "";

    for (let i = 0; i < count; i++) {
      const value = values[i] || 1;

      const sliderRow = document.createElement("div");
      sliderRow.className = "slider-row";

      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = 1;
      slider.max = 12;
      slider.value = value;
      slider.className = "grid-value-slider";
      slider.dataset.index = i;

      slider.addEventListener("input", function () {
        const index = parseInt(this.dataset.index);
        const value = parseInt(this.value);
        layoutState.gridBuilder.values[index] = value;
        this.nextElementSibling.textContent = `${value}${unit}`;
        updateTemplateOutput();
        updateBuilderPreview();
      });

      const valueDisplay = document.createElement("span");
      valueDisplay.className = "slider-value";
      valueDisplay.textContent = `${value}${unit}`;

      sliderRow.appendChild(slider);
      sliderRow.appendChild(valueDisplay);
      gridValueSliders.appendChild(sliderRow);
    }

    updateTemplateOutput();
    updateBuilderPreview();
  }

  function updateTemplateOutput() {
    const { unit, count, values } = layoutState.gridBuilder;

    // Verificar se todos os valores são iguais
    const allSame = values.every((val) => val === values[0]);

    if (allSame) {
      // Usar sintaxe repeat()
      templateOutput.value = `repeat(${count}, ${values[0]}${unit})`;
    } else {
      // Usar lista de valores
      templateOutput.value = values.map((val) => `${val}${unit}`).join(" ");
    }
  }

  function updateBuilderPreview() {
    const { type, values, unit } = layoutState.gridBuilder;

    // Limpar preview
    builderPreviewGrid.innerHTML = "";

    // Configurar estilo do grid
    if (type === "columns") {
      builderPreviewGrid.style.gridTemplateColumns = values
        .map((val) => `${val}${unit}`)
        .join(" ");
      builderPreviewGrid.style.gridTemplateRows = "1fr";

      // Adicionar colunas
      values.forEach((val, index) => {
        const col = document.createElement("div");
        col.className = "preview-col";
        col.textContent = `${val}${unit}`;
        builderPreviewGrid.appendChild(col);
      });
    } else {
      builderPreviewGrid.style.gridTemplateRows = values
        .map((val) => `${val}${unit}`)
        .join(" ");
      builderPreviewGrid.style.gridTemplateColumns = "1fr";

      // Adicionar linhas
      values.forEach((val, index) => {
        const row = document.createElement("div");
        row.className = "preview-row";
        row.textContent = `${val}${unit}`;
        builderPreviewGrid.appendChild(row);
      });
    }
  }

  function resetFlexboxLayout() {
    layoutState.container.flexbox = {
      direction: "row",
      wrap: "wrap",
      justifyContent: "flex-start",
      alignItems: "flex-start",
      alignContent: "flex-start",
      gap: 10,
    };

    // Resetar itens
    layoutState.items.forEach((item) => {
      item.flexGrow = 0;
      item.flexShrink = 1;
      item.flexBasis = "auto";
      item.alignSelf = "auto";
      item.order = 0;
    });

    // Resetar UI
    document.getElementById("flex-direction").value = "row";
    document.getElementById("flex-wrap").value = "wrap";
    document.getElementById("justify-content").value = "flex-start";
    document.getElementById("align-items").value = "flex-start";
    document.getElementById("align-content").value = "flex-start";
    document.getElementById("flex-gap").value = 10;
    document.getElementById("flex-gap-value").textContent = "10px";

    document.getElementById("align-self-all").value = "auto";
    document.getElementById("flex-grow-all").value = 0;
    document.getElementById("flex-shrink-all").value = 1;
    document.getElementById("flex-basis-all").value = "auto";
    document.getElementById("flex-basis-unit-all").value = "";
  }

  function resetGridLayout() {
    layoutState.container.grid = {
      templateColumns: "repeat(3, 1fr)",
      templateRows: "auto",
      gap: 10,
      columnGap: 10,
      rowGap: 10,
      justifyItems: "stretch",
      alignItems: "stretch",
      justifyContent: "start",
      alignContent: "start",
    };

    // Resetar itens
    layoutState.items.forEach((item) => {
      item.gridColumnStart = "auto";
      item.gridColumnEnd = "auto";
      item.gridRowStart = "auto";
      item.gridRowEnd = "auto";
      item.justifySelf = "auto";
      item.alignSelf = "auto";
      item.gridArea = "";
    });

    // Resetar UI
    document.getElementById("grid-template-columns").value = "repeat(3, 1fr)";
    document.getElementById("grid-template-rows").value = "auto";
    document.getElementById("grid-gap").value = 10;
    document.getElementById("grid-gap-value").textContent = "10px";
    document.getElementById("grid-column-gap").value = 10;
    document.getElementById("grid-column-gap-value").textContent = "10px";
    document.getElementById("grid-row-gap").value = 10;
    document.getElementById("grid-row-gap-value").textContent = "10px";
    document.getElementById("justify-items").value = "stretch";
    document.getElementById("align-grid-items").value = "stretch";
    document.getElementById("justify-grid-content").value = "start";
    document.getElementById("align-grid-content").value = "start";

    document.getElementById("justify-self-all").value = "auto";
    document.getElementById("align-self-grid-all").value = "auto";
  }

  function applyFlexPreset(preset) {
    // Resetar layout primeiro
    resetFlexboxLayout();

    // Aplicar propriedades do preset ao container
    layoutState.container.flexbox.direction = preset.direction;
    layoutState.container.flexbox.wrap = preset.wrap;
    layoutState.container.flexbox.justifyContent = preset.justifyContent;
    layoutState.container.flexbox.alignItems = preset.alignItems;
    layoutState.container.flexbox.gap = preset.gap;

    // Atualizar controles do container
    document.getElementById("flex-direction").value = preset.direction;
    document.getElementById("flex-wrap").value = preset.wrap;
    document.getElementById("justify-content").value = preset.justifyContent;
    document.getElementById("align-items").value = preset.alignItems;
    document.getElementById("flex-gap").value = preset.gap;
    document.getElementById("flex-gap-value").textContent = preset.gap + "px";

    // Ajustar número de itens se necessário
    if (preset.itemCount !== undefined) {
      // Adicionar ou remover itens conforme necessário
      while (layoutState.items.length < preset.itemCount) {
        addItemBtn.click();
      }

      while (layoutState.items.length > preset.itemCount) {
        removeItemBtn.click();
      }
    }

    // Aplicar propriedades específicas aos itens se fornecidas
    if (preset.items) {
      preset.items.forEach((itemPreset, index) => {
        if (index < layoutState.items.length) {
          const item = layoutState.items[index];

          if (itemPreset.flexGrow !== undefined) {
            item.flexGrow = itemPreset.flexGrow;
          }

          if (itemPreset.flexShrink !== undefined) {
            item.flexShrink = itemPreset.flexShrink;
          }

          if (itemPreset.flexBasis !== undefined) {
            item.flexBasis = itemPreset.flexBasis;
          }

          if (itemPreset.alignSelf !== undefined) {
            item.alignSelf = itemPreset.alignSelf;
          }

          if (itemPreset.order !== undefined) {
            item.order = itemPreset.order;
          }
        }
      });
    }

    updatePreview();
    updateCSSOutput();
  }

  function applyGridPreset(preset) {
    // Resetar layout primeiro
    resetGridLayout();

    // Aplicar propriedades do preset ao container
    layoutState.container.grid.templateColumns = preset.templateColumns;
    layoutState.container.grid.templateRows = preset.templateRows;
    layoutState.container.grid.gap = preset.gap;
    layoutState.container.grid.columnGap = preset.gap;
    layoutState.container.grid.rowGap = preset.gap;

    // Atualizar controles do container
    document.getElementById("grid-template-columns").value =
      preset.templateColumns;
    document.getElementById("grid-template-rows").value = preset.templateRows;
    document.getElementById("grid-gap").value = preset.gap;
    document.getElementById("grid-gap-value").textContent = preset.gap + "px";
    document.getElementById("grid-column-gap").value = preset.gap;
    document.getElementById("grid-column-gap-value").textContent =
      preset.gap + "px";
    document.getElementById("grid-row-gap").value = preset.gap;
    document.getElementById("grid-row-gap-value").textContent =
      preset.gap + "px";

    // Ajustar número de itens se necessário
    if (preset.itemCount !== undefined) {
      // Adicionar ou remover itens conforme necessário
      while (layoutState.items.length < preset.itemCount) {
        addItemBtn.click();
      }

      while (layoutState.items.length > preset.itemCount) {
        removeItemBtn.click();
      }
    }

    // Aplicar propriedades específicas aos itens se fornecidas
    if (preset.items) {
      preset.items.forEach((itemPreset, index) => {
        if (index < layoutState.items.length) {
          const item = layoutState.items[index];

          if (itemPreset.gridArea !== undefined) {
            item.gridArea = itemPreset.gridArea;
          }

          if (itemPreset.gridColumnStart !== undefined) {
            item.gridColumnStart = itemPreset.gridColumnStart;
          }

          if (itemPreset.gridColumnEnd !== undefined) {
            item.gridColumnEnd = itemPreset.gridColumnEnd;
          }

          if (itemPreset.gridRowStart !== undefined) {
            item.gridRowStart = itemPreset.gridRowStart;
          }

          if (itemPreset.gridRowEnd !== undefined) {
            item.gridRowEnd = itemPreset.gridRowEnd;
          }

          if (itemPreset.justifySelf !== undefined) {
            item.justifySelf = itemPreset.justifySelf;
          }

          if (itemPreset.alignSelf !== undefined) {
            item.alignSelf = itemPreset.alignSelf;
          }
        }
      });
    }

    // Aplicar CSS adicional se fornecido
    if (preset.extraCSS) {
      const match = preset.extraCSS.match(/([^:]+):\s*(.+)/);
      if (match) {
        const property = match[1].trim();
        const value = match[2].trim();
        layoutState.container.grid[property] = value;
      }
    }

    updatePreview();
    updateCSSOutput();
  }

  function copyToClipboard(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);

    showMessage("Código copiado para a área de transferência!");
  }

  function showMessage(message) {
    // Criar elemento de mensagem
    const messageElement = document.createElement("div");
    messageElement.className = "message-popup";
    messageElement.textContent = message;

    // Adicionar ao DOM
    document.body.appendChild(messageElement);

    // Remover após 3 segundos
    setTimeout(function () {
      messageElement.classList.add("fade-out");
      setTimeout(function () {
        document.body.removeChild(messageElement);
      }, 500);
    }, 2500);
  }

  // Inicializar a interface com os itens
  renderItems();
});
