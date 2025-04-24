// static/js/common.js - Funcionalidades comuns para todas as páginas

// Alternância de tema
document.addEventListener("DOMContentLoaded", function () {
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const htmlElement = document.documentElement;

  // Verificar tema atual
  const getCurrentTheme = () => {
    return localStorage.getItem("theme") || "dark"; // Tema padrão: escuro
  };

  // Aplicar tema
  const applyTheme = (theme) => {
    htmlElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    // Enviar evento para o backend (atualizar cookie)
    fetch("/set-theme", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ theme }),
    }).catch((error) => console.error("Erro ao definir tema:", error));
  };

  // Inicializar com o tema salvo
  applyTheme(getCurrentTheme());

  // Alternar tema ao clicar no botão
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const currentTheme = getCurrentTheme();
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(newTheme);
    });
  }

  // Menu móvel
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const mainNav = document.querySelector(".main-nav");

  if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener("click", () => {
      mainNav.classList.toggle("open");

      // Alternar estado do botão do menu
      const spans = mobileMenuToggle.querySelectorAll("span");
      if (mainNav.classList.contains("open")) {
        spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
        spans[1].style.opacity = "0";
        spans[2].style.transform = "rotate(-45deg) translate(7px, -6px)";
      } else {
        spans[0].style.transform = "none";
        spans[1].style.opacity = "1";
        spans[2].style.transform = "none";
      }
    });

    // Fechar menu ao clicar fora
    document.addEventListener("click", (e) => {
      if (
        mainNav.classList.contains("open") &&
        !mainNav.contains(e.target) &&
        !mobileMenuToggle.contains(e.target)
      ) {
        mainNav.classList.remove("open");
        const spans = mobileMenuToggle.querySelectorAll("span");
        spans[0].style.transform = "none";
        spans[1].style.opacity = "1";
        spans[2].style.transform = "none";
      }
    });
  }
});
