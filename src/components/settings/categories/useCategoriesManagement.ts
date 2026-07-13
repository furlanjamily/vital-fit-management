"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createFinancialCategoryAction,
  deleteFinancialCategoryAction,
  updateFinancialCategoryAction,
} from "@/app/(app)/settings/categories/actions";
import type { FinancialCategory } from "@/components/finance/finance-category.types";

export function useCategoriesManagement(initialCategories: FinancialCategory[]) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FinancialCategory | null>(null);
  const [removingCategory, setRemovingCategory] = useState<FinancialCategory | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openCreateForm() {
    setEditingCategory(null);
    setActionError(null);
    setFormOpen(true);
  }

  function openEditForm(category: FinancialCategory) {
    setEditingCategory(category);
    setActionError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingCategory(null);
    setActionError(null);
  }

  function handleFormSuccess(category: FinancialCategory) {
    setCategories((current) =>
      editingCategory
        ? current.map((item) => (item.id === category.id ? category : item))
        : [...current, category].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    );

    closeForm();
    router.refresh();
  }

  function removeCategory(categoryId: string) {
    startTransition(async () => {
      setActionError(null);

      const result = await deleteFinancialCategoryAction(categoryId);

      if (!result.success) {
        setActionError(result.error);
        return;
      }

      setCategories((current) => current.filter((category) => category.id !== categoryId));
      if (editingCategory?.id === categoryId) closeForm();
      setRemovingCategory(null);
      router.refresh();
    });
  }

  return {
    categories,
    formOpen,
    editingCategory,
    removingCategory,
    actionError,
    isPending,
    openCreateForm,
    openEditForm,
    closeForm,
    handleFormSuccess,
    removeCategory,
    requestRemove: setRemovingCategory,
    cancelRemove: () => setRemovingCategory(null),
    createFinancialCategoryAction,
    updateFinancialCategoryAction,
  };
}
