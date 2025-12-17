import json
import os
from typing import Dict, List, Any
from utils.ueba_monitor import UEBAMonitor

class DiagnosisAgent:
    def __init__(self, ueba_monitor: UEBAMonitor):
        self.ueba = ueba_monitor

    def diagnose_issues(self, vehicle_id: str, analysis_result: Dict[str, Any]) -> Dict[str, Any]:
        """Diagnose potential failures and calculate risk scores"""
        # Check permissions
        permission_check = self.ueba.verify_action("Diagnosis", "predict_failures", {"vehicle_id": vehicle_id})
        if not permission_check["allowed"]:
            return {"error": permission_check["anomaly"]["message"]}

        # Load vehicle data
        vehicles = self._load_vehicles()
        vehicle = next((v for v in vehicles if v["id"] == vehicle_id), None)
        if not vehicle:
            return {"error": f"Vehicle {vehicle_id} not found"}

        anomalies = analysis_result.get("anomalies", [])
        sensors = analysis_result.get("sensors", {})
        vehicle_info = {
            "mileage": vehicle.get("mileage", 0),
            "last_service_km": vehicle.get("last_service_km", 0),
            "model": vehicle.get("model", ""),
            "year": vehicle.get("year", 2020)
        }

        risk_score = self._calculate_risk_score(anomalies, sensors, vehicle_info)
        predictions = self._predict_failures(anomalies, vehicle_info)

        diagnosis_result = {
            "vehicle_id": vehicle_id,
            "risk_score": risk_score,
            "risk_level": self._get_risk_level(risk_score),
            "predicted_failures": predictions,
            "recommendations": self._generate_recommendations(predictions, risk_score)
        }

        return diagnosis_result

    def _load_vehicles(self) -> List[Dict[str, Any]]:
        if os.path.exists('data/vehicles.json'):
            with open('data/vehicles.json', 'r') as f:
                return json.load(f)
        return []

    def _calculate_risk_score(self, anomalies: List[Dict[str, Any]], sensors: Dict[str, Any], vehicle_info: Dict[str, Any]) -> int:
        """Calculate risk score 0-100 based on various factors"""
        base_score = 0

        # Anomaly severity scoring
        severity_weights = {
            "low": 10,
            "medium": 25,
            "high": 50,
            "critical": 80
        }

        for anomaly in anomalies:
            severity = anomaly.get("severity", "medium")
            base_score += severity_weights.get(severity, 25)

        # Mileage factor
        mileage = vehicle_info.get("mileage", 0)
        if mileage > 100000:
            base_score += 20
        elif mileage > 50000:
            base_score += 10

        # Service overdue factor
        last_service = vehicle_info.get("last_service_km", 0)
        current_mileage = vehicle_info.get("mileage", 0)
        km_since_service = current_mileage - last_service
        if km_since_service > 10000:
            base_score += 30
        elif km_since_service > 5000:
            base_score += 15

        # Vehicle age factor
        import datetime
        current_year = datetime.datetime.now().year
        age = current_year - vehicle_info.get("year", 2020)
        if age > 5:
            base_score += 15

        return min(100, base_score)

    def _get_risk_level(self, score: int) -> str:
        if score >= 70:
            return "critical"
        elif score >= 40:
            return "high"
        elif score >= 20:
            return "medium"
        else:
            return "low"

    def _predict_failures(self, anomalies: List[Dict[str, Any]], vehicle_info: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Predict potential failures based on anomalies and patterns"""
        predictions = []

        # Based on anomalies
        for anomaly in anomalies:
            component = anomaly.get("component", "")
            if component == "oil_system":
                predictions.append({
                    "component": "Oil System",
                    "failure_type": "Oil pump failure or seal leak",
                    "probability": 85,
                    "timeframe": "Within 500 km",
                    "cost_estimate": "₹3,500 - ₹8,000"
                })
            elif component == "brake_system":
                predictions.append({
                    "component": "Brake System",
                    "failure_type": "Brake pad wear or rotor damage",
                    "probability": 75,
                    "timeframe": "Within 1000 km",
                    "cost_estimate": "₹4,000 - ₹12,000"
                })
            elif component == "engine_cooling":
                predictions.append({
                    "component": "Engine Cooling",
                    "failure_type": "Overheating leading to engine damage",
                    "probability": 90,
                    "timeframe": "Immediate",
                    "cost_estimate": "₹15,000 - ₹45,000"
                })

        # Service overdue prediction
        km_since_service = vehicle_info.get("mileage", 0) - vehicle_info.get("last_service_km", 0)
        if km_since_service > 10000:
            predictions.append({
                "component": "General Maintenance",
                "failure_type": "Multiple system failures due to neglected service",
                "probability": 60,
                "timeframe": "Within 2000 km",
                "cost_estimate": "₹8,000 - ₹25,000"
            })

        return predictions

    def _generate_recommendations(self, predictions: List[Dict[str, Any]], risk_score: int) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []

        if risk_score >= 70:
            recommendations.append("URGENT: Schedule service immediately - do not drive until inspected")
        elif risk_score >= 40:
            recommendations.append("HIGH PRIORITY: Book service appointment within 2-3 days")
        elif risk_score >= 20:
            recommendations.append("MONITOR: Schedule service within 1-2 weeks")
        else:
            recommendations.append("ROUTINE: Continue normal maintenance schedule")

        for prediction in predictions:
            if prediction["probability"] > 80:
                recommendations.append(f"Address {prediction['component']} immediately")

        return recommendations