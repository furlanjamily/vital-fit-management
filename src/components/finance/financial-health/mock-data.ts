import type { FinancialHealthBar, FinancialHealthData } from "./types";

const BAR_PATTERN: Array<[number, FinancialHealthBar["color"]]> = [
  [38, "lavender"],
  [62, "mint"],
  [48, "lavender"],
  [78, "mint"],
  [55, "lavender"],
  [88, "mint"],
  [42, "lavender"],
  [70, "mint"],
  [58, "lavender"],
  [92, "mint"],
  [45, "lavender"],
  [68, "mint"],
  [52, "lavender"],
  [80, "mint"],
  [40, "lavender"],
  [74, "mint"],
  [60, "lavender"],
  [85, "mint"],
  [48, "lavender"],
  [66, "mint"],
];

export const MOCK_FINANCIAL_HEALTH: FinancialHealthData = {
  id: "financial-health-30d",
  title: "Saúde Financeira",
  status: "on_track",
  statusLabel: "No caminho",
  amount: 374.84,
  currencySymbol: "R$",
  changePercent: -24,
  changePeriodLabel: "Neste último mês",
  bars: BAR_PATTERN.map(([height, color]) => ({ height, color })),
  footerNote:
    "Esta condição é baseada nos dados de transação dos últimos 30 dias",
};
