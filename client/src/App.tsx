import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/Navigation";
import Home from "@/pages/Home";
import DailyItinerary from "@/pages/DailyItinerary";
import TravelReminders from "@/pages/TravelReminders";
import KeyAttractions from "@/pages/KeyAttractions";
import NotFound from "@/pages/not-found";

// Strip trailing slash from BASE_URL for wouter's base prop
const base = import.meta.env.BASE_URL.replace(/\/$/, "");

function AppRoutes() {
  return (
    <>
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/itinerary" component={DailyItinerary} />
        <Route path="/itinerary/:dayNumber" component={DailyItinerary} />
        <Route path="/reminders" component={TravelReminders} />
        <Route path="/attractions" component={KeyAttractions} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router base={base}>
          <AppRoutes />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

