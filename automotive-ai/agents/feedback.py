import json
import os
from typing import Dict, List, Any
from utils.ueba_monitor import UEBAMonitor

class FeedbackAgent:
    def __init__(self, ueba_monitor: UEBAMonitor):
        self.ueba = ueba_monitor

    def collect_feedback(self, vehicle_id: str) -> Dict[str, Any]:
        """Collect post-service customer feedback"""
        # Check permissions
        permission_check = self.ueba.verify_action("Feedback", "collect_feedback", {"vehicle_id": vehicle_id})
        if not permission_check["allowed"]:
            return {"error": permission_check["anomaly"]["message"]}

        # Load vehicle data
        vehicles = self._load_vehicles()
        vehicle = next((v for v in vehicles if v["id"] == vehicle_id), None)
        if not vehicle:
            return {"error": f"Vehicle {vehicle_id} not found"}

        # Simulate feedback collection (in real system, send survey)
        feedback = self._generate_mock_feedback(vehicle)

        result = {
            "vehicle_id": vehicle_id,
            "customer": vehicle["owner"],
            "survey_sent": True,
            "feedback": feedback,
            "satisfaction_score": feedback.get("overall_rating", 0),
            "follow_up_needed": feedback.get("overall_rating", 5) < 4
        }

        return result

    def _load_vehicles(self) -> List[Dict[str, Any]]:
        if os.path.exists('data/vehicles.json'):
            with open('data/vehicles.json', 'r') as f:
                return json.load(f)
        return []

    def _generate_mock_feedback(self, vehicle: Dict[str, Any]) -> Dict[str, Any]:
        """Generate realistic mock feedback"""
        # Base feedback
        feedback = {
            "overall_rating": 5,  # 1-5 scale
            "service_quality": 5,
            "timeliness": 5,
            "staff_courtesy": 5,
            "value_for_money": 4,
            "would_recommend": True,
            "comments": "Excellent service! The pickup and delivery was very convenient.",
            "issues_resolved": True,
            "response_time": "Quick and efficient"
        }

        # Add some variation
        import random
        feedback["overall_rating"] = random.randint(4, 5)
        feedback["value_for_money"] = random.randint(3, 5)

        if feedback["overall_rating"] == 4:
            feedback["comments"] = "Good service overall, but waited a bit longer than expected."
        elif feedback["overall_rating"] == 5:
            feedback["comments"] = "Outstanding service! Highly recommend AutoCare."

        return feedback

    def get_feedback_summary(self) -> Dict[str, Any]:
        """Get aggregated feedback statistics"""
        # In real system, aggregate from database
        return {
            "total_responses": 150,
            "average_rating": 4.7,
            "satisfaction_rate": 94,  # %
            "recommendation_rate": 92,  # %
            "common_positive": ["Convenient pickup/delivery", "Professional staff", "Quality work"],
            "common_improvements": ["Wait time", "Communication"]
        }