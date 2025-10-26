"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountryController = void 0;
const countryServices_1 = require("../services/countryServices");
const imageServices_1 = require("../services/imageServices");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class CountryController {
    static async refreshCountries(req, res) {
        try {
            await countryServices_1.CountryService.refreshCountries();
            const status = await countryServices_1.CountryService.getStatus();
            const topCountries = await countryServices_1.CountryService.getTopCountriesByGDP(5);
            await imageServices_1.ImageService.generateSummaryImage(status.total_countries, topCountries, status.last_refreshed_at);
            res.json({
                message: "Countries data refreshed successfully",
                total_countries: status.total_countries,
                last_refreshed_at: status.last_refreshed_at,
            });
        }
        catch (error) {
            if (error instanceof Error &&
                error.message.includes("Could not fetch data from")) {
                res.status(503).json({
                    error: "External data source unavailable",
                    details: error.message,
                });
            }
            else {
                console.error("Refresh error:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        }
    }
    static async getAllCountries(req, res) {
        try {
            const filters = {
                region: req.query.region,
                currency: req.query.currency,
                sort: req.query.sort,
            };
            const countries = await countryServices_1.CountryService.getAllCountries(filters);
            res.json(countries);
        }
        catch (error) {
            console.error("Get all countries error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
    static async getCountryByName(req, res) {
        try {
            const { name } = req.params;
            if (!name) {
                res.status(400).json({
                    error: "Validation failed",
                    details: { name: "is required" },
                });
                return;
            }
            const country = await countryServices_1.CountryService.getCountryByName(name);
            if (!country) {
                res.status(404).json({ error: "Country not found" });
                return;
            }
            res.status(200).json(country);
        }
        catch (error) {
            console.error("Get country by name error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
    static async deleteCountryByName(req, res) {
        try {
            const { name } = req.params;
            if (!name) {
                res.status(400).json({
                    error: "Validation failed",
                    details: { name: "is required" },
                });
                return;
            }
            const deleted = await countryServices_1.CountryService.deleteCountry(name);
            if (!deleted) {
                res.status(404).json({ error: "Country not found" });
                return;
            }
            res.status(204).json();
        }
        catch (error) {
            console.error("Delete country error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
    static async getStatus(req, res) {
        try {
            const status = await countryServices_1.CountryService.getStatus();
            res.json(status);
        }
        catch (error) {
            console.error("Get status error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
    static async getSummaryImage(req, res) {
        try {
            const imagePath = path_1.default.join(__dirname, "../../cache/summary.png");
            if (!fs_1.default.existsSync(imagePath)) {
                res.status(404).json({ error: "Summary image not found" });
                return;
            }
            res.sendFile(imagePath);
        }
        catch (error) {
            console.error("Get summary image error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}
exports.CountryController = CountryController;
