export interface DailyItinerary {
  dayNumber: number;
  date: string;
  title: string;
  description: string;
  city: string;
  activities: Activity[];
  meals: MealPlan;
  accommodation?: string;
  imageUrl: string;
  departureTime?: string;
  estimatedDuration: string;
}

export interface Activity {
  time: string;
  name: string;
  description: string;
  location: string;
  duration: string;
  notes?: string;
}

export interface MealPlan {
  breakfast?: string;
  lunch?: string;
  dinner?: string;
}

export const dailyItinerary: DailyItinerary[] = [
  {
    dayNumber: 1,
    date: "10月5日",
    title: "巴塞隆納抵達",
    description: "機場接機、飯店入住、哥德區漫步",
    city: "巴塞隆納",
    activities: [
      {
        time: "00:30",
        name: "桃園機場出發",
        description: "搭乘長榮航空前往巴塞隆納",
        location: "桃園國際機場",
        duration: "轉機約15小時"
      },
      {
        time: "18:00",
        name: "抵達巴塞隆納",
        description: "機場接機，前往飯店辦理入住",
        location: "巴塞隆納機場",
        duration: "1小時"
      },
      {
        time: "20:00",
        name: "哥德區夜遊",
        description: "漫步中世紀老城區，感受巴塞隆納夜晚魅力",
        location: "哥德區",
        duration: "2小時"
      }
    ],
    meals: {
      breakfast: "機上用餐",
      lunch: "機上用餐",
      dinner: "加泰隆尼亞傳統料理"
    },
    accommodation: "巴塞隆納市中心酒店",
    imageUrl: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
    departureTime: "00:30",
    estimatedDuration: "全天"
  },
  {
    dayNumber: 2,
    date: "10月6日",
    title: "高第建築巡禮",
    description: "聖家堂、巴特婁之家、米拉之家",
    city: "巴塞隆納",
    activities: [
      {
        time: "09:00",
        name: "聖家堂參觀",
        description: "高第的曠世巨作，登塔欣賞巴塞隆納全景",
        location: "聖家堂",
        duration: "2.5小時",
        notes: "需提前預約門票"
      },
      {
        time: "14:00",
        name: "巴特婁之家",
        description: "參觀高第設計的現代主義建築傑作",
        location: "格拉西亞大道",
        duration: "1.5小時"
      },
      {
        time: "16:30",
        name: "米拉之家",
        description: "波浪形外觀的獨特建築，屋頂花園景色優美",
        location: "格拉西亞大道",
        duration: "1.5小時"
      }
    ],
    meals: {
      breakfast: "飯店早餐",
      lunch: "巴塞隆納海鮮燉飯",
      dinner: "Tapas小食巡禮"
    },
    accommodation: "巴塞隆納市中心酒店",
    imageUrl: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
    departureTime: "09:00",
    estimatedDuration: "09:00-18:00"
  },
  {
    dayNumber: 3,
    date: "10月7日",
    title: "前往馬德里",
    description: "高鐵體驗、皇宮參觀、普拉多美術館",
    city: "馬德里",
    activities: [
      {
        time: "08:00",
        name: "搭乘AVE高速列車",
        description: "體驗西班牙高速鐵路，前往首都馬德里",
        location: "巴塞隆納Sants車站",
        duration: "2.5小時"
      },
      {
        time: "13:00",
        name: "馬德里皇宮",
        description: "歐洲最豪華的皇宮之一，欣賞巴洛克建築",
        location: "馬德里皇宮",
        duration: "2小時"
      },
      {
        time: "16:00",
        name: "普拉多美術館",
        description: "世界三大美術館之一，欣賞委拉斯開茲等大師作品",
        location: "普拉多美術館",
        duration: "2.5小時"
      }
    ],
    meals: {
      breakfast: "飯店早餐",
      lunch: "馬德里傳統燉牛肉",
      dinner: "佛朗明哥表演晚宴"
    },
    accommodation: "馬德里精品酒店",
    imageUrl: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
    departureTime: "08:00",
    estimatedDuration: "08:00-19:00"
  },
  // Add more days...
];
