// content.js - injetado apenas nas páginas do perfil do usuário do Mubi
function normalizeDate(dateStr) {
  const meses = {
    janeiro: "01", fevereiro: "02", março: "03", abril: "04", maio: "05", junho: "06",
    julho: "07", agosto: "08", setembro: "09", outubro: "10", novembro: "11", dezembro: "12"
  };
  const match = dateStr.match(/(\d{1,2}) (\w+) (\d{4})/i);
  if (!match) return "";
  const [_, dia, mes, ano] = match;
  const mesNum = meses[mes.toLowerCase()];
  return `${ano}-${mesNum}-${dia.padStart(2, '0')}`;
}

function exportMubiToLetterboxd() {
  const rows = [["Title", "Year", "Directors", "Rating", "WatchedDate", "Review"]];

  document.querySelectorAll("li.css-1bmn10l").forEach(item => {
    const title = item.querySelector("h3")?.innerText.trim() || "";
    const directorSpan = item.querySelector('[data-testid="director-and-year"]');
    let directors = "", year = "";
    if (directorSpan) {
      const spans = directorSpan.querySelectorAll("span");
      if (spans.length >= 2) {
        directors = spans[0]?.innerText.replace(/ e mais \d+/i, "").trim();
        year = spans[2]?.textContent?.trim() || "";
      }
    }
    const ratingTitle = item.querySelector('div[title$="Stars"]')?.getAttribute("title") || "";
    const ratingMatch = ratingTitle.match(/([\d.]+) Stars/);
    const rating = ratingMatch ? ratingMatch[1] : "";
    const dateEl = item.querySelector(".css-101pkgb");
    const watchedDate = dateEl ? normalizeDate(dateEl.textContent.trim()) : "";
    const review = item.querySelector(".css-segsy1")?.innerText.trim().replace(/\s+/g, " ") || "";

    if (title && year) {
      rows.push([title, year, directors, rating, watchedDate, review]);
    }
  });

  const csv = rows.map(r => r.map(f => `"${f}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mubi_to_letterboxd.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.open("https://letterboxd.com/import/", "_blank");
}

// Adiciona menu ao clicar na extensão
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "export-mubi") {
    exportMubiToLetterboxd();
  }
});
