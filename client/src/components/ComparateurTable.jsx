import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  Typography,
  Box,
  Tooltip,
  TableSortLabel,
  Avatar,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

function getColorByPrice(price, minPrice) {
  if (price === "ND") return "transparent";
  const ratio = (price - minPrice) / minPrice;
  if (ratio <= 0.05) return "#C8E6C9"; // green
  if (ratio <= 0.15) return "#FFF9C4"; // yellow
  if (ratio <= 0.3) return "#FFE0B2"; // orange
  return "#FFCDD2"; // red
}

function getMinPriceAcrossAll(data) {
  return Math.min(
    ...data
      .flatMap((d) => d.data)
      .filter((o) => typeof o.tarifTotal === "number")
      .map((o) => o.tarifTotal)
  );
}

function Row({ loueur, minPriceGlobal }) {
  const [open, setOpen] = useState(false);
  const offresValides = loueur.data.filter(
    (o) => typeof o.tarifTotal === "number"
  );
  const bestOffer =
    offresValides.length > 0
      ? [...offresValides].sort((a, b) => a.tarifTotal - b.tarifTotal)[0]
      : null;

  const color = bestOffer
    ? getColorByPrice(bestOffer.tarifTotal, minPriceGlobal)
    : "transparent";

  return (
    <>
      <TableRow sx={{ backgroundColor: color }}>
        <TableCell>
          <IconButton onClick={() => setOpen(!open)} size="small">
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>{loueur.name}</TableCell>
        <TableCell>
          {bestOffer ? (
            <Tooltip
              title={`${
                bestOffer.tarifTotal - minPriceGlobal
              }€ au-dessus du tarif minimum`}
            >
              <span>{bestOffer.tarifTotal} €</span>
            </Tooltip>
          ) : (
            "ND"
          )}
        </TableCell>
        <TableCell>{bestOffer?.categorie || "ND"}</TableCell>
        <TableCell>{bestOffer?.kilometrage || "ND"}</TableCell>
        <TableCell>
          {bestOffer?.image && (
            <Avatar src={bestOffer.image} variant="square" />
          )}
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={6} sx={{ p: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Offres de {loueur.name}
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Catégorie</TableCell>
                    <TableCell>Prix</TableCell>
                    <TableCell>KM</TableCell>
                    <TableCell>Places</TableCell>
                    <TableCell>Carburant</TableCell>
                    <TableCell>Image</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...offresValides]
                    .sort((a, b) => a.tarifTotal - b.tarifTotal)
                    .map((offre, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{offre.categorie}</TableCell>
                        <TableCell>
                          <Tooltip
                            title={`${
                              offre.tarifTotal - minPriceGlobal
                            }€ au-dessus du tarif minimum`}
                          >
                            <span
                              style={{
                                backgroundColor: getColorByPrice(
                                  offre.tarifTotal,
                                  minPriceGlobal
                                ),
                                padding: "2px 6px",
                                borderRadius: 4,
                              }}
                            >
                              {offre.tarifTotal} €
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{offre.kilometrage}</TableCell>
                        <TableCell>{offre.places || "-"}</TableCell>
                        <TableCell>{offre.carburant || "-"}</TableCell>
                        <TableCell>
                          {offre.image && (
                            <Avatar src={offre.image} variant="square" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function ComparateurTable({ data }) {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("tarifTotal");

  const minGlobal = getMinPriceAcrossAll(data);

  const sorted = [...data].sort((a, b) => {
    const aBest = a.data.find((o) => typeof o.tarifTotal === "number");
    const bBest = b.data.find((o) => typeof o.tarifTotal === "number");
    if (!aBest || !bBest) return 0;
    return order === "asc"
      ? aBest.tarifTotal - bBest.tarifTotal
      : bBest.tarifTotal - aBest.tarifTotal;
  });

  // Priorise Rentacar en haut
  sorted.sort((a, b) => {
    if (a.name === "Rentacar") return -1;
    if (b.name === "Rentacar") return 1;
    return 0;
  });

  const handleSort = () => {
    setOrder(order === "asc" ? "desc" : "asc");
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Loueur</TableCell>
            <TableCell>
              <TableSortLabel active direction={order} onClick={handleSort}>
                Prix minimum
              </TableSortLabel>
            </TableCell>
            <TableCell>Catégorie</TableCell>
            <TableCell>KM inclus</TableCell>
            <TableCell>Image</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((loueur, idx) => (
            <Row key={idx} loueur={loueur} minPriceGlobal={minGlobal} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
