#!/usr/bin/env python3
"""
Regression Alert Agent

Monitors evaluation results and detects performance regressions.
Automatically flags models that fail to meet benchmark thresholds.

This agent demonstrates:
- Automated quality gates
- Regression detection before promotion
- Data-driven decision support
"""

import json
import sys
from pathlib import Path
from typing import List, Dict, Any


class RegressionAlertAgent:
    def __init__(self, data_dir: Path, regression_threshold: float = 2.0):
        self.data_dir = data_dir
        self.regression_threshold = regression_threshold

    def load_regression_tracker(self) -> Dict[str, Any]:
        """Load regression tracking data."""
        tracker_path = self.data_dir / "evals" / "regression_tracker.json"
        with open(tracker_path, 'r') as f:
            return json.load(f)

    def analyze_regressions(self) -> Dict[str, Any]:
        """Analyze regression data and identify issues."""
        tracker = self.load_regression_tracker()
        baseline_id = tracker['baseline_run_id']

        results = {
            'baseline': baseline_id,
            'critical_regressions': [],
            'warnings': [],
            'improvements': [],
            'blocked_models': []
        }

        for comparison in tracker['comparisons']:
            run_id = comparison['run_id']
            analysis = {
                'run_id': run_id,
                'overall_status': comparison['overall_status'],
                'promotion_eligible': comparison['promotion_eligible'],
                'critical_benchmarks': [],
                'warning_benchmarks': [],
                'improved_benchmarks': []
            }

            # Analyze each benchmark
            for benchmark, data in comparison['vs_baseline'].items():
                delta = data['delta']
                status = data['status']

                if status == 'critical_regression' or status == 'regression':
                    if abs(delta) >= self.regression_threshold:
                        analysis['critical_benchmarks'].append({
                            'name': benchmark,
                            'delta': delta,
                            'status': status
                        })
                elif status == 'warning':
                    analysis['warning_benchmarks'].append({
                        'name': benchmark,
                        'delta': delta
                    })
                elif status == 'improvement':
                    analysis['improved_benchmarks'].append({
                        'name': benchmark,
                        'delta': delta
                    })

            # Categorize overall
            if analysis['critical_benchmarks']:
                results['critical_regressions'].append(analysis)
            elif analysis['warning_benchmarks']:
                results['warnings'].append(analysis)
            elif analysis['improved_benchmarks']:
                results['improvements'].append(analysis)

            # Track blocked models
            if not comparison['promotion_eligible']:
                results['blocked_models'].append({
                    'run_id': run_id,
                    'reasons': comparison.get('blocking_reasons', []),
                    'notes': comparison.get('notes', '')
                })

        return results

    def generate_alert(self, results: Dict[str, Any]) -> str:
        """Generate alert report."""
        output = []
        output.append("=" * 80)
        output.append("REGRESSION ALERT REPORT")
        output.append("=" * 80)
        output.append(f"\nBaseline: {results['baseline']}")
        output.append(f"Regression Threshold: ±{self.regression_threshold} points\n")

        # Critical Regressions
        if results['critical_regressions']:
            output.append("\n" + "🔴 CRITICAL REGRESSIONS " + "🔴")
            output.append("=" * 80)
            for reg in results['critical_regressions']:
                output.append(f"\nRUN: {reg['run_id']}")
                output.append(f"Status: {reg['overall_status']}")
                output.append(f"Promotion: {'✗ BLOCKED' if not reg['promotion_eligible'] else '✓ Eligible'}")
                output.append("\nRegressed Benchmarks:")
                for bench in reg['critical_benchmarks']:
                    output.append(f"  • {bench['name']}: {bench['delta']:+.1f} pts ({bench['status']})")
                output.append("\nACTION REQUIRED:")
                output.append("  - DO NOT PROMOTE this model to production")
                output.append("  - Investigate root cause of regressions")
                output.append("  - Consider additional training or architecture changes")

        # Warnings
        if results['warnings']:
            output.append("\n\n" + "⚠️  WARNINGS " + "⚠️")
            output.append("=" * 80)
            for warn in results['warnings']:
                output.append(f"\nRUN: {warn['run_id']}")
                output.append("Warning Benchmarks:")
                for bench in warn['warning_benchmarks']:
                    output.append(f"  • {bench['name']}: {bench['delta']:+.1f} pts")
                output.append("\nRECOMMENDATION:")
                output.append("  - Monitor closely during canary deployment")
                output.append("  - Consider A/B testing vs baseline")

        # Improvements
        if results['improvements']:
            output.append("\n\n" + "✅ IMPROVEMENTS " + "✅")
            output.append("=" * 80)
            for imp in results['improvements']:
                output.append(f"\nRUN: {imp['run_id']}")
                output.append("Improved Benchmarks:")
                for bench in imp['improved_benchmarks']:
                    output.append(f"  • {bench['name']}: {bench['delta']:+.1f} pts")

        # Blocked Models Summary
        if results['blocked_models']:
            output.append("\n\n" + "🚫 BLOCKED MODELS SUMMARY " + "🚫")
            output.append("=" * 80)
            output.append(f"\n{len(results['blocked_models'])} model(s) blocked from promotion:\n")
            for blocked in results['blocked_models']:
                output.append(f"\n  {blocked['run_id']}")
                if blocked['reasons']:
                    output.append("  Blocking Reasons:")
                    for reason in blocked['reasons']:
                        output.append(f"    - {reason}")
                if blocked['notes']:
                    output.append(f"  Notes: {blocked['notes']}")

        # Summary Statistics
        output.append("\n\n" + "=" * 80)
        output.append("SUMMARY")
        output.append("=" * 80)
        output.append(f"Critical Regressions: {len(results['critical_regressions'])}")
        output.append(f"Warnings: {len(results['warnings'])}")
        output.append(f"Improvements: {len(results['improvements'])}")
        output.append(f"Blocked Models: {len(results['blocked_models'])}")

        output.append("\n\nIntegration: Configure this agent to run on every eval completion.")
        output.append("Send alerts to: Slack, Email, PagerDuty\n")

        return "\n".join(output)

    def run(self) -> None:
        """Run regression analysis and generate report."""
        try:
            results = self.analyze_regressions()
            report = self.generate_alert(results)
            print(report)

            # Exit with error code if critical regressions found
            if results['critical_regressions']:
                sys.exit(1)
        except Exception as e:
            print(f"ERROR: Regression analysis failed: {e}", file=sys.stderr)
            sys.exit(2)


def main():
    # Determine data directory
    script_dir = Path(__file__).parent
    data_dir = script_dir.parent

    agent = RegressionAlertAgent(data_dir)
    agent.run()


if __name__ == "__main__":
    main()
