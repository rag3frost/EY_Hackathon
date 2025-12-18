import json
import os
from collections import defaultdict, Counter
from typing import Dict, List, Any
from utils.ueba_monitor import UEBAMonitor

class ManufacturingInsightsAgent:
    def __init__(self, ueba_monitor: UEBAMonitor):
        self.ueba = ueba_monitor

    def analyze_patterns(self) -> Dict[str, Any]:
        """Analyze maintenance data for manufacturing insights - returns RCA/CAPA data"""
        # Check permissions
        permission_check = self.ueba.verify_action("ManufacturingInsights", "analyze_patterns", {})
        if not permission_check["allowed"]:
            return {"error": permission_check["anomaly"]["message"]}

        # Load RCA/CAPA data directly
        rca_data = self._load_rca_capa_data()
        if not rca_data:
            return {"error": "No RCA/CAPA data available"}

        # Return structured data for the UI
        insights = {
            "analysis_timestamp": self._get_timestamp(),
            "stats": rca_data.get("stats", {
                "active_defects": 0,
                "in_progress": 0,
                "resolved": 0,
                "affected_vehicles": 0
            }),
            "defect_trends": rca_data.get("defect_trends", {
                "months": [],
                "series": {}
            }),
            "failure_distribution": rca_data.get("failure_distribution", {
                "months": [],
                "components": {}
            }),
            "patterns": rca_data.get("patterns", []),
            "defects": rca_data.get("defects", []),
            # Legacy fields for backward compatibility
            "component_failures": self._calculate_component_failures(rca_data),
            "recommendations": self._generate_recommendations(rca_data)
        }

        return insights

    def _load_rca_capa_data(self) -> Dict[str, Any]:
        """Load RCA/CAPA data from file"""
        if os.path.exists('data/rca_capa_data.json'):
            with open('data/rca_capa_data.json', 'r') as f:
                return json.load(f)
        return {}

    def _calculate_component_failures(self, rca_data: Dict[str, Any]) -> Dict[str, int]:
        """Calculate component failures from defects"""
        failures = defaultdict(int)
        for defect in rca_data.get("defects", []):
            component = defect.get("component", "Unknown")
            failures[component] += defect.get("affected_vehicles", 0)
        return dict(failures)

    def _generate_recommendations(self, rca_data: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on patterns"""
        recommendations = []
        for pattern in rca_data.get("patterns", []):
            if pattern.get("severity") == "critical":
                recommendations.append(f"Priority investigation required for {pattern.get('component', 'component')} issues")
            recommendations.append(f"Review {pattern.get('component', 'component')} supplier quality processes")
        
        recommendations.extend([
            "Enhance incoming quality inspection for critical components",
            "Implement real-time defect tracking dashboard",
            "Schedule monthly RCA review meetings with suppliers"
        ])
        return recommendations[:6]  # Return top 6

    def _get_timestamp(self) -> str:
        from datetime import datetime
        return datetime.now().isoformat()

    def get_rca_capa_data(self) -> Dict[str, Any]:
        """Get existing RCA/CAPA data"""
        return self._load_rca_capa_data()