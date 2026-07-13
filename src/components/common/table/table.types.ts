import type { ReactNode } from "react";

export type TableColumnAlign = "left" | "center" | "right";

export type TableColumn<T> = {
  /** Identificador único da coluna. */
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Valor textual usado pelo filtro global. Colunas sem searchValue não participam da busca. */
  searchValue?: (row: T) => string;
  className?: string;
  headerClassName?: string;
  /** Alinhamento horizontal da coluna. Padrão: left. */
  align?: TableColumnAlign;
  /** Largura da coluna (ex: "28%", "120px") — mantém thead/tbody alinhados. */
  width?: string;
};
