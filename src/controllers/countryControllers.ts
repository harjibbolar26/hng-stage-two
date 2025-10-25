import { Request, Response } from "express";
import { CountryService } from "../services/countryServices";
import { ImageService } from "../services/imageServices";
import path from "path";
import fs from "fs";

export class CountryController {
  static async refreshCountries(req: Request, res: Response): Promise<void> {
    try {
      await CountryService.refreshCountries();

      const status = await CountryService.getStatus();
      const topCountries = await CountryService.getTopCountriesByGDP(5);

      await ImageService.generateSummaryImage(
        status.total_countries,
        topCountries,
        status.last_refreshed_at
      );

      res.json({
        message: "Countries data refreshed successfully",
        total_countries: status.total_countries,
        last_refreshed_at: status.last_refreshed_at,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Could not fetch data from")
      ) {
        res.status(503).json({
          error: "External data source unavailable",
          details: error.message,
        });
      } else {
        console.error("Refresh error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  static async getAllCountries(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        region: req.query.region as string | undefined,
        currency: req.query.currency as string | undefined,
        sort: req.query.sort as string | undefined,
      };

      const countries = await CountryService.getAllCountries(filters);
      res.json(countries);
    } catch (error) {
      console.error("Get all countries error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getCountryByName(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;

      if (!name) {
        res.status(400).json({
          error: "Validation failed",
          details: { name: "is required" },
        });
        return;
      }

      const country = await CountryService.getCountryByName(name);

      if (!country) {
        res.status(404).json({ error: "Country not found" });
        return;
      }

      res.status(200).json(country);
    } catch (error) {
      console.error("Get country by name error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async deleteCountryByName(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;

      if (!name) {
        res.status(400).json({
          error: "Validation failed",
          details: { name: "is required" },
        });
        return;
      }

      const deleted = await CountryService.deleteCountry(name);

      if (!deleted) {
        res.status(404).json({ error: "Country not found" });
        return;
      }

      res.status(204).json();
    } catch (error) {
      console.error("Delete country error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await CountryService.getStatus();
      res.json(status);
    } catch (error) {
      console.error("Get status error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getSummaryImage(req: Request, res: Response): Promise<void> {
    try {
      const imagePath = path.join(__dirname, "../../cache/summary.png");

      if (!fs.existsSync(imagePath)) {
        res.status(404).json({ error: "Summary image not found" });
        return;
      }

      res.sendFile(imagePath);
    } catch (error) {
      console.error("Get summary image error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
