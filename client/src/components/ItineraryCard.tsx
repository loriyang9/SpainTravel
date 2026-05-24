import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveAssetUrl } from "@/lib/api";

interface ItineraryCardProps {
  dayNumber: number;
  date: string;
  title: string;
  description: string;
  duration: string;
  imageUrl: string;
  color: string;
  onClick?: () => void;
}

const ItineraryCard = ({ 
  dayNumber, 
  date, 
  title, 
  description, 
  duration, 
  imageUrl, 
  color,
  onClick 
}: ItineraryCardProps) => {
  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-sm h-full flex flex-col" data-testid={`itinerary-card-day-${dayNumber}`}>
      <img 
        src={resolveAssetUrl(imageUrl)} 
        alt={title}
        className="w-full h-48 object-cover flex-shrink-0"
        loading="lazy"
      />
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-3">
          <span 
            className={`bg-${color} text-white px-3 py-1 rounded-full text-sm font-semibold`}
            data-testid={`day-badge-${dayNumber}`}
          >
            Day {dayNumber}
          </span>
          <span className="text-muted-foreground text-sm" data-testid={`date-${dayNumber}`}>
            {date}
          </span>
        </div>
        <h3 className="text-xl font-semibold mb-2 text-card-foreground" data-testid={`title-${dayNumber}`}>
          Day {dayNumber} - {title}
        </h3>
        <p className="text-muted-foreground mb-4 flex-grow line-clamp-3 text-sm leading-relaxed" data-testid={`description-${dayNumber}`}>
          {description}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-sm text-muted-foreground flex items-center" data-testid={`duration-${dayNumber}`}>
            <Clock className="w-4 h-4 mr-1" />
            {duration}
          </span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClick}
            className="text-primary hover:text-primary/80"
            data-testid={`details-button-${dayNumber}`}
          >
            查看詳情 →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ItineraryCard;
