interface Gate {
  name: string;
  status: 'pass' | 'fail' | 'pending';
  details: string;
  blocker?: boolean;
}

interface LaunchCandidate {
  run_id: string;
  model_size: string;
  checkpoint: string;
  gates: {
    eval_thresholds: Gate;
    safety_review: Gate;
    infra_scaling: Gate;
    monitoring_plan: Gate;
    rollback_plan: Gate;
    documentation: Gate;
  };
  overall_status: 'ready' | 'blocked' | 'pending';
  promotion_recommendation: string;
  risk_level: 'low' | 'medium' | 'high';
}

const launchCandidates: LaunchCandidate[] = [
  {
    run_id: "gemini-ultra-175b-v1",
    model_size: "175B",
    checkpoint: "final",
    gates: {
      eval_thresholds: {
        name: "Evaluation Thresholds",
        status: "pass",
        details: "All benchmarks meet or exceed baseline. MMLU +2.9pts, GSM8K +3.1pts."
      },
      safety_review: {
        name: "Safety Review",
        status: "pass",
        details: "Safety team approved. Toxicity rate 0.012, bias score 0.23, refusal appropriateness 0.94."
      },
      infra_scaling: {
        name: "Infrastructure Scaling",
        status: "pass",
        details: "Serving infrastructure validated at 10K QPS. Auto-scaling configured."
      },
      monitoring_plan: {
        name: "Monitoring Plan",
        status: "pass",
        details: "Dashboards configured. Alerts set for latency, error rate, and quality metrics."
      },
      rollback_plan: {
        name: "Rollback Plan",
        status: "pass",
        details: "Automated rollback to production-v2.1 configured. Tested in staging."
      },
      documentation: {
        name: "Documentation",
        status: "pass",
        details: "Model card, API docs, and deployment guide complete."
      }
    },
    overall_status: "ready",
    promotion_recommendation: "Recommend immediate promotion to staging for canary deployment.",
    risk_level: "low"
  },
  {
    run_id: "gemini-x-70b-v3",
    model_size: "70B",
    checkpoint: "step-42000",
    gates: {
      eval_thresholds: {
        name: "Evaluation Thresholds",
        status: "fail",
        details: "MMLU regression -2.3pts, MATH regression -2.9pts. Below promotion threshold.",
        blocker: true
      },
      safety_review: {
        name: "Safety Review",
        status: "pass",
        details: "Preliminary safety review complete. Toxicity rate 0.015."
      },
      infra_scaling: {
        name: "Infrastructure Scaling",
        status: "pending",
        details: "Awaiting infrastructure capacity allocation. Est. 3-5 days."
      },
      monitoring_plan: {
        name: "Monitoring Plan",
        status: "pass",
        details: "Monitoring configured and tested."
      },
      rollback_plan: {
        name: "Rollback Plan",
        status: "pending",
        details: "Rollback plan drafted, pending review."
      },
      documentation: {
        name: "Documentation",
        status: "pending",
        details: "Model card in progress."
      }
    },
    overall_status: "blocked",
    promotion_recommendation: "BLOCKED: Do not promote until eval regressions are resolved. Recommend additional training or architecture changes.",
    risk_level: "high"
  },
  {
    run_id: "gemini-x-70b-safety-v2",
    model_size: "70B",
    checkpoint: "step-21000",
    gates: {
      eval_thresholds: {
        name: "Evaluation Thresholds",
        status: "pass",
        details: "TruthfulQA +4.4pts (significant improvement). Some capability regressions expected for safety variant."
      },
      safety_review: {
        name: "Safety Review",
        status: "pass",
        details: "Excellent safety metrics. Toxicity rate 0.008, bias score 0.19, refusal appropriateness 0.96."
      },
      infra_scaling: {
        name: "Infrastructure Scaling",
        status: "pass",
        details: "Infrastructure ready. Same footprint as standard 70B model."
      },
      monitoring_plan: {
        name: "Monitoring Plan",
        status: "pass",
        details: "Enhanced safety monitoring configured."
      },
      rollback_plan: {
        name: "Rollback Plan",
        status: "fail",
        details: "Rollback plan missing for safety-specific features.",
        blocker: true
      },
      documentation: {
        name: "Documentation",
        status: "pending",
        details: "Safety model card in progress. Need safety team sign-off."
      }
    },
    overall_status: "blocked",
    promotion_recommendation: "Near ready. Complete rollback plan and documentation before staging deployment. Recommend safety team final review.",
    risk_level: "medium"
  },
  {
    run_id: "gemini-x-13b-v2",
    model_size: "13B",
    checkpoint: "step-18000",
    gates: {
      eval_thresholds: {
        name: "Evaluation Thresholds",
        status: "fail",
        details: "Significantly below baseline (expected for smaller model). Not a promotion candidate.",
        blocker: true
      },
      safety_review: {
        name: "Safety Review",
        status: "pending",
        details: "Awaiting safety review."
      },
      infra_scaling: {
        name: "Infrastructure Scaling",
        status: "pass",
        details: "Lightweight model, no scaling concerns."
      },
      monitoring_plan: {
        name: "Monitoring Plan",
        status: "pending",
        details: "Not yet configured."
      },
      rollback_plan: {
        name: "Rollback Plan",
        status: "pending",
        details: "Not applicable - research experiment only."
      },
      documentation: {
        name: "Documentation",
        status: "fail",
        details: "No documentation prepared.",
        blocker: false
      }
    },
    overall_status: "blocked",
    promotion_recommendation: "NOT RECOMMENDED: Research experiment only. Not intended for production deployment.",
    risk_level: "low"
  }
];

function getGateIcon(status: Gate['status']) {
  switch (status) {
    case 'pass':
      return (
        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    case 'fail':
      return (
        <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    case 'pending':
      return (
        <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      );
  }
}

function getOverallStatusBadge(status: LaunchCandidate['overall_status']) {
  switch (status) {
    case 'ready':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <svg className="mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Ready for Launch
        </span>
      );
    case 'blocked':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <svg className="mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          Blocked
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <svg className="mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Pending Review
        </span>
      );
  }
}

function getRiskBadge(risk: LaunchCandidate['risk_level']) {
  const colors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colors[risk]}`}>
      {risk.toUpperCase()} RISK
    </span>
  );
}

export default function LaunchReadiness() {
  const readyCount = launchCandidates.filter(c => c.overall_status === 'ready').length;
  const blockedCount = launchCandidates.filter(c => c.overall_status === 'blocked').length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Launch Readiness Summary
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Models evaluated against launch criteria
          </p>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Candidates
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                {launchCandidates.length}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Ready for Launch
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600 dark:text-green-400">
                {readyCount}
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
          </dl>
        </div>
      </div>

      {/* Launch Candidates */}
      {launchCandidates.map((candidate) => (
        <div key={candidate.run_id} className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  {candidate.run_id}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                  {candidate.model_size} • {candidate.checkpoint}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {getRiskBadge(candidate.risk_level)}
                {getOverallStatusBadge(candidate.overall_status)}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700">
            {/* Gates */}
            <dl className="divide-y divide-gray-200 dark:divide-gray-700">
              {Object.values(candidate.gates).map((gate, idx) => (
                <div key={idx} className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    {getGateIcon(gate.status)}
                    <span className="ml-2">
                      {gate.name}
                      {gate.blocker && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          BLOCKER
                        </span>
                      )}
                    </span>
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    {gate.details}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Recommendation */}
          <div className={`px-4 py-4 sm:px-6 ${
            candidate.overall_status === 'ready'
              ? 'bg-green-50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800'
              : candidate.overall_status === 'blocked'
              ? 'bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800'
              : 'bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800'
          }`}>
            <h4 className={`text-sm font-medium mb-1 ${
              candidate.overall_status === 'ready'
                ? 'text-green-900 dark:text-green-200'
                : candidate.overall_status === 'blocked'
                ? 'text-red-900 dark:text-red-200'
                : 'text-yellow-900 dark:text-yellow-200'
            }`}>
              Recommendation:
            </h4>
            <p className={`text-sm ${
              candidate.overall_status === 'ready'
                ? 'text-green-800 dark:text-green-300'
                : candidate.overall_status === 'blocked'
                ? 'text-red-800 dark:text-red-300'
                : 'text-yellow-800 dark:text-yellow-300'
            }`}>
              {candidate.promotion_recommendation}
            </p>
          </div>
        </div>
      ))}

      {/* Decision Log Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700 dark:text-blue-200">
              All launch decisions are logged and auditable. Gate criteria are versioned and traceable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
