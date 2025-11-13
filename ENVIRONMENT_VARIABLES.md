# 環境變數清單

## 重要！請在取消 Replit 訂閱前保存這些資訊

這個專案需要以下環境變數才能正常運作。請將這些資訊安全保存，部署到其他平台時會需要。

---

## 必需的環境變數

### 1. Google Maps API Key
**變數名稱：** `VITE_GOOGLE_MAPS_API_KEY`  
**當前值：** `AIzaSyCycFLaTkTR5I5-zb1yQteh-wPegVRZvOg`  
**用途：** 前端地圖顯示、地理編碼、地點資訊  
**使用的 API：**
- Maps JavaScript API
- Geocoding API
- Places API

**重要提醒：**
- 這個 Key 需要設定網站限制（參考 Google 的安全警告）
- 部署到新平台時，在 Google Cloud Console 更新允許的網域

---

### 2. OpenAI API Key
**變數名稱：** `OPENAI_API_KEY`  
**當前值：** 請從 Replit Secrets 中查看並記錄  
**用途：** 生成每日行程的 AI 描述文字  
**位置：** Replit → Tools → Secrets → `OPENAI_API_KEY`

---

### 3. Google Service Account JSON
**變數名稱：** `GOOGLE_SERVICE_ACCOUNT_JSON`  
**當前值：** 請從 Replit Secrets 中查看並記錄  
**用途：** 連接 Google Sheets 讀取行程資料  
**位置：** Replit → Tools → Secrets → `GOOGLE_SERVICE_ACCOUNT_JSON`  
**格式：** JSON 字串（包含 service account 的憑證）

---

### 4. Weather API Key（選用）
**變數名稱：** `OPENWEATHER_API_KEY` 或 `WEATHER_API_KEY`  
**當前值：** 如果有使用請記錄  
**用途：** 顯示天氣資訊  
**備註：** 如果沒有設定，會使用模擬資料

---

## 資料庫環境變數（如果使用 PostgreSQL）

如果你的專案使用了 PostgreSQL 資料庫，可能還需要：

- `DATABASE_URL` - 資料庫連接字串
- `PGHOST` - 資料庫主機
- `PGPORT` - 資料庫端口
- `PGUSER` - 資料庫用戶名
- `PGPASSWORD` - 資料庫密碼
- `PGDATABASE` - 資料庫名稱

**請檢查 Replit Secrets 確認是否有這些變數。**

---

## 部署到其他平台的設定步驟

### Vercel
1. 連接 GitHub repository
2. 在 Settings → Environment Variables 添加上述所有變數
3. 部署

### Railway
1. 從 GitHub 創建新專案
2. 在 Variables 分頁添加環境變數
3. 如需資料庫，添加 PostgreSQL 服務

### Render
1. 連接 GitHub repository
2. 在 Environment 部分添加所有變數
3. 部署

---

## 安全提醒

⚠️ **絕對不要：**
- 把這些 API keys 上傳到 GitHub
- 在程式碼中硬編碼這些值
- 分享給其他人

✅ **應該：**
- 將此文件保存在安全的地方（如密碼管理器）
- 定期更換 API keys
- 為每個部署環境使用不同的 keys（開發/生產）

---

## 快速檢查清單

在取消 Replit 訂閱前，確認你已經：

- [ ] 記錄所有上述的 API keys
- [ ] 保存 `GOOGLE_SERVICE_ACCOUNT_JSON` 完整內容
- [ ] 確認 `.gitignore` 已更新
- [ ] 確認 GitHub 上沒有敏感資訊
- [ ] 測試過可以從 GitHub clone 並本地運行
- [ ] 了解如何在新平台設定環境變數

---

**最後更新：** 2025-10-18
