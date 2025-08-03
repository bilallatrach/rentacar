// scraper/RentacarScraper.js
import axios from "axios";
import BaseScraper from "./BaseScraper.js";
import * as cheerio from "cheerio";

class RentacarScraper extends BaseScraper {
  formatDateTime(dateStr, hourStr) {
    const d = new Date(dateStr);
    const [hours, minutes] = hourStr.split(":").map((v) => v.padStart(2, "0"));
    return `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${d
      .getDate()
      .toString()
      .padStart(2, "0")}T${hours}:${minutes}:00`;
  }

  async scrape() {
    const { agenceCode, dateDepart, dateRetour, heureDepart, heureRetour } =
      this.params;

    const pickupDate = this.formatDateTime(dateDepart, heureDepart);
    const dropoffDate = this.formatDateTime(dateRetour, heureRetour);

    const url = `https://www.rentacar.fr/v3/reservation/categories?RideType=RoundTrip&Pickup.MaxNumberOfAgencies=1&Radius=50&VehicleType=Car&PickupDate=${encodeURIComponent(
      pickupDate
    )}&DropoffDate=${encodeURIComponent(
      dropoffDate
    )}&pickupDescription=${agenceCode}&isAgency=true`;

    console.log("🔗 Rentacar URL:", url);

    try {
      const response = await axios.get("https://api.scrapfly.io/scrape", {
        params: {
          key: "scp-live-5a282361788145baa37b4b2b77ca515f",
          url: url,
          render_js: true,
          wait_for_selector: ".AgencyOption_categoryOption__HUCRm",
          country: "fr",
          session: true,
          asp: true,
          proxy_pool: "public_residential_pool",
        },
      });

      const html = response.data.result.content;

      if (!html) {
        console.error("❌ No HTML content received from Rentacar");
        return [];
      }

      const $ = cheerio.load(html);
      const results = [];

      $(".AgencyOption_categoryOption__HUCRm").each((_, el) => {
        const $card = $(el);

        // Extraction comme avant :
        const categorie =
          $card.find(".CategoryOptionCard_vehicleLabel__CT4t3").text().trim() ||
          "Non précisé";
        const exemple =
          $card
            .find(".CategoryOptionCard_vehicleExample__4Ce2g")
            .text()
            .trim() || "ND";
        const infos = $card
          .find(".Badge_badge__PfD5k")
          .map((_, b) => $(b).text().trim())
          .get();
        const carburant =
          infos.find((txt) =>
            ["essence", "diesel", "gasoil", "électrique"].includes(
              txt.toLowerCase()
            )
          ) || "ND";
        const places =
          infos.find((txt) => txt.toLowerCase().includes("place")) || "ND";
        const kmBloc = $card
          .find(".CategoryOptionCard_vehicleDetails__XFm_O")
          .last()
          .text()
          .toLowerCase();
        const kilometrage = kmBloc.includes("100km") ? "100 km inclus" : "ND";
        let prix = $card
          .find(".RoundTripPrice_finalPrice__JlexW")
          .text()
          .trim();
        prix = prix
          ? parseFloat(
              prix.replace(/\s/g, "").replace("€", "").replace(",", ".")
            )
          : "ND";
        const imgSrc = $card.find("img").attr("src");
        const image = imgSrc
          ? imgSrc.startsWith("http")
            ? imgSrc
            : `https://www.rentacar.fr${imgSrc}`
          : "ND";

        results.push({
          categorie,
          exemple,
          carburant,
          places,
          kilometrage,
          tarifTotal: prix,
          image,
          lienOffre: url,
          source: "Rentacar",
        });
      });

      $(".ListViewByCategory_categoryOption__kNUkN").each((_, el) => {
        const $card = $(el);

        console.log("parse nearby card:", $card.html());

        // Extraction comme avant :
        const categorie =
          $card.find(".CategoryOptionCard_vehicleLabel__CT4t3").text().trim() ||
          "Non précisé";
        const exemple =
          $card
            .find(".CategoryOptionCard_vehicleExample__4Ce2g")
            .text()
            .trim() || "ND";
        const infos = $card
          .find(".Badge_badge__PfD5k")
          .map((_, b) => $(b).text().trim())
          .get();
        const carburant =
          infos.find((txt) =>
            ["essence", "diesel", "gasoil", "électrique"].includes(
              txt.toLowerCase()
            )
          ) || "ND";
        const places =
          infos.find((txt) => txt.toLowerCase().includes("place")) || "ND";
        const kmBloc = $card
          .find(".CategoryOptionCard_vehicleDetails__XFm_O")
          .last()
          .text()
          .toLowerCase();
        const kilometrage = kmBloc.includes("100km") ? "100 km inclus" : "ND";
        let prix = $card
          .find(".RoundTripPrice_finalPrice__JlexW")
          .text()
          .trim();
        prix = prix
          ? parseFloat(
              prix.replace(/\s/g, "").replace("€", "").replace(",", ".")
            )
          : "ND";
        const imgSrc = $card.find("img").attr("src");
        const image = imgSrc
          ? imgSrc.startsWith("http")
            ? imgSrc
            : `https://www.rentacar.fr${imgSrc}`
          : "ND";

        results.push({
          categorie,
          exemple,
          carburant,
          places,
          kilometrage,
          tarifTotal: prix,
          image,
          lienOffre: url,
          source: "Rentacar",
        });
      });

      return results;
    } catch (err) {
      console.error("❌ Erreur RentacarScraper:", err.message);
      throw err;
    }
  }
}

export default RentacarScraper;
