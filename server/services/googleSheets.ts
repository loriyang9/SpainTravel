import { google } from 'googleapis';

// Google Sheets configuration
const SPREADSHEET_ID = '1V5NSXukzD5z2m-07AhcMkU6fWEPchO4lIN8KzpI7Lwo';

class GoogleSheetsService {
  private sheets: any;

  constructor() {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}');
      
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
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
      if (!data || data.length === 0) return {};

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
        if (isNaN(dayNumber) || dayNumber < 1) {
          continue;
        }

        if (!dayGroups[dayNumber]) {
          dayGroups[dayNumber] = [];
        }
        dayGroups[dayNumber].push(activity);
      }

      // Convert groups to day objects, merging with DailyItinerary data
      Object.keys(dayGroups).forEach(dayNumStr => {
        const dayNumber = parseInt(dayNumStr);
        const activities = dayGroups[dayNumber];
        const overview = dailyOverviews[dayNumber] || {};
        
        if (activities.length === 0) return;

        const dayData: any = {
          dayNumber,
          date: overview.date || activities[0].date || '',
          title: overview.theme || this.extractDayTitle(activities), // Use Theme from DailyItinerary
          description: overview.theme || this.extractDayTitle(activities),
          city: overview.city || '', // Use City from DailyItinerary only
          activities: activities.map(act => ({
            time: act.time || '全天',
            name: act.title || '活動',
            description: act.description || act.title || '',
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
          imageUrl: this.getDefaultImageUrl(overview.city || this.extractCity(activities))
        };

        result.push(dayData);
      });

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

  private getDefaultImageUrl(city: string): string {
    const imageMap: { [key: string]: string } = {
      '巴薩隆納': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
      '薩拉曼卡': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
      '馬德里': 'https://images.unsplash.com/photo-1539821266776-0e846c90c957?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
      '台北': 'https://images.unsplash.com/photo-1590735213920-68192a487bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'
    };
    
    return imageMap[city] || 'https://images.unsplash.com/photo-1504019347908-b45f9b0b8dd5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400';
  }

  private mapCategory(category: string): string {
    const categoryMap: { [key: string]: string } = {
      '世界遺產': 'world_heritage',
      '建築': 'architecture',
      '博物館': 'museum',
      '公園': 'park',
      '教堂': 'architecture',
      '宮殿': 'architecture'
    };
    return categoryMap[category] || 'attraction';
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

        const attraction: any = {
          id: rowData[0] || '',
          name: rowData[1] || '',
          nameEn: rowData[2] || '',
          city: rowData[3] || '',
          category: this.mapCategory(rowData[4] || ''),
          description: rowData[6] || rowData[5] || '', // 其他補充 or 重點特色
          visitDuration: '2-3小時',
          ticketRequired: '建議預訂',
          imageUrl: this.getAttractionImageUrl(rowData[1] || ''),
          highlights: this.parseHighlights(rowData[5] || '') // 重點特色
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

      const result = [];
      let currentCategory = '';
      let currentPriority = 1;

      for (let row = 0; row < data.length; row++) {
        const rowData = data[row];
        if (!rowData || rowData.length < 2) continue;

        const title = rowData[0] || '';
        const text = rowData[1] || '';

        if (!title || !text) continue;

        // Create reminder object
        const reminder: any = {
          id: `reminder-${row}`,
          category: this.mapReminderCategory(title),
          title: title.replace('：', '').replace(':', '').trim(),
          icon: this.getReminderIcon(title),
          priority: this.getReminderPriority(title),
          items: this.parseReminderItems(text)
        };

        if (reminder.items && reminder.items.length > 0) {
          result.push(reminder);
        }
      }

      return result;
    } catch (error) {
      console.warn('Error fetching travel reminders:', error);
      return [];
    }
  }
}

export default GoogleSheetsService;