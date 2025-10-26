"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = void 0;
// src/config/database.ts
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = promise_1.default.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "country_exchange_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: "+00:00", // Use UTC
    dateStrings: false, // Return dates as Date objects
});
const initDatabase = async () => {
    const connection = await pool.getConnection();
    try {
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || "country_exchange_db"}`);
        await connection.query(`USE ${process.env.DB_NAME || "country_exchange_db"}`);
        // Create countries table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS countries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        capital VARCHAR(255),
        region VARCHAR(255),
        population BIGINT NOT NULL,
        currency_code VARCHAR(10),
        exchange_rate DECIMAL(20, 4),
        estimated_gdp DECIMAL(30, 2),
        flag_url VARCHAR(500),
        last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_region (region),
        INDEX idx_currency (currency_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        await connection.query(`
      CREATE TABLE IF NOT EXISTS refresh_metadata (
        id INT PRIMARY KEY DEFAULT 1,
        last_refreshed_at DATETIME NULL DEFAULT NULL,
        CHECK (id = 1)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
        await connection.query(`
      INSERT IGNORE INTO refresh_metadata (id, last_refreshed_at)
      VALUES (1, NULL)
    `);
        console.log("Database tables created successfully");
    }
    finally {
        connection.release();
    }
};
exports.initDatabase = initDatabase;
exports.default = pool;
