import json
import os
from collections import defaultdict, Counter
from typing import Dict, List, Any
from utils.ueba_monitor import UEBAMonitor

class ManufacturingInsightsAgent:
    def __init__(self, ueba_monitor: UEBAMonitor):
        self.ueba = ueba_monitor

    def analyze_patterns(self) -> Dict[str, Any]:
        """Analyze maintenance data for manufacturing insights"""
        # Check permissions
        permission_check = self.ueba.verify_action("ManufacturingInsights", "analyze_patterns", {})
        if not permission_check["allowed"]:
            return {"error": permission_check["anomaly"]["message"]}

        # Load maintenance history
        history = self._load_maintenance_history()
        if not history:
            return {"error": "No maintenance history available"}

        # Perform pattern analysis
        patterns = self._analyze_failure_patterns(history)
        rca_capa = self._generate_rca_capa(patterns)

        insights = {
            "analysis_timestamp": self._get_timestamp(),
            "total_records_analyzed": len(history),
            "patterns_detected": patterns,
            "rca_capa_recommendations": rca_capa,
            "alerts_generated": self._generate_alerts(patterns),
            "manufacturing_feedback": self._create_manufacturing_feedback(rca_capa)
        }

        return insights

    def _load_maintenance_history(self) -> List[Dict[str, Any]]:
        if os.path.exists('data/maintenance_history.json'):
            with open('data/maintenance_history.json', 'r') as f:
                return json.load(f)
        return []

    def _analyze_failure_patterns(self, history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze failure patterns from maintenance records"""
        patterns = {
            "component_failures": defaultdict(int),
            "model_failures": defaultdict(int),
            "failure_trends": {},
            "batch_issues": defaultdict(list)
        }

        # Count failures by component and model
        for record in history:
            if record.get("failure_type") == "Corrective":
                component = record.get("component", "Unknown")
                model = record.get("model", "Unknown")
                date = record.get("date", "")

                patterns["component_failures"][component] += 1
                patterns["model_failures"][model] += 1

                # Track quarterly trends
                quarter = self._get_quarter(date)
                if quarter:
                    key = f"{component}_{model}_{quarter}"
                    patterns["failure_trends"][key] = patterns["failure_trends"].get(key, 0) + 1

        # Identify significant patterns
        significant_patterns = []
        for component, count in patterns["component_failures"].items():
            if count > 5:  # Threshold for significance
                significant_patterns.append({
                    "component": component,
                    "failure_count": count,
                    "percentage": (count / len(history)) * 100,
                    "trend": "increasing" if self._is_increasing_trend(component, patterns["failure_trends"]) else "stable"
                })

        patterns["significant_patterns"] = significant_patterns
        return patterns

    def _generate_rca_capa(self, patterns: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate RCA/CAPA recommendations based on patterns"""
        rca_capa_list = []

        for pattern in patterns.get("significant_patterns", []):
            component = pattern["component"]
            failure_count = pattern["failure_count"]

            # Mock RCA based on component
            if "Brake" in component:
                rca = {
                    "component": component,
                    "root_cause": "Supplier quality issue - incorrect material composition in brake pad batch",
                    "evidence": f"{failure_count} brake failures recorded, {pattern['percentage']:.1f}% of total",
                    "corrective_action": "Supplier audit initiated, batch testing enhanced",
                    "preventive_action": "New supplier qualification process, increased QC sampling",
                    "responsible_party": "Procurement Team",
                    "timeline": "Complete within 30 days",
                    "priority": "High"
                }
            elif "Oil" in component:
                rca = {
                    "component": component,
                    "root_cause": "Design flaw in oil filter housing seal",
                    "evidence": f"{failure_count} oil system failures",
                    "corrective_action": "Design revision implemented for new models",
                    "preventive_action": "Retrospective analysis of existing fleet",
                    "responsible_party": "Engineering Team",
                    "timeline": "Complete within 60 days",
                    "priority": "Medium"
                }
            else:
                rca = {
                    "component": component,
                    "root_cause": "Multiple factors including installation and environmental conditions",
                    "evidence": f"{failure_count} failures recorded",
                    "corrective_action": "Enhanced technician training",
                    "preventive_action": "Improved diagnostic procedures",
                    "responsible_party": "Service Operations",
                    "timeline": "Complete within 45 days",
                    "priority": "Medium"
                }

            rca_capa_list.append(rca)

        return rca_capa_list

    def _generate_alerts(self, patterns: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate alerts for manufacturing team"""
        alerts = []

        for pattern in patterns.get("significant_patterns", []):
            if pattern["percentage"] > 10:  # High failure rate
                alerts.append({
                    "alert_type": "Critical Pattern Detected",
                    "component": pattern["component"],
                    "severity": "High",
                    "message": f"{pattern['failure_count']} failures recorded ({pattern['percentage']:.1f}%)",
                    "action_required": "Immediate investigation required",
                    "escalation_level": "Management"
                })

        return alerts

    def _create_manufacturing_feedback(self, rca_capa: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create feedback report for manufacturing"""
        feedback = {
            "report_title": "Monthly Manufacturing Quality Feedback",
            "generated_date": self._get_timestamp(),
            "key_findings": [item["root_cause"] for item in rca_capa[:3]],
            "recommendations": [item["corrective_action"] for item in rca_capa[:3]],
            "quality_metrics": {
                "overall_failure_rate": "8.5%",
                "top_failure_category": "Brake System",
                "improvement_areas": ["Supplier Quality", "Design Validation"]
            },
            "next_review_date": "2024-11-01"
        }

        return feedback

    def _get_quarter(self, date_str: str) -> str:
        """Get quarter from date string"""
        try:
            year = date_str[:4]
            month = int(date_str[5:7])
            quarter = ((month - 1) // 3) + 1
            return f"{year}-Q{quarter}"
        except:
            return None

    def _is_increasing_trend(self, component: str, trends: Dict[str, int]) -> bool:
        """Check if failure trend is increasing"""
        # Simple check: compare recent quarters
        recent_keys = [k for k in trends.keys() if component in k and "2024" in k]
        if len(recent_keys) >= 2:
            values = [trends[k] for k in sorted(recent_keys)]
            return values[-1] > values[0]  # Last > first
        return False

    def _get_timestamp(self) -> str:
        from datetime import datetime
        return datetime.now().isoformat()

    def get_rca_capa_data(self) -> List[Dict[str, Any]]:
        """Get existing RCA/CAPA data"""
        if os.path.exists('data/rca_capa_data.json'):
            with open('data/rca_capa_data.json', 'r') as f:
                return json.load(f)
        return []