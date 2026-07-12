export type ExpenseBreakdownItem = {
  name: string;
  value: number;
  color: string;
};

export type ExpenseBreakdownData = {
  title: string;
  items: ExpenseBreakdownItem[];
  totalLabel: string;
};
