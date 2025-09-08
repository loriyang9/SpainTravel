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

  // 檢查是否有特定地址對應
  const specificAddress = LOCATION_ADDRESS_MAP[locationName.trim()];
  const searchQuery = specificAddress || locationName.trim();

  // 創建 Google Maps 搜尋 URL
  const encodedQuery = encodeURIComponent(searchQuery);
  return `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
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