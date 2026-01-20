// Mock regression data
const regressionData = {
  baseline_run_id: "baseline-production",
  comparisons: [
    {
      run_id: "gemini-ultra-175b-v1",
      vs_baseline: {
        MMLU: { delta: 2.9, status: "improvement" as const },
        GSM8K: { delta: 3.1, status: "improvement" as const },
        HumanEval: { delta: 4.5, status: "improvement" as const },
        MATH: { delta: 3.7, status: "improvement" as const },
        HellaSwag: { delta: 1.6, status: "improvement" as const },
        TruthfulQA: { delta: 2.1, status: "improvement" as const },
        BBH: { delta: 2.8, status: "improvement" as const }
      },
      overall_status: "pass",
      promotion_eligible: true
    },
    {
      run_id: "gemini-x-70b-v3",
      vs_baseline: {
        MMLU: { delta: -2.3, status: "regression" as const },
        GSM8K: { delta: -1.5, status: "warning" as const },
        HumanEval: { delta: -2.9, status: "regression" as const },
        MATH: { delta: -2.9, status: "regression" as const },
        HellaSwag: { delta: -1.6, status: "warning" as const },
        TruthfulQA: { delta: -1.4, status: "warning" as const },
        BBH: { delta: -1.6, status: "warning" as const }
      },
      overall_status: "blocked",
      promotion_eligible: false,
      blocking_reasons: ["MMLU regression > 2.0pts", "MATH regression > 2.0pts"]
    },
    {
      run_id: "gemini-x-70b-safety-v2",
      vs_baseline: {
        MMLU: { delta: -2.7, status: "regression" as const },
        GSM8K: { delta: -2.2, status: "regression" as const },
        HumanEval: { delta: -4.1, status: "regression" as const },
        MATH: { delta: -3.7, status: "regression" as const },
        HellaSwag: { delta: -1.9, status: "warning" as const },
        TruthfulQA: { delta: 4.4, status: "improvement" as const },
        BBH: { delta: -2.5, status: "regression" as const }
      },
      overall_status: "conditional_pass",
      promotion_eligible: true,
      notes: "Regressions expected for safety-tuned variant. TruthfulQA improvement significant. Safety metrics improved."
    }
  ]
};

const benchmarkScores = [
  {
    run_id: "baseline-production",
    checkpoint: "production-v2.1",
    benchmarks: {
      MMLU: { score: 83.5, std_dev: 0.3 },
      GSM8K: { score: 86.1, std_dev: 0.5 },
      HumanEval: { score: 74.2, std_dev: 0.8 },
      MATH: { score: 48.6, std_dev: 1.2 },
      HellaSwag: { score: 93.7, std_dev: 0.2 },
      TruthfulQA: { score: 66.8, std_dev: 0.7 },
      BBH: { score: 78.4, std_dev: 0.4 }
    }
  },
  {
    run_id: "gemini-ultra-175b-v1",
    checkpoint: "final",
    benchmarks: {
      MMLU: { score: 86.4, std_dev: 0.3 },
      GSM8K: { score: 89.2, std_dev: 0.5 },
      HumanEval: { score: 78.7, std_dev: 0.8 },
      MATH: { score: 52.3, std_dev: 1.2 },
      HellaSwag: { score: 95.3, std_dev: 0.2 },
      TruthfulQA: { score: 68.9, std_dev: 0.7 },
      BBH: { score: 81.2, std_dev: 0.4 }
    }
  },
  {
    run_id: "gemini-x-70b-v3",
    checkpoint: "step-42000",
    benchmarks: {
      MMLU: { score: 81.2, std_dev: 0.4 },
      GSM8K: { score: 84.6, std_dev: 0.6 },
      HumanEval: { score: 71.3, std_dev: 0.9 },
      MATH: { score: 45.7, std_dev: 1.3 },
      HellaSwag: { score: 92.1, std_dev: 0.3 },
      TruthfulQA: { score: 65.4, std_dev: 0.8 },
      BBH: { score: 76.8, std_dev: 0.5 }
    }
  },
  {
    run_id: "gemini-x-70b-safety-v2",
    checkpoint: "step-21000",
    benchmarks: {
      MMLU: { score: 80.8, std_dev: 0.4 },
      GSM8K: { score: 83.9, std_dev: 0.6 },
      HumanEval: { score: 70.1, std_dev: 0.9 },
      MATH: { score: 44.9, std_dev: 1.3 },
      HellaSwag: { score: 91.8, std_dev: 0.3 },
      TruthfulQA: { score: 71.2, std_dev: 0.7 },
      BBH: { score: 75.9, std_dev: 0.5 }
    }
  }
];

function getDeltaColor(status: string) {
  switch (status) {
    case 'improvement':
      return 'text-green-600 dark:text-green-400';
    case 'warning':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'regression':
    case 'critical_regression':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

function getStatusBadge(status: string, eligible: boolean) {
  if (eligible) {
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Promotion Eligible</span>;
  } else {
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Blocked</span>;
  }
}

export default function EvaluationView() {
  const blockedCount = regressionData.comparisons.filter(c => !c.promotion_eligible).length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Evaluation Summary
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Benchmark performance vs. baseline (production-v2.1)
          </p>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Evaluated
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                {regressionData.comparisons.length}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Promotion Eligible
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600 dark:text-green-400">
                {regressionData.comparisons.filter(c => c.promotion_eligible).length}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Blocked
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-red-600 dark:text-red-400">
                {blockedCount}
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* Regression Alerts */}
      {blockedCount > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-200">
                <span className="font-medium">{blockedCount} model{blockedCount > 1 ? 's' : ''} blocked due to regressions.</span> Review required before promotion.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Regression Comparison Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Regression Analysis vs. Baseline
          </h3>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          {regressionData.comparisons.map((comparison) => (
            <div key={comparison.run_id} className="px-4 py-5 sm:p-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-base font-medium text-gray-900 dark:text-white">{comparison.run_id}</h4>
                  {comparison.notes && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{comparison.notes}</p>
                  )}
                </div>
                {getStatusBadge(comparison.overall_status, comparison.promotion_eligible)}
              </div>

              {comparison.blocking_reasons && comparison.blocking_reasons.length > 0 && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">Blocking Reasons:</p>
                  <ul className="mt-1 list-disc list-inside text-sm text-red-700 dark:text-red-300">
                    {comparison.blocking_reasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                {Object.entries(comparison.vs_baseline).map(([benchmark, data]) => (
                  <div key={benchmark} className="text-center">
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      {benchmark}
                    </dt>
                    <dd className={`mt-1 text-lg font-semibold ${getDeltaColor(data.status)}`}>
                      {data.delta > 0 ? '+' : ''}{data.delta.toFixed(1)}
                    </dd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Absolute Scores Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Absolute Benchmark Scores
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Raw scores with standard deviation
          </p>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Run ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  MMLU
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  GSM8K
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  HumanEval
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  MATH
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  HellaSwag
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  TruthfulQA
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  BBH
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {benchmarkScores.map((result) => (
                <tr key={result.run_id} className={result.run_id === 'baseline-production' ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {result.run_id}
                    {result.run_id === 'baseline-production' && (
                      <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        BASELINE
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {result.benchmarks.MMLU.score.toFixed(1)} <span className="text-gray-500 dark:text-gray-400">±{result.benchmarks.MMLU.std_dev.toFixed(1)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {result.benchmarks.GSM8K.score.toFixed(1)} <span className="text-gray-500 dark:text-gray-400">±{result.benchmarks.GSM8K.std_dev.toFixed(1)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {result.benchmarks.HumanEval.score.toFixed(1)} <span className="text-gray-500 dark:text-gray-400">±{result.benchmarks.HumanEval.std_dev.toFixed(1)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {result.benchmarks.MATH.score.toFixed(1)} <span className="text-gray-500 dark:text-gray-400">±{result.benchmarks.MATH.std_dev.toFixed(1)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {result.benchmarks.HellaSwag.score.toFixed(1)} <span className="text-gray-500 dark:text-gray-400">±{result.benchmarks.HellaSwag.std_dev.toFixed(1)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {result.benchmarks.TruthfulQA.score.toFixed(1)} <span className="text-gray-500 dark:text-gray-400">±{result.benchmarks.TruthfulQA.std_dev.toFixed(1)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {result.benchmarks.BBH.score.toFixed(1)} <span className="text-gray-500 dark:text-gray-400">±{result.benchmarks.BBH.std_dev.toFixed(1)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
