import { useCountdown } from "@/hooks/useCountdown";
import { Plane } from "lucide-react";

interface CountdownTimerProps {
  targetDate: Date;
  label: string;
  description: string;
  type: "departure" | "return";
}

const CountdownTimer = ({ targetDate, label, description, type }: CountdownTimerProps) => {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);

  if (isExpired && type === "departure") {
    return null; // Hide departure countdown when expired
  }

  return (
    <div className="bg-card/90 backdrop-blur-sm rounded-lg p-8 countdown-glow" data-testid={`countdown-${type}`}>
      <div className="text-center">
        <Plane 
          className={`h-8 w-8 mx-auto mb-4 ${
            type === "departure" ? "text-primary rotate-45" : "text-secondary -rotate-45"
          }`} 
        />
        <h3 className="text-xl font-semibold mb-4 text-card-foreground">{label}</h3>
        <div className={`text-2xl md:text-3xl font-bold ${
          type === "departure" ? "text-primary" : "text-secondary"
        }`}>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <span className="block text-3xl" data-testid={`countdown-${type}-days`}>{days}</span>
              <span className="text-sm text-muted-foreground">天</span>
            </div>
            <div>
              <span className="block text-3xl" data-testid={`countdown-${type}-hours`}>
                {hours.toString().padStart(2, '0')}
              </span>
              <span className="text-sm text-muted-foreground">時</span>
            </div>
            <div>
              <span className="block text-3xl" data-testid={`countdown-${type}-minutes`}>
                {minutes.toString().padStart(2, '0')}
              </span>
              <span className="text-sm text-muted-foreground">分</span>
            </div>
            <div>
              <span className="block text-3xl" data-testid={`countdown-${type}-seconds`}>
                {seconds.toString().padStart(2, '0')}
              </span>
              <span className="text-sm text-muted-foreground">秒</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      </div>
    </div>
  );
};

export default CountdownTimer;
