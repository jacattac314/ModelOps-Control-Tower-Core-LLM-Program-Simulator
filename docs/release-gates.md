# Release Gates

## Purpose

Release gates are **not bureaucracy** — they are **risk management**.

Deploying a frontier LLM to production affects millions of users. A quality regression can damage trust. A safety failure can cause real harm. Infrastructure under-provisioning can lead to outages.

Gates ensure we ship with confidence, not hope.

---

## Gate Framework

Each gate has:
1. **Owner**: Who approves this gate
2. **Criteria**: What must be true to pass
3. **Evidence**: What artifacts demonstrate compliance
4. **Bypass**: Under what conditions can we waive this gate (if ever)

---

## Gate 1: Evaluation Thresholds

### Owner
Research/Eval Team Lead

### Criteria

**Must Pass**:
- No critical regression (> 2.0 pts) on any core benchmark
- Overall trend: mean delta across benchmarks ≥ 0
- Statistical significance: confidence intervals confirm non-regression

**May Pass with Justification**:
- Regressions < 2.0 pts if safety/efficiency gains justify tradeoff
- Expected regressions for specialized variants (safety, efficiency)

### Evidence

- Eval results dashboard showing all benchmarks
- Regression analysis report with baseline comparison
- Statistical significance tests

### Automation

Regression alert agent automatically flags violations.

### Bypass Conditions

**Never bypass** for production deployment.

**May bypass for staging** with:
- VP Engineering approval
- Explicit A/B test plan to validate in production
- Documented rollback trigger

---

## Gate 2: Safety Review

### Owner
Safety & Alignment Team Lead

### Criteria

**Must Pass**:
- Toxicity rate < 0.015 (1.5%)
- Bias score < 0.30
- Refusal appropriateness > 0.90
- No catastrophic failures in red-team testing
- Safety team sign-off on model card

**Additional for High-Risk Models**:
- External audit (for models > 100B parameters)
- Staged rollout with enhanced monitoring

### Evidence

- Safety eval results
- Red-team test report
- Model card with safety section complete
- Sign-off email from Safety team lead

### Automation

Safety metrics checked automatically in promotion script.

### Bypass Conditions

**Never bypass** for any deployment.

Safety is non-negotiable.

---

## Gate 3: Infrastructure Scaling

### Owner
Infrastructure/SRE Lead

### Criteria

**Must Pass**:
- Serving infrastructure validated at target QPS
- Auto-scaling tested and configured
- Latency SLOs met at peak load
- Cost per query within budget targets
- GPU/CPU capacity reserved for rollout

**Load Testing**:
- Sustained load test at 2x expected peak traffic
- Spike test at 5x expected traffic
- Chaos engineering: random pod failures during load

### Evidence

- Load test results showing latency p50, p95, p99
- Auto-scaling logs demonstrating scale-up/scale-down
- Capacity reservation confirmation
- Cost projection based on traffic estimates

### Automation

Infrastructure readiness checked in promotion script.

### Bypass Conditions

**May bypass for canary** (< 1% traffic) with:
- SRE on-call standing by
- Manual scale-up plan documented
- Auto-rollback on SLO violation

---

## Gate 4: Monitoring & Alerting

### Owner
TPM or SRE Lead

### Criteria

**Must Pass**:
- Dashboards created for:
  - Request rate, latency, error rate
  - Model quality metrics (sampled evals)
  - Cost and resource utilization
- Alerts configured for:
  - Latency p99 > SLO
  - Error rate > 1%
  - Quality degradation (eval drop > 3 pts)
- On-call rotation assigned
- Runbooks documented

**Monitoring Checklist**:
- [ ] Request rate by endpoint
- [ ] Latency distribution (p50, p95, p99)
- [ ] Error rate and error types
- [ ] Model version distribution
- [ ] Sample eval scores (hourly during canary)
- [ ] Cost per query
- [ ] GPU/CPU utilization

### Evidence

- Screenshots of dashboards
- Alert configuration export
- On-call schedule
- Runbook links

### Automation

Monitoring plan template with required dashboards/alerts.

### Bypass Conditions

**Never bypass** for production.

**May reduce scope for internal staging** with TPM approval.

---

## Gate 5: Rollback Plan

### Owner
Engineering Lead

### Criteria

**Must Pass**:
- Previous model version available and tested
- Automated rollback trigger defined (e.g., error rate > 2%)
- Rollback tested in staging environment
- Rollback time < 5 minutes
- Communication plan for rollback scenario

**Rollback Trigger Examples**:
- Error rate > 2% sustained for 10 minutes
- Latency p99 > 2x SLO for 10 minutes
- Quality eval drop > 3 pts
- Manual trigger by on-call

### Evidence

- Rollback procedure documented in runbook
- Staging rollback test results
- Rollback trigger configuration
- Communication template

### Automation

Auto-rollback configured based on SLO violations.

### Bypass Conditions

**Never bypass** for production.

Rollbacks are table stakes.

---

## Gate 6: Documentation

### Owner
TPM or Product Manager

### Criteria

**Must Pass**:
- **Model Card** complete with:
  - Model architecture and size
  - Training data description
  - Eval results
  - Known limitations
  - Safety considerations
  - Intended use and out-of-scope uses
- **API Documentation** updated
- **Release Notes** drafted
- **Internal FAQ** for support team

**Model Card Template**:
See: https://arxiv.org/abs/1810.03993

### Evidence

- Model card published to internal docs
- API docs PR merged
- Release notes approved by Product
- Support FAQ shared with team

### Automation

Documentation checklist in promotion script.

### Bypass Conditions

**May defer for staging** with plan to complete before production.

**Never bypass documentation** for production deployment.

---

## Gate Workflow

### Staging Deployment

```
┌─────────────────┐
│ Eval Thresholds │ ✅ REQUIRED
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Safety Review   │ ✅ REQUIRED
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Infra Scaling   │ ⚠️  REDUCED (1% traffic)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Monitoring Plan │ ✅ REQUIRED
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Rollback Plan   │ ✅ REQUIRED
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Documentation   │ ⚠️  IN PROGRESS OK
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │APPROVED│
    │ Deploy │
    │Staging │
    └────────┘
```

### Production Deployment

```
All Gates ✅ REQUIRED

Staging deployment stable for 48h ✅

A/B test (if applicable) shows improvement ✅

VP Engineering approval ✅
    │
    ▼
┌────────┐
│APPROVED│
│ Canary │
│  1%    │
└───┬────┘
    │
    │ Monitor 24h
    ▼
┌────────┐
│  10%   │
└───┬────┘
    │
    │ Monitor 24h
    ▼
┌────────┐
│  50%   │
└───┬────┘
    │
    │ Monitor 48h
    ▼
┌────────┐
│  100%  │
└────────┘
```

---

## Gate Metrics

### Gate Pass Rate
- **Target**: > 80% of models pass all gates on first review
- **Tracks**: Program quality and preparedness

### Time in Review
- **Target**: < 3 days from eval completion to gate decision
- **Tracks**: Review velocity

### Gate Bypasses
- **Target**: 0 bypasses per quarter
- **Tracks**: Process adherence

### Regressions Escaped
- **Target**: < 5% of deployments have production regressions
- **Tracks**: Gate effectiveness

---

## Special Scenarios

### Emergency Hotfix

**Scenario**: Critical production bug requires immediate model update

**Process**:
1. Incident declared by on-call
2. Hotfix model prepared and tested
3. **Abbreviated gates**:
   - Safety review: REQUIRED
   - Eval thresholds: DEFERRED (run in parallel)
   - Monitoring: USE EXISTING
   - Rollback: REQUIRED
4. VP approval for expedited deployment
5. Full gate review within 24h post-deployment

**Rationale**: Speed over perfect process, but safety never compromised.

---

### Research Preview

**Scenario**: Experimental model for limited beta testing

**Process**:
- All gates apply
- Deployment to isolated environment
- Explicit user consent for experimental model
- Enhanced monitoring
- Fast rollback at first sign of issues

**Rationale**: Beta users accept higher risk, but we maintain quality bar.

---

## Continuous Improvement

Gates should evolve based on:

1. **Incident retrospectives**: What gate would have caught this?
2. **False positive rate**: Are gates too strict, blocking good models?
3. **Escape rate**: Are gates too loose, letting regressions through?
4. **Industry best practices**: What are peers doing?

**Quarterly review**: Gate criteria and thresholds.

---

## Conclusion

Release gates are the difference between shipping fast and shipping recklessly.

They ensure:
- **Quality**: Eval thresholds prevent regressions
- **Safety**: Review process catches harmful outputs
- **Reliability**: Infra validation prevents outages
- **Observability**: Monitoring enables fast iteration
- **Recoverability**: Rollback plans limit blast radius
- **Transparency**: Documentation enables informed use

Strong gates enable velocity, not hinder it.

Because confident teams ship faster than anxious ones.
