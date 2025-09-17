/**
 * Smart date calculation utilities for Spain travel itinerary
 */

export interface TravelDates {
  departure: Date;
  return: Date;
}

// Travel dates configuration
export const TRAVEL_DATES: TravelDates = {
  departure: new Date('2025-10-05T00:30:00+08:00'), // Taiwan time
  return: new Date('2025-10-18T22:05:00+02:00'), // Spain time
};

/**
 * Calculate current trip day based on travel dates
 * @param actualTripDays - Total number of actual trip days (excluding Day 0)
 * @returns Day number (0 = not departed yet or returned, 1-N = trip days)
 */
export const getCurrentTripDay = (actualTripDays: number = 15): number => {
  const now = new Date();
  const departureTime = TRAVEL_DATES.departure.getTime();
  const returnTime = TRAVEL_DATES.return.getTime();
  const currentTime = now.getTime();
  
  // Before departure
  if (currentTime < departureTime) {
    return 0;
  }
  
  // After return
  if (currentTime > returnTime) {
    return 0;
  }
  
  // During trip - calculate days since departure
  const daysSinceDeparture = Math.floor((currentTime - departureTime) / (24 * 60 * 60 * 1000));
  const tripDay = daysSinceDeparture + 1; // Day 1 is the first day
  
  return Math.min(Math.max(tripDay, 1), actualTripDays);
};

/**
 * Get the smart default route for daily itinerary
 * @param actualTripDays - Total number of actual trip days
 * @returns URL path for the current appropriate day
 */
export const getSmartItineraryRoute = (actualTripDays: number = 15): string => {
  const currentDay = getCurrentTripDay(actualTripDays);
  
  if (currentDay === 0) {
    return '/itinerary/day-0'; // Show Day 0 (departure preparation)
  }
  
  return `/itinerary/day-${currentDay}`;
};

/**
 * Check if currently in travel period
 * @returns boolean indicating if currently traveling
 */
export const isCurrentlyTraveling = (): boolean => {
  const now = new Date();
  return now >= TRAVEL_DATES.departure && now <= TRAVEL_DATES.return;
};

/**
 * Get days until departure or return
 * @returns Object with countdown info
 */
export const getCountdownInfo = () => {
  const now = new Date();
  const departureTime = TRAVEL_DATES.departure.getTime();
  const returnTime = TRAVEL_DATES.return.getTime();
  const currentTime = now.getTime();
  
  if (currentTime < departureTime) {
    return {
      type: 'departure' as const,
      targetDate: TRAVEL_DATES.departure,
      label: '出發倒數',
      description: '2025年10月5日 00:30 台北時間'
    };
  } else if (currentTime <= returnTime) {
    return {
      type: 'return' as const,
      targetDate: TRAVEL_DATES.return,
      label: '返家倒數',
      description: '2025年10月18日 22:05 西班牙時間'
    };
  } else {
    return {
      type: 'completed' as const,
      targetDate: TRAVEL_DATES.return,
      label: '旅程已結束',
      description: '美好回憶永存'
    };
  }
};