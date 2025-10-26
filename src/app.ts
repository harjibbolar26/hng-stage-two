import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import countryRoutes from "./routes/countryRoutes";
import path from "path";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/cache", express.static(path.join(__dirname, "../cache")));

app.get("/status", async (req, res) => {
  const { CountryController } = await import(
    "./controllers/countryControllers"
  );
  return CountryController.getStatus(req, res);
});
app.use("/countries", countryRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to my stage 2 task for HNGi13",
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
