# 部署前檢查清單

## 📋 在取消 Replit 訂閱前必做

### 1. 保存所有環境變數
- [ ] 打開 Replit → Tools → Secrets
- [ ] 複製以下 secrets 的值：
  - `OPENAI_API_KEY`
  - `GOOGLE_SERVICE_ACCOUNT_JSON`
  - `GOOGLE_MAPS_API_KEY`（如果有）
  - 任何資料庫相關的變數
- [ ] 將這些值保存到安全的地方（密碼管理器）

### 2. 確認 GitHub 安全
- [ ] 檢查 `.gitignore` 已正確設定
- [ ] 確認沒有 `.env` 文件被上傳
- [ ] 檢查 GitHub repository 中沒有 API keys

### 3. 備份資料
- [ ] 如果有使用資料庫，匯出資料
- [ ] 備份所有上傳的圖片（`attached_assets/` 資料夾）
- [ ] 確認 Google Sheets 資料來源仍可訪問

### 4. 驗證代碼完整性
- [ ] 所有源代碼已上傳到 GitHub
- [ ] `package.json` 包含所有依賴
- [ ] 配置文件都已上傳（`vite.config.ts`, `tsconfig.json` 等）

---

## 🚀 重新部署步驟

### 選項 A：Vercel（推薦）

1. **登入 Vercel**
   - 訪問 https://vercel.com
   - 使用 GitHub 登入

2. **導入專案**
   - 點擊 "Add New" → "Project"
   - 選擇你的 GitHub repository
   - 點擊 "Import"

3. **配置環境變數**
   - 在 "Environment Variables" 部分添加：
     ```
     VITE_GOOGLE_MAPS_API_KEY=你的值
     OPENAI_API_KEY=你的值
     GOOGLE_SERVICE_ACCOUNT_JSON=你的值
     ```

4. **部署**
   - 點擊 "Deploy"
   - 等待構建完成

### 選項 B：Railway

1. **登入 Railway**
   - 訪問 https://railway.app
   - 使用 GitHub 登入

2. **創建專案**
   - 點擊 "New Project"
   - 選擇 "Deploy from GitHub repo"
   - 選擇你的 repository

3. **添加環境變數**
   - 點擊專案 → "Variables"
   - 添加所有環境變數

4. **添加資料庫（如需要）**
   - 點擊 "New" → "Database" → "PostgreSQL"

---

## ✅ 部署後測試

- [ ] 網站可以正常訪問
- [ ] 地圖功能正常顯示
- [ ] Google Sheets 資料正確載入
- [ ] AI 生成的描述正常顯示
- [ ] 所有頁面都可以訪問

---

## 📞 需要協助？

如果遇到問題：
1. 檢查環境變數是否正確設定
2. 查看部署平台的日誌（Logs）
3. 確認 API keys 有足夠的配額
4. 檢查 Google Maps API 的網域限制

---

**創建日期：** 2025-10-18
