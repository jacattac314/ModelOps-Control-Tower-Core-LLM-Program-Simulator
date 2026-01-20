import { ExperimentRun } from '../lib/data';

// Mock data for client component
const experiments: ExperimentRun[] = [
  {
    run_id: "gemini-x-70b-v3",
    model_size: "70B",
    dataset: "webmix-v5",
    dataset_tokens: "4.2T",
    status: "running",
    gpu_hours: 4200,
    progress_pct: 68,
    owner: "research-llm-team",
    started_at: "2026-01-15T08:00:00Z",
    estimated_completion: "2026-01-22T14:30:00Z",
    gpus_allocated: 256,
    cost_usd: 168000
  },
  {
    run_id: "gemini-x-13b-v2",
    model_size: "13B",
    dataset: "code-mix-v3",
    dataset_tokens: "800B",
    status: "stalled",
    gpu_hours: 900,
    progress_pct: 41,
    owner: "code-modeling",
    started_at: "2026-01-18T06:00:00Z",
    stalled_since: "2026-01-19T22:15:00Z",
    gpus_allocated: 64,
    cost_usd: 36000,
    stall_reason: "Data pipeline checksum mismatch detected"
  },
  {
    run_id: "gemini-x-7b-ablation",
    model_size: "7B",
    dataset: "synthetic-reasoning-v1",
    dataset_tokens: "200B",
    status: "queued",
    gpu_hours: 0,
    progress_pct: 0,
    owner: "research-reasoning",
    queued_at: "2026-01-20T03:00:00Z",
    gpus_requested: 32,
    priority: "high"
  },
  {
    run_id: "gemini-ultra-175b-v1",
    model_size: "175B",
    dataset: "unified-corpus-v8",
    dataset_tokens: "10T",
    status: "complete",
    gpu_hours: 12400,
    progress_pct: 100,
    owner: "research-llm-team",
    started_at: "2026-01-05T00:00:00Z",
    completed_at: "2026-01-17T18:45:00Z",
    gpus_allocated: 512,
    cost_usd: 496000
  },
  {
    run_id: "gemini-x-70b-safety-v2",
    model_size: "70B",
    dataset: "webmix-v5-filtered",
    dataset_tokens: "3.8T",
    status: "running",
    gpu_hours: 2100,
    progress_pct: 34,
    owner: "safety-alignment",
    started_at: "2026-01-17T12:00:00Z",
    estimated_completion: "2026-01-26T09:00:00Z",
    gpus_allocated: 256,
    cost_usd: 84000
  },
  {
    run_id: "gemini-x-3b-distill",
    model_size: "3B",
    dataset: "distillation-corpus-v2",
    dataset_tokens: "500B",
    status: "failed",
    gpu_hours: 124,
    progress_pct: 15,
    owner: "efficiency-team",
    started_at: "2026-01-19T14:00:00Z",
    failed_at: "2026-01-20T02:30:00Z",
    gpus_allocated: 16,
    cost_usd: 4960,
    failure_reason: "OOM error - batch size too large for model architecture"
  }
];

function getStatusColor(status: string) {
  switch (status) {
    case 'running':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'complete':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'queued':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'stalled':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'failed':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

export default function ExperimentDashboard() {
  const runningCount = experiments.filter(e => e.status === 'running').length;
  const stalledCount = experiments.filter(e => e.status === 'stalled').length;
  const queuedCount = experiments.filter(e => e.status === 'queued').length;
  const totalGPUs = experiments
    .filter(e => e.status === 'running')
    .reduce((sum, e) => sum + (e.gpus_allocated || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Running Experiments
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                  {runningCount}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  GPUs Allocated
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                  {totalGPUs}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Queued
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                  {queuedCount}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-red-500 dark:text-red-400 truncate">
                  Stalled
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-red-600 dark:text-red-400">
                  {stalledCount}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {stalledCount > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-200">
                <span className="font-medium">{stalledCount} experiment{stalledCount > 1 ? 's' : ''} stalled.</span> Immediate attention required.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Experiments Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Active Experiments
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Current model training runs and their status
          </p>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Run ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Model
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Dataset
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Progress
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  GPUs
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cost
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Owner
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {experiments.map((exp) => (
                <tr key={exp.run_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {exp.run_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {exp.model_size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {exp.dataset}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(exp.status)}`}>
                      {exp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900 dark:text-white mr-2">{exp.progress_pct}%</div>
                      <div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${exp.progress_pct}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {exp.gpus_allocated || exp.gpus_requested || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${(exp.cost_usd || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {exp.owner}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stalled Experiments Detail */}
      {stalledCount > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-red-50 dark:bg-red-900/20">
            <h3 className="text-lg leading-6 font-medium text-red-900 dark:text-red-200">
              Stalled Experiments - Immediate Action Required
            </h3>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
            {experiments
              .filter(e => e.status === 'stalled')
              .map((exp) => (
                <div key={exp.run_id} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{exp.run_id}</h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Stalled since: {exp.stalled_since ? new Date(exp.stalled_since).toLocaleString() : 'Unknown'}
                      </p>
                      {exp.stall_reason && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                          <span className="font-medium">Reason:</span> {exp.stall_reason}
                        </p>
                      )}
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      {exp.progress_pct}% complete
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
