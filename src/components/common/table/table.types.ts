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
  /**
   * Largura mínima da coluna (ex: "140px"). Essencial para mobile: impede que
   * `table-fixed` comprima o conteúdo abaixo do legível — em vez disso, a
   * tabela cresce além do container e o scroll horizontal é acionado.
   */
  minWidth?: string;
  /**
   * Fixa a coluna em um dos lados durante o scroll horizontal (ex.: coluna
   * de "Ações"). Use com moderação — no máximo uma coluna por lado.
   */
  sticky?: "left" | "right";
};
