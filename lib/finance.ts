export type Kind = "income" | "expense" | "asset" | "liability";
export type Frequency = "monthly" | "yearly" | "one_time";

export type LineItem = {
  id: string;
  profile_id: string;
  kind: Kind;
  label: string;
  amount: number;
  frequency: Frequency;
};

export type Metrics = {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlySurplus: number;
  savingsRate: number;
  assets: number;
  liabilities: number;
};

export type Recommendation = {
  title: string;
  detail: string;
  priority: "critical" | "high" | "medium" | "low";
};

const monthly = (item: LineItem) =>
  item.frequency === "yearly" ? item.amount / 12 : item.amount;

export function calculateMetrics(items: LineItem[]): Metrics {
  const total = (kind: Kind, recurring = false) =>
    items
      .filter((item) => item.kind === kind)
      .reduce((sum, item) => sum + (recurring ? monthly(item) : item.amount), 0);
  const monthlyIncome = total("income", true);
  const monthlyExpense = total("expense", true);
  const assets = total("asset");
  const liabilities = total("liability");
  const monthlySurplus = monthlyIncome - monthlyExpense;
  return {
    netWorth: assets - liabilities,
    monthlyIncome,
    monthlyExpense,
    monthlySurplus,
    savingsRate: monthlyIncome ? (monthlySurplus / monthlyIncome) * 100 : 0,
    assets,
    liabilities,
  };
}

export function buildRecommendations(metrics: Metrics): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const debtRatio = metrics.assets ? metrics.liabilities / metrics.assets : metrics.liabilities ? 1 : 0;
  const emergencyMonths = metrics.monthlyExpense ? metrics.assets / metrics.monthlyExpense : 0;

  if (metrics.savingsRate < 5) {
    recommendations.push({
      title: "Create breathing room this month",
      detail: `Your monthly surplus is ${formatUSD(metrics.monthlySurplus)}. Review your three largest expenses and aim to free at least 10% of income.`,
      priority: "critical",
    });
  } else if (metrics.savingsRate < 20) {
    recommendations.push({
      title: "Lift your savings rate toward 20%",
      detail: `You currently save ${metrics.savingsRate.toFixed(1)}% of income. Automate a small increase after payday and raise it gradually.`,
      priority: "medium",
    });
  } else {
    recommendations.push({
      title: "Put your healthy surplus to work",
      detail: `Your ${metrics.savingsRate.toFixed(1)}% savings rate is strong. Automate goal contributions before discretionary spending.`,
      priority: "low",
    });
  }
  if (debtRatio > 0.6) {
    recommendations.push({
      title: "Prioritise high-cost debt",
      detail: `Liabilities are ${(debtRatio * 100).toFixed(0)}% of your assets. Direct extra surplus to the highest-interest balance first.`,
      priority: "high",
    });
  } else if (metrics.liabilities > 0) {
    recommendations.push({
      title: "Use a clear debt payoff order",
      detail: `List rates for your ${formatUSD(metrics.liabilities)} of liabilities and overpay the costliest debt while maintaining minimums.`,
      priority: "medium",
    });
  }
  if (emergencyMonths < 3) {
    recommendations.push({
      title: "Build a three-month safety buffer",
      detail: `Your assets cover about ${emergencyMonths.toFixed(1)} months of expenses. Keep the first three months in accessible savings.`,
      priority: "medium",
    });
  } else {
    recommendations.push({
      title: "Protect your emergency reserve",
      detail: `You have roughly ${emergencyMonths.toFixed(1)} months of expenses in assets. Keep at least six months liquid before investing the rest.`,
      priority: "low",
    });
  }
  recommendations.push({
    title: "Review this blueprint quarterly",
    detail: "Update income, balances and expenses every three months so your next action stays grounded in current numbers.",
    priority: "low",
  });
  const rank = { critical: 0, high: 1, medium: 2, low: 3 };
  return recommendations.sort((a, b) => rank[a.priority] - rank[b.priority]).slice(0, 5);
}

export function formatUSD(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
