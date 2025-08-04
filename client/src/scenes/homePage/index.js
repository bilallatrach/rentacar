import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import ComparateurTable from "components/ComparateurTable";
import { Formik } from "formik";
import React from "react";
import { useState } from "react";
import apiService from "services/apiService";

const HomePage = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [bestOffer, setBestOffer] = useState(null);

  const fetchData = async (values) => {
    setLoading(true);
    setResults([]); // Reset results before fetching new data
    setBestOffer(null); // Reset best offer
    try {
      const { data, error } = await apiService.postData(
        "/rent/getInformations",
        values
      );
      if (!error && data?.results) {
        setResults(data.results);
        setBestOffer(data.bestOffer || null);
        setLoading(false);
      } else if (error) {
        setLoading(false);
        console.error("Erreur lors de la récupération des données :", error);
      }
      return data;
    } catch (err) {
      setLoading(false);
      console.error("Erreur dans fetchData :", err);
      return null;
    }
  };

  return (
    <Box sx={{ padding: "20px", maxWidth: "1120px", margin: "0 auto" }}>
      <Formik
        initialValues={{
          ville: "Pau",
          dateDepart: "2025-08-11",
          dateRetour: "2025-08-12",
          heureDepart: "10:00",
          heureRetour: "10:00",
          categorie: "Berline",
          kilometrage: 100,
          conducteurAge: 26,
        }}
        validate={(values) => {
          const errors = {};
          if (!values.ville) {
            errors.ville = "Ville requis";
          }
          if (!values.dateDepart) {
            errors.dateDepart = "Date de depart Invalid";
          }
          if (!values.dateRetour) {
            errors.dateRetour = "Date de retour Invalid";
          }
          if (!values.heureDepart) {
            errors.heureDepart = "Heure de depart Invalid";
          }
          if (!values.heureRetour) {
            errors.heureRetour = "Heure de retour Invalid";
          }
          if (!values.categorie) {
            errors.categorie = "Catégorie requise";
          }
          if (!values.kilometrage) {
            errors.kilometrage = "Kilométrage requis";
          }
          if (!values.conducteurAge) {
            errors.conducteurAge = "Age du conducteur requis";
          }
          return errors;
        }}
        onSubmit={(values, { setSubmitting }) => {
          fetchData(values).then((data) => {
            setSubmitting(false);
          });
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          /* and other goodies */
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                maxWidth: "600px",
                margin: "0 auto",
                flexWrap: "wrap",
              }}
            >
              <Typography variant="h4" gutterBottom>
                Recherche de location de voiture
              </Typography>

              {/* <TextField
                type="text"
                name="ville"
                placeholder="Ville"
                fullWidth
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.ville}
                error={errors.ville && touched.ville}
                helperText={errors.ville}
              /> */}

              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Ville</InputLabel>
                <Select
                  labelId="select-ville"
                  id="select-ville"
                  label="Ville"
                  name="ville"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.ville}
                  error={errors.ville && touched.ville}
                  helperText={errors.ville}
                >
                  <MenuItem value="Pau">Pau</MenuItem>
                  <MenuItem value="Tarbes">Tarbes</MenuItem>
                  <MenuItem value="Dax">Dax</MenuItem>
                  <MenuItem value="Mont-de-Marsan">Mont-de-Marsan</MenuItem>
                </Select>
              </FormControl>

              <TextField
                type="date"
                name="dateDepart"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.dateDepart}
                error={errors.dateDepart && touched.dateDepart}
                helperText={errors.dateDepart}
              />

              <TextField
                type="time"
                name="heureDepart"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.heureDepart}
                error={errors.heureDepart && touched.heureDepart}
                helperText={errors.heureDepart}
              />

              <TextField
                type="date"
                name="dateRetour"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.dateRetour}
                error={errors.dateRetour && touched.dateRetour}
                helperText={errors.dateRetour}
              />

              <TextField
                type="time"
                name="heureRetour"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.heureRetour}
                error={errors.heureRetour && touched.heureRetour}
                helperText={errors.heureRetour}
              />

              <FormControl>
                <InputLabel id="select-category">Categorie</InputLabel>
                <Select
                  labelId="select-category"
                  id="select-category"
                  label="Categorie"
                  name="categorie"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.categorie}
                  error={errors.categorie && touched.categorie}
                  helperText={errors.categorie}
                >
                  <MenuItem value="Berline">Berline</MenuItem>
                </Select>
              </FormControl>

              <TextField
                type="number"
                name="kilometrage"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.kilometrage}
                error={errors.kilometrage && touched.kilometrage}
                helperText={errors.kilometrage}
              />
              <TextField
                type="number"
                name="conducteurAge"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.conducteurAge}
                error={errors.conducteurAge && touched.conducteurAge}
                helperText={errors.conducteurAge}
              />

              <Button fullWidth type="submit" disabled={isSubmitting}>
                Rechercher
              </Button>
            </Box>
          </form>
        )}
      </Formik>
      {loading && (
        <Box sx={{ marginTop: "20px" }}>
          <Typography variant="h1" gutterBottom>
            Recherche en cours...
          </Typography>

          <Box>
            <Skeleton variant="text" width="200px" />
            <Skeleton variant="text" width="50%" />

            <Grid container spacing={2} sx={{ marginTop: "20px" }}>
              <Grid item xs={12} sm={6} md={4}>
                <Skeleton variant="rectangular" width="200px" height="118px" />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Skeleton variant="rectangular" width="200px" height="118px" />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Skeleton variant="rectangular" width="200px" height="118px" />
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}
      {bestOffer && (
        <Box sx={{ marginTop: "20px", width: "fit-content" }}>
          <Typography variant="h1" gutterBottom>
            Meilleure offre
          </Typography>
          <Box
            sx={{
              padding: "10px",
              border: "1px solid",
              borderColor: "primary.main",
              borderRadius: "5px",
            }}
          >
            <Typography variant="h2" fontWeight="bold">
              {bestOffer.source}
            </Typography>
            <Typography variant="h2" fontWeight="bold">
              {bestOffer.name}
            </Typography>
            <Typography variant="h3">
              Tarif Total: {bestOffer.tarifTotal} €
            </Typography>
            {bestOffer.kilometrage && (
              <Typography>Kilométrage: {bestOffer.kilometrage}</Typography>
            )}
            {bestOffer.carburant && (
              <Typography>Carburant: {bestOffer.carburant}</Typography>
            )}
            {bestOffer.places && (
              <Typography>Places: {bestOffer.places}</Typography>
            )}
            {bestOffer.image && (
              <img
                src={bestOffer.image}
                alt={bestOffer.name}
                style={{ maxWidth: "100px", marginTop: "10px" }}
              />
            )}
            {bestOffer.lienOffre && (
              <Button
                href={bestOffer.lienOffre}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                color="primary"
                sx={{ marginTop: "10px" }}
              >
                Voir l'offre
              </Button>
            )}
          </Box>
        </Box>
      )}
      {/* Affichage des résultats de la recherche */}
      {results.length > 0 && (
        <Box sx={{ marginTop: "20px" }}>
          <Typography variant="h1" gutterBottom>
            Résultats de la recherche
          </Typography>
          {results.map((result, index) => (
            <Box
              key={index}
              sx={{
                marginBottom: "20px",
                borderBottom: "1px solid #ccc",
                paddingBottom: "20px",
              }}
            >
              <Typography variant="h2" fontWeight="bold">
                {result.name}
              </Typography>
              <Typography variant="h3">
                Nombre de résultats: {result.data?.length ?? 0}
              </Typography>
              <Grid container spacing={2} sx={{ marginTop: "20px" }}>
                {result.data?.map((item, idx) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    key={`${result.name}-${idx}`}
                  >
                    <Box
                      sx={{
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                      }}
                    >
                      <Typography>{item.categorie || item.name}</Typography>
                      <Typography>Tarif Total: {item.tarifTotal} €</Typography>
                      {item.kilometrage && (
                        <Typography>Kilométrage: {item.kilometrage}</Typography>
                      )}
                      {item.carburant && (
                        <Typography>Carburant: {item.carburant}</Typography>
                      )}
                      {item.places && (
                        <Typography>Places: {item.places}</Typography>
                      )}
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.categorie || item.name}
                          style={{ maxWidth: "100px", marginTop: "10px" }}
                        />
                      )}
                      {item.lienOffre && (
                        <Button
                          href={item.lienOffre}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="contained"
                          color="primary"
                          sx={{ marginTop: "10px" }}
                        >
                          Voir l'offre
                        </Button>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>
      )}

      {results.length > 0 && (
        <ComparateurTable data={results.filter((r) => r.success === true)} />
      )}
    </Box>
  );
};

export default HomePage;
