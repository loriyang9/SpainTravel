import { MapPin, Ticket, Camera } from "lucide-react";
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
    // 根據 Google Sheet 原始分類設定顏色
    switch (category) {
      case "景點":
        return "bg-blue-500";
      case "市場":
        return "bg-green-500";
      case "步道":
        return "bg-emerald-500";
      case "購物中心":
        return "bg-purple-500";
      case "餐廳與小酒館":
        return "bg-red-500";
      case "早餐／早午餐":
        return "bg-orange-500";
      case "精品咖啡／咖啡館":
        return "bg-amber-600";
      case "小店":
        return "bg-pink-500";
      case "教堂":
        return "bg-indigo-500";
      case "博物館":
        return "bg-teal-500";
      case "宮殿":
        return "bg-yellow-600";
      case "公園":
        return "bg-lime-500";
      case "古蹟":
        return "bg-stone-500";
      case "建築":
        return "bg-gray-600";
      default:
        return "bg-slate-500";
    }
  };

  const getCategoryLabel = (category: string) => {
    // 直接使用 Google Sheet 中的原始分類名稱
    return category || "其他";
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
            className={`${getCategoryColor(category)} text-white mr-3 hover:opacity-80 transition-opacity`}
            data-testid={`category-badge-${id}`}
          >
            {getCategoryLabel(category)}
          </Badge>
        </div>
        
        <h3 className="text-2xl font-bold mb-4 text-foreground font-serif" data-testid={`name-${id}`}>
          {name}
        </h3>
        
        <p className="text-muted-foreground mb-6 leading-relaxed" data-testid={`description-${id}`}>
          {description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span className="flex items-center" data-testid={`city-${id}`}>
              <MapPin className="w-4 h-4 mr-1" />
              {city}
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
