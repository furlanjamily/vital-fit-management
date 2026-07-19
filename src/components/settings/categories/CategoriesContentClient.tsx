"use client";

import Link from "next/link";
import { ArrowLeft, Edit3, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/common/button/Button";
import { RowActionsMenu, type RowAction } from "@/components/common/menu/RowActionsMenu";
import { ConfirmRemoveDialog } from "@/components/common/modal/ConfirmRemoveDialog";
import {
  Table,
  type TableColumn,
  type TableFilterDefinition,
} from "@/components/common/table/Table";
import { CategoryForm } from "@/components/settings/categories/CategoryForm";
import { useCategoriesManagement } from "@/components/settings/categories/useCategoriesManagement";
import {
  financialCategoryTypeLabels,
  type FinancialCategory,
} from "@/components/finance/finance-category.types";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { useToastOnError } from "@/hooks/useToastOnError";
import { cn } from "@/lib/cn";

type CategoriesContentClientProps = {
  initialCategories: FinancialCategory[];
  loadError?: string | null;
};

const categoryFilters: TableFilterDefinition<FinancialCategory>[] = [
  {
    type: "text",
    key: "search",
    placeholder: "Buscar por nome…",
  },
  {
    type: "select",
    key: "type",
    placeholder: "Tipo",
    options: [
      { value: "RECEITA", label: financialCategoryTypeLabels.RECEITA },
      { value: "DESPESA", label: financialCategoryTypeLabels.DESPESA },
    ],
    match: (category) => category.type,
  },
];

function CategoryColorSwatch({ color, name }: { color: string; name: string }) {
  return (
    <div className="flex items-center gap-2.5 truncate">
      <span
        className="size-3.5 shrink-0 rounded-full border border-white/20"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className={glassTextStyles.entityName}>{name}</span>
    </div>
  );
}

function CategoryTypeBadge({ type }: { type: FinancialCategory["type"] }) {
  const isReceita = type === "RECEITA";

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium",
        isReceita
          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
          : "border-orange-400/25 bg-orange-400/10 text-orange-200",
      )}
    >
      {financialCategoryTypeLabels[type]}
    </span>
  );
}

export function CategoriesContentClient({
  initialCategories,
  loadError = null,
}: CategoriesContentClientProps) {
  const {
    categories,
    formOpen,
    editingCategory,
    removingCategory,
    isPending,
    openCreateForm,
    openEditForm,
    closeForm,
    handleFormSuccess,
    removeCategory,
    requestRemove,
    cancelRemove,
    createFinancialCategoryAction,
    updateFinancialCategoryAction,
  } = useCategoriesManagement(initialCategories);

  useToastOnError(loadError);

  const columns: TableColumn<FinancialCategory>[] = [
    {
      key: "name",
      header: "Categoria",
      searchValue: (category) => category.name,
      render: (category) => <CategoryColorSwatch color={category.color} name={category.name} />,
    },
    {
      key: "type",
      header: "Tipo",
      searchValue: (category) => financialCategoryTypeLabels[category.type],
      render: (category) => <CategoryTypeBadge type={category.type} />,
    },
    {
      key: "color",
      header: "Cor",
      searchValue: (category) => category.color,
      render: (category) => (
        <span className={cn("font-mono text-xs", glassText.muted)}>{category.color}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "w-16",
      headerClassName: "w-16",
      width: "4rem",
      render: (category) => {
        const actions: RowAction[] = [
          {
            label: "Editar",
            icon: Edit3,
            onSelect: () => openEditForm(category),
          },
        ];

        if (!category.is_system) {
          actions.push({
            label: "Remover",
            icon: Trash2,
            tone: "danger",
            onSelect: () => requestRemove(category),
          });
        }

        return (
          <RowActionsMenu
            ariaLabel={`Ações para ${category.name}`}
            disabled={isPending}
            actions={actions}
          />
        );
      },
    },
  ];

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/settings"
            className={cn(
              "mb-3 inline-flex items-center gap-1.5 text-sm transition hover:text-glass-primary",
              glassText.muted,
            )}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Voltar para configurações
          </Link>
          <h1 className={glassTextStyles.pageTitle}>Categorias financeiras</h1>
          <p className={cn("mt-1 text-sm", glassText.muted)}>
            Gerencie receitas e despesas usadas no dashboard e nos lançamentos
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={openCreateForm}
          leftIcon={<Plus className="size-4" aria-hidden="true" />}
        >
          Nova categoria
        </Button>
      </div>

      <Table
        data={categories}
        columns={columns}
        getRowId={(category) => category.id}
        filters={categoryFilters}
        emptyMessage="Nenhuma categoria cadastrada."
        className={cn(isPending && "pointer-events-none opacity-70")}
      />

      {formOpen ? (
        <CategoryForm
          editingCategory={editingCategory}
          onSuccess={handleFormSuccess}
          onCancel={closeForm}
          createAction={createFinancialCategoryAction}
          updateAction={updateFinancialCategoryAction}
        />
      ) : null}

      {removingCategory ? (
        <ConfirmRemoveDialog
          title="Remover categoria"
          subjectName={removingCategory.name}
          pending={isPending}
          onConfirm={() => removeCategory(removingCategory.id)}
          onCancel={cancelRemove}
        />
      ) : null}
    </div>
  );
}
