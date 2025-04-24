// static/js/color-picker.js - Funcionalidades para a ferramenta de seleção de cores

document.addEventListener("DOMContentLoaded", function () {
  const colorPicker = document.getElementById("color-picker");
  if (!colorPicker) return;

  const colorDisplay = document.getElementById("color-display");
  const hexInput = document.getElementById("hex-value");
  const rgbInput = document.getElementById("rgb-value");
  const hslInput = document.getElementById("hsl-value");
  const hueSlider = document.getElementById("hue-slider");
  const saturationSlider = document.getElementById("saturation-slider");
  const lightnessSlider = document.getElementById("lightness-slider");
  const copyColorBtn = document.getElementById("copy-color-btn");
  const monochromaticPalette = document.getElementById("monochromatic-palette");
  const analogousPalette = document.getElementById("analogous-palette");
  const complementaryPalette = document.getElementById("complementary-palette");

  let currentHue = 217;
  let currentSaturation = 91;
  let currentLightness = 60;

  // Converter HSL para RGB
  const hslToRgb = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  // Converter RGB para HEX
  const rgbToHex = (r, g, b) => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  };

  // Atualizar valores de cor
  const updateColor = () => {
    const rgb = hslToRgb(currentHue, currentSaturation, currentLightness);
    const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);

    // Atualizar visualização de cor
    colorDisplay.style.backgroundColor = `hsl(${currentHue}, ${currentSaturation}%, ${currentLightness}%)`;

    // Atualizar inputs
    hexInput.value = hex;
    rgbInput.value = `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`;
    hslInput.value = `${currentHue}, ${currentSaturation}%, ${currentLightness}%`;

    // Atualizar paletas
    updatePalettes(currentHue, currentSaturation, currentLightness);
  };

  // Atualizar paletas de cores
  const updatePalettes = (h, s, l) => {
    // Limpar paletas
    monochromaticPalette.innerHTML = "";
    analogousPalette.innerHTML = "";
    complementaryPalette.innerHTML = "";

    // Paleta monocromática (diferentes valores de luminosidade)
    const luminosities = [20, 40, 60, 80, 100];
    luminosities.forEach((lum) => {
      const color = document.createElement("div");
      color.style.backgroundColor = `hsl(${h}, ${s}%, ${lum}%)`;
      color.dataset.hsl = `${h}, ${s}%, ${lum}%`;
      color.addEventListener("click", () => {
        currentLightness = lum;
        lightnessSlider.value = lum;
        updateColor();
      });
      monochromaticPalette.appendChild(color);
    });

    // Paleta análoga (cores adjacentes no círculo cromático)
    const analogousHues = [h - 30, h - 15, h, h + 15, h + 30];
    analogousHues.forEach((hue) => {
      const wrappedHue = ((hue % 360) + 360) % 360; // Garantir que o valor esteja entre 0-360
      const color = document.createElement("div");
      color.style.backgroundColor = `hsl(${wrappedHue}, ${s}%, ${l}%)`;
      color.dataset.hsl = `${wrappedHue}, ${s}%, ${l}%`;
      color.addEventListener("click", () => {
        currentHue = wrappedHue;
        hueSlider.value = wrappedHue;
        updateColor();
      });
      analogousPalette.appendChild(color);
    });

    // Paleta complementar (cores opostas no círculo cromático)
    const complementaryHue = (h + 180) % 360;
    const complementaryColors = [
      `hsl(${h}, ${s}%, ${l}%)`,
      `hsl(${h}, ${s / 2}%, ${l}%)`,
      `hsl(${complementaryHue}, ${s}%, ${l}%)`,
      `hsl(${complementaryHue}, ${s}%, ${l + 10}%)`,
      `hsl(${complementaryHue}, ${s}%, ${l - 10}%)`,
    ];

    complementaryColors.forEach((color, index) => {
      const colorDiv = document.createElement("div");
      colorDiv.style.backgroundColor = color;
      colorDiv.dataset.color = color;
      colorDiv.addEventListener("click", () => {
        const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (match) {
          currentHue = parseInt(match[1]);
          currentSaturation = parseInt(match[2]);
          currentLightness = parseInt(match[3]);
          hueSlider.value = currentHue;
          saturationSlider.value = currentSaturation;
          lightnessSlider.value = currentLightness;
          updateColor();
        }
      });
      complementaryPalette.appendChild(colorDiv);
    });
  };

  // Adicionar event listeners
  if (hueSlider) {
    hueSlider.addEventListener("input", () => {
      currentHue = parseInt(hueSlider.value);
      updateColor();
    });
  }

  if (saturationSlider) {
    saturationSlider.addEventListener("input", () => {
      currentSaturation = parseInt(saturationSlider.value);
      updateColor();
    });
  }

  if (lightnessSlider) {
    lightnessSlider.addEventListener("input", () => {
      currentLightness = parseInt(lightnessSlider.value);
      updateColor();
    });
  }

  if (copyColorBtn) {
    copyColorBtn.addEventListener("click", () => {
      // Determinar qual formato copiar (HEX por padrão)
      const textToCopy = hexInput.value;

      // Criar elemento temporário para cópia
      const tempInput = document.createElement("input");
      tempInput.value = textToCopy;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);

      // Feedback visual
      const originalText = copyColorBtn.textContent;
      copyColorBtn.textContent = "Copiado! ✓";

      setTimeout(() => {
        copyColorBtn.textContent = originalText;
      }, 2000);
    });
  }

  // Inicializar
  if (colorDisplay) {
    updateColor();
  }
});
