import type { TableColumn } from "@/components/common/table/table.types";
import { getColumnMinWidthPx } from "@/components/common/table/table.helpers";

type TableColGroupProps<T> = {
  columns: TableColumn<T>[];
};

export function TableColGroup<T>({ columns }: TableColGroupProps<T>) {
  return (
    <colgroup>
      {columns.map((column) => {
        const widthPx = getColumnMinWidthPx(column);

        return (
          <col
            key={column.key}
            style={{
              width: widthPx,
              minWidth: widthPx,
            }}
          />
        );
      })}
    </colgroup>
  );
}
