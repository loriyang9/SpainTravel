import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Attraction } from "@shared/schema";
import '../types/google.d.ts';

interface DynamicMapProps {
  height?: number;
  className?: string;
}

interface UserLocation {
  lat: number;
  lng: number;
}

interface MapCenter {
  lat: number;
  lng: number;
  source: 'user' | 'itinerary' | 'default';
}

interface AttractionWithCoords extends Attraction {
  lat?: number;
  lng?: number;
}

const DynamicMap = ({ height = 500, className = "" }: DynamicMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [mapCenter, setMapCenter] = useState<MapCenter>({ lat: 41.3851, lng: 2.1734, source: 'default' }); // Default to Barcelona

  // Fetch attractions data
  const { data: attractions, isLoading } = useQuery<Attraction[]>({
    queryKey: ['/api/attractions'],
  });

  // Fetch itinerary data for smart centering
  const { data: itineraryData = [] } = useQuery<any[]>({
    queryKey: ['/api/itinerary'],
  });

  // City coordinates mapping
  const getCityCoordinates = (cityName: string): { lat: number; lng: number } => {
    const cityMap: Record<string, { lat: number; lng: number }> = {
      '巴塞隆納': { lat: 41.3851, lng: 2.1734 },
      'Barcelona': { lat: 41.3851, lng: 2.1734 },
      '馬德里': { lat: 40.4168, lng: -3.7038 },
      'Madrid': { lat: 40.4168, lng: -3.7038 },
      '薩拉曼卡': { lat: 40.9701, lng: -5.6635 },
      'Salamanca': { lat: 40.9701, lng: -5.6635 },
      '台北': { lat: 25.0330, lng: 121.5654 },
      'Taipei': { lat: 25.0330, lng: 121.5654 },
    };
    return cityMap[cityName] || { lat: 41.3851, lng: 2.1734 }; // Default to Barcelona
  };

  // Get current trip day
  const getCurrentTripDay = (): number => {
    const departureDate = new Date('2025-10-05T00:30:00+08:00'); // Taiwan time
    const currentDate = new Date();
    const diffTime = currentDate.getTime() - departureDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Before the trip - show Day 0 
    if (diffDays < 0) {
      return 0;
    }
    
    // During the trip (Day 0 to Day 14)
    if (diffDays >= 0 && diffDays <= 14) {
      return diffDays;
    }
    
    // After the trip - show last day
    return 14;
  };

  // Get city for specific day from itinerary
  const getCityForDay = (dayNumber: number): string => {
    if (!Array.isArray(itineraryData) || itineraryData.length === 0) {
      return 'Barcelona'; // Default fallback
    }
    
    const dayData = itineraryData.find((day: any) => day.dayNumber === dayNumber);
    
    if (dayData?.city) {
      return dayData.city;
    }
    
    // Extract city from title as fallback
    const title = dayData?.title || '';
    if (title.includes('巴薩隆納') || title.includes('Barcelona')) return 'Barcelona';
    if (title.includes('薩拉曼卡') || title.includes('Salamanca')) return 'Salamanca';
    if (title.includes('馬德里') || title.includes('Madrid')) return 'Madrid';
    if (title.includes('台北') || title.includes('Taipei')) return 'Taipei';
    
    return 'Barcelona'; // Ultimate fallback
  };

  // Check if coordinates are in Spain
  const isInSpain = (lat: number, lng: number): boolean => {
    // Spain's approximate bounds
    const spainBounds = {
      north: 43.8,
      south: 36.0,
      east: 3.3,
      west: -9.3
    };
    
    return lat >= spainBounds.south && lat <= spainBounds.north && 
           lng >= spainBounds.west && lng <= spainBounds.east;
  };

  // Get user's location
  const getUserLocation = (): Promise<UserLocation> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes cache
        }
      );
    });
  };

  // Calculate smart map center
  const calculateMapCenter = async (): Promise<MapCenter> => {
    try {
      // Try to get user's location first
      const location = await getUserLocation();
      setUserLocation(location);
      
      // If user is in Spain, use their location
      if (isInSpain(location.lat, location.lng)) {
        return {
          lat: location.lat,
          lng: location.lng,
          source: 'user'
        };
      }
    } catch (error) {
      console.log('無法獲取用戶位置，使用行程邏輯:', error instanceof Error ? error.message : '位置服務不可用');
    }
    
    // User not in Spain or location unavailable, use itinerary logic
    const currentDay = getCurrentTripDay();
    
    if (currentDay === 0) {
      // Day 0 and before - use Barcelona
      const coords = getCityCoordinates('Barcelona');
      return {
        ...coords,
        source: 'default'
      };
    } else {
      // Day 1+ - use current day's city
      const cityName = getCityForDay(currentDay);
      const coords = getCityCoordinates(cityName);
      return {
        ...coords,
        source: 'itinerary'
      };
    }
  };

  // Initialize smart map center
  useEffect(() => {
    if (Array.isArray(itineraryData) && itineraryData.length > 0) {
      calculateMapCenter().then(center => {
        setMapCenter(center);
        console.log(`地圖中心設定為: ${center.source === 'user' ? '用戶位置' : center.source === 'itinerary' ? '行程城市' : '預設(巴塞隆納)'}`, center);
      }).catch(error => {
        console.warn('無法計算智能地圖中心，使用預設值:', error);
      });
    }
  }, [itineraryData]);

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

  // Category color mapping - same as AttractionCard
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "景點":
        return "#3b82f6"; // bg-blue-500
      case "市場":
        return "#22c55e"; // bg-green-500
      case "步道":
        return "#10b981"; // bg-emerald-500
      case "購物中心":
        return "#a855f7"; // bg-purple-500
      case "餐廳與小酒館":
        return "#ef4444"; // bg-red-500
      case "早餐／早午餐":
        return "#f97316"; // bg-orange-500
      case "精品咖啡／咖啡館":
        return "#d97706"; // bg-amber-600
      case "小店":
        return "#ec4899"; // bg-pink-500
      case "教堂":
        return "#6366f1"; // bg-indigo-500
      case "博物館":
        return "#14b8a6"; // bg-teal-500
      case "宮殿":
        return "#ca8a04"; // bg-yellow-600
      case "公園":
        return "#84cc16"; // bg-lime-500
      case "古蹟":
        return "#78716c"; // bg-stone-500
      case "建築":
        return "#4b5563"; // bg-gray-600
      default:
        return "#64748b"; // bg-slate-500
    }
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
      // 初始化地圖，使用智能中心點
      const map = new window.google.maps.Map(mapRef.current!, {
        zoom: mapCenter.source === 'user' ? 10 : 6,
        center: { lat: mapCenter.lat, lng: mapCenter.lng },
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
            // 建立 Google Maps 連結 - 搜尋景點名稱和城市
            const queryString = `${attraction.name},${attraction.city}`;
            const googleMapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(queryString)}`;
            const categoryColor = getCategoryColor(attraction.category);
            
            infoWindow.setContent(`
              <div style="max-width: 300px; padding: 12px; font-family: system-ui, -apple-system, sans-serif;">
                <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                  ${attraction.name}
                </h3>
                ${attraction.nameEn ? `<p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; font-style: italic;">${attraction.nameEn}</p>` : ''}
                <div style="background: ${categoryColor}; color: white; padding: 6px 12px; border-radius: 4px; display: inline-flex; align-items: center; font-size: 13px; margin-bottom: 12px; gap: 6px; font-weight: 500;">
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
                  <a href="${googleMapsUrl}" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 8px 12px; border-radius: 16px; text-decoration: none; font-size: 13px; font-weight: 500; transition: all 0.2s; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);">
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

      // 根據智能中心邏輯決定是否調整地圖視野
      if (markersAdded > 0) {
        // 只有在用戶位置模式下才自動調整視野以包含所有標記
        if (mapCenter.source === 'user') {
          map.fitBounds(bounds);
          // 避免過度放大單一標記
          const listener = window.google.maps.event.addListener(map, 'idle', () => {
            if (map.getZoom()! > 15) map.setZoom(15);
            window.google.maps.event.removeListener(listener);
          });
        } else {
          // 保持智能中心點和預設縮放等級
          map.setCenter({ lat: mapCenter.lat, lng: mapCenter.lng });
          map.setZoom(mapCenter.source === 'itinerary' ? 8 : 6);
        }
        
        console.log(`成功添加 ${markersAdded} 個景點標記到地圖`);
      } else {
        console.warn('沒有找到任何有效的景點位置');
      }
    };

    initMap().catch(console.error);
  }, [isMapLoaded, attractions, mapCenter]);

  // Update map center when mapCenter changes
  useEffect(() => {
    if (googleMapRef.current && mapCenter) {
      googleMapRef.current.setCenter({ lat: mapCenter.lat, lng: mapCenter.lng });
      googleMapRef.current.setZoom(mapCenter.source === 'user' ? 10 : 6);
    }
  }, [mapCenter]);

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