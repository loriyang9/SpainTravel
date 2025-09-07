import { Check, ChevronRight } from "lucide-react";
import * as Icons from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

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
  isPreview?: boolean;
}

const ReminderCard = ({ id, title, items, icon, priority, isPreview = false }: ReminderCardProps) => {
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
        {/* 預覽模式只顯示前兩行，詳細模式顯示全部 */}
        {items.map((item, index) => {
          const lines = item.text.split('\n').filter(line => line.trim());
          const displayLines = isPreview ? lines.slice(0, 2) : lines;
          
          return (
            <div key={index} className="text-sm" data-testid={`reminder-item-${id}-${index}`}>
              {displayLines.map((line, lineIndex) => (
                <div key={lineIndex} className={lineIndex > 0 ? 'mt-2' : ''}>
                  {line}
                </div>
              ))}
              {/* 在預覽模式下顯示省略號 */}
              {isPreview && lines.length > 2 && (
                <div className="mt-2 text-muted-foreground/60">
                  ...
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* 在預覽模式下顯示查看詳情連結 */}
      {isPreview && (
        <div className="mt-4 pt-4 border-t border-border">
          <Link href={`/reminders#${id}`}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary hover:text-primary/80 p-0 h-auto font-normal"
              data-testid={`view-details-${id}`}
            >
              查看詳情 →
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ReminderCard;
