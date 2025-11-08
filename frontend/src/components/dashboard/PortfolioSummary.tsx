import { Card } from "@/components/ui/card";
import { TrendingUp, Wallet, Briefcase } from "lucide-react";
import PriceDisplay from "../shared/PriceDisplay";
import PercentageChange from "../shared/PercentageChange";
import StatCard from "../shared/StatCard";
import { formatCurrency, formatNumber } from "@/lib/number-format";
import { usePriceFlash } from "@/hooks/usePriceFlash";

interface PortfolioSummaryProps {
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  cashBalance: number;
  holdingsCount: number;
}

export default function PortfolioSummary({
  totalValue,
  dayChange,
  dayChangePercent,
  cashBalance,
  holdingsCount,
}: PortfolioSummaryProps) {
  const signedDayChange = `${dayChange >= 0 ? "+" : "-"}${formatCurrency(
    Math.abs(dayChange),
  )}`;
  const dayFlash = usePriceFlash(dayChange);
  const percentFlash = usePriceFlash(dayChangePercent);

  return (
    <Card className="p-6" data-testid="portfolio-summary">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Portfolio Summary</h2>
          <div className="flex items-end gap-3">
            <PriceDisplay price={totalValue} size="lg" />
            <span className={percentFlash}>
              <PercentageChange value={dayChangePercent} size="md" />
            </span>
          </div>
          <div
            className={`text-sm font-medium mt-2 ${
              dayChange >= 0 ? "text-success" : "text-danger"
            } ${dayFlash}`}
          >
            {signedDayChange} today
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatCard
            icon={Wallet}
            label="Cash Balance"
            value={formatCurrency(cashBalance)}
            flashValue={cashBalance}
          />
          <StatCard
            icon={Briefcase}
            label="Holdings"
            value={formatNumber(holdingsCount, { maximumFractionDigits: 0 })}
            subtitle="Teams"
          />
          <StatCard
            icon={TrendingUp}
            label="Day P&L"
            value={signedDayChange}
            flashValue={dayChange}
          />
        </div>
      </div>
    </Card>
  );
}
