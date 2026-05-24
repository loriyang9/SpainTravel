import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import express from "express";
import path from "path";
import GoogleSheetsService from "./services/googleSheets.js";

export async function registerRoutes(app: Express): Promise<Server> {
  const googleSheetsService = new GoogleSheetsService();

  // Serve uploaded assets statically
  app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets')));

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
    let clientEmail = "未設定";
    try {
      const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}');
      clientEmail = credentials.client_email || "未在 JSON 中找到 client_email";
    } catch (e) {
      clientEmail = "解析 GOOGLE_SERVICE_ACCOUNT_JSON 失敗";
    }

    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      message: "西班牙金秋之旅 API 正常運行",
      googleServiceAccountEmail: clientEmail,
      hasOpenAiKey: !!process.env.OPENAI_API_KEY,
      openAiKeyPrefix: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.slice(0, 7)}...` : "未設定"
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
    } catch (error: any) {
      console.error(`Debug error for sheet ${req.params.sheetName}:`, error);
      res.status(500).json({ 
        error: `無法讀取 ${req.params.sheetName} 資料`, 
        message: error?.message || String(error),
        details: error?.response?.data || error
      });
    }
  });

  // Debug endpoint to test OpenAI connectivity
  app.get("/api/debug/openai", async (req, res) => {
    try {
      const openai = (googleSheetsService as any).openai;
      if (!openai) {
        return res.status(400).json({ error: "OpenAI client not initialized (no API key?)" });
      }
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: "Say hello in 5 words" }],
        max_tokens: 10
      });
      
      res.json({
        success: true,
        response: response.choices[0]?.message?.content || ""
      });
    } catch (error: any) {
      console.error("OpenAI test error:", error);
      res.status(500).json({
        error: "OpenAI call failed",
        message: error?.message || String(error),
        stack: error?.stack,
        details: error
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
