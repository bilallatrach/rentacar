// scraper/FrancecarsScraper.js
import axios from "axios";
import BaseScraper from "./BaseScraper.js";
import * as cheerio from "cheerio";

class FrancecarsScraper extends BaseScraper {
  constructor(params) {
    super(params);
    this.headless = true; // Mode headless par défaut
  }
  async scrape() {
    //await this.initBrowser();

    const {
      agenceCode,
      dateDepart,
      dateRetour,
      heureDepart,
      heureRetour,
      kilometrage,
    } = this.params;

    // Format des dates attendu : JJ/MM/AAAA
    const dateDepartStr = `${dateDepart
      .getDate()
      .toString()
      .padStart(2, "0")}/${(dateDepart.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${dateDepart.getFullYear()}`;
    const dateRetourStr = `${dateRetour
      .getDate()
      .toString()
      .padStart(2, "0")}/${(dateRetour.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${dateRetour.getFullYear()}`;
    const url = `https://www.francecars.fr/reservation-vehicule-s208.html?etape=famille&la_version=express&page_appelante=reservation&agence=${agenceCode}&famille=58&date_depart=${encodeURIComponent(
      dateDepartStr
    )}&heure_depart=${heureDepart}%3A00&date_retour=${encodeURIComponent(
      dateRetourStr
    )}&heure_retour=${heureRetour}%3A00&km_estimes=${kilometrage}`;

    // return to not use scrapfly credits
    // return [];

    const response = await axios.get("https://api.scrapfly.io/scrape", {
      params: {
        key: "scp-live-5a282361788145baa37b4b2b77ca515f",
        url: url,
        render_js: true,
        country: "fr",
        session: true,
        asp: true,
        proxy_pool: "public_residential_pool",
      },
    });

    const html = response.data.result.content;
    const $ = cheerio.load(html);

    const results = [];

    $("._item").each((_, card) => {
      const titre = $(card).find(".nom").text().trim() || "Non précisé";

      let tarifTTC = $(card).find(".tarif_ttc").text().trim() || "ND";
      if (tarifTTC !== "ND") {
        tarifTTC = tarifTTC.replace(/\s/g, "").replace("€TTC", "");
        tarifTTC = parseFloat(tarifTTC);
      }

      const kmInclus = $(card).find(".km_compris").text().trim() || "ND";
      const image = $(card).find("img").attr("src") || "ND";

      if (tarifTTC !== "ND" && titre !== "Non précisé") {
        results.push({
          categorie: titre,
          tarifTotal: tarifTTC,
          kilometrage: kmInclus,
          image: image,
        });
      }
    });

    return results;

    // await this.page.goto(url, { waitUntil: "networkidle2" });

    // const data = await this.page.evaluate(() => {
    //   const results = [];
    //   document.querySelectorAll("._item").forEach((card) => {
    //     const titre =
    //       card.querySelector(".titre")?.innerText.trim() || "Non précisé";
    //     //'64.50 € TTC' -> '64.50'
    //     let tarifTTC =
    //       card.querySelector(".tarif_ttc")?.innerText.trim() || "ND";
    //     if (tarifTTC !== "ND") {
    //       // On enlève les espaces et le symbole € pour ne garder que le montant
    //       tarifTTC = tarifTTC.replace(/\s/g, "").replace("€ TTC", "");
    //       // On convertit en nombre
    //       tarifTTC = parseFloat(tarifTTC);
    //     }

    //     const kmInclus =
    //       card.querySelector(".km_compris")?.innerText.trim() || "ND";

    //     const image = card.querySelector("img")?.src || "ND";

    //     if (tarifTTC !== "ND" && titre !== "Non précisé") {
    //       results.push({
    //         name: titre,
    //         tarifTotal: tarifTTC,
    //         kilometrage: kmInclus,
    //         image: image,
    //       });
    //     }
    //   });

    //   return results;
    // });

    // await this.closeBrowser();
    // return data;
  }
}

export default FrancecarsScraper;
