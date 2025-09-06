import { useState, useEffect } from 'react';

interface ScrollSpyOptions {
  sections: string[];
  offset?: number;
}

export const useScrollSpy = ({ sections, offset = 100 }: ScrollSpyOptions) => {
  const [activeSection, setActiveSection] = useState<string>(sections[0]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Find the section that is currently in view
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section) {
          const rect = section.getBoundingClientRect();
          const sectionTop = window.scrollY + rect.top;
          
          // Check if we're in this section
          if (scrollY >= sectionTop - offset) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    // Set initial active section
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections, offset]);

  return activeSection;
};