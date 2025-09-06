import { useState } from "react";
import { Calendar, Clock, MapPin, Utensils, Bed, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { ItineraryDay } from "@shared/schema";

const DailyItinerary = () => {
  const [selectedDay, setSelectedDay] = useState(0);
  
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
          <p className="text-lg text-muted-foreground">13天西班牙深度之旅詳細規劃</p>
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
                <div className="space-y-2">
                  {dailyItinerary.map((day) => (
                    <button
                      key={day.dayNumber}
                      onClick={() => setSelectedDay(day.dayNumber)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedDay === day.dayNumber
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent'
                      }`}
                      data-testid={`day-selector-${day.dayNumber}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Day {day.dayNumber}</span>
                        <span className="text-sm opacity-80">{day.date}</span>
                      </div>
                      <div className="text-sm opacity-80 mt-1">{day.city}</div>
                      <div className="text-sm text-primary font-medium mt-1">{day.title}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Itinerary */}
          <div className="lg:col-span-3">
            <Card data-testid="detailed-itinerary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-serif mb-2">
                      Day {currentItinerary.dayNumber} - {currentItinerary.title}
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-muted-foreground">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {currentItinerary.date}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {currentItinerary.city}
                      </span>
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
                          {activity.time}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-1">{activity.name}</h4>
                          <p className="text-muted-foreground mb-2">{activity.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {activity.location}
                            </span>
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
                      <p className="font-medium">{currentItinerary.accommodation}</p>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
                    disabled={selectedDay === 1}
                    data-testid="previous-day"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    前一天
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedDay(Math.min(dailyItinerary.length, selectedDay + 1))}
                    disabled={selectedDay === dailyItinerary.length}
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
