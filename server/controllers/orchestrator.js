import AdaScraper from "../scraper/AdaScraper.js";
import AvisScraper from "../scraper/AvisScraper.js";
import EuropcarScraper from "../scraper/EuropcarScraper.js";
import FrancecarsScraper from "../scraper/FrancecarsScraper.js";
import HertzScraper from "../scraper/HertzScraper.js";
import LeclercScraper from "../scraper/LeclercScraper.js";
import RentacarScraper from "../scraper/RentacarScraper.js";
import { buildSearchParams } from "../tools/searchParams.js";

export async function runScrapers(baseParams) {
  const params = buildSearchParams(baseParams);

  const scrapers = [
    {
      name: "ADA",
      enabled: (params) => !!params.agenceCode.ada,
      createInstance: (params) =>
        new AdaScraper({
          ...params,
          agenceCode: params.agenceCode.ada,
        }),
    },
    {
      name: "Francecars",
      enabled: (params) => !!params.agenceCode.francecars,
      createInstance: (params) =>
        new FrancecarsScraper({
          ...params,
          agenceCode: params.agenceCode.francecars,
        }),
    },
    {
      name: "Europcar",
      enabled: (params) => !!params.agenceCode.europcar,
      createInstance: (params) =>
        new EuropcarScraper({
          ...params,
          agenceCode: params.agenceCode.europcar,
        }),
    },
    {
      name: "Avis",
      enabled: () => true,
      createInstance: (params) => new AvisScraper(params),
    },
    {
      name: "Rentacar",
      enabled: (params) => !!params.agenceCode.rentacar,
      createInstance: (params) =>
        new RentacarScraper({
          ...params,
          agenceCode: params.agenceCode.rentacar,
        }),
    },
    // {
    //   name: "Leclerc",
    //   enabled: () => true,
    //   createInstance: (params) => new LeclercScraper(params),
    // },
    // {
    //   name: "Hertz",
    //   enabled: () => false, // ❌ désactivé à cause d'Incapsula
    //   createInstance: () => null,
    // },
    // ➕ Ajouter d’autres ici (Europcar, Avis, etc.)
  ];

  const results = await Promise.all(
    scrapers.map(async ({ name, enabled, createInstance }) => {
      if (!enabled(params)) {
        return {
          name,
          success: false,
          error: "Scraper désactivé (protection anti-bot active)",
        };
      }

      const instance = createInstance(params);
      if (!instance) {
        return {
          name,
          success: false,
          error: "Instance non initialisée (désactivée ou non implémentée)",
        };
      }

      try {
        const data = await instance.scrape();
        return { name, success: true, data };
      } catch (err) {
        return { name, success: false, error: err.message };
      }
    })
  );

  return results;
}
