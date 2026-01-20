// Mock infrastructure data
const clusterData = {
  cluster_name: "research-gpu-cluster-primary",
  total_gpus: 2048,
  gpu_type: "H100",
  allocated: 1820,
  available: 228,
  utilization_pct: 88.9,
  queue_depth: 3,
  queue_latency_min: 47,
  avg_wait_time_hours: 2.8,
  daily_cost_usd: 210000,
  monthly_budget_usd: 6500000,
  month_to_date_spend_usd: 4200000,
  budget_utilization_pct: 64.6,
  projected_month_end_spend_usd: 6720000,
  budget_status: "warning",
  gpu_allocation_by_team: {
    "research-llm-team": 512,
    "code-modeling": 64,
    "safety-alignment": 256,
    "efficiency-team": 16,
    "research-reasoning": 32,
    "multimodal-research": 384,
    "infrastructure-testing": 128,
    "reserved": 228,
    "other": 200
  },
  node_health: {
    healthy: 2032,
    degraded: 12,
    offline: 4
  }
};

const budgetData = {
  team_budgets: [
    {
      team: "research-llm-team",
      quarterly_allocation_usd: 7800000,
      spent_to_date_usd: 5040000,
      utilization_pct: 64.6,
      projected_spend_usd: 8064000,
      status: "warning"
    },
    {
      team: "safety-alignment",
      quarterly_allocation_usd: 3900000,
      spent_to_date_usd: 2520000,
      utilization_pct: 64.6,
      projected_spend_usd: 4032000,
      status: "warning"
    },
    {
      team: "multimodal-research",
      quarterly_allocation_usd: 5850000,
      spent_to_date_usd: 3780000,
      utilization_pct: 64.6,
      projected_spend_usd: 6048000,
      status: "warning"
    },
    {
      team: "code-modeling",
      quarterly_allocation_usd: 975000,
      spent_to_date_usd: 630000,
      utilization_pct: 64.6,
      projected_spend_usd: 1008000,
      status: "warning"
    }
  ]
};

export default function InfraHealth() {
  const isOverBudget = clusterData.projected_month_end_spend_usd > clusterData.monthly_budget_usd;
  const budgetVariance = clusterData.projected_month_end_spend_usd - clusterData.monthly_budget_usd;

  return (
    <div className="space-y-6">
      {/* Capacity Warning */}
      {clusterData.utilization_pct > 85 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-200">
                <span className="font-medium">Capacity constrained.</span> GPU utilization at {clusterData.utilization_pct.toFixed(1)}%. Prioritize high-impact runs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Budget Warning */}
      {isOverBudget && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-200">
                <span className="font-medium">Budget overrun projected.</span> Estimated ${Math.abs(budgetVariance).toLocaleString()} over monthly budget.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cluster Overview */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Cluster Overview
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            {clusterData.cluster_name}
          </p>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                GPU Type
              </dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {clusterData.gpu_type}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total GPUs
              </dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {clusterData.total_gpus.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Allocated
              </dt>
              <dd className="mt-1 text-2xl font-semibold text-blue-600 dark:text-blue-400">
                {clusterData.allocated.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Available
              </dt>
              <dd className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
                {clusterData.available.toLocaleString()}
              </dd>
            </div>
          </dl>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">GPU Utilization</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{clusterData.utilization_pct.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
              <div
                className={`h-4 rounded-full ${clusterData.utilization_pct > 90 ? 'bg-red-600' : clusterData.utilization_pct > 80 ? 'bg-yellow-500' : 'bg-green-600'}`}
                style={{ width: `${clusterData.utilization_pct}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              Queue Depth
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
              {clusterData.queue_depth}
            </dd>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">experiments waiting</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              Queue Latency
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
              {clusterData.queue_latency_min}
            </dd>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">minutes average</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              Avg Wait Time
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
              {clusterData.avg_wait_time_hours.toFixed(1)}h
            </dd>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">for queued jobs</p>
          </div>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Budget Overview
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Monthly compute spending
          </p>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Daily Cost
              </dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                ${clusterData.daily_cost_usd.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Monthly Budget
              </dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                ${(clusterData.monthly_budget_usd / 1000000).toFixed(1)}M
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Month-to-Date
              </dt>
              <dd className="mt-1 text-2xl font-semibold text-blue-600 dark:text-blue-400">
                ${(clusterData.month_to_date_spend_usd / 1000000).toFixed(1)}M
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Projected
              </dt>
              <dd className={`mt-1 text-2xl font-semibold ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                ${(clusterData.projected_month_end_spend_usd / 1000000).toFixed(1)}M
              </dd>
            </div>
          </dl>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Budget Utilization</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{clusterData.budget_utilization_pct.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-4 rounded-full"
                style={{ width: `${clusterData.budget_utilization_pct}%` }}
              ></div>
            </div>
            {isOverBudget && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                Projected to exceed budget by ${Math.abs(budgetVariance).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* GPU Allocation by Team */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            GPU Allocation by Team
          </h3>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Team
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  GPUs Allocated
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {Object.entries(clusterData.gpu_allocation_by_team)
                .sort(([, a], [, b]) => b - a)
                .map(([team, gpus]) => (
                  <tr key={team} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {team}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {gpus}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {((gpus / clusterData.total_gpus) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Node Health */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Node Health
          </h3>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="text-center">
              <dt className="text-sm font-medium text-green-600 dark:text-green-400">
                Healthy
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600 dark:text-green-400">
                {clusterData.node_health.healthy}
              </dd>
            </div>
            <div className="text-center">
              <dt className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                Degraded
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-yellow-600 dark:text-yellow-400">
                {clusterData.node_health.degraded}
              </dd>
            </div>
            <div className="text-center">
              <dt className="text-sm font-medium text-red-600 dark:text-red-400">
                Offline
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-red-600 dark:text-red-400">
                {clusterData.node_health.offline}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
