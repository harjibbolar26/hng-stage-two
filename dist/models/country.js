"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountryModel = void 0;
const db_1 = __importDefault(require("../config/db"));
class CountryModel {
    static async findAll(filters) {
        let query = "SELECT * FROM countries WHERE 1=1";
        const params = [];
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
        }
        else if (filters?.sort === "gdp_asc") {
            query += " ORDER BY estimated_gdp ASC";
        }
        else if (filters?.sort === "population_desc") {
            query += " ORDER BY population DESC";
        }
        else if (filters?.sort === "population_asc") {
            query += " ORDER BY population ASC";
        }
        else {
            query += " ORDER BY name ASC";
        }
        const [rows] = await db_1.default.query(query, params);
        return rows;
    }
    static async findByName(name) {
        const [rows] = await db_1.default.query("SELECT * FROM countries WHERE LOWER(name) = LOWER(?)", [name]);
        if (rows.length === 0)
            return null;
        return rows[0];
    }
    static async upsert(country) {
        const existing = await this.findByName(country.name);
        if (existing) {
            await db_1.default.query(`UPDATE countries 
         SET capital = ?, region = ?, population = ?, currency_code = ?, 
             exchange_rate = ?, estimated_gdp = ?, flag_url = ?, 
             last_refreshed_at = CURRENT_TIMESTAMP
         WHERE LOWER(name) = LOWER(?)`, [
                country.capital,
                country.region,
                country.population,
                country.currency_code,
                country.exchange_rate,
                country.estimated_gdp,
                country.flag_url,
                country.name,
            ]);
        }
        else {
            await db_1.default.query(`INSERT INTO countries 
         (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                country.name,
                country.capital,
                country.region,
                country.population,
                country.currency_code,
                country.exchange_rate,
                country.estimated_gdp,
                country.flag_url,
            ]);
        }
    }
    static async delete(name) {
        const [result] = await db_1.default.query("DELETE FROM countries WHERE LOWER(name) = LOWER(?)", [name]);
        return result.affectedRows > 0;
    }
    static async count() {
        const [rows] = await db_1.default.query("SELECT COUNT(*) as total FROM countries");
        return rows[0].total;
    }
    static async getTopByGDP(limit = 5) {
        const [rows] = await db_1.default.query("SELECT * FROM countries WHERE estimated_gdp IS NOT NULL ORDER BY estimated_gdp DESC LIMIT ?", [limit]);
        return rows;
    }
    static async updateRefreshMetadata() {
        await db_1.default.query("UPDATE refresh_metadata SET last_refreshed_at = CURRENT_TIMESTAMP WHERE id = 1");
    }
    static async getLastRefreshTime() {
        const [rows] = await db_1.default.query("SELECT last_refreshed_at FROM refresh_metadata WHERE id = 1");
        if (rows.length === 0)
            return null;
        const timestamp = rows[0].last_refreshed_at;
        return timestamp ? new Date(timestamp) : null;
    }
}
exports.CountryModel = CountryModel;
