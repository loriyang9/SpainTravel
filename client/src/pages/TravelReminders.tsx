import { useState, useEffect } from "react";
import { ArrowLeft, Check, AlertTriangle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";
import ReminderCard from "@/components/ReminderCard";
import { useQuery } from "@tanstack/react-query";
import type { TravelReminder } from "@shared/schema";

const TravelReminders = () => {
  const [selectedPriority, setSelectedPriority] = useState("全部");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  // 頁面載入時自動滾動到頂部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  
  const { data: reminders, isLoading } = useQuery<TravelReminder[]>({
    queryKey: ['/api/reminders'],
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-lg text-muted-foreground">載入提醒資料中...</div>
      </div>
    );
  }
  
  const travelReminders = reminders || [];
  const priorities = ["全部", "1", "2", "3", "4", "5"];

  const filteredReminders = travelReminders.filter(reminder => {
    return selectedPriority === "全部" || reminder.priority.toString() === selectedPriority;
  });

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return "最高優先級";
      case 2:
        return "高優先級";
      case 3:
        return "中優先級";
      case 4:
        return "低優先級";
      case 5:
        return "提醒事項";
      default:
        return "未知";
    }
  };

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

  // 這些函數已經不需要了，因為進度計算現在在個別卡片內部處理

  return (
    <div className="min-h-screen pt-20" data-testid="travel-reminders-page">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4" data-testid="back-to-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首頁
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-foreground font-serif mb-4">旅遊提醒事項</h1>
        </div>



        {/* 出發前準備 - 單獨在頂部 */}
        {travelReminders
          .filter(reminder => reminder.title === "出發前準備")
          .map((reminder: TravelReminder) => (
            <div key={reminder.id} id={reminder.id} className="bg-card rounded-xl p-8 shadow-lg card-hover mb-12">
              {/* Icon and Title */}
              <div className="flex items-center mb-6">
                <div className="text-3xl mr-4">✅</div>
                <h3 className="text-2xl font-semibold text-card-foreground" data-testid={`reminder-title-${reminder.id}`}>
                  出發前準備確認表
                </h3>
              </div>

              {/* Content - 出發前準備：每個分段都有checkbox */}
              <ul className="space-y-4 mb-6">
                {(reminder.items as any[]).map((item: any, itemIndex: number) => {
                  // 將每一行分割成獨立的checklist項目
                  const lines = item.text.split('\n').filter((line: string) => line.trim());
                  
                  return lines.map((line: string, lineIndex: number) => {
                    const itemKey = `${reminder.id}-${itemIndex}-${lineIndex}`;
                    const isChecked = checkedItems[itemKey] || false;
                    
                    return (
                      <li key={`${itemIndex}-${lineIndex}`} className="flex items-start space-x-4" data-testid={`reminder-item-${reminder.id}-${itemIndex}-${lineIndex}`}>
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => {
                            const newCheckedItems = { ...checkedItems };
                            if (isChecked) {
                              delete newCheckedItems[itemKey];
                            } else {
                              newCheckedItems[itemKey] = true;
                            }
                            setCheckedItems(newCheckedItems);
                          }}
                          className="mt-1"
                          data-testid={`checkbox-${reminder.id}-${itemIndex}-${lineIndex}`}
                        />
                        <div 
                          className={`text-base ${isChecked 
                            ? 'line-through text-muted-foreground' 
                            : 'text-foreground'
                          }`}
                        >
                          {line}
                        </div>
                      </li>
                    );
                  });
                }).flat()}
              </ul>

              {/* Progress for this card */}
              {(() => {
                // 計算所有分段的總數和已完成數
                let totalLines = 0;
                let checkedLines = 0;
                
                // 確保 reminder.items 存在且是陣列
                if (reminder.items && Array.isArray(reminder.items)) {
                  (reminder.items as any[]).forEach((item: any, itemIndex: number) => {
                    if (item && item.text) {
                      const lines = item.text.split('\n').filter((line: string) => line.trim());
                      totalLines += lines.length;
                      
                      lines.forEach((_: string, lineIndex: number) => {
                        const itemKey = `${reminder.id}-${itemIndex}-${lineIndex}`;
                        if (checkedItems[itemKey]) {
                          checkedLines++;
                        }
                      });
                    }
                  });
                }
                
                const progressPercentage = totalLines > 0 ? Math.round((checkedLines / totalLines) * 100) : 0;
                
                return (
                  <div className="pt-6 border-t">
                    <div className="flex items-center justify-between text-base mb-3">
                      <span className="text-muted-foreground font-medium">完成進度</span>
                      <span className="font-semibold text-lg">{checkedLines} / {totalLines}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3">
                      {progressPercentage > 0 && (
                        <div 
                          className="h-3 rounded-full transition-all duration-500 bg-primary"
                          style={{ 
                            width: `${Math.max(0, Math.min(100, progressPercentage))}%`
                          }}
                        ></div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          ))
        }


        {/* 其他提醒事項 Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="reminders-grid">
          {travelReminders
            .filter(reminder => reminder.title !== "出發前準備")
            .map((reminder: TravelReminder) => (
              <div key={reminder.id} id={reminder.id} className="bg-card rounded-xl p-6 shadow-lg card-hover">
                {/* Icon and Title */}
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">
                    {(() => {
                      // 根據標題直接映射圖標
                      switch (reminder.title) {
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
                  <h3 className="text-xl font-semibold text-card-foreground" data-testid={`reminder-title-${reminder.id}`}>
                    {reminder.title}
                  </h3>
                </div>

                {/* Content - 其他分類：只顯示內容 */}
                <div className="space-y-3">
                  {(reminder.items as any[]).map((item: any, index: number) => (
                    <div key={index} className="text-sm text-foreground" data-testid={`reminder-item-${reminder.id}-${index}`}>
                      {item.text.split('\n').map((line: string, lineIndex: number) => (
                        <div key={lineIndex} className={lineIndex > 0 ? 'mt-2' : ''}>
                          {line}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>

      </div>
    </div>
  );
};

export default TravelReminders;
