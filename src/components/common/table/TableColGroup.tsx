import type { TableColumn } from "@/components/common/table/table.types";

type TableColGroupProps<T> = {
  columns: TableColumn<T>[];
};

export function TableColGroup<T>({ columns }: TableColGroupProps<T>) {
  return (
    <colgroup>
      {columns.map((column) => (
        <col key={column.key} style={column.width ? { width: column.width } : undefined} />
      ))}
    </colgroup>
  );
}
