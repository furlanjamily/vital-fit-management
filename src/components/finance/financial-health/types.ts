export type FinancialHealthStatus = "on_track" | "at_risk" | "off_track";

export type HealthBarColor = "lavender" | "mint";

export interface FinancialHealthBar {
  height: number;
  color: HealthBarColor;
}

export interface FinancialHealthData {
  id: string;
  title: string;
  status: FinancialHealthStatus;
  statusLabel: string;
  amount: number;
  currencySymbol: string;
  changePercent: number;
  changePeriodLabel: string;
  bars: FinancialHealthBar[];
  footerNote: string;
}
