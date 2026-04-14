/* ========================================
   Markdown Parser (lightweight)
   ======================================== */
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function parseInlineMarkdown(text) {
    return text
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>")
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

function markdownToHtml(markdown) {
    const normalized = markdown.replace(/\r\n/g, "\n");

    if (/<\s*[a-zA-Z!/][^>]*>/.test(normalized)) {
        return normalized;
    }

    const lines = normalized.split("\n");
    const html = [];
    let inList = false;

    for (const rawLine of lines) {
        const line = rawLine.trim();

        if (!line) {
            if (inList) { html.push("</ul>"); inList = false; }
            continue;
        }

        const heading = line.match(/^(#{1,6})\s+(.+)$/);
        if (heading) {
            if (inList) { html.push("</ul>"); inList = false; }
            const level = heading[1].length;
            const content = parseInlineMarkdown(escapeHtml(heading[2]));
            html.push(`<h${level}>${content}</h${level}>`);
            continue;
        }

        const listItem = line.match(/^[-*]\s+(.+)$/);
        if (listItem) {
            if (!inList) { html.push("<ul>"); inList = true; }
            html.push(`<li>${parseInlineMarkdown(escapeHtml(listItem[1]))}</li>`);
            continue;
        }

        if (inList) { html.push("</ul>"); inList = false; }
        html.push(`<p>${parseInlineMarkdown(escapeHtml(line))}</p>`);
    }

    if (inList) html.push("</ul>");
    return html.join("\n");
}

/* ========================================
   Markdown Section Loader
   ======================================== */
async function loadMarkdownSections() {
    const sections = document.querySelectorAll("[data-md]");
    if (!sections.length) return;

    const isFileProtocol = window.location.protocol === "file:";
    let hasFailure = false;

    await Promise.all(
        Array.from(sections).map(async (el) => {
            const path = el.getAttribute("data-md");
            if (!path) return;
            try {
                const res = await fetch(path);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                el.innerHTML = markdownToHtml(await res.text());
            } catch (e) {
                hasFailure = true;
                el.innerHTML = `<p>Could not load <code>${path}</code>.</p>`;
                console.error(e);
            }
        })
    );

    if (hasFailure && isFileProtocol) {
        const w = document.createElement("div");
        w.className = "local-preview-warning";
        w.innerHTML =
            "<strong>Local preview note:</strong> Opened via <code>file://</code> — " +
            "browser security blocks loading <code>.md</code> files. " +
            "Run <code>python3 -m http.server 8000</code> and open <code>http://localhost:8000</code>.";
        document.body.prepend(w);
    }
}

/* ========================================
   Page Init
   ======================================== */
document.addEventListener("DOMContentLoaded", async () => {
    await loadMarkdownSections();
});
