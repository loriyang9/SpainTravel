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
      console.error(`Error fetching data from sheet ${sheetName}:`, error);
      throw error;
    }
  }

  // Parse DailyItinerary sheet data (horizontal format)
  async getDailyItinerary() {
    try {
      const data = await this.getSheetData('DailyItinerary');
      if (!data || data.length === 0) return [];

      const headers = data[0]; // First row contains dayNumbers (0, 1, 2, ...)
      const result = [];

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
              dayData.title = cellValue;
              dayData.description = cellValue;
              break;
            case 'City':
              dayData.city = cellValue.split(' ')[0]; // Extract city name before English
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
            default:
              // Handle activity rows (detailed schedule)
              if (rowHeader === '' && cellValue) {
                if (!dayData.activitiesRaw) dayData.activitiesRaw = '';
                dayData.activitiesRaw += cellValue + '\n';
              }
              break;
          }
        }

        // Parse activities from raw text
        dayData.activities = this.parseActivities(dayData.activitiesRaw || '');
        dayData.estimatedDuration = this.calculateDuration(dayData.activities);
        
        // Set meals
        dayData.meals = {
          breakfast: dayData.breakfast || '',
          lunch: dayData.lunch || '',
          dinner: dayData.dinner || ''
        };

        // Add default image URL
        dayData.imageUrl = this.getDefaultImageUrl(dayData.city);

        result.push(dayData);
      }

      return result.filter(day => day.dayNumber >= 1 && day.dayNumber <= 16); // Only actual travel days
    } catch (error) {
      console.error('Error parsing daily itinerary:', error);
      throw error;
    }
  }

  private parseActivities(activitiesText: string) {
    if (!activitiesText) return [];

    const lines = activitiesText.split('\n').filter(line => line.trim());
    const activities = [];

    for (const line of lines) {
      const timeMatch = line.match(/^(\d{1,2}:\d{2})-?(\d{1,2}:\d{2})?/);
      if (timeMatch) {
        const [, startTime, endTime] = timeMatch;
        const description = line.replace(timeMatch[0], '').trim();
        
        activities.push({
          time: startTime,
          name: description.split(' ')[0] || '活動',
          description: description,
          location: '',
          duration: endTime ? this.calculateTimeDiff(startTime, endTime) : '1小時',
        });
      } else if (line.includes('-') && line.length > 10) {
        // Handle lines without specific time format
        activities.push({
          time: '全天',
          name: line.substring(0, 20),
          description: line,
          location: '',
          duration: '2小時',
        });
      }
    }

    return activities;
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

  // Parse Attractions sheet (if available)
  async getAttractions() {
    try {
      const data = await this.getSheetData('Attractions');
      if (!data || data.length < 2) return [];

      const headers = data[0];
      const result = [];

      for (let row = 1; row < data.length; row++) {
        const rowData = data[row];
        if (!rowData || rowData.length === 0) continue;

        const attraction: any = {};
        headers.forEach((header: string, index: number) => {
          attraction[header] = rowData[index] || '';
        });

        // Set default values
        attraction.highlights = [
          attraction.highlight1,
          attraction.highlight2,
          attraction.highlight3,
          attraction.highlight4
        ].filter(Boolean);

        result.push(attraction);
      }

      return result;
    } catch (error) {
      console.warn('Attractions sheet not found, using default data');
      return [];
    }
  }

  // Parse TravelReminders sheet (if available)
  async getTravelReminders() {
    try {
      const data = await this.getSheetData('TravelReminders');
      if (!data || data.length < 2) return [];

      const headers = data[0];
      const result = [];

      for (let row = 1; row < data.length; row++) {
        const rowData = data[row];
        if (!rowData || rowData.length === 0) continue;

        const reminder: any = {};
        headers.forEach((header: string, index: number) => {
          reminder[header] = rowData[index] || '';
        });

        // Parse items
        reminder.items = [
          reminder.item1,
          reminder.item2,
          reminder.item3,
          reminder.item4,
          reminder.item5,
          reminder.item6
        ].filter(Boolean).map((text: string) => ({ text }));

        result.push(reminder);
      }

      return result;
    } catch (error) {
      console.warn('TravelReminders sheet not found, using default data');
      return [];
    }
  }
}

export default GoogleSheetsService;