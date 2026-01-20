# Demo Script for Interviews

This document provides a structured walkthrough for demonstrating the ModelOps Control Tower in technical interviews.

---

## Context Setting (1 minute)

> **"Let me show you how I think about program management for frontier LLM development."**

**Opening**:
"This is ModelOps Control Tower — a platform I built to demonstrate how TPMs can accelerate research velocity in model development. It consolidates what's typically scattered across spreadsheets, notebooks, and Slack into one operational view."

**Why it matters**:
"Training a single 100B+ model costs hundreds of thousands of dollars. A stalled experiment wastes weeks and GPU-hours. A quality regression impacts millions of users. This platform demonstrates how to manage those risks while maintaining research velocity."

---

## Dashboard Walkthrough (3-4 minutes)

### Tab 1: Experiments

**Navigate to**: Experiments tab

**Point out**:
1. **Summary metrics** at top (running, queued, stalled, GPU allocation)
2. **Alert banner** for stalled experiments
3. **Experiments table** with status, progress, cost, owner

**Highlight**:
> "See this stalled experiment? It's been stuck for 8 hours due to a data pipeline issue. In a real program, this would be burning $5K/hour in GPU costs. The system detects this automatically and flags it for immediate attention."

**Key point**:
"TPMs need visibility into bottlenecks before they become crises."

---

### Tab 2: Evaluations

**Navigate to**: Evaluations tab

**Point out**:
1. **Regression summary** (promotion eligible vs. blocked)
2. **Regression analysis** with delta scores vs. baseline
3. **Absolute scores table** with standard deviations

**Highlight**:
> "This model shows a -2.3 point regression on MMLU, which exceeds our 2-point threshold. The system automatically blocks promotion until the regression is resolved. No manual review needed — the gate is data-driven."

**Show specific model**:
"Contrast that with this safety variant. It has some capability regressions, but TruthfulQA improved by 4.4 points. The system flags it as 'conditional pass' because the tradeoffs make sense for a safety-tuned model."

**Key point**:
"Automated regression detection prevents quality escapes while maintaining velocity."

---

### Tab 3: Infrastructure

**Navigate to**: Infrastructure tab

**Point out**:
1. **Capacity warning** (88.9% GPU utilization)
2. **Budget tracking** (projected overspend)
3. **GPU allocation by team**
4. **Queue metrics** (latency, wait time)

**Highlight**:
> "We're at 88.9% GPU utilization and projected to exceed monthly budget by $220K. This visibility enables proactive capacity planning. I can see exactly which teams are consuming resources and make informed prioritization decisions."

**Key point**:
"TPMs manage constraints, not just schedules. Infrastructure capacity is a constraint."

---

### Tab 4: Launch Gates

**Navigate to**: Launch Gates tab

**Point out**:
1. **Launch candidates** with traffic light status
2. **Individual gates** (evals, safety, infra, monitoring, rollback, docs)
3. **Blocking reasons** for failed gates
4. **Promotion recommendations**

**Highlight**:
> "This model passed all gates and is ready for staging. But this one is blocked because of eval regressions and missing documentation. The gates are automated but the recommendations are human-readable."

**Show decision log**:
"Every promotion decision is logged and auditable. No 'I think we're ready' vibes — just data and clear criteria."

**Key point**:
"Launch governance isn't bureaucracy. It's risk management that enables confident deployment."

---

## Automation Demo (2-3 minutes)

### Stall Detection Agent

**Run**:
```bash
python3 agents/stall-detector.py
```

**Point out**:
- Automatically detects stalled experiments
- Calculates stall duration and cost impact
- Provides actionable recommendations

**Explain**:
> "This agent runs on a schedule — hourly during active training, for example. It alerts via Slack or PagerDuty when experiments stall. The recommendations are context-aware: data pipeline issues get different actions than OOM errors."

---

### Regression Alert Agent

**Run**:
```bash
python3 agents/regression-alert.py
```

**Point out**:
- Compares all models against baseline
- Flags critical regressions
- Lists blocked models with reasons

**Explain**:
> "This runs automatically after every eval completion. It blocks promotions before a human even reviews the results. TPMs shouldn't waste time reviewing models that obviously fail the bar."

---

### Promotion Gatekeeper

**Run**:
```bash
python3 scripts/promote-model.py gemini-ultra-175b-v1 staging
```

**Point out**:
- Evaluates all six launch gates
- Clear pass/fail for each gate
- Actionable recommendations
- Decision logged with timestamp

**Explain**:
> "This script enforces governance automatically. Engineers can't bypass gates without explicit approval. Every promotion attempt is logged for audit. This is the difference between 'move fast and break things' and 'move fast with safety rails.'"

---

## Documentation Deep Dive (2 minutes)

**Show**:
1. **Vision doc** — Why this platform matters
2. **Training Strategy** — How programs are managed
3. **Evaluation Framework** — Methodology and thresholds
4. **Release Gates** — Launch criteria
5. **ADRs** — Technical decision rationale

**Highlight**:
> "TPMs aren't just ticket trackers. We're strategic partners who understand the why behind processes."

**Pick one ADR** (e.g., ADR-001 on system architecture):
> "Here's an example of technical decision-making. I chose JSON files over a database for this prototype. The ADR explains the tradeoffs: faster development and transparency vs. scale limitations. Real TPM work involves making these calls and documenting the rationale."

---

## Technical Discussion Points (Flex)

Be prepared to discuss:

### On LLM Training
- **Scaling laws**: Why 70B vs. 175B models
- **Checkpoint strategies**: How often to save, how to resume
- **Data quality**: Deduplication, filtering, versioning
- **Failure modes**: OOM, gradient explosions, data corruption

### On Evaluation
- **Benchmark selection**: Why MMLU, GSM8K, HumanEval
- **Statistical significance**: Confidence intervals, multiple comparisons
- **Regression thresholds**: How to set them, when to adjust
- **Safety evals**: Toxicity, bias, truthfulness

### On Infrastructure
- **GPU scheduling**: Priority vs. fairness
- **Budget management**: Burn rate, forecasting, cost optimization
- **Capacity planning**: Queue theory, utilization targets
- **Fault tolerance**: Checkpoint recovery, spot instances

### On Program Management
- **Prioritization frameworks**: P0/P1/P2, cost/benefit
- **Stakeholder alignment**: Research, engineering, product, safety
- **Risk management**: What can go wrong, mitigations
- **Velocity vs. quality**: When to move fast, when to slow down

---

## Closing (1 minute)

**Summary**:
> "This project demonstrates how I think about TPM work in frontier AI: visibility into program state, automation to reduce toil, governance to manage risk, and documentation to drive alignment."

**Why DeepMind**:
> "DeepMind is building the most advanced models in the world. That requires world-class operations to match. I want to help Core Modeling teams ship faster while maintaining rigor."

**Call to action**:
> "I'd love to discuss how these patterns could apply to DeepMind's model development workflows."

---

## Anticipated Questions

### Q: "Why not use existing tools like Weights & Biases or MLflow?"

**A**: "Those are great tools for individual researchers. But program management requires a different view — consolidating experiments, evals, infra, and launch governance. This platform shows what that unified view looks like. In practice, you'd integrate with W&B/MLflow for detailed experiment tracking and build this layer on top for program oversight."

---

### Q: "How would this scale to 100+ models per quarter?"

**A**: "The JSON file approach is a prototype optimized for demonstration. At scale, you'd migrate to a database (Postgres, BigQuery), add caching layers, and build an API. But the operational patterns — stall detection, regression alerts, launch gates — remain the same. The investment in workflow design transfers even when the tech stack evolves."

---

### Q: "How do you handle researcher pushback on gates?"

**A**: "Gates should be built with researchers, not imposed on them. The key is: gates automate things researchers already care about (don't ship regressions) while being transparent about criteria. If a gate blocks incorrectly, that's a bug in the gate, not researcher non-compliance. Regular retrospectives on gate effectiveness keep the balance right."

---

### Q: "What's missing from this system?"

**A**: "Lots! This is a v1 focused on core workflows. Missing:
- Real-time updates (dashboards are static snapshots)
- Predictive analytics (forecasting experiment success)
- Resource optimization (auto-scheduling)
- Integration ecosystem (Slack, PagerDuty, W&B)
- Experiment reproducibility tracking
- Multi-modal model support (vision, audio)

But those are natural next steps — the foundation is here."

---

### Q: "How much time did this take to build?"

**A**: "The initial version took about a weekend — one day for the dashboard, one day for agents and docs. But the thinking behind it — the operational patterns, the gate criteria, the evaluation methodology — that comes from understanding how frontier AI teams actually work."

---

## Pro Tips for the Demo

1. **Keep it concrete**: Don't just describe — show the actual data, run the actual scripts.

2. **Tell stories**: "See this stalled experiment? In a real program, this costs $X/hour..."

3. **Demonstrate depth**: Pick one area (evals, infra, gates) and go deep if the interviewer shows interest.

4. **Show tradeoffs**: ADRs demonstrate you think about pros/cons, not just "this is the right way."

5. **Connect to DeepMind**: Reference Gemini, AlphaFold, Chinchilla when discussing scale and rigor.

6. **Be humble**: "This is a prototype demonstrating patterns, not a production system."

7. **Show velocity**: "I shipped this in a weekend because I optimized for clarity over scale."

---

## Success Metrics

You've nailed the demo if the interviewer:

1. Asks detailed questions about your design choices
2. Discusses how this would apply to their workflows
3. Engages with the docs, not just the dashboard
4. Recognizes patterns from their own challenges
5. Says something like "We could actually use this"

Remember: The goal isn't to impress with the tech stack.

It's to demonstrate **operational thinking** that accelerates frontier AI research.
