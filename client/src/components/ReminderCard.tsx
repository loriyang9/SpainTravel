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
                return "✅";
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
          {title === "出發前準備" ? "出發前準備確認表" : title}
        </h3>
      </div>
      
      <div className="text-muted-foreground space-y-2 text-sm">
        {/* 針對特定分類限制顯示前4個要點 */}
        {items.map((item, index) => {
          // 對於防盜安全、天氣與穿著、關於時間，只顯示前4個要點
          const shouldLimit = ["防盜安全", "天氣與穿著", "關於時間"].includes(title);
          const lines = item.text.split('\n').filter(line => line.trim());
          const displayLines = shouldLimit ? lines.slice(0, 4) : lines;
          
          return (
            <div key={index} className="text-sm" data-testid={`reminder-item-${id}-${index}`}>
              {displayLines.map((line, lineIndex) => (
                <div key={lineIndex} className={lineIndex > 0 ? 'mt-2' : ''}>
                  {line}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReminderCard;
