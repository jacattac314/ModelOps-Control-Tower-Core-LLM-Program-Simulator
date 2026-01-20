#!/usr/bin/env python3
"""
Model Promotion Gatekeeper

Enforces launch gates before promoting models to staging/production.
Validates that all criteria are met before allowing promotion.

This script demonstrates:
- Automated governance and compliance
- Release management rigor
- Go/no-go decision automation
"""

import json
import sys
from pathlib import Path
from typing import Dict, Any, List, Tuple
from datetime import datetime


class PromotionGatekeeper:
    def __init__(self, data_dir: Path):
        self.data_dir = data_dir

    def load_regression_tracker(self) -> Dict[str, Any]:
        """Load regression analysis data."""
        tracker_path = self.data_dir / "evals" / "regression_tracker.json"
        with open(tracker_path, 'r') as f:
            return json.load(f)

    def load_experiments(self) -> List[Dict[str, Any]]:
        """Load experiment registry."""
        registry_path = self.data_dir / "experiments" / "run_registry.json"
        with open(registry_path, 'r') as f:
            return json.load(f)

    def check_eval_gate(self, run_id: str) -> Tuple[bool, str]:
        """Check if evaluation thresholds are met."""
        tracker = self.load_regression_tracker()

        for comparison in tracker['comparisons']:
            if comparison['run_id'] == run_id:
                if not comparison['promotion_eligible']:
                    reasons = comparison.get('blocking_reasons', ['Unknown'])
                    return False, f"Eval gate FAILED: {'; '.join(reasons)}"

                # Check for critical regressions
                critical_regs = []
                for benchmark, data in comparison['vs_baseline'].items():
                    if data['status'] in ['critical_regression', 'regression']:
                        if abs(data['delta']) >= 2.0:
                            critical_regs.append(f"{benchmark} ({data['delta']:+.1f})")

                if critical_regs:
                    return False, f"Eval gate FAILED: Critical regressions in {', '.join(critical_regs)}"

                return True, "Eval gate PASSED"

        return False, "Eval gate FAILED: No evaluation data found"

    def check_safety_gate(self, run_id: str) -> Tuple[bool, str]:
        """Check if safety review is complete."""
        # In a real system, this would check a safety review database
        # For this demo, we simulate based on run naming
        if 'safety' in run_id.lower():
            return True, "Safety gate PASSED: Safety variant with enhanced safety measures"
        elif run_id == "gemini-ultra-175b-v1":
            return True, "Safety gate PASSED: Safety team approved"
        else:
            # Simulate pending or failed safety reviews
            return False, "Safety gate PENDING: Awaiting safety team review"

    def check_infra_gate(self, run_id: str) -> Tuple[bool, str]:
        """Check if infrastructure is ready."""
        # In a real system, this would check infrastructure capacity and readiness
        # For this demo, we check experiment status
        experiments = self.load_experiments()

        for exp in experiments:
            if exp['run_id'] == run_id:
                if exp['status'] != 'complete':
                    return False, f"Infra gate FAILED: Experiment status is '{exp['status']}', not 'complete'"

                # Check if model size is within deployment capacity
                if exp['model_size'] in ['175B']:
                    return True, "Infra gate PASSED: Large model infrastructure validated"
                elif exp['model_size'] in ['70B', '13B', '7B', '3B']:
                    return True, "Infra gate PASSED: Infrastructure ready"

        return False, "Infra gate FAILED: Experiment not found"

    def check_monitoring_gate(self, run_id: str) -> Tuple[bool, str]:
        """Check if monitoring is configured."""
        # In a real system, this would verify monitoring dashboards and alerts
        # For this demo, we check based on experiment completeness
        experiments = self.load_experiments()

        for exp in experiments:
            if exp['run_id'] == run_id:
                if exp['status'] == 'complete':
                    return True, "Monitoring gate PASSED: Dashboards and alerts configured"

        return False, "Monitoring gate PENDING: Monitoring setup incomplete"

    def check_documentation_gate(self, run_id: str) -> Tuple[bool, str]:
        """Check if documentation is complete."""
        # In a real system, this would check for model cards, API docs, etc.
        # For this demo, we simulate based on model maturity
        if run_id == "gemini-ultra-175b-v1":
            return True, "Documentation gate PASSED: Model card and docs complete"
        else:
            return False, "Documentation gate PENDING: Documentation incomplete"

    def evaluate_promotion(self, run_id: str, target_env: str = "staging") -> Dict[str, Any]:
        """Evaluate all gates for promotion."""
        print(f"\n{'='*80}")
        print(f"PROMOTION EVALUATION: {run_id} → {target_env.upper()}")
        print(f"{'='*80}\n")

        gates = {
            'eval_thresholds': self.check_eval_gate(run_id),
            'safety_review': self.check_safety_gate(run_id),
            'infra_ready': self.check_infra_gate(run_id),
            'monitoring': self.check_monitoring_gate(run_id),
            'documentation': self.check_documentation_gate(run_id)
        }

        passed = []
        failed = []

        for gate_name, (status, message) in gates.items():
            icon = "✅" if status else "❌"
            print(f"{icon} {gate_name.replace('_', ' ').title()}")
            print(f"   {message}\n")

            if status:
                passed.append(gate_name)
            else:
                failed.append(gate_name)

        print(f"{'='*80}")
        print("DECISION")
        print(f"{'='*80}\n")

        all_passed = len(failed) == 0

        if all_passed:
            print(f"✅ PROMOTION APPROVED")
            print(f"\n{run_id} meets all requirements for {target_env} deployment.")
            print(f"\nNext Steps:")
            print(f"  1. Create deployment ticket")
            print(f"  2. Schedule canary deployment window")
            print(f"  3. Enable gradual rollout (1% → 10% → 50% → 100%)")
            print(f"  4. Monitor key metrics for 48 hours before full rollout")
            print(f"\nPromotion logged: {datetime.utcnow().isoformat()}Z")
        else:
            print(f"❌ PROMOTION BLOCKED")
            print(f"\n{run_id} does NOT meet requirements for {target_env} deployment.")
            print(f"\nBlocking Gates ({len(failed)}):")
            for gate in failed:
                print(f"  - {gate.replace('_', ' ').title()}")
            print(f"\nREQUIRED ACTIONS:")
            print(f"  1. Resolve all blocking gates")
            print(f"  2. Re-run promotion evaluation")
            print(f"  3. Do not attempt manual bypass")
            print(f"\nPromotion denied: {datetime.utcnow().isoformat()}Z")

        print(f"\n{'='*80}\n")

        return {
            'run_id': run_id,
            'target_env': target_env,
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'gates': {k: v[0] for k, v in gates.items()},
            'passed_gates': passed,
            'failed_gates': failed,
            'decision': 'APPROVED' if all_passed else 'BLOCKED',
            'approved': all_passed
        }

    def promote(self, run_id: str, target_env: str = "staging") -> int:
        """Attempt to promote a model."""
        try:
            result = self.evaluate_promotion(run_id, target_env)

            # Return 0 for success, 1 for blocked
            return 0 if result['approved'] else 1

        except Exception as e:
            print(f"\nERROR: Promotion evaluation failed: {e}", file=sys.stderr)
            return 2


def main():
    if len(sys.argv) < 2:
        print("Usage: python promote-model.py <run_id> [staging|production]")
        print("\nExample:")
        print("  python promote-model.py gemini-ultra-175b-v1 staging")
        sys.exit(1)

    run_id = sys.argv[1]
    target_env = sys.argv[2] if len(sys.argv) > 2 else "staging"

    if target_env not in ['staging', 'production']:
        print(f"ERROR: Invalid target environment '{target_env}'. Must be 'staging' or 'production'.")
        sys.exit(1)

    # Determine data directory
    script_dir = Path(__file__).parent
    data_dir = script_dir.parent

    gatekeeper = PromotionGatekeeper(data_dir)
    exit_code = gatekeeper.promote(run_id, target_env)

    sys.exit(exit_code)


if __name__ == "__main__":
    main()
