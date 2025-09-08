import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Attraction } from "@shared/schema";
import '../types/google.d.ts';

interface DynamicMapProps {
  height?: number;
  className?: string;
}

interface AttractionWithCoords extends Attraction {
  lat?: number;
  lng?: number;
}

const DynamicMap = ({ height = 500, className = "" }: DynamicMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Fetch attractions data
  const { data: attractions, isLoading } = useQuery<Attraction[]>({
    queryKey: ['/api/attractions'],
  });

  // Category icon mapping based on your Google Sheets categories
  const getCategoryIcon = (category: string): string => {
    const iconMap: Record<string, string> = {
      "餐廳與小酒館": "🍽️",
      "早餐／早午餐": "🥐",
      "精品咖啡／咖啡館": "☕",
      "景點": "🏛️",
      "教堂": "⛪",
      "宮殿": "🏰",
      "購物中心": "🛍️",
      "市場": "🏪",
      "小店": "🏪",
      "步道": "🚶",
      "公園": "🌳",
      "古蹟": "🏺",
      "建築": "🏗️",
      "博物館": "🏛️",
      // 預設圖標
      "default": "📍"
    };
    
    return iconMap[category] || iconMap["default"];
  };

  // Load Google Maps Script
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsMapLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&language=zh-TW&region=ES`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsMapLoaded(true);
      script.onerror = () => {
        console.error('無法載入 Google Maps 腳本');
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Geocode attraction using Google Places API
  const geocodeAttraction = async (attraction: Attraction): Promise<AttractionWithCoords> => {
    if (!window.google || !window.google.maps) {
      return attraction;
    }

    const geocoder = new window.google.maps.Geocoder();
    const placesService = new window.google.maps.places.PlacesService(
      document.createElement('div')
    );

    // 嘗試使用 Places API 獲得更精確的結果
    try {
      const request = {
        query: `${attraction.nameEn || attraction.name}, ${attraction.city}, Spain`,
        fields: ['geometry', 'name', 'place_id']
      };

      const results = await new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
        placesService.textSearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            resolve(results);
          } else {
            reject(new Error(`Places API 錯誤: ${status}`));
          }
        });
      });

      if (results && results[0] && results[0].geometry && results[0].geometry.location) {
        const location = results[0].geometry.location;
        return {
          ...attraction,
          lat: location.lat(),
          lng: location.lng()
        };
      }
    } catch (error) {
      console.warn(`Places API 查詢失敗：${attraction.name}，嘗試使用 Geocoding API`);
    }

    // 備用方案：使用 Geocoding API
    try {
      const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode(
          { address: `${attraction.nameEn || attraction.name}, ${attraction.city}, Spain` },
          (results, status) => {
            if (status === 'OK' && results) {
              resolve(results);
            } else {
              reject(new Error(`Geocoding 錯誤: ${status}`));
            }
          }
        );
      });

      if (results && results[0]) {
        const location = results[0].geometry.location;
        return {
          ...attraction,
          lat: location.lat(),
          lng: location.lng()
        };
      }
    } catch (error) {
      console.warn(`無法定位景點：${attraction.name}`, error);
    }

    return attraction;
  };

  // Create custom marker icon
  const createMarkerIcon = (icon: string): google.maps.Icon => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 40;
    
    canvas.width = size;
    canvas.height = size;

    if (ctx) {
      // 繪製圓形背景
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // 繪製圖標文字
      ctx.font = '18px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#000000';
      ctx.fillText(icon, size / 2, size / 2);
    }

    return {
      url: canvas.toDataURL(),
      scaledSize: new window.google.maps.Size(32, 32),
      anchor: new window.google.maps.Point(16, 16)
    };
  };

  // Initialize map and add markers
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !attractions || attractions.length === 0) return;

    const initMap = async () => {
      // 初始化地圖，以西班牙為中心
      const map = new window.google.maps.Map(mapRef.current!, {
        zoom: 6,
        center: { lat: 40.4168, lng: -3.7038 }, // 馬德里，西班牙
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ],
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true
      });

      googleMapRef.current = map;

      // 建立資訊窗口
      const infoWindow = new window.google.maps.InfoWindow();

      // 為所有景點進行地理編碼並添加標記
      console.log('開始處理景點位置查詢...', attractions.length, '個景點');
      
      const geocodePromises = attractions.map(attraction => geocodeAttraction(attraction));
      const geocodedAttractions = await Promise.all(geocodePromises);

      const bounds = new window.google.maps.LatLngBounds();
      let markersAdded = 0;

      geocodedAttractions.forEach((attraction) => {
        if (attraction.lat && attraction.lng) {
          const icon = getCategoryIcon(attraction.category);
          const markerIcon = createMarkerIcon(icon);
          
          // 建立標記
          const marker = new window.google.maps.Marker({
            position: { lat: attraction.lat, lng: attraction.lng },
            map: map,
            title: attraction.name,
            icon: markerIcon
          });

          // 添加點擊監聽器顯示資訊窗口
          marker.addListener('click', () => {
            // 建立 Google Maps 連結
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${attraction.lat},${attraction.lng}`;
            
            infoWindow.setContent(`
              <div style="max-width: 300px; padding: 12px; font-family: system-ui, -apple-system, sans-serif;">
                <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                  ${attraction.name}
                </h3>
                ${attraction.nameEn ? `<p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; font-style: italic;">${attraction.nameEn}</p>` : ''}
                <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 6px 12px; border-radius: 16px; display: inline-flex; align-items: center; font-size: 13px; margin-bottom: 12px; gap: 6px;">
                  <span>${icon}</span>
                  <span>${attraction.category}</span>
                </div>
                <p style="margin: 8px 0; font-size: 14px; line-height: 1.5; color: #374151;">
                  ${attraction.description}
                </p>
                <div style="border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 12px; font-size: 13px; color: #6b7280;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span>📍</span>
                    <span>${attraction.city}</span>
                  </div>
                  <a href="${googleMapsUrl}" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; background: #10b981; color: white; padding: 8px 12px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 500; transition: background-color 0.2s;">
                    <span>🗺️</span>
                    <span>在 Google Maps 中查看</span>
                  </a>
                </div>
              </div>
            `);
            infoWindow.open(map, marker);
          });

          bounds.extend({ lat: attraction.lat, lng: attraction.lng });
          markersAdded++;
        } else {
          console.warn(`無法定位景點：${attraction.name} (${attraction.city})`);
        }
      });

      // 調整地圖視野以包含所有標記
      if (markersAdded > 0) {
        map.fitBounds(bounds);
        // 避免過度放大單一標記
        const listener = window.google.maps.event.addListener(map, 'idle', () => {
          if (map.getZoom()! > 15) map.setZoom(15);
          window.google.maps.event.removeListener(listener);
        });
        
        console.log(`成功添加 ${markersAdded} 個景點標記到地圖`);
      } else {
        console.warn('沒有找到任何有效的景點位置');
      }
    };

    initMap().catch(console.error);
  }, [isMapLoaded, attractions]);

  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted/20 rounded-lg ${className}`}
        style={{ height }}
        data-testid="map-loading"
      >
        <div className="text-muted-foreground">載入地圖資料中...</div>
      </div>
    );
  }

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <div 
        className={`flex items-center justify-center bg-red-50 rounded-lg border border-red-200 ${className}`}
        style={{ height }}
        data-testid="map-error"
      >
        <div className="text-red-600 text-center">
          <p className="font-semibold">Google Maps API 金鑰未設定</p>
          <p className="text-sm">請設定 VITE_GOOGLE_MAPS_API_KEY 環境變數</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden shadow-lg ${className}`} data-testid="dynamic-map">
      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }}
        className="bg-muted/20"
        data-testid="map-container"
      />
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          <div className="text-muted-foreground">載入 Google Maps 中...</div>
        </div>
      )}
    </div>
  );
};

export default DynamicMap;