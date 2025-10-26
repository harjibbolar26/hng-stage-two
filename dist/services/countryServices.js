"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountryService = void 0;
const axios_1 = __importDefault(require("axios"));
const country_1 = require("../models/country");
const COUNTRIES_API = "https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies";
const EXCHANGE_API = "https://open.er-api.com/v6/latest/USD";
class CountryService {
    static async refreshCountries() {
        try {
            const countryResponse = await axios_1.default.get(COUNTRIES_API, { timeout: 10000 });
            const countries = countryResponse.data;
            const exchnageResponse = await axios_1.default.get(EXCHANGE_API, {
                timeout: 10000,
            });
            const exchangeRates = exchnageResponse.data.rates;
            for (const countryData of countries) {
                let currencyCode = null;
                let exchangeRate = null;
                let estimatedGdp = null;
                if (countryData.currencies && countryData.currencies.length > 0) {
                    currencyCode = countryData.currencies[0].code;
                    if (currencyCode && exchangeRates[currencyCode]) {
                        exchangeRate = exchangeRates[currencyCode];
                        const randomMultiplier = Math.random() * (2000 - 1000) + 1000;
                        estimatedGdp =
                            (countryData.population * randomMultiplier) / exchangeRate;
                    }
                }
                else {
                    estimatedGdp = 0;
                }
                const country = {
                    name: countryData.name,
                    capital: countryData.capital || null,
                    region: countryData.region || null,
                    population: countryData.population,
                    currency_code: currencyCode,
                    exchange_rate: exchangeRate,
                    estimated_gdp: estimatedGdp,
                    flag_url: countryData?.flag || null,
                };
                await country_1.CountryModel.upsert(country);
            }
            await country_1.CountryModel.updateRefreshMetadata();
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const apiName = error.config?.url?.includes("restcountries")
                    ? "restcountries.com"
                    : "open.er-api.com";
                throw new Error(`Could not fetch data from ${apiName}`);
            }
            throw error;
        }
    }
    static async getAllCountries(filters) {
        return country_1.CountryModel.findAll(filters);
    }
    static async getCountryByName(name) {
        return country_1.CountryModel.findByName(name);
    }
    static async deleteCountry(name) {
        return country_1.CountryModel.delete(name);
    }
    static async getStatus() {
        const total = await country_1.CountryModel.count();
        const lastRefresh = await country_1.CountryModel.getLastRefreshTime();
        return {
            total_countries: total,
            last_refreshed_at: lastRefresh,
        };
    }
    static async getTopCountriesByGDP(limit = 5) {
        return country_1.CountryModel.getTopByGDP(limit);
    }
}
exports.CountryService = CountryService;
