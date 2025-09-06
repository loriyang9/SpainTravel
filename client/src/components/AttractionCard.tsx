import { Clock, Ticket, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AttractionCardProps {
  id: string;
  name: string;
  city: string;
  category: string;
  description: string;
  visitDuration: string;
  ticketRequired: string;
  imageUrl: string;
  onLearnMore?: (id: string) => void;
}

const AttractionCard = ({ 
  id,
  name, 
  city, 
  category, 
  description, 
  visitDuration, 
  ticketRequired, 
  imageUrl,
  onLearnMore
}: AttractionCardProps) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "world_heritage":
        return "primary";
      case "architecture":
        return "chart-1";
      case "museum":
        return "chart-2";
      case "park":
        return "chart-3";
      default:
        return "secondary";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "world_heritage":
        return "世界遺產";
      case "architecture":
        return "建築奇蹟";
      case "museum":
        return "博物館";
      case "park":
        return "藝術公園";
      default:
        return "景點";
    }
  };

  return (
    <div className="bg-background rounded-xl overflow-hidden shadow-xl card-hover" data-testid={`attraction-card-${id}`}>
      <img 
        src={imageUrl} 
        alt={name}
        className="w-full h-64 object-cover"
        loading="lazy"
      />
      <div className="p-8">
        <div className="flex items-center mb-4">
          <Badge 
            variant="secondary"
            className={`bg-${getCategoryColor(category)} text-white mr-3`}
            data-testid={`category-badge-${id}`}
          >
            {getCategoryLabel(category)}
          </Badge>
          <span className="text-muted-foreground text-sm" data-testid={`city-${id}`}>
            {city}
          </span>
        </div>
        
        <h3 className="text-2xl font-bold mb-4 text-foreground font-serif" data-testid={`name-${id}`}>
          {name}
        </h3>
        
        <p className="text-muted-foreground mb-6 leading-relaxed" data-testid={`description-${id}`}>
          {description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span className="flex items-center" data-testid={`duration-${id}`}>
              <Clock className="w-4 h-4 mr-1" />
              參觀時間：{visitDuration}
            </span>
            <span className="flex items-center" data-testid={`ticket-${id}`}>
              <Ticket className="w-4 h-4 mr-1" />
              {ticketRequired}
            </span>
          </div>
          <Button
            variant="ghost"
            onClick={() => onLearnMore?.(id)}
            className="text-primary hover:text-primary/80 font-medium"
            data-testid={`learn-more-${id}`}
          >
            了解更多 →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AttractionCard;
