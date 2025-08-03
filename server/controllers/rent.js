import { runScrapers } from "./orchestrator.js";

/* RENT CAR INFORMATION */
export const getRentCarInformation = async (req, res) => {
  console.log("🔍 Recherche de voitures de location...");
  const {
    ville,
    dateDepart,
    dateRetour,
    heureDepart,
    heureRetour,
    categorie,
    kilometrage,
    conducteurAge,
  } = req.body;

  console.log("Params:", {
    ville,
    dateDepart,
    dateRetour,
    heureDepart,
    heureRetour,
    categorie,
    kilometrage,
    conducteurAge,
  });

  // const baseParams = {
  //   ville: "Pau",
  //   dateDepart: "2025-07-07",
  //   dateRetour: "2025-07-08",
  //   heureDepart: "10:00",
  //   heureRetour: "10:00",
  //   categorie: "Berline",
  //   kilometrage: 100,
  //   conducteurAge: 26,
  // };

  const run = async () => {
    const results = await runScrapers({
      ville: ville,
      dateDepart: dateDepart,
      dateRetour: dateRetour,
      heureDepart: heureDepart,
      heureRetour: heureRetour,
      categorie: categorie,
      kilometrage: kilometrage,
      conducteurAge: conducteurAge,
    });

    let bestOffer = null;
    results.forEach((result) => {
      if (result.success) {
        console.log(
          `✅ ${result.name} → ${result.data.length} offres trouvées`
        );
        console.log("1er resultat:", result.data[0]);
      } else {
        console.warn(`❌ ${result.name} → Erreur : ${result.error}`);
      }
      if (result.data && result.data.length > 0) {
        result.data.forEach((offer) => {
          if (
            !bestOffer ||
            (offer.tarifTotal && offer.tarifTotal < bestOffer.tarifTotal)
          ) {
            bestOffer = offer;
            bestOffer.source = result.name;
          }
        });
      }
    });

    return res.json({
      results: results,
      bestOffer: bestOffer || null,
    });
  };

  run();
};
