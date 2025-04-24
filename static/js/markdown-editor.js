// static/js/markdown-editor.js - Funcionalidades para a ferramenta de edição markdown

document.addEventListener("DOMContentLoaded", function () {
  const markdownEditor = document.getElementById("markdown-editor");
  if (!markdownEditor) return;

  const mdInput = document.getElementById("markdown-input");
  const mdPreview = document.getElementById("markdown-preview");
  const previewToggle = document.getElementById("preview-toggle");
  const boldBtn = document.getElementById("bold-btn");
  const italicBtn = document.getElementById("italic-btn");
  const headingBtn = document.getElementById("heading-btn");
  const linkBtn = document.getElementById("link-btn");
  const imageBtn = document.getElementById("image-btn");
  const listBtn = document.getElementById("list-btn");
  const codeBtn = document.getElementById("code-btn");
  const copyMdBtn = document.getElementById("copy-md-btn");
  const clearMdBtn = document.getElementById("clear-md-btn");
  const editorPane = document.getElementById("editor-pane");
  const previewPane = document.getElementById("preview-pane");

  // Converter Markdown para HTML (versão simplificada)
  const convertMarkdown = (md) => {
    // Esta é uma implementação básica. Em um projeto real,
    // use uma biblioteca como marked.js

    // Escapar HTML
    let html = md
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Cabeçalhos
    html = html.replace(/^# (.*$)/gm, "<h1>$1</h1>");
    html = html.replace(/^## (.*$)/gm, "<h2>$1</h2>");
    html = html.replace(/^### (.*$)/gm, "<h3>$1</h3>");

    // Negrito
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Itálico
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Imagens
    html = html.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

    // Listas
    html = html.replace(/^\* (.*$)/gm, "<li>$1</li>");
    html = html.replace(/<\/li>\n<li>/g, "</li><li>");
    html = html.replace(/(<li>.*<\/li>)/g, "<ul>$1</ul>");

    // Código inline
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Blocos de código
    html = html.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>");

    // Quebras de linha
    html = html.replace(/\n/g, "<br>");

    return html;
  };

  // Atualizar visualização
  const updatePreview = () => {
    if (mdPreview) {
      mdPreview.innerHTML = convertMarkdown(mdInput.value);
    }
  };

  // Inserir formatação
  const insertFormatting = (start, end, placeholder) => {
    const startPos = mdInput.selectionStart;
    const endPos = mdInput.selectionEnd;
    const selection = mdInput.value.substring(startPos, endPos);

    let replacement;
    if (selection) {
      replacement = start + selection + end;
    } else {
      replacement = start + placeholder + end;
      // Posicionar cursor dentro do placeholder
      setTimeout(() => {
        mdInput.selectionStart = startPos + start.length;
        mdInput.selectionEnd = startPos + start.length + placeholder.length;
        mdInput.focus();
      }, 0);
    }

    mdInput.value =
      mdInput.value.substring(0, startPos) +
      replacement +
      mdInput.value.substring(endPos);

    // Atualizar visualização
    updatePreview();
  };

  // Adicionar event listeners
  if (mdInput) {
    mdInput.addEventListener("input", updatePreview);
  }

  if (previewToggle) {
    previewToggle.addEventListener("click", () => {
      editorPane.classList.toggle("fullscreen");
      previewPane.classList.toggle("fullscreen");

      // Alternar texto do botão
      if (previewToggle.textContent === "Visualizar") {
        previewToggle.textContent = "Editar";
      } else {
        previewToggle.textContent = "Visualizar";
      }
    });
  }

  if (boldBtn) {
    boldBtn.addEventListener("click", () => {
      insertFormatting("**", "**", "texto em negrito");
    });
  }

  if (italicBtn) {
    italicBtn.addEventListener("click", () => {
      insertFormatting("*", "*", "texto em itálico");
    });
  }

  if (headingBtn) {
    headingBtn.addEventListener("click", () => {
      insertFormatting("# ", "", "Título");
    });
  }

  if (linkBtn) {
    linkBtn.addEventListener("click", () => {
      insertFormatting("[", "](https://exemplo.com)", "link");
    });
  }

  if (imageBtn) {
    imageBtn.addEventListener("click", () => {
      insertFormatting("![", "](https://exemplo.com/imagem.jpg)", "alt text");
    });
  }

  if (listBtn) {
    listBtn.addEventListener("click", () => {
      insertFormatting("* ", "\n* ", "Item 1");
    });
  }

  if (codeBtn) {
    codeBtn.addEventListener("click", () => {
      insertFormatting("```\n", "\n```", "seu código aqui");
    });
  }

  if (copyMdBtn) {
    copyMdBtn.addEventListener("click", () => {
      mdInput.select();
      document.execCommand("copy");

      // Feedback visual
      const originalText = copyMdBtn.textContent;
      copyMdBtn.textContent = "Copiado! ✓";

      setTimeout(() => {
        copyMdBtn.textContent = originalText;
      }, 2000);
    });
  }

  if (clearMdBtn) {
    clearMdBtn.addEventListener("click", () => {
      mdInput.value = "";
      updatePreview();
    });
  }

  // Inicializar com um exemplo
  if (mdInput && mdInput.value === "") {
    mdInput.value = `# Bem-vindo ao Editor Markdown

**Este é um exemplo** de como usar *markdown* para formatar texto.

## Recursos Suportados

* Cabeçalhos
* **Negrito** e *itálico*
* [Links](https://squidcoder.dev)
* Listas
* E muito mais!

\`\`\`
// Exemplo de código
function exemplo() {
  console.log("Olá, Markdown!");
}
\`\`\`

Divirta-se editando!`;

    updatePreview();
  }
});
