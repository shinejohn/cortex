"""
CloudWatch monitoring and alerting configuration.
"""

import pulumi
import pulumi_aws as aws
from config import project_name, env, common_tags, monitoring
from compute import cluster
from database import db_instance, redis_cluster

# SNS Topic for Alerts
alert_topic = aws.sns.Topic(
    f"{project_name}-{env}-alerts",
    name=f"{project_name}-{env}-alerts",
    tags=common_tags,
)

# Email subscription (if email is configured)
if monitoring["alarm_email"]:
    aws.sns.TopicSubscription(
        f"{project_name}-{env}-email-subscription",
        topic=alert_topic.arn,
        protocol="email",
        endpoint=monitoring["alarm_email"],
    )

# CloudWatch Dashboard
import json

dashboard_body = json.dumps({
    "widgets": [
        {
            "type": "metric",
            "properties": {
                "metrics": [
                    ["AWS/ECS", "CPUUtilization", {"stat": "Average", "label": "ECS CPU"}],
                    ["AWS/ECS", "MemoryUtilization", {"stat": "Average", "label": "ECS Memory"}],
                ],
                "period": 300,
                "stat": "Average",
                "region": "us-east-1",
                "title": "ECS Metrics",
            },
        },
        {
            "type": "metric",
            "properties": {
                "metrics": [
                    ["AWS/RDS", "CPUUtilization", {"stat": "Average", "label": "RDS CPU"}],
                    ["AWS/RDS", "DatabaseConnections", {"stat": "Average", "label": "DB Connections"}],
                ],
                "period": 300,
                "stat": "Average",
                "region": "us-east-1",
                "title": "RDS Metrics",
            },
        },
        {
            "type": "metric",
            "properties": {
                "metrics": [
                    ["AWS/ElastiCache", "CPUUtilization", {"stat": "Average", "label": "Redis CPU"}],
                    ["AWS/ElastiCache", "CacheHits", {"stat": "Sum", "label": "Cache Hits"}],
                    ["AWS/ElastiCache", "CacheMisses", {"stat": "Sum", "label": "Cache Misses"}],
                ],
                "period": 300,
                "stat": "Average",
                "region": "us-east-1",
                "title": "ElastiCache Metrics",
            },
        },
    ],
})

dashboard = aws.cloudwatch.Dashboard(
    f"{project_name}-{env}-dashboard",
    dashboard_name=f"{project_name}-{env}",
    dashboard_body=dashboard_body,
)

# Alarms
# ECS CPU Alarm
aws.cloudwatch.MetricAlarm(
    f"{project_name}-{env}-ecs-cpu-alarm",
    name=f"{project_name}-{env}-ecs-cpu-high",
    comparison_operator="GreaterThanThreshold",
    evaluation_periods=2,
    metric_name="CPUUtilization",
    namespace="AWS/ECS",
    period=300,
    statistic="Average",
    threshold=monitoring["cpu_alarm_threshold"],
    alarm_description="Alert when ECS CPU exceeds threshold",
    alarm_actions=[alert_topic.arn],
    dimensions={"ClusterName": cluster.name},
    tags=common_tags,
)

# RDS CPU Alarm
aws.cloudwatch.MetricAlarm(
    f"{project_name}-{env}-rds-cpu-alarm",
    name=f"{project_name}-{env}-rds-cpu-high",
    comparison_operator="GreaterThanThreshold",
    evaluation_periods=2,
    metric_name="CPUUtilization",
    namespace="AWS/RDS",
    period=300,
    statistic="Average",
    threshold=monitoring["db_cpu_alarm_threshold"],
    alarm_description="Alert when RDS CPU exceeds threshold",
    alarm_actions=[alert_topic.arn],
    dimensions={"DBInstanceIdentifier": db_instance.id},
    tags=common_tags,
)

pulumi.export("alert_topic_arn", alert_topic.arn)

