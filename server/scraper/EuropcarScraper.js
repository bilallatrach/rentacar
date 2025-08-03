// scraper/EuropcarScraper.js
import BaseScraper from "./BaseScraper.js";

class EuropcarScraper extends BaseScraper {
  constructor(params) {
    super(params);
    this.headless = true; // Mode headless par défaut
  }

  async scrape() {
    await this.initBrowser();

    const {
      agenceCode,
      dateDepart,
      dateRetour,
      heureDepart,
      heureRetour,
      conducteurAge,
    } = this.params;

    const url = `https://www.europcar.fr/fr-fr/reservation/vehicles?pickupLocation=${agenceCode}&dropoffLocation=${agenceCode}&pickupYear=${dateDepart.getFullYear()}&pickupMonth=${
      dateDepart.getMonth() + 1
    }&pickupDay=${dateDepart.getDate()}&dropoffYear=${dateRetour.getFullYear()}&dropoffMonth=${
      dateRetour.getMonth() + 1
    }&dropoffDay=${dateRetour.getDate()}&pickupHour=${heureDepart}&pickupMinute=00&dropoffHour=${heureRetour}&dropoffMinute=00&driverAge=${conducteurAge}&countryOfResidence=FR`;

    await this.page.goto(url, { waitUntil: "networkidle2" });

    await this.page.waitForSelector(".vehicles-page__results-container", {
      visible: true,
      timeout: 10000,
    });

    const data = await this.page.evaluate(() => {
      const results = [];
      document.querySelectorAll(".ecw-vehicle-card").forEach((card) => {
        //   let total = card.querySelector(
        //     ".ecw-vehicle-card__basic-information__price-section--total"
        //   )?.innerText;
        //   // 'TOTAL 130,00 €' -> 130.00
        //   if (total) {
        //     total = total.replace("TOTAL ", "").replace("€", "").trim();
        //     total = parseFloat(total.replace(",", "."));
        //   }
        //   if (isNaN(total)) {
        //     total = "ND";
        //   }

        //   tarifs.push({
        //     categorie:
        //       card.querySelector(".ecw-title")?.innerText || "Non précisé",
        //     tarifTotal: total,
        //   });
        // });
        // return tarifs;

        const categorie =
          card
            .querySelector(
              "h2.os-title.os-title--size-l.os-title--weight-bold.os-title--color-standard-1"
            )
            ?.innerText.trim() || "Non précisé";

        // ✅ Récupération du prix
        let total = card.querySelector(
          ".ecw-vehicle-card__basic-information__price-section--total"
        )?.innerText;
        // 'TOTAL 130,00 €' -> 130.00
        if (total) {
          total = total.replace("TOTAL ", "").replace("€", "").trim();
          total = parseFloat(total.replace(",", "."));
        }
        if (isNaN(total)) {
          total = "ND";
        }

        // ✅ Kilométrage
        let kilometrage = "ND";
        const kmText = card.innerText.match(/(\d+)\s*km\s*inclus/i);
        if (kmText) {
          kilometrage = kmText[1] + " km inclus";
        }

        // ✅ Carburant
        let carburant = "ND";
        const fuelMatch = card.innerText.match(
          /\b(Essence|Diesel|Électrique|Hybride)\b/i
        );
        if (fuelMatch) {
          carburant = fuelMatch[1];
        }

        // ✅ Places
        let places = "ND";
        const placesMatch = card.innerText.match(/(\d+)\s*places?/i);
        if (placesMatch) {
          places = placesMatch[1];
        }

        // ✅ Image
        const image = card.querySelector("img")?.src || "ND";

        results.push({
          categorie,
          tarifTotal: total,
          kilometrage,
          carburant,
          places,
          image,
          lienOffre: window.location.href,
          source: "Europcar",
        });
      });
      return results;
    });

    await this.closeBrowser();
    return data;
  }
}

export default EuropcarScraper;
