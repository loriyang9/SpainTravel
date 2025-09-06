import { useState } from "react";
import { ArrowLeft, MapPin, Clock, Ticket, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import AttractionCard from "@/components/AttractionCard";
import { useQuery } from "@tanstack/react-query";
import type { Attraction } from "@shared/schema";

const KeyAttractions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("全部");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  
  const { data: attractions, isLoading } = useQuery<Attraction[]>({
    queryKey: ['/api/attractions'],
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-lg text-muted-foreground">載入景點資料中...</div>
      </div>
    );
  }
  
  const attractionsData = attractions || [];
  const cities = ["全部", ...Array.from(new Set(attractionsData.map(a => a.city)))];
  const categories = ["全部", ...Array.from(new Set(attractionsData.map(a => a.category)))];

  const filteredAttractions = attractionsData.filter(attraction => {
    const matchesSearch = attraction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attraction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === "全部" || attraction.city === selectedCity;
    const matchesCategory = selectedCategory === "全部" || attraction.category === selectedCategory;
    
    return matchesSearch && matchesCity && matchesCategory;
  });

  const getCategoryLabel = (category: string) => {
    if (category === "全部") return "全部";
    return category; // 直接使用 Google Sheet 中的原始分類名稱
  };

  return (
    <div className="min-h-screen pt-20" data-testid="key-attractions-page">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4" data-testid="back-to-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首頁
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-foreground font-serif mb-4">重要景點介紹</h1>
          <p className="text-lg text-muted-foreground">西班牙必訪的世界文化遺產與經典地標</p>
        </div>

        {/* Filters */}
        <div className="mb-8 p-6 bg-card rounded-lg shadow-lg">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜尋景點..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-input"
              />
            </div>

            {/* City Filter */}
            <div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground"
                data-testid="city-filter"
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground"
                data-testid="category-filter"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {getCategoryLabel(category)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="text-center p-6 bg-primary/10 rounded-lg" data-testid="total-attractions">
              <div className="text-3xl font-bold text-primary">{attractions.length}</div>
              <div className="text-sm text-muted-foreground">總景點數</div>
            </div>
            <div className="text-center p-6 bg-chart-3/10 rounded-lg" data-testid="filtered-count">
              <div className="text-3xl font-bold text-chart-3">{filteredAttractions.length}</div>
              <div className="text-sm text-muted-foreground">符合條件</div>
            </div>
          </div>
        </div>

        {/* Attractions Grid */}
        {filteredAttractions.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8" data-testid="attractions-grid">
            {filteredAttractions.map((attraction) => (
              <AttractionCard
                key={attraction.id}
                id={attraction.id}
                name={attraction.name}
                city={attraction.city}
                category={attraction.category}
                description={attraction.description}
                additionalInfo={attraction.additionalInfo}
                imageUrl={attraction.imageUrl}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12" data-testid="no-results">
            <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">找不到符合條件的景點</h3>
            <p className="text-muted-foreground mb-4">請嘗試調整搜尋條件或篩選器</p>
            <Button 
              onClick={() => {
                setSearchTerm("");
                setSelectedCity("全部");
                setSelectedCategory("全部");
              }}
              data-testid="clear-filters"
            >
              清除所有篩選
            </Button>
          </div>
        )}

        {/* Quick Tips */}
        <div className="mt-12 p-6 bg-muted/20 rounded-lg" data-testid="quick-tips">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            💡 參觀小貼士
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-2">預約門票</h4>
              <p>聖家堂、阿爾罕布拉宮等熱門景點建議提前網上預約，避免現場排隊。</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">最佳拍照時間</h4>
              <p>黃金時段（日出後1小時、日落前1小時）是拍攝建築的最佳時機。</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">參觀時間</h4>
              <p>大部分景點週一休館，建議確認開放時間後再前往參觀。</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">語音導覽</h4>
              <p>許多景點提供中文語音導覽，能更深入了解歷史文化背景。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyAttractions;
