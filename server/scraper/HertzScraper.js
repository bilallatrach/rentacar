// scraper/HertzScraper.js
import axios from "axios";
import BaseScraper from "./BaseScraper.js";

class HertzScraper extends BaseScraper {
  async scrape() {
    const { ville, dateDepart, dateRetour, heureDepart, heureRetour } =
      this.params;

    // Tu peux adapter cette URL manuellement (récupérée depuis le site après recherche)
    const scrapUrl = "https://www.hertz.fr/rentacar/reservation/";

    const scrapflyApiKey =
      process.env.SCRAPFLY_KEY || "scp-live-e1c60504ea7641579b309e3bb6516c86";

    const response = await axios.get("https://api.scrapfly.io/scrape", {
      params: {
        key: scrapflyApiKey,
        url: scrapUrl,
        render_js: true, // ScrapFly exécutera le JS (SPA + captcha si besoin)
        country: "fr", // pour éviter les redirections
        session: true, // persiste les cookies si besoin
      },
    });

    const html = response.data.result.content;

    console.log("hertz html", html);

    // Charger le HTML côté Node avec un parseur léger (comme cheerio)
    const cheerio = await import("cheerio");
    const $ = cheerio.load(html);

    const results = [];

    $(".res-vehicle-listing").each((i, el) => {
      const categorie =
        $(el).find(".res-vehicle-name").text().trim() || "Non précisé";
      const tarif = $(el).find(".res-vehicle-totalprice").text().trim() || "ND";
      results.push({
        categorie,
        tarifTotal: tarif,
        kilometrage: "ND",
        lienOffre: scrapUrl,
      });
    });

    return results;
  }
}

export default HertzScraper;
