import { Sun, ArrowDown, Calendar, Compass, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import CountdownTimer from "@/components/CountdownTimer";
import TodayHighlights from "@/components/TodayHighlights";
import ItineraryCard from "@/components/ItineraryCard";
import AttractionCard from "@/components/AttractionCard";
import ReminderCard from "@/components/ReminderCard";
import { useQuery } from "@tanstack/react-query";
import type { ItineraryDay, Attraction, TravelReminder } from "@shared/schema";
import { attractions } from "@/data/attractions";
import { travelReminders } from "@/data/reminders";

const Home = () => {
  const departureDate = new Date('2025-10-05T00:30:00+08:00'); // Taiwan time
  const returnDate = new Date('2025-10-18T22:05:00+02:00'); // Spain time
  
  // Fetch itinerary data from API
  const { data: itinerary } = useQuery<ItineraryDay[]>({
    queryKey: ['/api/itinerary'],
  });
  
  // Get first few items for preview
  const previewItinerary = (itinerary || []).slice(0, 6);
  const previewAttractions = attractions.slice(0, 4);
  const previewReminders = travelReminders.slice(0, 6);

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
            <p className="text-lg text-muted-foreground">13天西班牙深度之旅精彩規劃</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {previewItinerary.map((day) => (
              <ItineraryCard
                key={day.dayNumber}
                dayNumber={day.dayNumber}
                date={day.date}
                title={day.title}
                description={day.description}
                duration={day.estimatedDuration}
                imageUrl={day.imageUrl}
                color={`chart-${day.dayNumber <= 5 ? day.dayNumber : 5}`}
                onClick={() => {/* Navigate to detailed itinerary */}}
              />
            ))}
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
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {previewAttractions.map((attraction) => (
              <AttractionCard
                key={attraction.id}
                id={attraction.id}
                name={attraction.name}
                city={attraction.city}
                category={attraction.category}
                description={attraction.description}
                visitDuration={attraction.visitDuration}
                ticketRequired={attraction.ticketRequired}
                imageUrl={attraction.imageUrl}
                onLearnMore={(id) => {/* Navigate to detailed attraction */}}
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
            <p className="text-lg text-muted-foreground">重要注意事項與實用旅遊貼士</p>
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
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sun className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold font-serif">西班牙金秋之旅</h3>
              </div>
              <p className="text-sm opacity-80">
                探索西班牙的黃金時光，感受秋日的浪漫與熱情。13天深度之旅，帶您領略伊比利亞半島的文化瑰寶。
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">快速連結</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><Link href="/"><span className="hover:text-primary transition-colors cursor-pointer">首頁</span></Link></li>
                <li><Link href="/itinerary"><span className="hover:text-primary transition-colors cursor-pointer">每日行程</span></Link></li>
                <li><Link href="/attractions"><span className="hover:text-primary transition-colors cursor-pointer">重要景點</span></Link></li>
                <li><Link href="/reminders"><span className="hover:text-primary transition-colors cursor-pointer">旅遊提醒</span></Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">重要日期</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li className="flex items-center"><span>✈️ 出發：2025/10/05</span></li>
                <li className="flex items-center"><span>🏠 返回：2025/10/18</span></li>
                <li className="flex items-center"><span>📅 天數：13天11夜</span></li>
                <li className="flex items-center"><span>🏙️ 城市：6個主要城市</span></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">緊急聯絡</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li>📞 台灣：+886-2-xxxx-xxxx</li>
                <li>📞 西班牙：+34-xxx-xxx-xxx</li>
                <li>📧 travel@example.com</li>
                <li>🏥 緊急醫療：112</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-secondary-foreground/20 pt-8 text-center text-sm opacity-60">
            <p>&copy; 2025 西班牙金秋之旅 | Golden Moment, Autumn Journey | 用心規劃每一個美好時刻</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
