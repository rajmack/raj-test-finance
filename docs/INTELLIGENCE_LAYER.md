# Intelligence Layer

## Messy Inputs
Users type free-text labels: "sallery", "emi for car", "FD in bank". We store the raw label and optionally normalise it.

## Auto-Structure (JSON example)
```json
{
  "kind": "income",
  "label": "sallery",
  "normalised_label": "Salary",
  "amount": 75000,
  "frequency": "monthly"
}
```

## Events to Track
- `profile_created` — new snapshot started.
- `line_item_added` / `line_item_removed` — each edit.
- `report_requested` — generate button clicked.
- `report_paid` — checkout completed.
- `report_viewed` — full report opened.

## Scoring Rules (rule-based, v1)
| Metric | Formula | Score |
|---|---|---|
| Savings rate | surplus / income × 100 | ≥20% = good; 10–20% = fair; <10% = poor |
| Debt-to-asset | liabilities / assets | <30% = good; 30–60% = fair; >60% = poor |
| Emergency fund | liquid assets / monthly expense (months) | ≥6 = good; 3–6 = fair; <3 = poor |

## What Gets Ranked
Recommendations are sorted by priority: **critical** (savings rate <5%), **high** (debt-to-asset >60%), **medium** (emergency fund <3 months), **low** (optimisation tips).

## v1 vs Later
- **v1:** Rule-based recommendations + AI summary paragraph (fallback to template). No label normalisation AI.
- **Later:** Auto-categorise free-text labels, trend analysis across multiple snapshots, goal-feasibility projections.
