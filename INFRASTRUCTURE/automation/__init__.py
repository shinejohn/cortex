"""
Automation module for Fibonacco infrastructure.

Exports:
    auto_remediation_lambda: Lambda function for auto-remediation
    capacity_warning_rule: EventBridge rule for capacity warnings
"""

from .remediation import auto_remediation_lambda, capacity_warning_rule

__all__ = ["auto_remediation_lambda", "capacity_warning_rule"]

