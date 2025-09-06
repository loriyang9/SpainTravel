import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import GoogleSheetsService from "./services/googleSheets.js";

export async function registerRoutes(app: Express): Promise<Server> {
  const googleSheetsService = new GoogleSheetsService();

  // Google Sheets API endpoints
  app.get("/api/itinerary", async (req, res) => {
    try {
      const itinerary = await googleSheetsService.getDailyItinerary();
      res.json(itinerary);
    } catch (error) {
      console.error("Error fetching itinerary:", error?.message || error);
      res.status(500).json({ error: "無法讀取行程資料" });
    }
  });

  app.get("/api/attractions", async (req, res) => {
    try {
      const attractions = await googleSheetsService.getAttractions();
      res.json(attractions);
    } catch (error) {
      console.error("Error fetching attractions:", error);
      res.status(500).json({ error: "無法讀取景點資料" });
    }
  });

  app.get("/api/reminders", async (req, res) => {
    try {
      const reminders = await googleSheetsService.getTravelReminders();
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      res.status(500).json({ error: "無法讀取提醒資料" });
    }
  });


  // Weather API endpoint
  app.get("/api/weather/:city", async (req, res) => {
    try {
      const city = req.params.city;
      const apiKey = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY || "your-api-key";
      
      if (!apiKey || apiKey === "your-api-key") {
        // Return mock data if no API key is available
        const mockWeather = {
          city,
          temperature: Math.floor(Math.random() * 15) + 15, // 15-30°C
          condition: ["晴朗", "多雲", "少雲"][Math.floor(Math.random() * 3)],
          description: "適合戶外活動",
          icon: "01d"
        };
        return res.json(mockWeather);
      }

      // Make actual API call to OpenWeatherMap
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=zh_tw`
      );
      
      if (!weatherResponse.ok) {
        throw new Error(`Weather API error: ${weatherResponse.status}`);
      }
      
      const weatherData = await weatherResponse.json();
      
      // Transform the response to match our interface
      const transformedData = {
        city: weatherData.name,
        temperature: Math.round(weatherData.main.temp),
        condition: weatherData.weather[0].description,
        description: `濕度 ${weatherData.main.humidity}%, 風速 ${weatherData.wind.speed}m/s`,
        icon: weatherData.weather[0].icon
      };
      
      res.json(transformedData);
    } catch (error) {
      console.error("Weather API error:", error);
      // Return fallback data
      res.json({
        city: req.params.city,
        temperature: 22,
        condition: "數據載入中",
        description: "請稍後重試",
        icon: "01d"
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      message: "西班牙金秋之旅 API 正常運行"
    });
  });

  // Debug endpoint to see raw sheet data
  app.get("/api/debug/sheets/:sheetName", async (req, res) => {
    try {
      const { sheetName } = req.params;
      const rawData = await googleSheetsService.getSheetData(sheetName);
      res.json({
        sheetName,
        rowCount: rawData.length,
        data: rawData
      });
    } catch (error) {
      console.error(`Debug error for sheet ${req.params.sheetName}:`, error);
      res.status(500).json({ error: `無法讀取 ${req.params.sheetName} 資料` });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
