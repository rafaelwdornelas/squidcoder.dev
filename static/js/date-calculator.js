// static/js/date-calculator.js
document.addEventListener("DOMContentLoaded", function () {
  // Elementos DOM - Modo de Diferença
  const tabs = document.querySelectorAll(".calculator-tab");
  const tabContents = document.querySelectorAll(".calculator-content");
  const startDateInput = document.getElementById("start-date");
  const endDateInput = document.getElementById("end-date");
  const workdaysOnlyCheckbox = document.getElementById("workdays-only");
  const includeEndDateCheckbox = document.getElementById("include-end-date");
  const excludeHolidaysCheckbox = document.getElementById("exclude-holidays");
  const calculateBtn = document.getElementById("calculate-btn");
  const swapDatesBtn = document.getElementById("swap-dates-btn");
  const todayBtn = document.getElementById("today-btn");
  const daysResult = document.getElementById("days-result");
  const weeksResult = document.getElementById("weeks-result");
  const monthsResult = document.getElementById("months-result");
  const yearsResult = document.getElementById("years-result");
  const detailResult = document.getElementById("detail-result");

  // Elementos DOM - Modo de Adição
  const baseDateInput = document.getElementById("base-date");
  const addYearsInput = document.getElementById("add-years");
  const addMonthsInput = document.getElementById("add-months");
  const addDaysInput = document.getElementById("add-days");
  const addWorkdaysOnlyCheckbox = document.getElementById("add-workdays-only");
  const addCalculateBtn = document.getElementById("add-calculate-btn");
  const addTodayBtn = document.getElementById("add-today-btn");
  const addResultDate = document.getElementById("add-result-date");

  // Elementos DOM - Modo de Subtração
  const subBaseDateInput = document.getElementById("sub-base-date");
  const subYearsInput = document.getElementById("sub-years");
  const subMonthsInput = document.getElementById("sub-months");
  const subDaysInput = document.getElementById("sub-days");
  const subWorkdaysOnlyCheckbox = document.getElementById("sub-workdays-only");
  const subCalculateBtn = document.getElementById("sub-calculate-btn");
  const subTodayBtn = document.getElementById("sub-today-btn");
  const subResultDate = document.getElementById("sub-result-date");

  // Feriados nacionais brasileiros (fixos e móveis)
  // Utilizamos uma função para calcular os feriados de um determinado ano
  const getBrazilianHolidays = (year) => {
    const holidays = [
      // Feriados fixos
      new Date(year, 0, 1), // Ano Novo
      new Date(year, 3, 21), // Tiradentes
      new Date(year, 4, 1), // Dia do Trabalho
      new Date(year, 8, 7), // Independência
      new Date(year, 9, 12), // Nossa Senhora Aparecida
      new Date(year, 10, 2), // Finados
      new Date(year, 10, 15), // Proclamação da República
      new Date(year, 11, 25), // Natal

      // Feriados móveis (calculados para o ano específico)
      calculateEaster(year),
      calculateCorpusChristi(year),
      calculateCarnaval(year),
    ];

    return holidays;
  };

  // Função para calcular a Páscoa (Algoritmo de Gauss)
  function calculateEaster(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const day = ((h + l - 7 * m + 114) % 31) + 1;

    return new Date(year, month, day);
  }

  // Função para calcular Corpus Christi (60 dias após a Páscoa)
  function calculateCorpusChristi(year) {
    const easter = calculateEaster(year);
    const corpusChristi = new Date(easter);
    corpusChristi.setDate(easter.getDate() + 60);
    return corpusChristi;
  }

  // Função para calcular o Carnaval (47 dias antes da Páscoa)
  function calculateCarnaval(year) {
    const easter = calculateEaster(year);
    const carnaval = new Date(easter);
    carnaval.setDate(easter.getDate() - 47);
    return carnaval;
  }

  // Inicializar com a data atual
  function initDates() {
    const today = new Date();
    const formattedDate = formatDateForInput(today);

    startDateInput.value = formattedDate;
    endDateInput.value = formattedDate;
    baseDateInput.value = formattedDate;
    subBaseDateInput.value = formattedDate;
  }

  // Formatar data para input
  function formatDateForInput(date) {
    return date.toISOString().split("T")[0];
  }

  // Formatar data para exibição
  function formatDateForDisplay(date) {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("pt-BR", options);
  }

  // Alternar entre as abas
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remover classe ativa de todas as abas
      tabs.forEach((t) => t.classList.remove("active"));

      // Adicionar classe ativa à aba clicada
      tab.classList.add("active");

      // Ocultar todos os conteúdos
      tabContents.forEach((content) => {
        content.classList.add("hidden");
      });

      // Mostrar o conteúdo correspondente à aba ativa
      const activeMode = tab.dataset.mode;
      document.getElementById(activeMode + "-mode").classList.remove("hidden");
    });
  });

  // Calcular dias úteis entre duas datas
  function calculateWorkdays(
    startDate,
    endDate,
    includeEndDate,
    excludeHolidays
  ) {
    let workdays = 0;
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    // Se incluir o último dia, adicionar um dia ao final
    if (includeEndDate) {
      end.setDate(end.getDate() + 1);
    }

    // Listar todos os anos envolvidos no período
    const startYear = startDate.getFullYear();
    const endYear = end.getFullYear();

    // Obter todos os feriados do período
    let allHolidays = [];
    if (excludeHolidays) {
      for (let year = startYear; year <= endYear; year++) {
        allHolidays = [...allHolidays, ...getBrazilianHolidays(year)];
      }
    }

    // Converter feriados para strings (para facilitar a comparação)
    const holidaysStr = allHolidays.map((d) => d.toISOString().split("T")[0]);

    // Contar dias úteis
    while (currentDate < end) {
      const dayOfWeek = currentDate.getDay();
      const dateStr = currentDate.toISOString().split("T")[0];

      // Verificar se é dia útil (não é final de semana e não é feriado)
      if (
        dayOfWeek !== 0 &&
        dayOfWeek !== 6 &&
        (!excludeHolidays || !holidaysStr.includes(dateStr))
      ) {
        workdays++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workdays;
  }

  // Calcular diferença entre datas
  function calculateDateDifference(
    startDate,
    endDate,
    workdaysOnly,
    includeEndDate,
    excludeHolidays
  ) {
    let start = new Date(startDate);
    let end = new Date(endDate);

    // Ajustar para o mesmo horário para evitar problemas com horário de verão
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Validar datas
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        days: 0,
        weeks: 0,
        months: 0,
        years: 0,
      };
    }

    // Garantir que a data de início seja anterior à data final
    if (start > end) {
      const temp = start;
      start = end;
      end = temp;
    }

    let days = 0;

    if (workdaysOnly) {
      // Calcular apenas dias úteis
      days = calculateWorkdays(start, end, includeEndDate, excludeHolidays);
    } else {
      // Calcular todos os dias
      const diffTime = Math.abs(end - start);
      days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Incluir o último dia, se necessário
      if (includeEndDate) {
        days += 1;
      }
    }

    // Calcular semanas, meses e anos
    const weeks = days / 7;

    // Para meses e anos, usamos uma aproximação baseada em dias
    const months = days / 30.44; // Média de dias em um mês
    const years = days / 365.25; // Considerando anos bissextos

    return {
      days: days,
      weeks: weeks,
      months: months,
      years: years,
    };
  }

  // Atualizar resultados na interface
  function updateResults(results) {
    daysResult.textContent = results.days;
    weeksResult.textContent = results.weeks.toFixed(1);
    monthsResult.textContent = results.months.toFixed(1);
    yearsResult.textContent = results.years.toFixed(2);
  }

  // Atualizar detalhes dos resultados
  function updateDetailedResults(
    startDate,
    endDate,
    results,
    workdaysOnly,
    excludeHolidays
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Texto inicial
    let detailText = `<p>Período: <strong>${formatDateForDisplay(
      start
    )}</strong> até <strong>${formatDateForDisplay(end)}</strong></p>`;

    // Informações sobre o cálculo
    if (workdaysOnly) {
      detailText += `<p>Calculando apenas <strong>dias úteis</strong> (segunda a sexta-feira).`;
      if (excludeHolidays) {
        detailText += ` Excluindo <strong>feriados nacionais brasileiros</strong>.`;
      }
      detailText += `</p>`;
    } else {
      detailText += `<p>Calculando <strong>todos os dias</strong> entre as datas (incluindo fins de semana e feriados).</p>`;
    }

    // Resultados detalhados
    detailText += `<p>Resultados detalhados:</p>`;
    detailText += `<ul>`;
    detailText += `<li><strong>${results.days}</strong> dias</li>`;
    detailText += `<li><strong>${results.weeks.toFixed(
      1
    )}</strong> semanas</li>`;
    detailText += `<li><strong>${results.months.toFixed(
      1
    )}</strong> meses</li>`;
    detailText += `<li><strong>${results.years.toFixed(2)}</strong> anos</li>`;
    detailText += `</ul>`;

    // Adicionar informações sobre anos bissextos
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();
    if (endYear > startYear) {
      const leapYears = [];
      for (let year = startYear; year <= endYear; year++) {
        if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
          leapYears.push(year);
        }
      }

      if (leapYears.length > 0) {
        detailText += `<p>Anos bissextos no período: <strong>${leapYears.join(
          ", "
        )}</strong></p>`;
      }
    }

    detailResult.innerHTML = detailText;
  }

  // Adicionar ou subtrair período a uma data
  function addPeriodToDate(baseDate, years, months, days, addWorkdaysOnly) {
    const result = new Date(baseDate);

    // Adicionar anos e meses normalmente
    result.setFullYear(result.getFullYear() + parseInt(years));
    result.setMonth(result.getMonth() + parseInt(months));

    // Adicionar dias (considerando dias úteis, se necessário)
    if (addWorkdaysOnly) {
      let daysAdded = 0;
      let daysToAdd = parseInt(days);

      while (daysAdded < daysToAdd) {
        result.setDate(result.getDate() + 1);
        const dayOfWeek = result.getDay();

        // Se for dia de semana (seg-sex)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          daysAdded++;
        }
      }
    } else {
      result.setDate(result.getDate() + parseInt(days));
    }

    return result;
  }

  // Subtrair período de uma data
  function subtractPeriodFromDate(
    baseDate,
    years,
    months,
    days,
    subtractWorkdaysOnly
  ) {
    const result = new Date(baseDate);

    // Subtrair anos e meses normalmente
    result.setFullYear(result.getFullYear() - parseInt(years));
    result.setMonth(result.getMonth() - parseInt(months));

    // Subtrair dias (considerando dias úteis, se necessário)
    if (subtractWorkdaysOnly) {
      let daysSubtracted = 0;
      let daysToSubtract = parseInt(days);

      while (daysSubtracted < daysToSubtract) {
        result.setDate(result.getDate() - 1);
        const dayOfWeek = result.getDay();

        // Se for dia de semana (seg-sex)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          daysSubtracted++;
        }
      }
    } else {
      result.setDate(result.getDate() - parseInt(days));
    }

    return result;
  }

  // Event handlers para Modo de Diferença
  calculateBtn.addEventListener("click", () => {
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    const workdaysOnly = workdaysOnlyCheckbox.checked;
    const includeEndDate = includeEndDateCheckbox.checked;
    const excludeHolidays = excludeHolidaysCheckbox.checked;

    const results = calculateDateDifference(
      startDate,
      endDate,
      workdaysOnly,
      includeEndDate,
      excludeHolidays
    );

    updateResults(results);
    updateDetailedResults(
      startDate,
      endDate,
      results,
      workdaysOnly,
      excludeHolidays
    );
  });

  swapDatesBtn.addEventListener("click", () => {
    const tempDate = startDateInput.value;
    startDateInput.value = endDateInput.value;
    endDateInput.value = tempDate;
  });

  todayBtn.addEventListener("click", () => {
    const today = new Date();
    endDateInput.value = formatDateForInput(today);
  });

  // Event handlers para Modo de Adição
  addCalculateBtn.addEventListener("click", () => {
    const baseDate = new Date(baseDateInput.value);
    const years = parseInt(addYearsInput.value) || 0;
    const months = parseInt(addMonthsInput.value) || 0;
    const days = parseInt(addDaysInput.value) || 0;
    const addWorkdaysOnly = addWorkdaysOnlyCheckbox.checked;

    if (isNaN(baseDate.getTime())) {
      addResultDate.textContent = "Por favor, selecione uma data válida.";
      return;
    }

    const resultDate = addPeriodToDate(
      baseDate,
      years,
      months,
      days,
      addWorkdaysOnly
    );
    addResultDate.textContent = formatDateForDisplay(resultDate);
  });

  addTodayBtn.addEventListener("click", () => {
    const today = new Date();
    baseDateInput.value = formatDateForInput(today);
  });

  // Event handlers para Modo de Subtração
  subCalculateBtn.addEventListener("click", () => {
    const baseDate = new Date(subBaseDateInput.value);
    const years = parseInt(subYearsInput.value) || 0;
    const months = parseInt(subMonthsInput.value) || 0;
    const days = parseInt(subDaysInput.value) || 0;
    const subWorkdaysOnly = subWorkdaysOnlyCheckbox.checked;

    if (isNaN(baseDate.getTime())) {
      subResultDate.textContent = "Por favor, selecione uma data válida.";
      return;
    }

    const resultDate = subtractPeriodFromDate(
      baseDate,
      years,
      months,
      days,
      subWorkdaysOnly
    );
    subResultDate.textContent = formatDateForDisplay(resultDate);
  });

  subTodayBtn.addEventListener("click", () => {
    const today = new Date();
    subBaseDateInput.value = formatDateForInput(today);
  });

  // Inicializar
  initDates();
});
