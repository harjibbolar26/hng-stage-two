import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";

export interface Country {
  id?: number;
  name: string;
  capital?: string | null;
  region?: string | null;
  population: number;
  currency_code?: string | null;
  exchange_rate?: number | null;
  estimated_gdp?: number | null;
  flag_url?: string | null;
  last_refreshed_at?: Date;
}

export interface ExternalCountryData {
  name: string;
  capital?: string;
  region?: string;
  population: number;
  flag?: string;
  currencies?: Array<{ code: string; name: string; symbol: string }>;
}

export interface ExchangeRates {
  rates: { [key: string]: number };
}

export class CountryModel {
  static async findAll(filters?: {
    region?: string;
    currency?: string;
    sort?: string;
  }): Promise<Country[]> {
    let query = "SELECT * FROM countries WHERE 1=1";
    const params: any[] = [];

    if (filters?.region) {
      query += " AND LOWER(region) = LOWER(?)";
      params.push(filters.region);
    }

    if (filters?.currency) {
      query += " AND LOWER(currency_code) = LOWER(?)";
      params.push(filters.currency);
    }

    if (filters?.sort === "gdp_desc") {
      query += " ORDER BY estimated_gdp DESC";
    } else if (filters?.sort === "gdp_asc") {
      query += " ORDER BY estimated_gdp ASC";
    } else if (filters?.sort === "population_desc") {
      query += " ORDER BY population DESC";
    } else if (filters?.sort === "population_asc") {
      query += " ORDER BY population ASC";
    } else {
      query += " ORDER BY name ASC";
    }

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return rows as Country[];
  }

  static async findByName(name: string): Promise<Country | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM countries WHERE LOWER(name) = LOWER(?)",
      [name]
    );

    if (rows.length === 0) return null;
    return rows[0] as Country;
  }

  static async upsert(country: Country): Promise<void> {
    const existing = await this.findByName(country.name);

    if (existing) {
      await pool.query(
        `UPDATE countries 
         SET capital = ?, region = ?, population = ?, currency_code = ?, 
             exchange_rate = ?, estimated_gdp = ?, flag_url = ?, 
             last_refreshed_at = CURRENT_TIMESTAMP
         WHERE LOWER(name) = LOWER(?)`,
        [
          country.capital,
          country.region,
          country.population,
          country.currency_code,
          country.exchange_rate,
          country.estimated_gdp,
          country.flag_url,
          country.name,
        ]
      );
    } else {
      await pool.query(
        `INSERT INTO countries 
         (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          country.name,
          country.capital,
          country.region,
          country.population,
          country.currency_code,
          country.exchange_rate,
          country.estimated_gdp,
          country.flag_url,
        ]
      );
    }
  }

  static async delete(name: string): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM countries WHERE LOWER(name) = LOWER(?)",
      [name]
    );

    return result.affectedRows > 0;
  }

  static async count(): Promise<number> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM countries"
    );

    return rows[0].total;
  }

  static async getTopByGDP(limit: number = 5): Promise<Country[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM countries WHERE estimated_gdp IS NOT NULL ORDER BY estimated_gdp DESC LIMIT ?",
      [limit]
    );
    return rows as Country[];
  }

  static async updateRefreshMetadata(): Promise<void> {
    await pool.query(
      "UPDATE refresh_metadata SET last_refreshed_at = CURRENT_TIMESTAMP WHERE id = 1"
    );
  }

  static async getLastRefreshTime(): Promise<Date | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT last_refreshed_at FROM refresh_metadata WHERE id = 1"
    );
    if (rows.length === 0) return null;
    const timestamp = rows[0].last_refreshed_at;
    return timestamp ? new Date(timestamp) : null;
  }
}
