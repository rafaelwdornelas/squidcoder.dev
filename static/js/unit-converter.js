// static/js/unit-converter.js
document.addEventListener("DOMContentLoaded", function () {
  // Unidades disponíveis por categoria
  const units = {
    temperature: [
      { name: "Celsius (°C)", value: "celsius" },
      { name: "Fahrenheit (°F)", value: "fahrenheit" },
      { name: "Kelvin (K)", value: "kelvin" },
    ],
    weight: [
      { name: "Quilograma (kg)", value: "kilogram" },
      { name: "Grama (g)", value: "gram" },
      { name: "Miligrama (mg)", value: "milligram" },
      { name: "Libra (lb)", value: "pound" },
      { name: "Onça (oz)", value: "ounce" },
      { name: "Tonelada (t)", value: "ton" },
    ],
    volume: [
      { name: "Litro (L)", value: "liter" },
      { name: "Mililitro (mL)", value: "milliliter" },
      { name: "Galão (gal)", value: "gallon" },
      { name: "Quartilho (qt)", value: "quart" },
      { name: "Pinta (pt)", value: "pint" },
      { name: "Xícara (cup)", value: "cup" },
      { name: "Onça fluida (fl oz)", value: "fluid_ounce" },
      { name: "Metro cúbico (m³)", value: "cubic_meter" },
    ],
    length: [
      { name: "Metro (m)", value: "meter" },
      { name: "Centímetro (cm)", value: "centimeter" },
      { name: "Milímetro (mm)", value: "millimeter" },
      { name: "Quilômetro (km)", value: "kilometer" },
      { name: "Polegada (in)", value: "inch" },
      { name: "Pé (ft)", value: "foot" },
      { name: "Jarda (yd)", value: "yard" },
      { name: "Milha (mi)", value: "mile" },
    ],
  };

  // Elementos DOM
  const tabs = document.querySelectorAll(".converter-tab");
  const fromUnitSelect = document.getElementById("from-unit");
  const toUnitSelect = document.getElementById("to-unit");
  const valueInput = document.getElementById("value-input");
  const resultInput = document.getElementById("result-input");
  const swapButton = document.getElementById("swap-units-btn");
  const formulaText = document.getElementById("formula-text");
  const referenceTable = document
    .getElementById("reference-table")
    .querySelector("tbody");

  // Categoria atual
  let currentCategory = "temperature";

  // Inicializar conversor
  loadUnits(currentCategory);
  updateConversion();

  // Event listeners para as abas
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remover classe ativa de todas as abas
      tabs.forEach((t) => t.classList.remove("active"));

      // Adicionar classe ativa à aba clicada
      tab.classList.add("active");

      // Atualizar categoria atual
      currentCategory = tab.dataset.category;

      // Carregar unidades da categoria selecionada
      loadUnits(currentCategory);

      // Atualizar conversão
      updateConversion();
    });
  });

  // Event listeners para inputs e seletores
  valueInput.addEventListener("input", updateConversion);
  fromUnitSelect.addEventListener("change", updateConversion);
  toUnitSelect.addEventListener("change", updateConversion);

  // Event listener para botão de troca
  swapButton.addEventListener("click", () => {
    // Salvar valores atuais
    const fromValue = fromUnitSelect.value;
    const toValue = toUnitSelect.value;

    // Trocar valores
    fromUnitSelect.value = toValue;
    toUnitSelect.value = fromValue;

    // Atualizar conversão
    updateConversion();
  });

  // Função para carregar unidades da categoria selecionada
  function loadUnits(category) {
    // Limpar seletores
    fromUnitSelect.innerHTML = "";
    toUnitSelect.innerHTML = "";

    // Adicionar opções
    units[category].forEach((unit) => {
      fromUnitSelect.add(new Option(unit.name, unit.value));
      toUnitSelect.add(new Option(unit.name, unit.value));
    });

    // Definir valores padrão
    if (category === "temperature") {
      fromUnitSelect.value = "celsius";
      toUnitSelect.value = "fahrenheit";
    } else {
      fromUnitSelect.selectedIndex = 0;
      toUnitSelect.selectedIndex = 1;
    }
  }

  // Função para atualizar a conversão
  function updateConversion() {
    // Obter valores
    const fromUnit = fromUnitSelect.value;
    const toUnit = toUnitSelect.value;
    const value = parseFloat(valueInput.value) || 0;

    // Fazer a conversão
    const result = convert(value, fromUnit, toUnit);

    // Atualizar input de resultado
    resultInput.value = result.toFixed(6).replace(/\.?0+$/, "");

    // Atualizar fórmula
    updateFormula(fromUnit, toUnit);

    // Atualizar tabela de referência
    updateReferenceTable(fromUnit, toUnit);
  }

  // Função para atualizar a fórmula
  function updateFormula(fromUnit, toUnit) {
    const fromUnitSymbol = getUnitSymbol(fromUnit);
    const toUnitSymbol = getUnitSymbol(toUnit);

    let formula = "Fórmula: ";

    if (currentCategory === "temperature") {
      if (fromUnit === "celsius" && toUnit === "fahrenheit") {
        formula += "°C × 9/5 + 32 = °F";
      } else if (fromUnit === "fahrenheit" && toUnit === "celsius") {
        formula += "(°F - 32) × 5/9 = °C";
      } else if (fromUnit === "celsius" && toUnit === "kelvin") {
        formula += "°C + 273.15 = K";
      } else if (fromUnit === "kelvin" && toUnit === "celsius") {
        formula += "K - 273.15 = °C";
      } else if (fromUnit === "fahrenheit" && toUnit === "kelvin") {
        formula += "(°F - 32) × 5/9 + 273.15 = K";
      } else if (fromUnit === "kelvin" && toUnit === "fahrenheit") {
        formula += "K × 9/5 - 459.67 = °F";
      } else {
        formula += "1 " + fromUnitSymbol + " = 1 " + toUnitSymbol;
      }
    } else {
      // Para outras categorias, mostramos a relação
      const conversionFactor = getConversionFactor(fromUnit, toUnit);
      formula +=
        "1 " +
        fromUnitSymbol +
        " = " +
        conversionFactor.toFixed(6).replace(/\.?0+$/, "") +
        " " +
        toUnitSymbol;
    }

    formulaText.textContent = formula;
  }

  // Função para atualizar a tabela de referência
  function updateReferenceTable(fromUnit, toUnit) {
    // Limpar tabela
    referenceTable.innerHTML = "";

    // Valores de referência
    let referenceValues = [];

    if (currentCategory === "temperature") {
      if (fromUnit === "celsius") {
        referenceValues = [0, 10, 20, 30, 40, 50, 100];
      } else if (fromUnit === "fahrenheit") {
        referenceValues = [32, 50, 68, 86, 104, 122, 212];
      } else {
        // kelvin
        referenceValues = [
          273.15, 283.15, 293.15, 303.15, 313.15, 323.15, 373.15,
        ];
      }
    } else {
      // Para outras categorias, usar múltiplos de 10
      const base = 1;
      referenceValues = [
        base * 0.01,
        base * 0.1,
        base,
        base * 10,
        base * 100,
        base * 1000,
      ];
    }

    // Adicionar linhas à tabela
    referenceValues.forEach((val) => {
      const row = document.createElement("tr");

      const fromCell = document.createElement("td");
      fromCell.textContent = val + " " + getUnitSymbol(fromUnit);

      const toCell = document.createElement("td");
      const convertedValue = convert(val, fromUnit, toUnit);
      toCell.textContent =
        convertedValue.toFixed(6).replace(/\.?0+$/, "") +
        " " +
        getUnitSymbol(toUnit);

      row.appendChild(fromCell);
      row.appendChild(toCell);
      referenceTable.appendChild(row);
    });
  }

  // Função para converter entre unidades
  function convert(value, fromUnit, toUnit) {
    // Se as unidades são iguais, retornar o mesmo valor
    if (fromUnit === toUnit) {
      return value;
    }

    let result = 0;

    // Converter para a unidade base da categoria
    let baseValue = 0;

    if (currentCategory === "temperature") {
      // Conversão para Kelvin (unidade base para temperatura)
      if (fromUnit === "celsius") {
        baseValue = value + 273.15;
      } else if (fromUnit === "fahrenheit") {
        baseValue = ((value + 459.67) * 5) / 9;
      } else {
        // kelvin
        baseValue = value;
      }

      // Conversão de Kelvin para a unidade alvo
      if (toUnit === "celsius") {
        result = baseValue - 273.15;
      } else if (toUnit === "fahrenheit") {
        result = (baseValue * 9) / 5 - 459.67;
      } else {
        // kelvin
        result = baseValue;
      }
    } else {
      // Para outras categorias, usar fatores de conversão
      const fromToBase = getConversionToBase(fromUnit);
      const baseToTo = getConversionToBase(toUnit);

      // Converter para a unidade base e depois para a unidade alvo
      baseValue = value * fromToBase;
      result = baseValue / baseToTo;
    }

    return result;
  }

  // Função para obter símbolo da unidade
  function getUnitSymbol(unit) {
    switch (unit) {
      case "celsius":
        return "°C";
      case "fahrenheit":
        return "°F";
      case "kelvin":
        return "K";
      case "kilogram":
        return "kg";
      case "gram":
        return "g";
      case "milligram":
        return "mg";
      case "pound":
        return "lb";
      case "ounce":
        return "oz";
      case "ton":
        return "t";
      case "liter":
        return "L";
      case "milliliter":
        return "mL";
      case "gallon":
        return "gal";
      case "quart":
        return "qt";
      case "pint":
        return "pt";
      case "cup":
        return "cup";
      case "fluid_ounce":
        return "fl oz";
      case "cubic_meter":
        return "m³";
      case "meter":
        return "m";
      case "centimeter":
        return "cm";
      case "millimeter":
        return "mm";
      case "kilometer":
        return "km";
      case "inch":
        return "in";
      case "foot":
        return "ft";
      case "yard":
        return "yd";
      case "mile":
        return "mi";
      default:
        return "";
    }
  }

  // Função para obter fator de conversão para a unidade base
  function getConversionToBase(unit) {
    // Unidades base por categoria:
    // - Peso: gramas
    // - Volume: mililitros
    // - Distância: milímetros

    switch (unit) {
      // Peso (base: gramas)
      case "kilogram":
        return 1000;
      case "gram":
        return 1;
      case "milligram":
        return 0.001;
      case "pound":
        return 453.592;
      case "ounce":
        return 28.3495;
      case "ton":
        return 1000000;

      // Volume (base: mililitros)
      case "liter":
        return 1000;
      case "milliliter":
        return 1;
      case "gallon":
        return 3785.41;
      case "quart":
        return 946.353;
      case "pint":
        return 473.176;
      case "cup":
        return 236.588;
      case "fluid_ounce":
        return 29.5735;
      case "cubic_meter":
        return 1000000;

      // Distância (base: milímetros)
      case "meter":
        return 1000;
      case "centimeter":
        return 10;
      case "millimeter":
        return 1;
      case "kilometer":
        return 1000000;
      case "inch":
        return 25.4;
      case "foot":
        return 304.8;
      case "yard":
        return 914.4;
      case "mile":
        return 1609344;

      default:
        return 1;
    }
  }

  // Função para obter fator de conversão direto entre duas unidades
  function getConversionFactor(fromUnit, toUnit) {
    const fromToBase = getConversionToBase(fromUnit);
    const baseToTo = getConversionToBase(toUnit);

    return fromToBase / baseToTo;
  }
});
