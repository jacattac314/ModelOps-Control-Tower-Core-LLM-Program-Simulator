#!/usr/bin/env python3
"""
Stall Detection Agent

Monitors running experiments and detects stalled runs.
Generates alerts when experiments have not made progress beyond a threshold.

This agent demonstrates:
- Proactive operations monitoring
- Automated bottleneck detection
- Early warning system for experiment failures
"""

import json
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Any


class StallDetector:
    def __init__(self, data_dir: Path, stall_threshold_hours: int = 6):
        self.data_dir = data_dir
        self.stall_threshold_hours = stall_threshold_hours

    def load_experiments(self) -> List[Dict[str, Any]]:
        """Load experiment registry."""
        registry_path = self.data_dir / "experiments" / "run_registry.json"
        with open(registry_path, 'r') as f:
            return json.load(f)

    def detect_stalls(self) -> List[Dict[str, Any]]:
        """Detect stalled experiments."""
        experiments = self.load_experiments()
        stalled = []
        now = datetime.utcnow()

        for exp in experiments:
            # Check for explicitly stalled status
            if exp.get('status') == 'stalled':
                stall_duration = None
                if exp.get('stalled_since'):
                    stalled_time = datetime.fromisoformat(exp['stalled_since'].replace('Z', '+00:00'))
                    stall_duration = (now - stalled_time).total_seconds() / 3600

                stalled.append({
                    'run_id': exp['run_id'],
                    'model_size': exp['model_size'],
                    'owner': exp['owner'],
                    'progress_pct': exp['progress_pct'],
                    'stall_duration_hours': stall_duration,
                    'stall_reason': exp.get('stall_reason', 'Unknown'),
                    'gpus_allocated': exp.get('gpus_allocated', 0),
                    'cost_usd': exp.get('cost_usd', 0),
                    'severity': 'high' if stall_duration and stall_duration > 12 else 'medium'
                })

            # Check for running experiments with no progress
            elif exp.get('status') == 'running':
                # In a real system, we'd check last progress update timestamp
                # For now, we identify potential stalls based on low progress vs time
                if exp.get('started_at'):
                    started_time = datetime.fromisoformat(exp['started_at'].replace('Z', '+00:00'))
                    runtime_hours = (now - started_time).total_seconds() / 3600

                    # If running for > 24 hours but < 20% progress, flag as potential stall
                    if runtime_hours > 24 and exp.get('progress_pct', 0) < 20:
                        stalled.append({
                            'run_id': exp['run_id'],
                            'model_size': exp['model_size'],
                            'owner': exp['owner'],
                            'progress_pct': exp['progress_pct'],
                            'runtime_hours': runtime_hours,
                            'stall_reason': 'Potential stall - low progress for runtime',
                            'gpus_allocated': exp.get('gpus_allocated', 0),
                            'cost_usd': exp.get('cost_usd', 0),
                            'severity': 'low'
                        })

        return stalled

    def generate_alerts(self, stalled: List[Dict[str, Any]]) -> str:
        """Generate alert messages."""
        if not stalled:
            return "✓ No stalled experiments detected."

        output = []
        output.append("=" * 80)
        output.append("STALL DETECTION ALERT")
        output.append("=" * 80)
        output.append(f"\nDetected {len(stalled)} stalled or potentially stalled experiment(s):\n")

        for exp in stalled:
            output.append(f"\n{'='*80}")
            output.append(f"RUN ID: {exp['run_id']}")
            output.append(f"Severity: {exp['severity'].upper()}")
            output.append(f"Model: {exp['model_size']}")
            output.append(f"Owner: {exp['owner']}")
            output.append(f"Progress: {exp['progress_pct']}%")
            output.append(f"GPUs Allocated: {exp['gpus_allocated']}")
            output.append(f"Cost to Date: ${exp['cost_usd']:,}")

            if exp.get('stall_duration_hours'):
                output.append(f"Stalled Duration: {exp['stall_duration_hours']:.1f} hours")
            if exp.get('runtime_hours'):
                output.append(f"Runtime: {exp['runtime_hours']:.1f} hours")

            output.append(f"\nReason: {exp['stall_reason']}")

            # Recommendations
            output.append("\nRECOMMENDED ACTIONS:")
            if 'data pipeline' in exp['stall_reason'].lower():
                output.append("  1. Check data pipeline status and logs")
                output.append("  2. Verify dataset checksums and availability")
                output.append("  3. Re-trigger data validation job if needed")
            elif exp.get('severity') == 'high':
                output.append("  1. Investigate immediately - high GPU/cost burn")
                output.append("  2. Consider pausing run to preserve resources")
                output.append("  3. Review training logs for errors")
            else:
                output.append("  1. Monitor for next checkpoint")
                output.append("  2. Review training metrics dashboard")
                output.append("  3. Contact run owner for status update")

        output.append("\n" + "=" * 80)
        output.append("\nRun this agent periodically via cron or monitoring system.")
        output.append("Integration: Send alerts to Slack, PagerDuty, or email.\n")

        return "\n".join(output)

    def run(self) -> None:
        """Run stall detection and generate report."""
        try:
            stalled = self.detect_stalls()
            report = self.generate_alerts(stalled)
            print(report)

            # Exit with error code if critical stalls detected
            critical = [s for s in stalled if s['severity'] == 'high']
            if critical:
                sys.exit(1)
        except Exception as e:
            print(f"ERROR: Stall detection failed: {e}", file=sys.stderr)
            sys.exit(2)


def main():
    # Determine data directory
    script_dir = Path(__file__).parent
    data_dir = script_dir.parent

    detector = StallDetector(data_dir)
    detector.run()


if __name__ == "__main__":
    main()
