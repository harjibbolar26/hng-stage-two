"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const countryControllers_1 = require("../controllers/countryControllers");
const router = (0, express_1.Router)();
// POST /countries/refresh - Refresh all countries data
router.post("/refresh", countryControllers_1.CountryController.refreshCountries);
// GET /countries/image - Get summary image
router.get("/image", countryControllers_1.CountryController.getSummaryImage);
// GET /countries - Get all countries with optional filters
router.get("/", countryControllers_1.CountryController.getAllCountries);
// DELETE /countries/:name - Delete country by name
router.get("/:name", countryControllers_1.CountryController.getCountryByName);
// GET /countries/:name - Get country by name
router.delete("/:name", countryControllers_1.CountryController.deleteCountryByName);
exports.default = router;
