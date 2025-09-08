import { Sun, ArrowDown, Calendar, Compass, List, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import CountdownTimer from "@/components/CountdownTimer";
import TodayHighlights from "@/components/TodayHighlights";
import ItineraryCard from "@/components/ItineraryCard";
import AttractionCard from "@/components/AttractionCard";
import ReminderCard from "@/components/ReminderCard";
import { useQuery } from "@tanstack/react-query";
import type { ItineraryDay, Attraction, TravelReminder } from "@shared/schema";
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useMemo } from 'react';

const Home = () => {
  const departureDate = new Date('2025-10-05T00:30:00+08:00'); // Taiwan time
  const returnDate = new Date('2025-10-18T22:05:00+02:00'); // Spain time
  const [, setLocation] = useLocation();
  
  // Fetch itinerary data from API
  const { data: itinerary } = useQuery<ItineraryDay[]>({
    queryKey: ['/api/itinerary'],
  });
  
  // Fetch attractions data from API
  const { data: attractionsData } = useQuery<Attraction[]>({
    queryKey: ['/api/attractions'],
  });
  
  // Fetch reminders data from API
  const { data: remindersData } = useQuery<TravelReminder[]>({
    queryKey: ['/api/reminders'],
  });
  
  // Calculate actual trip days (exclude Day 0)
  const actualTripDays = itinerary ? Math.max(...itinerary.filter(d => d.dayNumber > 0).map(d => d.dayNumber)) : 15;
  
  // Calculate current trip day number
  const getCurrentTripDay = () => {
    const now = new Date();
    const departureTime = departureDate.getTime();
    const currentTime = now.getTime();
    
    if (currentTime < departureTime) {
      return 0; // 還未出發
    }
    
    // 計算從出發到現在經過的天數
    const daysSinceDeparture = Math.floor((currentTime - departureTime) / (24 * 60 * 60 * 1000));
    const tripDay = daysSinceDeparture + 1; // Day 1 是第一天
    
    return Math.min(tripDay, actualTripDays); // 不能超過行程最大天數
  };

  // Smart attraction recommendation logic
  const smartAttractions = useMemo(() => {
    if (!itinerary || !attractionsData) return [];
    
    const currentTripDay = getCurrentTripDay();
    
    // Find today's itinerary
    const todayItinerary = itinerary.find(day => day.dayNumber === currentTripDay);
    
    let selectedAttractions: Attraction[] = [];
    
    // Step 1: Get attractions from today's itinerary
    if (todayItinerary?.activities) {
      const activityNames = todayItinerary.activities.map((activity: any) => activity.name);
      const todayAttractions = attractionsData.filter(attraction => 
        activityNames.some(activityName => 
          attraction.name.includes(activityName) || activityName.includes(attraction.name)
        )
      );
      selectedAttractions.push(...todayAttractions);
    }
    
    // Step 2: If not enough, add attractions from the same city with "景點" category
    if (selectedAttractions.length < 6 && todayItinerary) {
      const sameCityAttractions = attractionsData
        .filter(attraction => 
          attraction.city === todayItinerary.city && 
          attraction.category === "景點" &&
          !selectedAttractions.some(selected => selected.id === attraction.id)
        )
        .sort((a, b) => parseInt(a.id) - parseInt(b.id)); // 按ID排序
      
      const needed = 6 - selectedAttractions.length;
      selectedAttractions.push(...sameCityAttractions.slice(0, needed));
    }
    
    // Step 3: If still not enough, add from all "景點" category
    if (selectedAttractions.length < 6) {
      const allSceneryAttractions = attractionsData
        .filter(attraction => 
          attraction.category === "景點" &&
          !selectedAttractions.some(selected => selected.id === attraction.id)
        )
        .sort((a, b) => parseInt(a.id) - parseInt(b.id)); // 按ID排序
      
      const needed = 6 - selectedAttractions.length;
      selectedAttractions.push(...allSceneryAttractions.slice(0, needed));
    }
    
    return selectedAttractions.slice(0, 6); // 確保只返回6個
  }, [itinerary, attractionsData, actualTripDays]);
  
  // Show all reminders from Google Sheets for preview
  const previewReminders = remindersData || [];
  
  // Carousel setup for itinerary preview
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    dragFree: true,
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
    axis: 'x'
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // 滾輪水平滑動功能
  useEffect(() => {
    if (!emblaApi) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const { deltaY } = event;
      
      if (deltaY > 0) {
        emblaApi.scrollNext();
      } else if (deltaY < 0) {
        emblaApi.scrollPrev();
      }
    };

    const emblaNode = emblaApi.rootNode();
    if (emblaNode) {
      emblaNode.addEventListener('wheel', handleWheel, { passive: false });
      return () => emblaNode.removeEventListener('wheel', handleWheel);
    }
  }, [emblaApi]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Banner */}
      <section 
        id="hero" 
        className="relative min-h-screen pt-20 flex items-center justify-center overflow-hidden"
        data-testid="hero-section"
      >
        <div className="absolute inset-0 z-0">
          <img 
            src="https://pixabay.com/get/g82eec300f6e5900dfb8ea45e94f67902d19288e0a395e2cff931d3fc0521a39fcee9918b13bd306111b1f40505416f6148fdf12123c1e0eae8141ff934d27cd1_1280.jpg"
            alt="Golden hour view of Sevilla's historic architecture" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-gradient"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="md:text-7xl font-bold text-white mb-6 font-serif animate-fade-in text-center text-[50px]">Golden Moment, Autumn Journey</h1>
          
          {/* Countdown Timer - Dynamic */}
          <div className="mb-12 flex justify-center" data-testid="countdown-section">
            {new Date() < departureDate ? (
              <CountdownTimer
                targetDate={departureDate}
                label="出發倒數"
                description="2025年10月5日 00:30 台北時間"
                type="departure"
              />
            ) : (
              <CountdownTimer
                targetDate={returnDate}
                label="返家倒數"
                description="2025年10月18日 22:05 西班牙時間"
                type="return"
              />
            )}
          </div>
          
          <Button 
            onClick={() => scrollToSection('itinerary-preview')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            data-testid="explore-button"
          >
            開始探索行程
            <ArrowDown className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>
      {/* Today's Highlights */}
      <TodayHighlights />
      {/* Itinerary Preview */}
      <section id="itinerary-preview" className="py-16 px-6 bg-background" data-testid="itinerary-preview-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground font-serif">
              每日行程預覽
            </h2>
            <p className="text-lg text-muted-foreground">{actualTripDays}天西班牙深度之旅精彩規劃</p>
          </div>
          
          <div className="relative mb-8">
            {/* Navigation buttons */}
            <div className="flex justify-end gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={scrollPrev}
                className="h-10 w-10 rounded-full p-0"
                data-testid="carousel-prev"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={scrollNext}
                className="h-10 w-10 rounded-full p-0"
                data-testid="carousel-next"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Carousel */}
            <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
              <div className="flex gap-6 select-none">
                {(itinerary || [])
                  .sort((a, b) => a.dayNumber - b.dayNumber)
                  .map((day) => (
                  <div key={day.dayNumber} className="flex-none w-80 md:w-96 h-[480px]">
                    <ItineraryCard
                      dayNumber={day.dayNumber}
                      date={day.date || ''}
                      title={day.title || ''}
                      description={day.description || ''}
                      duration={day.estimatedDuration || ''}
                      imageUrl={day.imageUrl || ''}
                      color={`chart-${day.dayNumber <= 5 ? day.dayNumber : 5}`}
                      onClick={() => setLocation(`/itinerary/${day.dayNumber}`)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Link href="/itinerary">
              <Button 
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
                data-testid="view-full-itinerary"
              >
                查看完整行程
                <Calendar className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* Attractions Showcase */}
      <section id="attractions-preview" className="py-16 px-6 bg-card" data-testid="attractions-preview-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-card-foreground font-serif">
              重要景點介紹
            </h2>
            <p className="text-lg text-muted-foreground">西班牙必訪的世界文化遺產與經典地標</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {smartAttractions.map((attraction) => (
              <AttractionCard
                key={attraction.id}
                id={attraction.id}
                name={attraction.name}
                city={attraction.city}
                category={attraction.category}
                description={attraction.description}
                additionalInfo={attraction.additionalInfo}
                imageUrl={attraction.imageUrl}
              />
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/attractions">
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
                data-testid="explore-all-attractions"
              >
                探索所有景點
                <Compass className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* Travel Reminders Preview */}
      <section id="reminders-preview" className="py-16 px-6 bg-background" data-testid="reminders-preview-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground font-serif">
              旅遊提醒事項
            </h2>
            <p className="text-lg text-muted-foreground">重要注意事項與出發前檢查</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {previewReminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                id={reminder.id}
                title={reminder.title}
                items={reminder.items}
                icon={reminder.icon}
                priority={reminder.priority}
                isPreview={true}
              />
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/reminders">
              <Button 
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
                data-testid="view-all-reminders"
              >
                查看完整提醒清單
                <List className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-12 px-6" data-testid="footer">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-sm opacity-60">
            <p>&copy; 2025 西班牙金秋之旅 | Golden Moment, Autumn Journey</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
