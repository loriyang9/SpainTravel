import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Utensils, Bed, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { ItineraryDay } from "@shared/schema";
import { openLocationInGoogleMaps, isValidLocation } from "@/utils/mapUtils";

// Helper function to format day number with leading zero
const formatDayNumber = (day: number): string => {
  return day.toString().padStart(2, '0');
};

// Helper function to parse day number from URL parameter
const parseDayNumber = (dayParam: string | undefined): number => {
  if (!dayParam) return 0;
  const parsed = parseInt(dayParam, 10);
  return isNaN(parsed) ? 0 : parsed;
};

const DailyItinerary = () => {
  const { dayNumber } = useParams();
  const [, setLocation] = useLocation();
  const [selectedDay, setSelectedDay] = useState(parseDayNumber(dayNumber));

  // Navigation helper functions
  const goToPreviousDay = () => {
    const previousDay = Math.max(0, selectedDay - 1);
    setLocation(`/itinerary/day${formatDayNumber(previousDay)}`);
  };

  const goToNextDay = () => {
    const nextDay = Math.min(dailyItinerary?.length - 1 || 0, selectedDay + 1);
    setLocation(`/itinerary/day${formatDayNumber(nextDay)}`);
  };
  
  // Update selectedDay when URL parameter changes
  useEffect(() => {
    if (dayNumber) {
      setSelectedDay(parseDayNumber(dayNumber));
    }
  }, [dayNumber]);
  
  // 頁面載入時自動滾動到頂部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const { data: itinerary, isLoading } = useQuery<ItineraryDay[]>({
    queryKey: ['/api/itinerary'],
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-lg text-muted-foreground">載入行程資料中...</div>
      </div>
    );
  }
  
  const dailyItinerary = itinerary || [];
  const currentItinerary = dailyItinerary.find(day => day.dayNumber === selectedDay) || dailyItinerary[0];
  
  // Calculate actual trip days (exclude Day 0)
  const actualTripDays = dailyItinerary.length > 0 ? Math.max(...dailyItinerary.filter(d => d.dayNumber > 0).map(d => d.dayNumber)) : 15;
  
  if (!currentItinerary) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-lg text-muted-foreground">無可用的行程資料</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20" data-testid="daily-itinerary-page">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4" data-testid="back-to-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首頁
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-foreground font-serif mb-4">每日完整行程</h1>
          <p className="text-lg text-muted-foreground">{actualTripDays}天西班牙深度之旅詳細規劃</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Day Selection Sidebar */}
          <div className="lg:col-span-1">
            <Card data-testid="day-selection">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  選擇日期
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* 響應式容器：大螢幕完整高度，小螢幕固定高度 */}
                  <div className="lg:space-y-2 lg:max-h-none lg:overflow-visible max-h-[240px] overflow-y-auto space-y-2">
                    {dailyItinerary.map((day) => (
                      <button
                        key={day.dayNumber}
                        onClick={() => setLocation(`/itinerary/day${formatDayNumber(day.dayNumber)}`)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedDay === day.dayNumber
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                        }`}
                        data-testid={`day-selector-${day.dayNumber}`}
                      >
                        <div className="font-semibold">Day {day.dayNumber} - {day.title}</div>
                        <div className="text-sm opacity-80 mt-1">
                          {(() => {
                            // 將日期從 "2025年10月4日 星期六" 轉換為 "10/4 (六)"
                            const dateStr = day.date;
                            const match = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日 星期(.)/);
                            if (match) {
                              const [, year, month, date, weekday] = match;
                              return `${month}/${date} (${weekday})`;
                            }
                            return dateStr; // 如果格式不匹配，返回原始格式
                          })()}
                        </div>
                        <div className="text-sm opacity-80">
                          {day.city}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* 漸變遮罩：只在小螢幕顯示 */}
                  <div className="lg:hidden absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Itinerary */}
          <div className="lg:col-span-3">
            <Card data-testid="detailed-itinerary">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-serif mb-2">
                      Day {currentItinerary.dayNumber} - {currentItinerary.title}
                    </CardTitle>
                    <div className="text-muted-foreground space-y-1">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {(() => {
                          // 將日期從 "2025/10/4 週六" 轉換為 "10/4 (六)"
                          const dateStr = currentItinerary.date;
                          const match = dateStr.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})\s*週(.)/);
                          if (match) {
                            const [, year, month, day, weekday] = match;
                            return `${month}/${day} (${weekday})`;
                          }
                          return dateStr; // 如果格式不匹配，返回原始格式
                        })()}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {currentItinerary.city}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {currentItinerary.estimatedDuration}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Hero Image */}
                <div className="mb-6">
                  <img
                    src={currentItinerary.imageUrl}
                    alt={currentItinerary.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>

                {/* Description */}
                <div className="mb-8">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {currentItinerary.description}
                  </p>
                </div>

                {/* Activities Timeline */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    詳細活動安排
                  </h3>
                  <div className="space-y-4">
                    {currentItinerary.activities.map((activity, index) => (
                      <div 
                        key={index}
                        className="flex items-start space-x-4 p-4 bg-accent/10 rounded-lg"
                        data-testid={`activity-${index}`}
                      >
                        <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold min-w-fit">
                          {(() => {
                            // 將12小時制轉換為24小時制，統一格式
                            const timeStr = activity.time;
                            const match = timeStr.match(/(上午|下午)\s*(\d{1,2}):(\d{2})/);
                            if (match) {
                              const [, period, hour, minute] = match;
                              let hour24 = parseInt(hour);
                              if (period === '下午' && hour24 !== 12) {
                                hour24 += 12;
                              } else if (period === '上午' && hour24 === 12) {
                                hour24 = 0;
                              }
                              return `${hour24.toString().padStart(2, '0')}:${minute}`;
                            }
                            return timeStr; // 如果格式不匹配，返回原始格式
                          })()}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-1">{activity.name}</h4>
                          {activity.description && activity.description.trim() && (
                            <p className="text-muted-foreground mb-2">{activity.description}</p>
                          )}
                          <div className="flex flex-wrap items-start justify-start gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            {activity.location && activity.location.trim() && (
                              <button 
                                onClick={() => openLocationInGoogleMaps(activity.location)}
                                className="flex items-start text-left text-primary hover:text-primary/80 hover:underline cursor-pointer transition-colors group"
                                data-testid={`location-${index}`}
                                title={`在 Google Maps 中查看 ${activity.location}`}
                              >
                                <MapPin className="w-3 h-3 mr-1 group-hover:scale-110 transition-transform" />
                                {activity.location}
                              </button>
                            )}
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {activity.duration}
                            </span>
                          </div>
                          {activity.notes && (
                            <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded text-sm">
                              💡 {activity.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Meals */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Utensils className="w-5 h-5 mr-2" />
                    用餐安排
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {currentItinerary.meals.breakfast && (
                      <div className="p-4 bg-chart-1/10 rounded-lg" data-testid="breakfast">
                        <h4 className="font-semibold text-chart-1 mb-2">早餐</h4>
                        <p className="text-sm">{currentItinerary.meals.breakfast}</p>
                      </div>
                    )}
                    {currentItinerary.meals.lunch && (
                      <div className="p-4 bg-chart-2/10 rounded-lg" data-testid="lunch">
                        <h4 className="font-semibold text-chart-2 mb-2">午餐</h4>
                        <p className="text-sm">{currentItinerary.meals.lunch}</p>
                      </div>
                    )}
                    {currentItinerary.meals.dinner && (
                      <div className="p-4 bg-chart-3/10 rounded-lg" data-testid="dinner">
                        <h4 className="font-semibold text-chart-3 mb-2">晚餐</h4>
                        <p className="text-sm">{currentItinerary.meals.dinner}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Accommodation */}
                {currentItinerary.accommodation && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Bed className="w-5 h-5 mr-2" />
                      住宿資訊
                    </h3>
                    <div className="p-4 bg-muted/20 rounded-lg" data-testid="accommodation">
                      {isValidLocation(currentItinerary.accommodation) ? (
                        <button 
                          onClick={() => openLocationInGoogleMaps(currentItinerary.accommodation)}
                          className="font-medium text-primary hover:text-primary/80 hover:underline cursor-pointer transition-colors group text-left"
                          title={`在 Google Maps 中查看 ${currentItinerary.accommodation}`}
                        >
                          <MapPin className="w-4 h-4 mr-2 inline group-hover:scale-110 transition-transform" />
                          {currentItinerary.accommodation}
                        </button>
                      ) : (
                        <div className="font-medium flex items-center">
                          <Bed className="w-4 h-4 mr-2" />
                          {currentItinerary.accommodation}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={goToPreviousDay}
                    disabled={selectedDay === 0}
                    data-testid="previous-day"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    前一天
                  </Button>
                  <Button
                    variant="outline"
                    onClick={goToNextDay}
                    disabled={selectedDay >= dailyItinerary.length - 1}
                    data-testid="next-day"
                  >
                    下一天
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyItinerary;
