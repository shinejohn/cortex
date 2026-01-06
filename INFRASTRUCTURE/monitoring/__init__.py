"""
Monitoring module for Fibonacco infrastructure.

Exports:
    alert_topic: SNS topic for alerts
    dashboard: CloudWatch dashboard
"""

from .cloudwatch import alert_topic, dashboard

__all__ = ["alert_topic", "dashboard"]

