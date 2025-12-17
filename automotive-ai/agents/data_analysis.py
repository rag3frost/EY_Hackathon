import json
import os
from typing import Dict, List, Any
from utils.ueba_monitor import UEBAMonitor

class DataAnalysisAgent:
    def __init__(self, ueba_monitor: UEBAMonitor):
        self.ueba = ueba_monitor

    def analyze_vehicle(self, vehicle_id: str) -> Dict[str, Any]:
        """Analyze vehicle sensor data for anomalies"""
        # Check permissions
        permission_check = self.ueba.verify_action("DataAnalysis", "read_vehicle_data", {"vehicle_id": vehicle_id})
        if not permission_check["allowed"]:
            return {"error": permission_check["anomaly"]["message"]}

        # Load vehicle data
        vehicles = self._load_vehicles()
        vehicle = next((v for v in vehicles if v["id"] == vehicle_id), None)
        if not vehicle:
            return {"error": f"Vehicle {vehicle_id} not found"}

        sensors = vehicle["sensors"]
        anomalies = self._detect_anomalies(sensors)

        analysis_result = {
            "vehicle_id": vehicle_id,
            "sensors": sensors,
            "anomalies": anomalies,
            "health_score": self._calculate_health_score(sensors, anomalies)
        }

        return analysis_result

    def _load_vehicles(self) -> List[Dict[str, Any]]:
        if os.path.exists('data/vehicles.json'):
            with open('data/vehicles.json', 'r') as f:
                return json.load(f)
        return []

    def _detect_anomalies(self, sensors: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Rule-based anomaly detection"""
        anomalies = []

        # Oil pressure check
        if sensors.get("oil_pressure", 50) < 30:
            anomalies.append({
                "component": "oil_system",
                "severity": "high",
                "description": f"Oil pressure {sensors['oil_pressure']} PSI is below safe threshold (30 PSI)",
                "recommendation": "Schedule oil service immediately"
            })

        # Engine temperature check
        if sensors.get("engine_temp", 90) > 105:
            anomalies.append({
                "component": "engine_cooling",
                "severity": "critical",
                "description": f"Engine temperature {sensors['engine_temp']}°C is too high",
                "recommendation": "Stop driving, check cooling system"
            })

        # Brake pad thickness check
        if sensors.get("brake_pad_thickness", 5) < 3:
            anomalies.append({
                "component": "brake_system",
                "severity": "high",
                "description": f"Brake pad thickness {sensors['brake_pad_thickness']}mm is worn out",
                "recommendation": "Replace brake pads"
            })

        # Battery voltage check
        if sensors.get("battery_voltage", 12.5) < 12.0:
            anomalies.append({
                "component": "electrical_system",
                "severity": "medium",
                "description": f"Battery voltage {sensors['battery_voltage']}V is low",
                "recommendation": "Check battery and charging system"
            })

        # Tire pressure check
        tire_pressures = sensors.get("tire_pressure", [])
        for i, pressure in enumerate(tire_pressures):
            if pressure < 28 or pressure > 35:
                anomalies.append({
                    "component": "tire_system",
                    "severity": "medium",
                    "description": f"Tire {i+1} pressure {pressure} PSI is out of range (28-35 PSI)",
                    "recommendation": "Adjust tire pressure"
                })

        return anomalies

    def _calculate_health_score(self, sensors: Dict[str, Any], anomalies: List[Dict[str, Any]]) -> int:
        """Calculate overall health score (0-100)"""
        base_score = 100

        severity_penalties = {
            "low": 5,
            "medium": 15,
            "high": 30,
            "critical": 50
        }

        for anomaly in anomalies:
            severity = anomaly.get("severity", "medium")
            base_score -= severity_penalties.get(severity, 15)

        return max(0, base_score)