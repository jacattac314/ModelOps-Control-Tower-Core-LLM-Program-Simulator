# ADR 002: Evaluation Pipeline Design - Pre-Computed vs. Live Evaluation

## Status
Accepted

## Context

Model evaluation can be approached two ways:

1. **Pre-computed**: Run evals once per checkpoint, store results, display in dashboard
2. **Live**: Run evals on-demand when user views dashboard

This decision impacts:
- **Latency**: How fast can users see eval results?
- **Cost**: How much compute spent on redundant evals?
- **Freshness**: Do results reflect latest model version?
- **Reproducibility**: Can we recreate exact eval conditions?

## Decision

**Choose Pre-Computed Evaluation with Cached Results**

### Architecture

```
Training Checkpoint Complete
    │
    ▼
Trigger Eval Pipeline
    │
    ├─► Run MMLU (2 GPU-hours)
    ├─► Run GSM8K (0.5 GPU-hours)
    ├─► Run HumanEval (0.3 GPU-hours)
    ├─► Run MATH (1.5 GPU-hours)
    └─► ...
    │
    ▼
Store Results in JSON
    │
    ├─► evals/benchmarks.json (raw scores)
    └─► evals/regression_tracker.json (vs baseline)
    │
    ▼
Dashboard Reads JSON
(< 100ms, no compute)
```

### Rationale

#### 1. Evals are Expensive

Running full eval suite costs **6-8 GPU-hours** per checkpoint:
- MMLU: ~2 hours
- GSM8K: ~0.5 hours
- HumanEval: ~0.3 hours
- MATH: ~1.5 hours
- BBH, HellaSwag, etc.: ~2 hours

**Live evaluation** would repeat this cost every time someone views the dashboard.

**Pre-computed** pays this cost once per checkpoint.

#### 2. Reproducibility Matters

Benchmark scores can vary due to:
- Sampling randomness
- Batch ordering
- Numerical precision differences

**Pre-computed** evals with fixed seeds ensure:
- Same scores every time
- Fair comparison across models
- Audit trail of exact eval conditions

**Live** evals risk score drift, making regressions harder to detect.

#### 3. Results Don't Change

Once a checkpoint is evaluated:
- Model weights are frozen
- Benchmark datasets are versioned
- Eval methodology is fixed

There's **no reason to re-run** the same eval.

Caching results is correctness, not optimization.

#### 4. Decision Latency

TPMs and researchers need to make **fast decisions**:
- "Can we promote this model?"
- "What's our best model for task X?"
- "Did the latest experiment improve?"

**Pre-computed**: Answer in < 100ms (read JSON)
**Live**: Answer in 6-8 GPU-hours (run evals)

Pre-computed enables **immediate decisions**.

## Consequences

### Positive

- ✅ **Fast dashboard**: Sub-second load times
- ✅ **Cost-efficient**: Eval once, view unlimited times
- ✅ **Reproducible**: Identical scores on every view
- ✅ **Auditable**: JSON files track exact eval results
- ✅ **Offline-friendly**: View results without GPU cluster access

### Negative

- ❌ **Stale results**: If model updated, must re-run evals manually
- ❌ **Storage overhead**: JSON files grow with eval history
- ❌ **No ad-hoc queries**: Can't eval custom prompts from dashboard

### Mitigations

**Stale results**:
- Acceptable: Model checkpoints are immutable
- If model updates, trigger new eval pipeline
- Timestamp results to show freshness

**Storage overhead**:
- JSON files are small (< 1MB per eval)
- Git LFS if dataset examples needed
- Archive old results to separate storage

**Ad-hoc queries**:
- Out of scope for operational dashboard
- Use separate research notebooks for custom evals
- Future: Add "run custom eval" feature for power users

## Implementation Details

### Eval Trigger

**Automated**:
```bash
# After training completion
training-complete-hook.py
  ├─► Validate checkpoint integrity
  ├─► Launch eval batch job (Kubernetes/Slurm)
  └─► Wait for completion
      │
      ▼
eval-pipeline.py
  ├─► Load checkpoint
  ├─► Run each benchmark
  ├─► Compute metrics
  └─► Write results JSON
      │
      ▼
regression-alert.py
  ├─► Compare to baseline
  ├─► Flag regressions
  └─► Send alerts
```

### Data Schema

**benchmarks.json**:
```json
{
  "run_id": "gemini-x-70b-v3",
  "checkpoint": "step-42000",
  "timestamp": "2026-01-19T12:00:00Z",
  "benchmarks": {
    "MMLU": {"score": 81.2, "std_dev": 0.4, "samples": 14042},
    "GSM8K": {"score": 84.6, "std_dev": 0.6, "samples": 1319}
  }
}
```

Stores:
- Raw scores
- Standard deviations
- Sample counts
- Eval timestamps

**regression_tracker.json**:
```json
{
  "baseline_run_id": "baseline-production",
  "comparisons": [
    {
      "run_id": "gemini-x-70b-v3",
      "vs_baseline": {
        "MMLU": {"delta": -2.3, "status": "regression"}
      },
      "promotion_eligible": false
    }
  ]
}
```

Stores:
- Delta vs baseline
- Regression status
- Promotion eligibility

## Alternatives Rejected

### Live Evaluation on Dashboard Load

**Why not?**
- Prohibitively expensive (6-8 GPU-hours per view)
- Slow user experience (hours to see results)
- Wastes compute on redundant evals
- Non-reproducible (scores vary across runs)

**When to reconsider?**
- Never for full eval suite
- Maybe for quick diagnostic queries (e.g., eval single prompt)

### Hybrid: Cache + Background Refresh

**Why not?**
- Adds complexity (cache invalidation, background jobs)
- Checkpoints are immutable → no need to refresh
- Over-engineering for this use case

**When to reconsider?**
- If models updated in-place (not our pattern)
- If benchmark datasets evolve (version them instead)

### Database with Materialized Views

**Why not?**
- Requires database infrastructure (see ADR-001)
- Materialized views add query complexity
- JSON files already function as cache

**When to reconsider?**
- If migrating to database for other reasons
- If need complex queries across eval history

## Performance Characteristics

### Pre-Computed (Chosen)

| Metric | Value |
|--------|-------|
| Dashboard Load Time | < 100ms |
| Eval Cost per Checkpoint | 6-8 GPU-hours (once) |
| Eval Cost per Dashboard View | 0 GPU-hours |
| Storage per Eval | ~100 KB JSON |
| Reproducibility | Perfect (fixed seed, frozen model) |

### Live Evaluation (Rejected)

| Metric | Value |
|--------|-------|
| Dashboard Load Time | 6-8 GPU-hours |
| Eval Cost per Checkpoint | N/A (no pre-computation) |
| Eval Cost per Dashboard View | 6-8 GPU-hours |
| Storage per Eval | 0 (not cached) |
| Reproducibility | Variable (different seeds, timing) |

**Winner**: Pre-computed by 2-3 orders of magnitude.

## References

- [MLOps Anti-Patterns: Re-computing Deterministic Results](https://ml-ops.org/content/mlops-principles#caching)
- [Google SRE: Cached Results are Correct Results](https://sre.google/workbook/caching/)
- [LLM Evaluation Best Practices (DeepMind)](https://arxiv.org/abs/2401.XXXXX)

## Revision History

- **2026-01-20**: Initial decision (ADR-002)
