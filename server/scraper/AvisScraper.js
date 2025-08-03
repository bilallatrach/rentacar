// scraper/AvisScraper.js
import BaseScraper from "./BaseScraper.js";

class AvisScraper extends BaseScraper {
  formatAvisDate(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  }

  formatAvisTime(heure) {
    return heure.replace(":", "");
  }

  async scrape() {
    await this.initBrowser();
    const page = this.page;

    const { ville, dateDepart, dateRetour, heureDepart, heureRetour } =
      this.params;

    const d = new Date(dateDepart);
    const d2 = new Date(dateRetour);

    try {
      await page.goto("https://www.avis.fr", {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      try {
        await page.waitForSelector("#consent_prompt_accept", { timeout: 5000 });
        await page.click("#consent_prompt_accept");
        console.log("Avis - Popup cookies acceptée et fermée");
      } catch (e) {
        console.log("Avis - Popup cookies non détectée ou déjà fermée");
      }

      // Tape la ville
      await page.focus("#hire-search");
      await page.click("#hire-search", { clickCount: 3 });
      await page.type("#hire-search", ville, { delay: 100 });

      // Attends la liste de suggestions visible
      await page.waitForSelector(".booking-widget__results", {
        visible: true,
        timeout: 10000,
      });

      // Clique sur la première suggestion
      await page.click(
        ".booking-widget__results__item button.booking-widget__results__link"
      );

      // Pause pour laisser les champs cachés se remplir
      await new Promise((res) => setTimeout(res, 1000));

      // Remplit les champs date et heure
      // 1. Clique sur l'input pour ouvrir le date picker
      await page.click("#date-from-display");

      // 2. Choisis le mois (exemple juin = 5) et l’année (2025)
      await page.select(".pika-select-month", d.getMonth().toString());
      await page.select(".pika-select-year", d.getFullYear().toString());

      // 3. Clique sur le jour (exemple 15 juin 2025)
      await page.click(
        `button.pika-day[data-pika-year="${d.getFullYear()}"][data-pika-month="${d.getMonth()}"][data-pika-day="${d.getDate()}"]`
      );

      // 1. Clique sur l'input pour ouvrir le date picker (retour)
      await page.click("#date-to-display");

      // 2. Choisis le mois (exemple juin = 5) et l’année (2025)
      await page.select(".pika-select-month", d2.getMonth().toString());
      await page.select(".pika-select-year", d2.getFullYear().toString());

      // 3. Clique sur le jour (exemple 15 juin 2025)
      await page.click(
        `button.pika-day[data-pika-year="${d2.getFullYear()}"][data-pika-month="${d2.getMonth()}"][data-pika-day="${d2.getDate()}"]`
      );

      // Clique sur le bouton de recherche
      await Promise.all([
        page.click('form#getAQuote button[type="submit"]'),
        page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }),
      ]);

      // Attend les résultats
      const data = await page.evaluate(() => {
        const vehicles = Array.from(
          document.querySelectorAll("article.vehicle")
        );
        return vehicles.map((v) => {
          const getAttr = (attr) => v.getAttribute(attr) || "ND";
          const getText = (sel) => {
            const el = v.querySelector(sel);
            return el ? el.textContent.trim() : "ND";
          };
          const getHref = () =>
            v.querySelector("a.vehicle__prices-cta")?.href ||
            window.location.href;

          let total =
            getAttr("data-pay-collection-price") !== "ND"
              ? getAttr("data-pay-collection-price")
              : null;
          if (total) {
            total = parseFloat(total.replace(",", "."));
          }
          if (isNaN(total)) {
            total = "ND";
          }

          return {
            categorie: getText("h2.vehicle__category"),
            exemple: getText("p.vehicle__note"),
            nom: getAttr("data-vehicle-name"),
            transmission: v.innerText.includes("Manuelle")
              ? "Manuelle"
              : v.innerText.includes("Auto")
              ? "Automatique"
              : "ND",
            tarifTotal: total,
            kilometrage: "ND", // Non présent dans le HTML
            lienOffre: getHref(),
            image: v.querySelector(".vehicle__image img")?.src || "ND",
          };
        });
      });

      await this.closeBrowser();
      return data;
    } catch (err) {
      console.error("Erreur AvisScraper:", err.message);
      await this.closeBrowser();
      throw err;
    }
  }
}

export default AvisScraper;
