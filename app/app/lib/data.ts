import { readFileSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), '..');

export interface ExperimentRun {
  run_id: string;
  model_size: string;
  dataset: string;
  dataset_tokens?: string;
  status: 'running' | 'queued' | 'complete' | 'stalled' | 'failed';
  gpu_hours: number;
  progress_pct: number;
  owner: string;
  started_at?: string;
  completed_at?: string;
  stalled_since?: string;
  failed_at?: string;
  queued_at?: string;
  estimated_completion?: string;
  gpus_allocated?: number;
  gpus_requested?: number;
  cost_usd?: number;
  priority?: string;
  stall_reason?: string;
  failure_reason?: string;
}

export interface BenchmarkScore {
  score: number;
  std_dev: number;
  samples: number;
}

export interface EvalResult {
  run_id: string;
  checkpoint: string;
  timestamp: string;
  benchmarks: {
    [key: string]: BenchmarkScore;
  };
  safety_evals: {
    toxicity_rate: number;
    bias_score: number;
    refusal_appropriateness: number;
  };
}

export interface RegressionComparison {
  run_id: string;
  vs_baseline: {
    [benchmark: string]: {
      delta: number;
      status: 'improvement' | 'warning' | 'regression' | 'critical_regression';
    };
  };
  overall_status: string;
  promotion_eligible: boolean;
  blocking_reasons?: string[];
  notes?: string;
}

export interface ClusterCapacity {
  cluster_name: string;
  total_gpus: number;
  gpu_type: string;
  allocated: number;
  available: number;
  utilization_pct: number;
  queue_depth: number;
  queue_latency_min: number;
  avg_wait_time_hours: number;
  daily_cost_usd: number;
  monthly_budget_usd: number;
  month_to_date_spend_usd: number;
  budget_utilization_pct: number;
  projected_month_end_spend_usd: number;
  budget_status: string;
  gpu_allocation_by_team: {
    [team: string]: number;
  };
  node_health: {
    healthy: number;
    degraded: number;
    offline: number;
  };
  last_updated: string;
}

export function getExperiments(): ExperimentRun[] {
  const data = readFileSync(join(DATA_DIR, 'experiments/run_registry.json'), 'utf-8');
  return JSON.parse(data);
}

export function getEvaluations(): EvalResult[] {
  const data = readFileSync(join(DATA_DIR, 'evals/benchmarks.json'), 'utf-8');
  return JSON.parse(data);
}

export function getRegressionTracker() {
  const data = readFileSync(join(DATA_DIR, 'evals/regression_tracker.json'), 'utf-8');
  return JSON.parse(data);
}

export function getClusterCapacity(): ClusterCapacity {
  const data = readFileSync(join(DATA_DIR, 'infra/cluster_capacity.json'), 'utf-8');
  return JSON.parse(data);
}

export function getBaselineEval(): EvalResult | null {
  const evals = getEvaluations();
  return evals.find(e => e.run_id === 'baseline-production') || null;
}
