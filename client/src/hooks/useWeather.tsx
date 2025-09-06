import { useQuery } from "@tanstack/react-query";

interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  description: string;
  icon: string;
}

export const useWeather = (city: string) => {
  return useQuery<WeatherData>({
    queryKey: ["/api/weather", city],
    enabled: !!city,
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
  });
};
