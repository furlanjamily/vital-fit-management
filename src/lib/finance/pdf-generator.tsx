import fs from "node:fs";
import path from "node:path";
import React from "react";
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { brand } from "@/config/brand-colors";
import { formatBrlAmount } from "@/components/finance/finance.helpers";
import type { CategoryExpense, FinancialBalance } from "@/components/finance/finance.types";

const FONTS_DIR = path.join(process.cwd(), "public", "fonts");

Font.register({
  family: "Pacifico",
  src: path.join(FONTS_DIR, "Pacifico-Regular.ttf"),
});

Font.register({
  family: "GeistSans",
  src: path.join(FONTS_DIR, "GeistSans-Bold.ttf"),
  fontWeight: 800,
});

export type FinancePdfMovementBar = {
  label: string;
  receitas: number;
  despesas: number;
};

export type FinancePdfReportInput = {
  periodLabel: string;
  dateRangeLabel: string;
  generatedAtLabel: string;
  balance: FinancialBalance;
  healthStatusLabel: string;
  healthStatus: "on_track" | "at_risk" | "off_track";
  movements: FinancePdfMovementBar[];
  expenses: CategoryExpense[];
  insights: string[];
};

export type FinancePdfFile = {
  buffer: Buffer;
  filename: string;
  mimeType: "application/pdf";
};

export type FinancePdfDownload = {
  base64: string;
  filename: string;
  mimeType: "application/pdf";
};

const colors = {
  ink: "#1A1A1A",
  muted: "#6B7280",
  soft: "#9CA3AF",
  line: "#E8E4DE",
  surface: "#FAFAF8",
  white: "#FFFFFF",
  orange: brand.orange,
  orangeMid: brand.orangeMid,
  orangeDeep: brand.orangeDeep,
  amber: brand.amber,
  gold: brand.gold,
  highlight: brand.highlight,
  danger: "#FF5E4A",
  success: "#2F9E6A",
  warning: "#D97706",
} as const;

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.ink,
    backgroundColor: colors.white,
    paddingTop: 40,
    paddingBottom: 56,
    paddingHorizontal: 44,
  },
  coverPage: {
    fontFamily: "Helvetica",
    backgroundColor: colors.white,
    paddingTop: 0,
    paddingBottom: 80,
    paddingHorizontal: 0,
  },
  coverAccent: {
    height: 8,
    backgroundColor: colors.orange,
  },
  coverBody: {
    paddingHorizontal: 48,
    paddingTop: 52,
    paddingBottom: 24,
  },
  coverFooter: {
    position: "absolute",
    left: 48,
    right: 48,
    bottom: 28,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  brandMark: {
    width: 48,
    height: 48,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: colors.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  brandMarkText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },
  brandTextCol: {
    flexDirection: "column",
    justifyContent: "center",
  },
  brandWordmark: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  brandWordmarkScript: {
    fontFamily: "Pacifico",
    fontSize: 28,
    color: colors.orange,
    letterSpacing: 0.2,
  },
  brandWordmarkSans: {
    fontFamily: "GeistSans",
    fontSize: 22,
    fontWeight: 800,
    color: colors.ink,
    letterSpacing: -0.8,
  },
  brandTag: {
    marginTop: 4,
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 0.2,
  },
  coverTitleBlock: {
    marginTop: 48,
  },
  coverEyebrow: {
    fontSize: 10,
    color: colors.orange,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  coverTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: colors.ink,
    lineHeight: 1.25,
    maxWidth: 420,
  },
  coverSubtitle: {
    marginTop: 12,
    fontSize: 11,
    color: colors.muted,
    lineHeight: 1.5,
    maxWidth: 380,
  },
  periodChip: {
    marginTop: 22,
    alignSelf: "flex-start",
    backgroundColor: colors.highlight,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  periodChipText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.ink,
  },
  kpiRow: {
    flexDirection: "row",
    marginTop: 40,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: 14,
    marginRight: 12,
  },
  kpiCardLast: {
    marginRight: 0,
  },
  kpiCardAccent: {
    borderColor: colors.orangeMid,
    backgroundColor: "#FFF8F2",
  },
  kpiLabel: {
    fontSize: 8,
    color: colors.muted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: colors.ink,
  },
  kpiValuePositive: {
    color: colors.success,
  },
  kpiValueNegative: {
    color: colors.danger,
  },
  coverFooterText: {
    fontSize: 8,
    color: colors.soft,
    letterSpacing: 0.2,
  },
  coverFooterRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  coverFooterDivider: {
    width: 1,
    height: 10,
    backgroundColor: colors.line,
    marginHorizontal: 10,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: colors.ink,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 9,
    color: colors.muted,
  },
  panel: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 18,
    backgroundColor: colors.surface,
  },
  panelTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.ink,
    marginBottom: 0,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statusBadge: {
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  statusBadgeText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
  },
  chartBlock: {
    marginBottom: 12,
  },
  chartLabel: {
    fontSize: 8,
    color: colors.muted,
    marginBottom: 4,
  },
  chartTrack: {
    height: 7,
    backgroundColor: "#EEEBE6",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 4,
  },
  chartBarRevenue: {
    height: "100%",
    backgroundColor: colors.orange,
  },
  chartBarExpense: {
    height: "100%",
    backgroundColor: colors.orangeDeep,
  },
  chartMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  chartValue: {
    fontSize: 7,
    color: colors.soft,
  },
  legendRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 8,
    color: colors.muted,
  },
  expenseRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  expenseName: {
    width: 120,
    fontSize: 9,
    color: colors.ink,
  },
  expenseTrack: {
    flex: 1,
    height: 9,
    backgroundColor: "#EEEBE6",
    borderRadius: 999,
    overflow: "hidden",
  },
  expenseBar: {
    height: "100%",
    borderRadius: 999,
  },
  expenseValue: {
    width: 78,
    textAlign: "right",
    fontSize: 8,
    color: colors.muted,
    marginLeft: 10,
  },
  insightItem: {
    flexDirection: "row",
    marginBottom: 14,
  },
  insightBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.orange,
    marginTop: 4,
    marginRight: 10,
  },
  insightText: {
    flex: 1,
    fontSize: 10,
    color: colors.ink,
    lineHeight: 1.5,
  },
  pageFooter: {
    position: "absolute",
    left: 44,
    right: 44,
    bottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 10,
  },
  pageFooterText: {
    fontSize: 8,
    color: colors.soft,
  },
  emptyText: {
    fontSize: 9,
    color: colors.muted,
  },
});

function formatBrl(value: number): string {
  return `R$ ${formatBrlAmount(value)}`;
}

function resolveLogoBuffer(): Buffer | null {
  const logoPath = path.join(process.cwd(), "public", "vital-fit-logo.png");
  if (!fs.existsSync(logoPath)) return null;

  try {
    return fs.readFileSync(logoPath);
  } catch {
    return null;
  }
}

function healthBadgeColor(status: FinancePdfReportInput["healthStatus"]): string {
  if (status === "on_track") return colors.success;
  if (status === "at_risk") return colors.warning;
  return colors.danger;
}

function PageFooter() {
  return (
    <View style={styles.pageFooter} fixed>
      <Text style={styles.pageFooterText}>VitalFit Management · Relatório executivo</Text>
      <Text
        style={styles.pageFooterText}
        render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
      />
    </View>
  );
}

function BrandHeader({ logoBuffer }: { logoBuffer: Buffer | null }) {
  return (
    <View style={styles.brandRow}>
      {logoBuffer ? (
        <Image src={logoBuffer} style={styles.logo} />
      ) : (
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>VF</Text>
        </View>
      )}
      <View style={styles.brandTextCol}>
        <View style={styles.brandWordmark}>
          <Text style={styles.brandWordmarkScript}>Vital</Text>
          <Text style={styles.brandWordmarkSans}>Fit</Text>
        </View>
        <Text style={styles.brandTag}>Workspace</Text>
      </View>
    </View>
  );
}

function FinancePdfDocument({ data }: { data: FinancePdfReportInput }) {
  const logoBuffer = resolveLogoBuffer();
  const maxMovement = Math.max(
    1,
    ...data.movements.flatMap((item) => [item.receitas, item.despesas]),
  );
  const expenseItems = data.expenses.filter((item) => item.total > 0).slice(0, 8);
  const maxExpense = Math.max(1, ...expenseItems.map((item) => item.total));
  const movements = data.movements.slice(0, 10);

  return (
    <Document
      title="Relatório Executivo Financeiro — VitalFit"
      author="VitalFit Management"
      subject={`Período: ${data.periodLabel}`}
      language="pt-BR"
    >
      {/* Capa */}
      <Page size="A4" style={styles.coverPage} wrap={false}>
        <View style={styles.coverAccent} />
        <View style={styles.coverBody}>
          <BrandHeader logoBuffer={logoBuffer} />

          <View style={styles.coverTitleBlock}>
            <Text style={styles.coverEyebrow}>Relatório executivo</Text>
            <Text style={styles.coverTitle}>Resumo Financeiro Estratégico</Text>
            <Text style={styles.coverSubtitle}>
              Visão consolidada de receitas, despesas e saúde financeira para auxiliar no processo de tomada de decisões.
            </Text>
            <View style={styles.periodChip}>
              <Text style={styles.periodChipText}>
                Período de referência: {data.periodLabel} · {data.dateRangeLabel}
              </Text>
            </View>
          </View>

          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Receita bruta</Text>
              <Text style={styles.kpiValue}>{formatBrl(data.balance.receitas)}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Despesas</Text>
              <Text style={styles.kpiValue}>{formatBrl(data.balance.despesas)}</Text>
            </View>
            <View style={[styles.kpiCard, styles.kpiCardLast, styles.kpiCardAccent]}>
              <Text style={styles.kpiLabel}>Saldo líquido</Text>
              <Text
                style={[
                  styles.kpiValue,
                  data.balance.saldo >= 0
                    ? styles.kpiValuePositive
                    : styles.kpiValueNegative,
                ]}
              >
                {formatBrl(data.balance.saldo)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.coverFooter} fixed>
          <Text style={styles.coverFooterText}>Documento confidencial · Uso interno</Text>
          <View style={styles.coverFooterRight}>
            <Text style={styles.coverFooterText}>Gerado em {data.generatedAtLabel}</Text>
            <View style={styles.coverFooterDivider} />
            <Text
              style={styles.coverFooterText}
              render={({ pageNumber, totalPages }) =>
                `Página ${pageNumber} de ${totalPages}`
              }
            />
          </View>
        </View>
      </Page>

      {/* Dashboard: Saúde financeira + evolução */}
      <Page size="A4" style={styles.page} wrap={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Saúde Financeira</Text>
          <Text style={styles.sectionSubtitle}>
            Evolução de receitas e despesas no período selecionado
          </Text>
        </View>

        <View style={styles.panel}>
          <View style={styles.statusRow}>
            <Text style={styles.panelTitle}>Indicador do período</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: healthBadgeColor(data.healthStatus) },
              ]}
            >
              <Text style={styles.statusBadgeText}>{data.healthStatusLabel}</Text>
            </View>
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.orange }]} />
              <Text style={styles.legendText}>Receitas</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.orangeDeep }]} />
              <Text style={styles.legendText}>Despesas</Text>
            </View>
          </View>

          {movements.length === 0 ? (
            <Text style={styles.emptyText}>Sem movimentações no período.</Text>
          ) : (
            movements.map((item) => (
              <View key={item.label} style={styles.chartBlock}>
                <Text style={styles.chartLabel}>{item.label}</Text>
                <View style={styles.chartTrack}>
                  <View
                    style={[
                      styles.chartBarRevenue,
                      { width: `${(item.receitas / maxMovement) * 100}%` },
                    ]}
                  />
                </View>
                <View style={styles.chartTrack}>
                  <View
                    style={[
                      styles.chartBarExpense,
                      { width: `${(item.despesas / maxMovement) * 100}%` },
                    ]}
                  />
                </View>
                <View style={styles.chartMeta}>
                  <Text style={styles.chartValue}>Rec. {formatBrl(item.receitas)}</Text>
                  <Text style={styles.chartValue}>Desp. {formatBrl(item.despesas)}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <PageFooter />
      </Page>

      {/* Dashboard: Despesas por categoria */}
      <Page size="A4" style={styles.page} wrap={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Composição de Despesas</Text>
          <Text style={styles.sectionSubtitle}>
            Principais categorias de custo no período de referência
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={[styles.panelTitle, { marginBottom: 16 }]}>
            Distribuição por categoria
          </Text>
          {expenseItems.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma despesa categorizada no período.</Text>
          ) : (
            expenseItems.map((item) => (
              <View key={item.id} style={styles.expenseRow}>
                <Text style={styles.expenseName}>{item.name}</Text>
                <View style={styles.expenseTrack}>
                  <View
                    style={[
                      styles.expenseBar,
                      {
                        width: `${(item.total / maxExpense) * 100}%`,
                        backgroundColor: item.color || colors.amber,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.expenseValue}>{formatBrl(item.total)}</Text>
              </View>
            ))
          )}
        </View>

        <PageFooter />
      </Page>

      {/* Dashboard: Insights */}
      <Page size="A4" style={styles.page} wrap={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Insights do Período</Text>
          <Text style={styles.sectionSubtitle}>
            Síntese estratégica para apoio à decisão em reunião
          </Text>
        </View>

        <View style={styles.panel}>
          {data.insights.map((insight) => (
            <View key={insight} style={styles.insightItem}>
              <View style={styles.insightBullet} />
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))}
        </View>

        <PageFooter />
      </Page>
    </Document>
  );
}

function buildFilename(dateRangeLabel: string): string {
  const stamp = new Date().toISOString().slice(0, 10);
  const slug = dateRangeLabel
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 40);

  return `relatorio-financeiro-vitalfit-${slug || stamp}.pdf`;
}

/** Gera o PDF executivo financeiro e retorna o buffer para download. */
export async function generateFinancePdfReport(
  data: FinancePdfReportInput,
): Promise<FinancePdfFile> {
  const buffer = await renderToBuffer(<FinancePdfDocument data={data} />);

  return {
    buffer: Buffer.from(buffer),
    filename: buildFilename(data.dateRangeLabel),
    mimeType: "application/pdf",
  };
}
