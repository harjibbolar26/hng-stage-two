# Country Currency & Exchange API

A RESTful API that fetches country data from external APIs, stores it in MySQL, and provides CRUD operations with exchange rate calculations.

## Features

- 🌍 Fetch country data from RestCountries API
- 💱 Real-time exchange rates from Open Exchange Rates API
- 💰 Calculated estimated GDP per country
- 🗄️ MySQL database caching
- 🖼️ Auto-generated summary images
- 🔍 Advanced filtering and sorting
- ⚡ Built with TypeScript and Express

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/harjibbolar26/hng-stage-two
   cd hng-stage-two
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your database credentials:
   ```env
   PORT=4040
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=country_exchange_db
   ```

4. **Create MySQL database**
   
   The application will automatically create the database and tables on first run, but you can manually create it:
   ```sql
   CREATE DATABASE country_exchange_db;
   ```

5. **Build the project**
   ```bash
   npm run build
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

The server will start on `http://localhost:4040` (or the port specified in `.env`).

## API Endpoints

### 1. Refresh Countries Data
**POST** `/countries/refresh`

Fetches all countries and exchange rates, calculates GDP, and stores in database. Also generates a summary image.

**Response:**
```json
{
  "message": "Countries data refreshed successfully",
  "total_countries": 250,
  "last_refreshed_at": "2025-10-22T18:00:00Z"
}
```

**Error Response (503):**
```json
{
  "error": "External data source unavailable",
  "details": "Could not fetch data from restcountries.com"
}
```

### 2. Get All Countries
**GET** `/countries`

Get all countries with optional filtering and sorting.

**Query Parameters:**
- `region` - Filter by region (e.g., `Africa`, `Europe`)
- `currency` - Filter by currency code (e.g., `NGN`, `USD`)
- `sort` - Sort results:
  - `gdp_desc` - Sort by GDP descending
  - `gdp_asc` - Sort by GDP ascending
  - `population_desc` - Sort by population descending
  - `population_asc` - Sort by population ascending

**Examples:**
```bash
GET /countries?region=Africa
GET /countries?currency=NGN
GET /countries?sort=gdp_desc
GET /countries?region=Europe&sort=population_desc
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139589,
    "currency_code": "NGN",
    "exchange_rate": 1600.23,
    "estimated_gdp": 25767448125.2,
    "flag_url": "https://flagcdn.com/ng.svg",
    "last_refreshed_at": "2025-10-22T18:00:00Z"
  }
]
```

### 3. Get Country by Name
**GET** `/countries/:name`

Get a specific country by name (case-insensitive).

**Example:**
```bash
GET /countries/Nigeria
```

**Response:**
```json
{
  "id": 1,
  "name": "Nigeria",
  "capital": "Abuja",
  "region": "Africa",
  "population": 206139589,
  "currency_code": "NGN",
  "exchange_rate": 1600.23,
  "estimated_gdp": 25767448125.2,
  "flag_url": "https://flagcdn.com/ng.svg",
  "last_refreshed_at": "2025-10-22T18:00:00Z"
}
```

**Error Response (404):**
```json
{
  "error": "Country not found"
}
```

### 4. Delete Country
**DELETE** `/countries/:name`

Delete a country record from the database.

**Example:**
```bash
DELETE /countries/Nigeria
```

**Response:**
```json
{
  "message": "Country deleted successfully"
}
```

**Error Response (404):**
```json
{
  "error": "Country not found"
}
```

### 5. Get Status
**GET** `/status`

Get system status including total countries and last refresh time.

**Response:**
```json
{
  "total_countries": 250,
  "last_refreshed_at": "2025-10-22T18:00:00Z"
}
```

### 6. Get Summary Image
**GET** `/countries/image`

Retrieve the auto-generated summary image showing top 5 countries by GDP.

**Response:** PNG image file

**Error Response (404):**
```json
{
  "error": "Summary image not found"
}
```

## Data Model

### Country Schema

| Field | Type | Description |
|-------|------|-------------|
| id | INT | Auto-increment primary key |
| name | VARCHAR(255) | Country name (unique, required) |
| capital | VARCHAR(255) | Capital city (optional) |
| region | VARCHAR(255) | Geographic region (optional) |
| population | BIGINT | Population count (required) |
| currency_code | VARCHAR(10) | Currency code (e.g., NGN, USD) |
| exchange_rate | DECIMAL(20,4) | Exchange rate vs USD |
| estimated_gdp | DECIMAL(30,2) | Calculated GDP estimate |
| flag_url | VARCHAR(500) | Flag image URL |
| last_refreshed_at | TIMESTAMP | Last update timestamp |

## Business Logic

### GDP Calculation
```
estimated_gdp = (population × random(1000-2000)) ÷ exchange_rate
```

- A new random multiplier (1000-2000) is generated on each refresh
- If no currency or exchange rate, GDP is set to 0 or null

### Currency Handling

1. **Multiple Currencies:** Only the first currency is stored
2. **No Currencies:** Sets currency_code to null, exchange_rate to null, estimated_gdp to 0
3. **Currency Not in Exchange API:** Sets exchange_rate to null, estimated_gdp to null

### Update vs Insert

- Countries are matched by name (case-insensitive)
- Existing countries are updated with new data
- New countries are inserted
- All fields recalculated on refresh including new random GDP multiplier

## Error Handling

The API returns consistent JSON error responses:

| Status Code | Error Type | Example |
|-------------|-----------|---------|
| 400 | Bad Request | `{"error": "Validation failed", "details": {"name": "is required"}}` |
| 404 | Not Found | `{"error": "Country not found"}` |
| 500 | Server Error | `{"error": "Internal server error"}` |
| 503 | Service Unavailable | `{"error": "External data source unavailable", "details": "..."}` |

## Project Structure

```
country-currency-exchange-api/
├── src/
│   ├── config/
│   │   └── database.ts          # Database configuration
│   ├── controllers/
│   │   └── countryController.ts # Request handlers
│   ├── models/
│   │   └── Country.ts           # Country model & types
│   ├── routes/
│   │   └── countryRoutes.ts     # API routes
│   ├── services/
│   │   ├── countryService.ts    # Business logic
│   │   └── imageService.ts      # Image generation
│   └── server.ts                # Application entry point
├── cache/
│   └── summary.png              # Generated summary image
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
└── README.md                    # Documentation
```

## Testing the API

### Using cURL

```bash
# Refresh data
curl -X POST http://localhost:4040/countries/refresh

# Get all countries
curl http://localhost:4040/countries

# Filter by region
curl http://localhost:4040/countries?region=Africa

# Get specific country
curl http://localhost:4040/countries/Nigeria

# Delete country
curl -X DELETE http://localhost:4040/countries/Nigeria

# Get status
curl http://localhost:4040/status

# Download summary image
curl http://localhost:4040/countries/image -o summary.png
```

### Using Postman

1. Import the API endpoints
2. Set base URL to `http://localhost:4040`
3. Test each endpoint with various parameters

## External APIs Used

1. **RestCountries API**
   - URL: `https://restcountries.com/v2/all`
   - Purpose: Fetch country data (name, capital, population, currencies, flags)
   - Rate Limit: None specified

2. **Open Exchange Rates API**
   - URL: `https://open.er-api.com/v6/latest/USD`
   - Purpose: Fetch currency exchange rates
   - Rate Limit: None specified (free tier)

## Dependencies

### Production
- **express**: Web framework
- **mysql2**: MySQL database driver
- **axios**: HTTP client for external APIs
- **dotenv**: Environment variable management
- **canvas**: Image generation library

### Development
- **typescript**: Type safety
- **ts-node-dev**: Development server with hot reload
- **@types/express**: TypeScript definitions
- **@types/node**: Node.js TypeScript definitions

## Troubleshooting

### Database Connection Issues
```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u root -p -e "SHOW DATABASES;"
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001
```

### Canvas Installation Issues
```bash
# Ubuntu/Debian
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# macOS
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

### External API Failures
- Check internet connection
- Verify API URLs are accessible
- Check for API rate limits
- Review error logs for specific failures

## License

MIT

## Support

For issues and questions, please open an issue on the repository.