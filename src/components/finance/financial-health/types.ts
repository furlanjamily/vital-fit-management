export type FinancialHealthStatus = "on_track" | "at_risk" | "off_track";

export interface FinancialChartBar {
  label: string;
  value: number;
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
  footerNote: string;
  hideChange?: boolean;
}
