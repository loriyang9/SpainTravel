import { google } from 'googleapis';
import OpenAI from 'openai';
import crypto from 'crypto';

// Google Sheets configuration
const SPREADSHEET_ID = '1V5NSXukzD5z2m-07AhcMkU6fWEPchO4lIN8KzpI7Lwo';

class GoogleSheetsService {
  private sheets: any;
  private openai: OpenAI | null;
  private descriptionsCache: Map<string, { description: string; timestamp: number }>;
  private attractionDescriptionsCache: Map<string, { description: string; timestamp: number }>;

  constructor() {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}');
      
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      
      // Initialize OpenAI client if API key is available
      this.openai = process.env.OPENAI_API_KEY ? new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      }) : null;
      
      // In-memory cache for descriptions
      this.descriptionsCache = new Map();
      this.attractionDescriptionsCache = new Map();
      
    } catch (error) {
      console.error('Failed to initialize Google Sheets service:', error);
      throw error;
    }
  }

  async getSheetData(sheetName: string, range: string = 'A:Z') {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!${range}`,
      });

      return response.data.values || [];
    } catch (error) {
      console.error(`Error fetching data from sheet ${sheetName}:`, error?.message || error);
      throw error;
    }
  }

  // Parse DailyItinerary sheet data (horizontal format) 
  async getDailyItineraryOverview() {
    try {
      const data = await this.getSheetData('DailyItinerary');
      
      if (!data || data.length === 0) {
        return {};
      }

      const headers = data[0]; // First row contains dayNumbers (0, 1, 2, ...)
      const dayOverviews: { [key: number]: any } = {};

      // Skip first empty column, process each day
      for (let col = 1; col < headers.length; col++) {
        const dayNumber = parseInt(headers[col]);
        if (isNaN(dayNumber)) continue;

        const dayData: any = { dayNumber };
        
        // Map each row to properties
        for (let row = 1; row < data.length; row++) {
          const rowHeader = data[row][0];
          const cellValue = data[row][col] || '';

          switch (rowHeader) {
            case 'Date':
              dayData.date = cellValue;
              break;
            case 'Theme':
              dayData.theme = cellValue;
              break;
            case 'City':
              dayData.city = cellValue;
              break;
            case 'accommodation':
              dayData.accommodation = cellValue;
              break;
            case 'breakfast':
              dayData.breakfast = cellValue;
              break;
            case 'lunch':
              dayData.lunch = cellValue;
              break;
            case 'dinner':
              dayData.dinner = cellValue;
              break;
          }
        }

        dayOverviews[dayNumber] = dayData;
      }

      return dayOverviews;
    } catch (error) {
      console.warn('DailyItinerary sheet not found, using Activities data only');
      return {};
    }
  }

  // Parse Activities sheet data (vertical format) and merge with DailyItinerary
  async getDailyItinerary() {
    try {
      // Get both data sources
      const [activitiesData, dailyOverviews] = await Promise.all([
        this.getSheetData('Activities'),
        this.getDailyItineraryOverview()
      ]);
      
      // Calculate total days from data
      const totalDays = this.calculateTotalDays(activitiesData, dailyOverviews);
      
      if (!activitiesData || activitiesData.length < 2) {
        return [];
      }

      const result = [];
      const dayGroups: { [key: number]: any[] } = {};

      // Group activities by dayNumber
      for (let row = 1; row < activitiesData.length; row++) {
        const rowData = activitiesData[row];
        if (!rowData || rowData.length === 0) continue;

        // Create activity object using index mapping
        const activity: any = {
          dayNumber: rowData[0] || '',
          date: rowData[1] || '',
          time: rowData[2] || '',
          timeZone: rowData[3] || '',
          title: rowData[4] || '',
          description: rowData[5] || '',
          location: rowData[6] || '',
          duration: rowData[7] || '',
          notes: rowData[8] || ''
        };

        const dayNumber = parseInt(activity.dayNumber);
        if (isNaN(dayNumber) || dayNumber < 0) {
          continue;
        }

        if (!dayGroups[dayNumber]) {
          dayGroups[dayNumber] = [];
        }
        dayGroups[dayNumber].push(activity);
      }

      // Convert groups to day objects, merging with DailyItinerary data
      for (const dayNumStr of Object.keys(dayGroups)) {
        const dayNumber = parseInt(dayNumStr);
        const activities = dayGroups[dayNumber];
        const overview = dailyOverviews[dayNumber] || {};
        
        if (activities.length === 0) continue;

        const dayData: any = {
          dayNumber,
          date: overview.date || activities[0].date || '',
          title: overview.theme || this.extractDayTitle(activities), // Use Theme from DailyItinerary
          description: await this.generateDaySummary(dayNumber, overview.theme || '', overview.city || '', activities, totalDays),
          city: overview.city || '', // Use City from DailyItinerary only
          activities: activities.map(act => ({
            time: act.time || '全天',
            name: act.title || '活動',
            description: act.description || '',
            location: act.location || '',
            duration: act.duration || '1小時',
          })),
          estimatedDuration: `${activities.length}個活動`,
          meals: {
            breakfast: overview.breakfast || '',
            lunch: overview.lunch || '',
            dinner: overview.dinner || ''
          },
          accommodation: overview.accommodation || '',
          imageUrl: this.getThemeBasedImageUrl(dayNumber, overview.theme || '', overview.city || this.extractCity(activities))
        };

        result.push(dayData);
      }

      return result.sort((a, b) => a.dayNumber - b.dayNumber);
    } catch (error) {
      console.error('Error parsing daily itinerary:', error);
      throw error;
    }
  }

  private extractDayTitle(activities: any[]): string {
    if (!activities || activities.length === 0) return '';
    
    // Try to find a main theme from the first activity or most detailed one
    const mainActivity = activities.find(act => act.title && act.title.length > 10) || activities[0];
    return mainActivity?.title || `Day ${activities[0]?.dayNumber || ''}`;
  }

  private calculateTotalDays(activitiesData: any[][], dailyOverviews: { [key: number]: any }): number {
    let maxDay = 0;
    
    // Check activities data (exclude Day 0)
    if (activitiesData && activitiesData.length > 1) {
      for (let row = 1; row < activitiesData.length; row++) {
        const dayNum = parseInt(activitiesData[row][0]);
        if (!isNaN(dayNum) && dayNum > 0 && dayNum > maxDay) {
          maxDay = dayNum;
        }
      }
    }
    
    // Check daily overviews data (exclude Day 0)
    const overviewDays = Object.keys(dailyOverviews).map(k => parseInt(k)).filter(n => !isNaN(n) && n > 0);
    if (overviewDays.length > 0) {
      const maxOverviewDay = Math.max(...overviewDays);
      if (maxOverviewDay > maxDay) {
        maxDay = maxOverviewDay;
      }
    }
    
    // Total days = max day number (Day 0 not counted)
    return maxDay;
  }

  // Create data hash for cache key
  private createDataHash(dayNumber: number, theme: string, city: string, activities: any[]): string {
    const dataString = JSON.stringify({ dayNumber, theme, city, activities });
    return crypto.createHash('md5').update(dataString).digest('hex');
  }

  // Generate AI-powered description with caching
  private async generateDaySummary(dayNumber: number, theme: string, city: string, activities: any[], totalDays: number): Promise<string> {
    // Create cache key
    const dataHash = this.createDataHash(dayNumber, theme, city, activities);
    
    // Check in-memory cache first
    const cached = this.descriptionsCache.get(dataHash);
    if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) { // 24 hours cache
      return cached.description;
    }
    
    // Special cases with fixed templates
    if (dayNumber === 0) {
      return `準備出發，整理行李並前往機場，開始${totalDays}天西班牙深度旅行冒險`;
    }
    
    if (dayNumber === totalDays - 1) {
      return `完成西班牙旅程，帶著滿滿回憶返回台灣，結束難忘的深度之旅`;
    }
    
    // Try AI generation if available
    if (this.openai) {
      try {
        console.log(`🤖 Starting AI generation for Day ${dayNumber}: ${theme} in ${city}`);
        const description = await this.generateAIDescription(dayNumber, theme, city, activities);
        console.log(`✅ AI generated description: "${description}"`);
        // Cache the result
        this.descriptionsCache.set(dataHash, {
          description,
          timestamp: Date.now()
        });
        return description;
      } catch (error) {
        console.warn('❌ AI generation failed, falling back to template:', error.message);
        console.warn('Error details:', error);
      }
    } else {
      console.log('⚠️ OpenAI client not available, using template');
    }
    
    // Fallback to template-based generation (without length limit)
    return this.generateTemplateDescription(dayNumber, theme, city, activities);
  }
  
  // AI-powered description generation
  private async generateAIDescription(dayNumber: number, theme: string, city: string, activities: any[]): Promise<string> {
    const mainActivities = activities.slice(0, 3).map(act => act.title).filter(Boolean);
    
    console.log(`📝 AI generation parameters:`, {
      dayNumber,
      theme,
      city,
      mainActivities: mainActivities.length,
      hasOpenAI: !!this.openai
    });
    
    const prompt = `為一個西班牙旅遊行程的第${dayNumber}天生成一個生動、吸引人的40-60字中文描述。

行程資訊：
- 主題：${theme}
- 城市：${city}
- 主要活動：${mainActivities.join('、') || '探索當地文化'}

要求：
1. 使用生動、感性的語言
2. 突出當天的特色和亮點
3. 讓讀者感受到西班牙的魅力
4. 40-60個中文字符
5. 不要使用省略號或截斷
6. 語氣要充滿期待和興奮

範例風格：「漫步在巴薩隆納的蘭布拉大道，探訪高第的建築奇蹟聖家堂，在哥德區的石板路上感受中世紀的浪漫，品嚐道地的加泰隆尼亞美食，讓藝術與歷史在每個轉角與你相遇」`;
    
    console.log(`🚀 Making OpenAI API call with model: gpt-4o`);
    
    // Using gpt-4o for better text generation stability and creativity
    const response = await this.openai!.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "你是一個專業的旅遊文案寫手，擅長用優美的中文描述旅遊體驗，讓讀者充滿期待。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });
    
    console.log(`📨 OpenAI API response:`, {
      choices: response.choices?.length || 0,
      firstChoice: response.choices?.[0]?.message?.content?.substring(0, 100) + '...',
      usage: response.usage
    });
    
    const result = response.choices[0]?.message?.content?.trim() || this.generateTemplateDescription(dayNumber, theme, city, activities);
    console.log(`🎯 Final description result: "${result}"`);
    return result;
  }

  // AI-powered attraction description generation
  private async generateAttractionAIDescription(name: string, city: string, category: string): Promise<string> {
    // Create cache key
    const cacheKey = `${name}-${city}-${category}`;
    
    // Check cache first
    const cached = this.attractionDescriptionsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 7 * 24 * 60 * 60 * 1000) { // 7 days cache
      return cached.description;
    }

    console.log(`🎨 Generating AI description for attraction: ${name} in ${city}`);

    const prompt = `為西班牙旅遊景點"${name}"生成一個吸引人的30字中文描述。

景點資訊：
- 名稱：${name}
- 城市：${city}
- 分類：${category}

要求：
1. 恰好30個中文字符
2. 突出該景點的特色和魅力
3. 語言生動、富有感染力
4. 讓讀者想要前往參觀
5. 融入西班牙文化特色
6. 不要使用省略號

範例風格：「歷史悠久的古堡見證著西班牙的輝煌歲月，石牆間訴說著騎士與公主的浪漫傳說」`;

    try {
      const response = await this.openai!.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "你是一個專業的旅遊文案寫手，擅長用30字中文精準描述景點特色，讓讀者充滿探索欲望。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.8
      });

      console.log(`📨 OpenAI API response for ${name}:`, {
        choices: response.choices.length,
        firstChoice: response.choices[0]?.message?.content?.substring(0, 100) + '...',
        usage: response.usage
      });

      const result = response.choices[0]?.message?.content?.trim() || `探索${name}的獨特魅力，感受${city}的文化底蘊與歷史風情`;
      
      // Cache the result
      this.attractionDescriptionsCache.set(cacheKey, {
        description: result,
        timestamp: Date.now()
      });

      console.log(`✨ Generated attraction description for ${name}: "${result}"`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to generate AI description for ${name}:`, error);
      // Fallback description
      return `探索${name}的獨特魅力，感受${city}的文化底蘊與歷史風情`;
    }
  }
  
  // Template-based fallback generation (no length limit)
  private generateTemplateDescription(dayNumber: number, theme: string, city: string, activities: any[]): string {
    const mainActivities = activities.slice(0, 2).map(act => act.title).filter(Boolean);
    
    if (theme && city) {
      if (mainActivities.length > 0) {
        const activityText = mainActivities.join('、');
        return `在${city}${theme}，${activityText}，感受西班牙的魅力與文化深度`;
      } else {
        return `在${city}體驗${theme}，探索西班牙獨特的文化與風情，留下難忘回憶`;
      }
    } else if (city) {
      return `探索${city}的迷人景色，品味當地文化與美食的精彩體驗，感受伊比利亞半島的魅力`;
    } else if (theme) {
      return `${theme}，深度體驗西班牙的歷史文化與自然風光，創造屬於自己的旅行故事`;
    } else {
      return `精彩的西班牙旅程，探索當地獨特的文化與美景，在每個角落發現驚喜`;
    }
  }

  private extractCityFromString(text: string): string {
    if (!text) return '';
    
    // Extract city names from text
    if (text.includes('巴塞隆納') || text.includes('Barcelona') || text.includes('巴薩隆納')) return '巴薩隆納';
    if (text.includes('馬德里') || text.includes('Madrid')) return '馬德里';  
    if (text.includes('薩拉曼卡') || text.includes('Salamanca')) return '薩拉曼卡';
    if (text.includes('托雷多') || text.includes('Toledo')) return '托雷多';
    if (text.includes('台北') || text.includes('Taipei')) return '台北';
    if (text.includes('杜拜') || text.includes('Dubai')) return '杜拜';
    
    return '';
  }

  private extractCity(activities: any[]): string {
    if (!activities || activities.length === 0) return '';
    
    // Try to extract city from various activity fields
    for (const activity of activities) {
      // Check location field first
      const cityFromLocation = this.extractCityFromString(activity.location || '');
      if (cityFromLocation) return cityFromLocation;
      
      // Check title field  
      const cityFromTitle = this.extractCityFromString(activity.title || '');
      if (cityFromTitle) return cityFromTitle;
      
      // Check description field
      const cityFromDesc = this.extractCityFromString(activity.description || '');
      if (cityFromDesc) return cityFromDesc;
    }
    
    return '';
  }

  private calculateTimeDiff(start: string, end: string): string {
    try {
      const [startH, startM] = start.split(':').map(Number);
      const [endH, endM] = end.split(':').map(Number);
      
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      const diff = endMinutes - startMinutes;
      
      if (diff <= 0) return '1小時';
      
      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;
      
      if (hours === 0) return `${minutes}分鐘`;
      if (minutes === 0) return `${hours}小時`;
      return `${hours}小時${minutes}分鐘`;
    } catch {
      return '1小時';
    }
  }

  private calculateDuration(activities: any[]): string {
    if (!activities || activities.length === 0) return '全天';
    return `${activities.length}個活動`;
  }

  // Enhanced image mapping based on day themes and activities
  private getThemeBasedImageUrl(dayNumber: number, theme: string, city: string): string {
    // Day-specific themed images for perfect content matching
    const dayThemeMap: { [key: number]: string } = {
      0: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400', // Airplane wing at sunset - departure
      1: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400', // Barcelona cityscape - jet lag recovery
      2: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400', // Sagrada Familia golden hour - Gaudi architecture Part I
      3: 'https://images.unsplash.com/photo-1558642084-fd07fae5282e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400', // Park Guell colorful mosaics - Gaudi architecture Part II
      4: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400', // Barcelona beach and Mediterranean - relaxation day
      5: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400', // Barcelona Gothic quarter - free exploration
      6: 'https://images.unsplash.com/photo-1544737151350-6bd638b62b83?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400', // Spanish train or travel - journey to Salamanca
      7: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400', // Salamanca cathedral wedding architecture - wedding day
      8: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400', // Salamanca golden stone buildings - post-wedding rest
      9: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400', // Salamanca university architecture - exploration
      10: 'https://images.unsplash.com/photo-1544737151350-6bd638b62b83?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400', // Travel journey - to Madrid
      11: 'https://images.unsplash.com/photo-1558124830-dde2d45abcd5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400', // Toledo ancient city - day trip
      12: 'https://images.unsplash.com/photo-1539821266776-0e846c90c957?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400', // Madrid Royal Palace - Madrid sightseeing
      13: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400', // Shopping street Madrid - shopping day
      14: 'https://images.unsplash.com/photo-1539821266776-0e846c90c957?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400', // Madrid city evening - final exploration
      15: 'https://images.unsplash.com/photo-1590735213920-68192a487bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400', // Airport departure - return home
    };

    // Return theme-specific image if available
    if (dayThemeMap[dayNumber]) {
      return dayThemeMap[dayNumber];
    }

    // Fallback to city-based images
    const cityImageMap: { [key: string]: string } = {
      '巴薩隆納': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
      '薩拉曼卡': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
      '馬德里': 'https://images.unsplash.com/photo-1539821266776-0e846c90c957?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
      '台北': 'https://images.unsplash.com/photo-1590735213920-68192a487bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'
    };
    
    return cityImageMap[city] || 'https://images.unsplash.com/photo-1504019347908-b45f9b0b8dd5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400';
  }


  private getAttractionImageUrl(name: string): string {
    const imageMap: { [key: string]: string } = {
      '聖家堂': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
      '阿爾罕布拉宮': 'https://images.unsplash.com/photo-1539650116574-75c0c6d5adf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
      '普拉多博物館': 'https://images.unsplash.com/photo-1544986581-efac024faf62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'
    };
    return imageMap[name] || 'https://images.unsplash.com/photo-1504019347908-b45f9b0b8dd5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400';
  }

  private parseHighlights(highlightText: string): string[] {
    if (!highlightText) return [];
    
    // Split by common separators
    const highlights = highlightText.split(/[,，;；\n]/)
      .map(h => h.trim())
      .filter(h => h.length > 0);
    
    return highlights.slice(0, 4); // Limit to 4 highlights
  }

  private mapReminderCategory(title: string): string {
    if (title.includes('時間') || title.includes('營業')) return 'schedule';
    if (title.includes('準備') || title.includes('出發')) return 'preparation';
    if (title.includes('安全') || title.includes('防盜')) return 'safety';
    if (title.includes('天氣') || title.includes('穿著')) return 'weather';
    if (title.includes('食物') || title.includes('水')) return 'food';
    if (title.includes('小費')) return 'money';
    if (title.includes('廁所')) return 'facilities';
    return 'general';
  }

  private getReminderIcon(title: string): string {
    const iconMap: { [key: string]: string } = {
      'schedule': 'Clock',
      'preparation': 'Luggage',
      'safety': 'Shield',
      'weather': 'Cloud',
      'food': 'Utensils',
      'money': 'CreditCard',
      'facilities': 'MapPin',
      'general': 'Info'
    };
    const category = this.mapReminderCategory(title);
    return iconMap[category] || 'Info';
  }

  private getReminderPriority(title: string): number {
    if (title.includes('安全') || title.includes('防盜')) return 1;
    if (title.includes('準備') || title.includes('出發')) return 2;
    if (title.includes('時間') || title.includes('營業')) return 3;
    return 4;
  }

  private parseReminderItems(text: string): Array<{text: string}> {
    if (!text) return [];
    
    // Split by numbered lists, bullet points, or line breaks
    const items = text.split(/\d+\.\s*|[•\-\n]/)
      .map(item => item.trim())
      .filter(item => item.length > 10) // Only keep substantial items
      .slice(0, 10); // Limit items
    
    return items.map(item => ({ text: item }));
  }

  // Parse Attractions sheet (vertical format)
  async getAttractions() {
    try {
      const data = await this.getSheetData('Attractions');
      if (!data || data.length < 2) return [];

      const headers = data[0]; // 編號, 中文名稱, 英文名稱, 城市, 分類, 重點特色, 其他補充
      const result = [];

      for (let row = 1; row < data.length; row++) {
        const rowData = data[row];
        if (!rowData || rowData.length === 0) continue;

        let description = rowData[5] || ''; // 重點特色
        
        // Generate AI description if missing and OpenAI is available
        if (!description && rowData[1] && this.openai) {
          try {
            description = await this.generateAttractionAIDescription(
              rowData[1], // name
              rowData[3] || '西班牙', // city
              rowData[4] || '景點' // category
            );
            console.log(`✅ Generated AI description for ${rowData[1]}: "${description}"`);
          } catch (error) {
            console.warn(`❌ Failed to generate AI description for ${rowData[1]}:`, error instanceof Error ? error.message : 'Unknown error');
          }
        }

        const attraction: any = {
          id: rowData[0] || '',
          name: rowData[1] || '',
          nameEn: rowData[2] || '',
          city: rowData[3] || '',
          category: rowData[4] || '其他',
          description: description,
          additionalInfo: rowData[6] || '', // 其他補充
          visitDuration: null,
          ticketRequired: null,
          imageUrl: this.getAttractionImageUrl(rowData[1] || ''),
          highlights: this.parseHighlights(description) // Use AI-generated or original description
        };

        if (attraction.name) {
          result.push(attraction);
        }
      }
      return result;
    } catch (error) {
      console.warn('Error fetching attractions:', error);
      return [];
    }
  }

  // Parse TravelReminders sheet (horizontal format)
  async getTravelReminders() {
    try {
      const data = await this.getSheetData('TravelReminders');
      if (!data || data.length < 2) return [];

      const titles = data[0]; // 第一行是標題
      const contents = data[1]; // 第二行是內容
      const result = [];

      // 從第2列開始（跳過第1列的"title"）
      for (let col = 1; col < titles.length && col < contents.length; col++) {
        const title = titles[col] || '';
        const text = contents[col] || '';

        if (!title || !text) continue;

        // 創建提醒物件
        const reminder: any = {
          id: `reminder-${col}`,
          category: this.mapReminderCategory(title),
          title: title.replace('：', '').replace(':', '').trim(),
          icon: this.getReminderIcon(title),
          priority: this.getReminderPriority(title),
          items: [{ text: text }] // 直接使用對應列的內容
        };

        result.push(reminder);
      }

      return result;
    } catch (error) {
      console.warn('Error fetching travel reminders:', error);
      return [];
    }
  }
}

export default GoogleSheetsService;