"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
dotenv_1.default.config();
const PORT = process.env.PORT || 4040;
const startServer = async () => {
    console.log("starting server");
    try {
        await (0, db_1.initDatabase)();
        console.log("Database initialized successfully");
        app_1.default.listen(PORT, () => {
            console.log(`Server started on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
