import type { ExpenseBreakdownData } from "./types";

export const MOCK_EXPENSE_BREAKDOWN: ExpenseBreakdownData = {
  title: "Expense Breakdown",
  totalLabel: "Total",
  items: [
    { name: "Marketing", value: 6200, color: "#FF9800" },
    { name: "Development", value: 4800, color: "#FF4D3D" },
    { name: "Operations", value: 4200, color: "#FFB300" },
    { name: "Others", value: 3230.2, color: "#FF7A4A" },
  ],
};
