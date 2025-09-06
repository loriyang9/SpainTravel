export interface Attraction {
  id: string;
  name: string;
  nameEn: string;
  city: string;
  category: string;
  description: string;
  visitDuration: string;
  ticketRequired: string;
  imageUrl: string;
  highlights: string[];
}

export const attractions: Attraction[] = [
  {
    id: "sagrada-familia",
    name: "聖家堂 Sagrada Família",
    nameEn: "Sagrada Família",
    city: "巴塞隆納",
    category: "world_heritage",
    description: "高第的曠世巨作，被譽為「石頭聖經」。這座未完成的教堂融合了哥德式與新藝術風格，每一處細節都展現了建築師對自然與宗教的深刻理解。彩色玻璃窗投射出夢幻般的光影，讓人彷彿置身天堂。",
    visitDuration: "2小時",
    ticketRequired: "需預約",
    imageUrl: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    highlights: [
      "高第獨特的建築風格",
      "彩色玻璃窗的光影效果",
      "登塔俯瞰巴塞隆納全景",
      "精緻的石雕裝飾"
    ]
  },
  {
    id: "alhambra",
    name: "阿爾罕布拉宮 Alhambra",
    nameEn: "Alhambra",
    city: "格拉納達",
    category: "world_heritage",
    description: "伊斯蘭建築的瑰寶，摩爾人在伊比利亞半島的最後堡壘。精緻的幾何圖案、優雅的拱門、潺潺的噴泉，展現了東方與西方文化的完美融合。夕陽西下時，整座宮殿披上金色外衣，美得令人屏息。",
    visitDuration: "3小時",
    ticketRequired: "限量門票",
    imageUrl: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    highlights: [
      "伊斯蘭藝術的精緻裝飾",
      "庭院中的噴泉與花園",
      "俯瞰格拉納達城市景觀",
      "歷史悠久的摩爾文化"
    ]
  },
  {
    id: "plaza-espana-seville",
    name: "西班牙廣場 Plaza de España",
    nameEn: "Plaza de España",
    city: "塞維亞",
    category: "architecture",
    description: "塞維亞最壯觀的廣場，半圓形的宏偉建築環抱著中央廣場。色彩繽紛的磁磚描繪著西班牙各省的歷史故事，運河中的小船悠然划過，橋樑連接著過去與現在。這裡曾是《星際大戰》的拍攝地點。",
    visitDuration: "1.5小時",
    ticketRequired: "絕佳拍照點",
    imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    highlights: [
      "半圓形的宏偉建築",
      "彩色磁磚的藝術裝飾",
      "運河與小船的浪漫景致",
      "電影取景的著名地標"
    ]
  },
  {
    id: "park-guell",
    name: "奎爾公園 Park Güell",
    nameEn: "Park Güell",
    city: "巴塞隆納",
    category: "park",
    description: "高第設計的童話世界，充滿了繽紛的馬賽克藝術。蜿蜒的座椅、糖果屋般的建築、守護神蜥蜴，每一處都展現了建築師無窮的想像力。從公園的高處眺望，整個巴塞隆納城市美景盡收眼底。",
    visitDuration: "2小時",
    ticketRequired: "城市景觀",
    imageUrl: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    highlights: [
      "高第的馬賽克藝術",
      "童話般的建築設計",
      "巴塞隆納城市全景",
      "獨特的自然與藝術融合"
    ]
  }
];
