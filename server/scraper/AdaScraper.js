// scraper/AdaScraper.js
import BaseScraper from "./BaseScraper.js";

class AdaScraper extends BaseScraper {
  async scrape() {
    await this.initBrowser();

    const { agenceCode, dateDepart, dateRetour, heureDepart, heureRetour } =
      this.params;

    const formatDate = (d) => d.toISOString().split("T")[0];

    const url = `https://www.ada.fr/recherche/${agenceCode}?type=car&dd=${formatDate(
      dateDepart
    )}&df=${formatDate(dateRetour)}&hd=${encodeURIComponent(
      heureDepart
    )}&hf=${encodeURIComponent(heureRetour)}&sq=`;

    await this.page.goto(url, { waitUntil: "networkidle2" });

    // Ajoute un petit délai de sécurité
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await this.page.evaluate(() => {
      const results = [];

      const cards = document.querySelectorAll(
        "div.shadow-raised.rounded-xs.overflow-hidden"
      );

      cards.forEach((card) => {
        const categorie =
          card.querySelector(".text-h3-mobile")?.innerText.trim() ||
          "Non précisé";

        // 🔍 Prix total : on cherche le div qui commence par "Total"
        // Cherche le bon bloc contenant "Total"
        const totalDiv = Array.from(card.querySelectorAll("div")).find((div) =>
          div.textContent?.trim().startsWith("Total")
        );

        let prixTotal = "ND";

        if (totalDiv) {
          // Essaye d'abord de trouver un prix dans un <span> non barré
          const prixRemise = Array.from(totalDiv.querySelectorAll("span")).find(
            (el) => !el.classList.contains("line-through")
          )?.innerText;

          // Si pas de prix remisé, regarde dans le texte brut du <div>
          const texte = totalDiv.innerText.trim(); // ex: "Total 37,00 €"
          const match = texte.match(/Total\s+([\d.,]+)\s*€/);

          if (prixRemise) {
            prixTotal = prixRemise;
          } else if (match) {
            prixTotal = match[1];
          }

          // Nettoyage final
          if (prixTotal !== "ND") {
            prixTotal = prixTotal.replace(/\s/g, "").replace(",", ".");
            prixTotal = parseFloat(prixTotal);
          }
        }

        // 🔍 Kilométrage inclus
        let kilometrage = "ND";
        card.querySelectorAll(".grid div").forEach((div) => {
          const txt = div.innerText.toLowerCase();
          if (txt.includes("km inclus")) {
            kilometrage = txt;
          }
        });

        // 🔍 Carburant
        let carburant = "ND";
        card.querySelectorAll(".grid div").forEach((div) => {
          const txt = div.innerText.toLowerCase();
          if (
            txt.includes("essence") ||
            txt.includes("diesel") ||
            txt.includes("électrique")
          ) {
            carburant = txt;
          }
        });

        // 🔍 Nombre de places
        let places = "ND";
        card.querySelectorAll(".grid div").forEach((div) => {
          const txt = div.innerText.toLowerCase();
          if (txt.includes("place")) {
            places = txt;
          }
        });

        // 🔍 Image
        const image = card.querySelector("img")?.src || "ND";

        results.push({
          categorie,
          tarifTotal: prixTotal,
          kilometrage,
          carburant,
          places,
          image,
          lienOffre: window.location.href,
          source: "ADA",
        });
      });

      return results;
    });

    await this.closeBrowser();
    return data;
  }
}

export default AdaScraper;
