import { Clock, MapPin, Utensils, Bed, Sun } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";

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
  // This would come from your itinerary data based on current date
  const todayData: TodayHighlight = {
    departure: "09:00",
    departureLocation: "飯店大廳",
    activities: "聖家堂參觀",
    activitiesDetail: "巴塞隆納必遊景點",
    meals: "海鮮燉飯",
    mealsDetail: "當地特色料理",
    accommodation: "巴塞隆納酒店",
    accommodationDetail: "市中心四星級",
    city: "Barcelona",
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
