import { Check } from "lucide-react";
import * as Icons from "lucide-react";

interface ReminderItem {
  text: string;
  completed?: boolean;
}

interface ReminderCardProps {
  id: string;
  title: string;
  items: ReminderItem[];
  icon: string;
  priority: number;
}

const ReminderCard = ({ id, title, items, icon, priority }: ReminderCardProps) => {
  // Dynamically get icon component
  const IconComponent = (Icons as any)[icon] || Icons.AlertCircle;
  
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return "destructive";
      case 2:
        return "chart-5";
      case 3:
        return "chart-1";
      case 4:
        return "chart-2";
      case 5:
        return "chart-3";
      default:
        return "muted";
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-lg card-hover" data-testid={`reminder-card-${id}`}>
      <div className="flex items-center mb-4">
        <div className="text-2xl mr-3">
          {(() => {
            // 根據標題直接映射圖標
            switch (title) {
              case "出發前準備":
                return "🧳";
              case "防盜安全":
                return "🛡️";
              case "天氣與穿著":
                return "🌤️";
              case "關於時間":
                return "⏰";
              case "食物與水":
                return "🍽️";
              case "小費":
                return "💰";
              case "廁所":
                return "🚻";
              default:
                return "📋"; // 預設圖標
            }
          })()}
        </div>
        <h3 className="text-xl font-semibold text-card-foreground" data-testid={`reminder-title-${id}`}>
          {title}
        </h3>
      </div>
      
      <div className="text-muted-foreground space-y-2 text-sm">
        {items.map((item, index) => (
          <div key={index} className="flex items-start" data-testid={`reminder-item-${id}-${index}`}>
            <Check className="text-primary mr-2 w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className={item.completed ? "line-through opacity-60" : ""}>
              {item.text.split('\n').map((line, lineIndex) => (
                <div key={lineIndex} className={lineIndex > 0 ? 'mt-2' : ''}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReminderCard;
