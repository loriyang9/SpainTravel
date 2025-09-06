import { Clock, MapPin, Utensils, Bed, Sun } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { useQuery } from "@tanstack/react-query";

interface TodayHighlight {
  departure: string;
  departureLocation: string;
  activities: string;
  activitiesDetail: string;
  meals: string;
  mealsDetail: string;
  accommodation: string;
  accommodationDetail: string;
  city: string;
}

const TodayHighlights = () => {
  // Calculate which day of the trip we're currently on
  const getCurrentTripDay = () => {
    const departureDate = new Date('2025-10-05T00:30:00+08:00'); // Taiwan time
    const currentDate = new Date();
    const diffTime = currentDate.getTime() - departureDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // During the trip (Day 0 to Day 14)
    if (diffDays >= 0 && diffDays <= 14) {
      return diffDays;
    }
    
    // Before the trip - show Day 0 
    if (diffDays < 0) {
      return 0;
    }
    
    // After the trip - show last day
    return 14;
  };

  const currentDay = getCurrentTripDay();

  // Fetch today's itinerary data
  const { data: itineraryData = [] } = useQuery({
    queryKey: ['/api/itinerary'],
  });

  const todayItinerary = itineraryData.find((day: any) => day.dayNumber === currentDay);

  // Extract city from the itinerary data
  const extractCityFromTitle = (title: string): string => {
    if (title.includes('巴薩隆納') || title.includes('Barcelona')) return 'Barcelona';
    if (title.includes('薩拉曼卡') || title.includes('Salamanca')) return 'Salamanca';
    if (title.includes('馬德里') || title.includes('Madrid')) return 'Madrid';
    if (title.includes('台北') || title.includes('Taipei')) return 'Taipei';
    return 'Barcelona'; // default
  };

  const todayData: TodayHighlight = {
    departure: todayItinerary?.activities?.[0]?.time || "全天",
    departureLocation: todayItinerary?.activities?.[0]?.location || "依行程安排",
    activities: todayItinerary?.activities?.[0]?.name || todayItinerary?.title || "行程安排中",
    activitiesDetail: todayItinerary?.description || "詳細資訊請參考每日行程",
    meals: todayItinerary?.meals?.lunch || todayItinerary?.meals?.breakfast || todayItinerary?.meals?.dinner || "依當地安排",
    mealsDetail: "品嚐道地西班牙美食",
    accommodation: todayItinerary?.accommodation || "旅程住宿",
    accommodationDetail: "舒適便利的住宿安排",
    city: extractCityFromTitle(todayItinerary?.title || "Barcelona"),
  };

  const { data: weather } = useWeather(todayData.city);

  const highlights = [
    {
      icon: Clock,
      title: "出發時間",
      value: todayData.departure,
      detail: todayData.departureLocation,
      color: "primary",
      testId: "highlight-departure",
    },
    {
      icon: MapPin,
      title: "重點行程",
      value: todayData.activities,
      detail: todayData.activitiesDetail,
      color: "chart-1",
      testId: "highlight-activities",
    },
    {
      icon: Utensils,
      title: "用餐安排",
      value: todayData.meals,
      detail: todayData.mealsDetail,
      color: "chart-2",
      testId: "highlight-meals",
    },
    {
      icon: Bed,
      title: "住宿地點",
      value: todayData.accommodation,
      detail: todayData.accommodationDetail,
      color: "chart-3",
      testId: "highlight-accommodation",
    },
    {
      icon: Sun,
      title: "天氣狀況",
      value: weather ? `${weather.condition} ${weather.temperature}°C` : "載入中...",
      detail: weather ? weather.description : "獲取天氣資訊中",
      color: "chart-4",
      testId: "highlight-weather",
    },
  ];

  return (
    <section className="py-16 px-6 bg-card" data-testid="today-highlights-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-card-foreground font-serif">
            今日行程重點
          </h2>
          <p className="text-lg text-muted-foreground">當天重要安排一目了然</p>
        </div>
        
        <div className="bg-background rounded-xl p-8 shadow-lg">
          <div className="grid md:grid-cols-5 gap-6">
            {highlights.map((highlight, index) => {
              const Icon = highlight.icon;
              return (
                <div key={index} className="text-center" data-testid={highlight.testId}>
                  <div className={`bg-${highlight.color}/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`text-${highlight.color} text-xl`} />
                  </div>
                  <h3 className="font-semibold mb-2 text-foreground">{highlight.title}</h3>
                  <p className="text-muted-foreground font-medium" data-testid={`${highlight.testId}-value`}>
                    {highlight.value}
                  </p>
                  <p className="text-sm text-muted-foreground" data-testid={`${highlight.testId}-detail`}>
                    {highlight.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TodayHighlights;
