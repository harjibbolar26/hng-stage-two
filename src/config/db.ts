import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "country_exchange_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const initDatabase = async () => {
  const connection = await pool.getConnection();

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${
        process.env.DB_NAME || "country_exchange_db"
      }`
    );
    await connection.query(
      `USE ${process.env.DB_NAME || "country_exchange_db"}`
    );

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
            last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CHECK (id = 1)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

    console.log("Database tables created successfully");
  } finally {
    connection.release();
  }
};

export default pool;
