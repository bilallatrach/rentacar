import express from "express";
import { getRentCarInformation } from "../controllers/rent.js";

const router = express.Router();

router.post("/getInformations", getRentCarInformation);

export default router;
