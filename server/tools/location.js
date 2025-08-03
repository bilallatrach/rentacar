// locations.js

export const agenceCodes = {
  Pau: {
    ada: "FRD70A",
    francecars: 73,
    europcar: "PUFT01", // Aéroport
    rentacar: "PAU",
    avis: "PUFC02", // Ville
    hertz: "PUFX01", // Gare
  },
  Tarbes: {
    ada: "FRD81A", // Repointé sur Pau selon ton mapping
    francecars: 78,
    europcar: "LDET01", // Tarbes/Lourdes Aéroport
    rentacar: "TARBES",
  },
  Dax: {
    ada: "FRD56A", // Repointé sur Bayonne selon ton mapping
    francecars: 149,
    europcar: "XDAX01", // Gare (XDAC01 = centre ville)
    rentacar: "DAX+-+GARE",
  },
  "Mont-de-Marsan": {
    europcar: "XMJC01",
    rentacar: "MONT+DE+MARSAN",
    // francecars, ada, hertz non disponibles
  },
};

export function getAgencyCodes(ville) {
  return agenceCodes[ville] || {};
}
