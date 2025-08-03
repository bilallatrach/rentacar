// scraper/LeclercScraper.js
import BaseScraper from "./BaseScraper.js";

class LeclercScraper extends BaseScraper {
  async scrape() {
    await this.initBrowser();
    const page = this.page;
    const {
      ville,
      dateDepart,
      dateRetour,
      heureDepart,
      heureRetour,
      kilometrage,
    } = this.params;

    const formatDate = (date) =>
      `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;

    const formatTime = (heure) => heure.padStart(5, "0");

    try {
      await page.goto("https://www.location.leclerc/", {
        waitUntil: "networkidle2",
        timeout: 60000,
      });

      // ✅ Gérer la popup cookie (Didomi)
      try {
        await page.waitForSelector("#didomi-notice-agree-button", {
          visible: true,
          timeout: 10000,
        });
        await page.click("#didomi-notice-agree-button");
        console.log("✅ Leclerc - Popup cookies détectée et fermée");

        await new Promise((res) => setTimeout(res, 1000));
      } catch {
        console.log("ℹ️ Popup cookies non détectée ou déjà fermée");
      }

      // ✅ Tape la ville dans le champ
      await page.waitForSelector("#agence", { visible: true });
      await page.click("#agence", { clickCount: 3 });
      await page.type("#agence", ville, { delay: 100 });

      // ✅ Attendre les suggestions & cliquer sur celle qui contient la ville
      await page.waitForSelector(".itemLocate", {
        visible: true,
        timeout: 10000,
      });

      const clicked = await page.evaluate((villeRecherchee) => {
        const items = Array.from(document.querySelectorAll(".itemLocate"));

        // Recherche prioritaire : la ligne qui contient ville exactement (après le code postal)
        // Ex : "64000 - Pau"
        const exactMatch = items.find((item) => {
          const txt = item.innerText.trim().toLowerCase();
          return (
            txt.endsWith(`- ${villeRecherchee.toLowerCase()}`) ||
            txt === villeRecherchee.toLowerCase()
          );
        });
        if (exactMatch) {
          exactMatch.click();
          return true;
        }

        // Sinon, recherche par inclusion stricte (mot entier)
        const wordMatch = items.find((item) => {
          const txt = item.innerText.toLowerCase();
          const regex = new RegExp(`\\b${villeRecherchee.toLowerCase()}\\b`);
          return regex.test(txt);
        });
        if (wordMatch) {
          wordMatch.click();
          return true;
        }

        // Fallback : clique sur le premier
        if (items.length > 0) {
          items[0].click();
          return true;
        }

        return false;
      }, ville);

      if (!clicked) {
        throw new Error(
          `❌ Aucune suggestion ne correspond à la ville : ${ville}`
        );
      }

      await new Promise((res) => setTimeout(res, 1000)); // laisser le formulaire se remplir

      //2. Sélectionne le mois (0 = janvier, ... 5 = juin)
      //Le widget utilise des div avec data-value pour les mois dans `.xdsoft_option`
      await page.evaluate(
        ({ d1, h1, d2, h2, km }) => {
          document.querySelector("#entreeDate").value = d1;
          document.querySelector("#entreeTemps").value = h1;
          document.querySelector("#sortieDate").value = d2;
          document.querySelector("#sortieTemps").value = h2;
          document.querySelector("#nombrekm").value = km;
        },
        {
          d1: formatDate(dateDepart),
          h1: heureDepart,
          d2: formatDate(dateRetour),
          h2: heureRetour,
          km: Number(kilometrage || 0),
        }
      );

      const dataS = await page.evaluate(() => {
        return [
          document.querySelector("#entreeDate").value,
          document.querySelector("#entreeTemps").value,
          document.querySelector("#sortieDate").value,
          document.querySelector("#sortieTemps").value,
          document.querySelector("#nombrekm").value,
        ];
      });

      console.log(dataS);

      await new Promise((res) => setTimeout(res, 20000));

      // ✅ Lancer la recherche
      await Promise.all([
        page.click(".go_recherche"),
        page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }),
      ]);

      // ✅ Attendre les résultats
      await page.waitForSelector(".result__item", { timeout: 15000 });

      // ✅ Extraire les données
      const data = await page.evaluate(() => {
        const results = [];

        document.querySelectorAll(".result__item").forEach((card) => {
          const titre =
            card.querySelector(".result__item__title")?.innerText.trim() ||
            "Non précisé";
          const prix =
            card
              .querySelector(".result__item__price .amount")
              ?.innerText.trim() || "ND";
          const image = card.querySelector("img")?.src || "ND";
          const kilometrage = card.innerText.includes("km inclus")
            ? "Inclus"
            : "ND";

          results.push({
            categorie: titre,
            tarifTotal: prix + " €",
            kilometrage,
            lienOffre: window.location.href,
            image,
            source: "Leclerc",
          });
        });

        return results;
      });

      await this.closeBrowser();
      return data;
    } catch (err) {
      console.error("❌ Erreur LeclercScraper :", err.message);
      await this.closeBrowser();
      throw err;
    }
  }
}

export default LeclercScraper;
