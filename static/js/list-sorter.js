// static/js/list-sorter.js - Funcionalidades para a ferramenta de ordenação de listas

document.addEventListener("DOMContentLoaded", function () {
  const listSorter = document.getElementById("list-sorter");
  if (!listSorter) return;

  const inputText = document.getElementById("input-text");
  const outputText = document.getElementById("output-text");
  const sortAscBtn = document.getElementById("sort-asc-btn");
  const sortDescBtn = document.getElementById("sort-desc-btn");
  const clearBtn = document.getElementById("clear-btn");
  const copyBtn = document.getElementById("copy-btn");
  const loadSampleBtn = document.getElementById("load-sample-btn");
  const errorMessage = document.getElementById("error-message");
  const lineCount = document.getElementById("line-count");

  // Opções de configuração
  const caseSensitive = document.getElementById("case-sensitive");
  const numericSort = document.getElementById("numeric-sort");

  // Função para ordenar lista
  const sortList = (ascending = true) => {
    try {
      const input = inputText.value;

      if (!input) {
        throw new Error("O texto de entrada não pode estar vazio");
      }

      // Dividir o texto em linhas
      let lines = input.split("\n").filter((line) => line.trim() !== "");

      // Função de comparação para ordenação
      let compareFunction;

      if (numericSort.checked) {
        // Ordenação numérica
        compareFunction = (a, b) => {
          const numA = parseFloat(a);
          const numB = parseFloat(b);

          // Verificar se ambos são números válidos
          if (!isNaN(numA) && !isNaN(numB)) {
            return ascending ? numA - numB : numB - numA;
          } else {
            // Fallback para ordenação de texto
            return ascending
              ? a.localeCompare(b, undefined, {
                  numeric: true,
                  sensitivity: caseSensitive.checked ? "case" : "base",
                })
              : b.localeCompare(a, undefined, {
                  numeric: true,
                  sensitivity: caseSensitive.checked ? "case" : "base",
                });
          }
        };
      } else {
        // Ordenação de texto
        compareFunction = (a, b) => {
          if (!caseSensitive.checked) {
            a = a.toLowerCase();
            b = b.toLowerCase();
          }
          return ascending ? a.localeCompare(b) : b.localeCompare(a);
        };
      }

      // Ordenar linhas
      lines.sort(compareFunction);

      // Atualizar contador
      lineCount.textContent = `${lines.length} linhas`;

      // Exibir resultados
      outputText.textContent = lines.join("\n");

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
    outputText.textContent = "";
    lineCount.textContent = "0 linhas";
    errorMessage.textContent = "";
    errorMessage.style.display = "none";
  };

  // Função para copiar o resultado
  const copyResult = () => {
    if (!outputText.textContent) {
      errorMessage.textContent = "Não há nada para copiar";
      errorMessage.style.display = "block";

      setTimeout(() => {
        errorMessage.style.display = "none";
      }, 3000);

      return;
    }

    // Criar elemento temporário para copiar o texto
    const tempInput = document.createElement("textarea");
    tempInput.value = outputText.textContent;
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

  // Função para carregar exemplo
  const loadSample = () => {
    inputText.value = `Banana
Maçã
Laranja
Morango
Uva
Abacaxi
pêssego
Melancia
abacate
Limão
Kiwi
100
50
1500
32
8
64
1
10`;
    sortList(true);
  };

  // Adicionar event listeners
  if (sortAscBtn) sortAscBtn.addEventListener("click", () => sortList(true));
  if (sortDescBtn) sortDescBtn.addEventListener("click", () => sortList(false));
  if (clearBtn) clearBtn.addEventListener("click", clearFields);
  if (copyBtn) copyBtn.addEventListener("click", copyResult);
  if (loadSampleBtn) loadSampleBtn.addEventListener("click", loadSample);

  // Event listeners para as opções
  if (caseSensitive)
    caseSensitive.addEventListener("change", () => {
      if (outputText.textContent) {
        const isAscending = sortAscBtn.classList.contains("active");
        sortList(isAscending);
      }
    });

  if (numericSort)
    numericSort.addEventListener("change", () => {
      if (outputText.textContent) {
        const isAscending = sortAscBtn.classList.contains("active");
        sortList(isAscending);
      }
    });

  // Permitir pressionar Enter para processar
  if (inputText) {
    inputText.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        sortList(true);
      }
    });
  }

  // Marcar botão ativo
  sortAscBtn.addEventListener("click", () => {
    sortAscBtn.classList.add("active");
    sortDescBtn.classList.remove("active");
  });

  sortDescBtn.addEventListener("click", () => {
    sortDescBtn.classList.add("active");
    sortAscBtn.classList.remove("active");
  });

  // Inicializar
  sortAscBtn.classList.add("active");
});
