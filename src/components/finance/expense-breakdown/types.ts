export type ExpenseBreakdownItem = {
  id: string;
  name: string;
  value: number;
  color: string;
};

export type ExpenseBreakdownData = {
  title: string;
  periodLabel: string;
  items: ExpenseBreakdownItem[];
  totalLabel: string;
};
