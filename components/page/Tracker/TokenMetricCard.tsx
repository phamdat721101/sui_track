import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { TokenMetricCardProps } from "@/types/interface";
import { TrendingUp, TrendingDown, AlertCircle, Sparkles } from "lucide-react";

export const TokenMetricCard = ({
  title,
  value,
  subValue,
  status = "neutral",
  items,
}: TokenMetricCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const getStatusClasses = () => {
    switch (status) {
      case "positive":
        return "text-green-500";
      case "negative":
        return "text-red-500";
      default:
        return "text-blue-500";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "positive":
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "negative":
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Sparkles className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "bg rounded-xl p-6 transition-all duration-300 border border-itemborder",
        "hover:translate-y-[-5px]"
      )}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-white/70">{title}</h3>
        <div className="rounded-full bg-itemborder p-1.5">
          {getStatusIcon()}
        </div>
      </div>

      <p
        className={cn("text-3xl font-bold tracking-tight", getStatusClasses())}
      >
        {typeof value === "number" && title === "Liquidity Score"
          ? `${value}/100`
          : value}
      </p>

      {subValue && <p className="text-sm text-white/60 mt-1">{subValue}</p>}

      {items && items.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start text-sm">
              <AlertCircle className="h-3.5 w-3.5 mr-2 mt-0.5 text-white/50" />
              <span className="text-white/70">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
