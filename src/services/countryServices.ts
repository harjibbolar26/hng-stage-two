import axios from "axios";
import {
  Country,
  CountryModel,
  ExchangeRates,
  ExternalCountryData,
} from "../models/country";

const COUNTRIES_API =
  "https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies";
const EXCHANGE_API = "https://open.er-api.com/v6/latest/USD";

export class CountryService {
  static async refreshCountries(): Promise<void> {
    try {
      const countryResponse = await axios.get<ExternalCountryData[]>(
        COUNTRIES_API,
        { timeout: 10000 }
      );
      const countries = countryResponse.data;

      const exchnageResponse = await axios.get<ExchangeRates>(EXCHANGE_API, {
        timeout: 10000,
      });
      const exchangeRates = exchnageResponse.data.rates;

      for (const countryData of countries) {
        let currencyCode: string | null = null;
        let exchangeRate: number | null = null;
        let estimatedGdp: number | null = null;

        if (countryData.currencies && countryData.currencies.length > 0) {
          currencyCode = countryData.currencies[0].code;

          if (currencyCode && exchangeRates[currencyCode]) {
            exchangeRate = exchangeRates[currencyCode];

            const randomMultiplier = Math.random() * (2000 - 1000) + 1000;
            estimatedGdp =
              (countryData.population * randomMultiplier) / exchangeRate;
          }
        } else {
          estimatedGdp = 0;
        }

        const country: Country = {
          name: countryData.name,
          capital: countryData.capital || null,
          region: countryData.region || null,
          population: countryData.population,
          currency_code: currencyCode,
          exchange_rate: exchangeRate,
          estimated_gdp: estimatedGdp,
          flag_url: countryData?.flag || null,
        };

        await CountryModel.upsert(country);
      }

      await CountryModel.updateRefreshMetadata();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiName = error.config?.url?.includes("restcountries")
          ? "restcountries.com"
          : "open.er-api.com";
        throw new Error(`Could not fetch data from ${apiName}`);
      }
      throw error;
    }
  }

  static async getAllCountries(filters?: {
    region?: string;
    currency?: string;
    sort?: string;
  }): Promise<Country[]> {
    return CountryModel.findAll(filters);
  }

  static async getCountryByName(name: string): Promise<Country | null> {
    return CountryModel.findByName(name);
  }

  static async deleteCountry(name: string): Promise<boolean> {
    return CountryModel.delete(name);
  }

  static async getStatus(): Promise<{
    total_countries: number;
    last_refreshed_at: Date | null;
  }> {
    const total = await CountryModel.count();
    const lastRefresh = await CountryModel.getLastRefreshTime();

    return {
      total_countries: total,
      last_refreshed_at: lastRefresh,
    };
  }

  static async getTopCountriesByGDP(limit: number = 5): Promise<Country[]> {
    return CountryModel.getTopByGDP(limit);
  }
}
