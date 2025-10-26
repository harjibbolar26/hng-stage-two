"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageService = void 0;
const canvas_1 = require("canvas");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class ImageService {
    static async generateSummaryImage(totalCountries, topCountries, lastRefresh) {
        // Create canvas
        const width = 800;
        const height = 600;
        const canvas = (0, canvas_1.createCanvas)(width, height);
        const ctx = canvas.getContext('2d');
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Country Data Summary', width / 2, 60);
        // Total countries
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#00d9ff';
        ctx.fillText(`Total Countries: ${totalCountries}`, width / 2, 120);
        // Top 5 countries header
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText('Top 5 Countries by GDP', 50, 180);
        // Draw top countries
        ctx.font = '18px Arial';
        let yPos = 220;
        topCountries.forEach((country, index) => {
            // Rank circle
            ctx.fillStyle = '#00d9ff';
            ctx.beginPath();
            ctx.arc(70, yPos, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#1a1a2e';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${index + 1}`, 70, yPos + 6);
            // Country name
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(country.name, 110, yPos + 5);
            // GDP value
            ctx.font = '16px Arial';
            ctx.fillStyle = '#00d9ff';
            const gdp = country.estimated_gdp
                ? `$${(country.estimated_gdp / 1000000000).toFixed(2)}B`
                : 'N/A';
            ctx.fillText(`GDP: ${gdp}`, 110, yPos + 30);
            // Currency
            ctx.fillStyle = '#aaaaaa';
            ctx.font = '14px Arial';
            ctx.fillText(`Currency: ${country.currency_code || 'N/A'}`, 400, yPos + 5);
            // Population
            ctx.fillText(`Population: ${country.population.toLocaleString()}`, 400, yPos + 25);
            yPos += 70;
        });
        // Last refresh timestamp
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        const timestamp = lastRefresh
            ? `Last Refreshed: ${lastRefresh.toISOString()}`
            : 'Last Refreshed: Never';
        ctx.fillText(timestamp, width / 2, height - 30);
        // Border
        ctx.strokeStyle = '#00d9ff';
        ctx.lineWidth = 3;
        ctx.strokeRect(10, 10, width - 20, height - 20);
        // Save image
        const cacheDir = path_1.default.join(__dirname, '../../cache');
        if (!fs_1.default.existsSync(cacheDir)) {
            fs_1.default.mkdirSync(cacheDir, { recursive: true });
        }
        const imagePath = path_1.default.join(cacheDir, 'summary.png');
        const buffer = canvas.toBuffer('image/png');
        fs_1.default.writeFileSync(imagePath, buffer);
        return imagePath;
    }
}
exports.ImageService = ImageService;
