// 地點對應到特定地址的映射
const LOCATION_ADDRESS_MAP: Record<string, string> = {
  "air bnb": "Ronda de Sant Pere, 35 3 2, 巴塞隆納, Catalunya 08010, 西班牙",
  "airbnb": "Ronda de Sant Pere, 35 3 2, 巴塞隆納, Catalunya 08010, 西班牙",
  "Air BnB": "Ronda de Sant Pere, 35 3 2, 巴塞隆納, Catalunya 08010, 西班牙",
  "Airbnb": "Ronda de Sant Pere, 35 3 2, 巴塞隆納, Catalunya 08010, 西班牙"
};

/**
 * 將地點名稱轉換為 Google Maps 搜尋 URL
 * @param locationName 地點名稱
 * @returns Google Maps 搜尋 URL
 */
export function createGoogleMapsUrl(locationName: string): string {
  if (!locationName || !locationName.trim()) {
    return '';
  }

  const trimmedLocation = locationName.trim();
  
  // 首先檢查完全匹配
  let searchQuery = LOCATION_ADDRESS_MAP[trimmedLocation];
  
  // 如果沒有完全匹配，檢查是否包含關鍵字
  if (!searchQuery) {
    const lowerLocation = trimmedLocation.toLowerCase();
    for (const [key, address] of Object.entries(LOCATION_ADDRESS_MAP)) {
      if (lowerLocation.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerLocation)) {
        searchQuery = address;
        break;
      }
    }
  }
  
  // 如果仍然沒有找到對應，使用原始地點名稱
  if (!searchQuery) {
    searchQuery = trimmedLocation;
  }

  // 創建 Google Maps 搜尋 URL
  const encodedQuery = encodeURIComponent(searchQuery);
  return `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
}

/**
 * 檢查是否為有效的地理位置
 * @param text 文字內容
 * @returns 是否為有效地理位置
 */
export function isValidLocation(text: string): boolean {
  if (!text || !text.trim()) {
    return false;
  }
  
  const trimmedText = text.trim().toLowerCase();
  
  // 排除非地理位置的描述性文字
  const nonLocationPhrases = [
    '飛機上好好睡一覺',
    '飛機上',
    '機上',
    '飛行中',
    '在飛機上',
    '途中',
    '旅途中',
    '無住宿',
    '不住宿',
    '休息'
  ];
  
  // 檢查是否包含非地理位置的關鍵字
  for (const phrase of nonLocationPhrases) {
    if (trimmedText.includes(phrase.toLowerCase())) {
      return false;
    }
  }
  
  return true;
}

/**
 * 打開 Google Maps 在新分頁
 * @param locationName 地點名稱
 */
export function openLocationInGoogleMaps(locationName: string): void {
  const url = createGoogleMapsUrl(locationName);
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}