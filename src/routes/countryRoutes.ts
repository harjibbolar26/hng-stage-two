import { Router } from "express";
import { CountryController } from "../controllers/countryControllers";

const router = Router();

// POST /countries/refresh - Refresh all countries data
router.post("/refresh", CountryController.refreshCountries);

// GET /countries/image - Get summary image
router.get("/image", CountryController.getSummaryImage);

// GET /countries - Get all countries with optional filters
router.get("/", CountryController.getAllCountries);

// DELETE /countries/:name - Delete country by name
router.get("/:name", CountryController.getCountryByName);

// GET /countries/:name - Get country by name
router.delete("/:name", CountryController.deleteCountryByName);

export default router;
