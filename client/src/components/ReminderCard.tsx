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
      <div className={`bg-${getPriorityColor(priority)}/10 rounded-full w-12 h-12 flex items-center justify-center mb-4`}>
        <IconComponent className={`text-${getPriorityColor(priority)} text-xl`} />
      </div>
      
      <h3 className="text-xl font-semibold mb-3 text-card-foreground" data-testid={`reminder-title-${id}`}>
        {title}
      </h3>
      
      <ul className="text-muted-foreground space-y-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-start" data-testid={`reminder-item-${id}-${index}`}>
            <Check className="text-primary mr-2 w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className={item.completed ? "line-through opacity-60" : ""}>
              {item.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReminderCard;
