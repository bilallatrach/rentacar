// searchParams.js

import { getAgencyCodes } from "./location.js";

export function buildSearchParams({
  ville,
  dateDepart,
  dateRetour,
  heureDepart,
  heureRetour,
  categorie,
  kilometrage,
  conducteurAge,
}) {
  return {
    ville,
    agenceCode: getAgencyCodes(ville), // ex: { ada: 'FRD70A', francecars: 73 }
    dateDepart: new Date(dateDepart),
    dateRetour: new Date(dateRetour),
    heureDepart,
    heureRetour,
    categorie,
    kilometrage,
    conducteurAge,
  };
}
