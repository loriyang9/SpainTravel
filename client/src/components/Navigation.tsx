import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Sun, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useScrollSpy } from "@/hooks/useScrollSpy";

const Navigation = () => {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Scroll spy for homepage sections
  const homeSections = ['hero', 'itinerary-preview', 'attractions-preview', 'reminders-preview'];
  const activeSection = useScrollSpy({ sections: homeSections, offset: 150 });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/", label: "首頁", testId: "nav-home", section: "hero" },
    { href: "/itinerary", label: "每日行程", testId: "nav-itinerary", section: "itinerary-preview" },
    { href: "/attractions", label: "重要景點", testId: "nav-attractions", section: "attractions-preview" },
    { href: "/reminders", label: "旅遊提醒", testId: "nav-reminders", section: "reminders-preview" },
  ];

  const isActive = (href: string, section?: string) => {
    // If we're on homepage, use scroll spy
    if (location === "/" && section) {
      return activeSection === section;
    }
    
    // For other pages, use route-based highlighting
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${
        isScrolled ? "nav-solid" : "nav-transparent"
      }`}
      data-testid="main-navigation"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" data-testid="logo-link">
          <div className="flex items-center space-x-2">
            <Sun className="h-8 w-8 text-primary" />
            <h1 className="font-bold text-foreground font-serif text-[20px]">楊家醬 in Spain</h1>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} data-testid={item.testId}>
              <span
                className={`text-foreground hover:text-primary transition-colors cursor-pointer ${
                  isActive(item.href, item.section) ? "text-primary font-semibold" : ""
                }`}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-foreground"
              data-testid="mobile-menu-trigger"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="flex items-center space-x-2 mb-8">
              <Sun className="h-6 w-6 text-primary" />
              <span className="font-bold font-serif">西班牙金秋之旅</span>
            </div>
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} data-testid={`mobile-${item.testId}`}>
                  <span
                    className={`block py-2 px-4 text-lg text-foreground hover:text-primary hover:bg-accent/20 rounded-lg transition-colors cursor-pointer ${
                      isActive(item.href, item.section) ? "text-primary font-semibold bg-accent/20" : ""
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navigation;
