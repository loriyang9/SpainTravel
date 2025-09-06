export interface TravelReminderItem {
  text: string;
  completed?: boolean;
}

export interface TravelReminder {
  id: string;
  category: string;
  title: string;
  items: TravelReminderItem[];
  icon: string;
  priority: number;
}

export const travelReminders: TravelReminder[] = [
  {
    id: "documents",
    category: "documents",
    title: "證件準備",
    items: [
      { text: "護照效期需超過6個月" },
      { text: "備份護照影本存雲端" },
      { text: "申根簽證申請完成" },
      { text: "國際駕照(如需租車)" }
    ],
    icon: "Passport",
    priority: 1
  },
  {
    id: "money",
    category: "money",
    title: "金錢準備",
    items: [
      { text: "兌換適量歐元現金" },
      { text: "信用卡開通海外刷卡" },
      { text: "通知銀行出國行程" },
      { text: "準備小費零錢" }
    ],
    icon: "CreditCard",
    priority: 1
  },
  {
    id: "packing",
    category: "packing",
    title: "行李打包",
    items: [
      { text: "秋季服裝(10-20°C)" },
      { text: "舒適步行鞋" },
      { text: "雨具與防風外套" },
      { text: "充電器與轉換插頭" }
    ],
    icon: "Luggage",
    priority: 2
  },
  {
    id: "communication",
    category: "communication",
    title: "通訊準備",
    items: [
      { text: "開通國際漫遊" },
      { text: "購買歐洲SIM卡" },
      { text: "下載離線地圖" },
      { text: "安裝翻譯APP" }
    ],
    icon: "Smartphone",
    priority: 3
  },
  {
    id: "safety",
    category: "safety",
    title: "安全須知",
    items: [
      { text: "投保旅遊險與醫療險" },
      { text: "注意扒手熱點區域" },
      { text: "重要物品分散放置" },
      { text: "記住緊急聯絡電話" }
    ],
    icon: "Shield",
    priority: 2
  },
  {
    id: "culture",
    category: "culture",
    title: "飲食文化",
    items: [
      { text: "午餐時間較晚(14:00)" },
      { text: "晚餐時間更晚(21:00)" },
      { text: "必試Tapas小食文化" },
      { text: "小費約10%非強制" }
    ],
    icon: "UtensilsCrossed",
    priority: 4
  }
];
