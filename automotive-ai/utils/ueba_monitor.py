import json
import os
from datetime import datetime
from typing import Dict, List, Any

class UEBAMonitor:
    def __init__(self):
        self.logs = []
        self.permissions = {
            "DataAnalysis": ["read_vehicle_data", "analyze_sensors", "detect_anomalies"],
            "Diagnosis": ["read_vehicle_data", "predict_failures", "calculate_risk"],
            "CustomerEngagement": ["read_customer_data", "initiate_conversation", "send_notifications"],
            "Scheduling": ["read_service_centers", "book_appointments", "check_capacity"],
            "Feedback": ["read_service_history", "collect_feedback", "send_surveys"],
            "ManufacturingInsights": ["read_maintenance_history", "analyze_patterns", "generate_reports"]
        }
        self.load_logs()

    def load_logs(self):
        if os.path.exists('data/security_logs.json'):
            with open('data/security_logs.json', 'r') as f:
                self.logs = json.load(f)

    def save_logs(self):
        os.makedirs('data', exist_ok=True)
        with open('data/security_logs.json', 'w') as f:
            json.dump(self.logs, f, indent=2)

    def log_action(self, agent: str, action: str, data: Dict[str, Any] = None, success: bool = True):
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "agent": agent,
            "action": action,
            "data": data or {},
            "success": success
        }
        self.logs.append(log_entry)
        self.save_logs()
        print(f"Logged action: {agent} - {action}")

    def check_permission(self, agent: str, action: str) -> bool:
        allowed_actions = self.permissions.get(agent, [])
        return action in allowed_actions

    def verify_action(self, agent: str, action: str, data: Dict[str, Any] = None) -> Dict[str, Any]:
        if not self.check_permission(agent, action):
            anomaly = {
                "type": "permission_violation",
                "message": f"{agent} attempted unauthorized action: {action}",
                "severity": "high"
            }
            self.log_action(agent, action, data, success=False)
            return {"allowed": False, "anomaly": anomaly}

        # Check for anomalies
        anomaly = self.detect_anomaly(agent, action, data)
        if anomaly:
            self.log_action(agent, action, data, success=False)
            return {"allowed": False, "anomaly": anomaly}

        self.log_action(agent, action, data, success=True)
        return {"allowed": True, "anomaly": None}

    def detect_anomaly(self, agent: str, action: str, data: Dict[str, Any] = None) -> Dict[str, Any]:
        # Simple anomaly detection
        recent_logs = [log for log in self.logs[-100:] if log['agent'] == agent]  # Last 100 actions

        # Check frequency
        if len(recent_logs) > 50:  # If agent has done many actions recently
            anomaly = {
                "type": "high_frequency",
                "message": f"{agent} showing unusually high activity",
                "severity": "medium"
            }
            return anomaly

        # Specific checks
        if agent == "Scheduling" and action == "read_vehicle_data" and "raw_telematics" in str(data):
            anomaly = {
                "type": "data_access_violation",
                "message": f"{agent} attempted to access raw telematics data",
                "severity": "high"
            }
            return anomaly

        return None

    def get_security_score(self) -> float:
        total_actions = len(self.logs)
        if total_actions == 0:
            return 100.0

        failed_actions = len([log for log in self.logs if not log.get('success', True)])
        score = 100 - (failed_actions / total_actions * 100)
        return max(0, score)

    def get_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        return self.logs[-limit:]

    def get_anomalies(self) -> List[Dict[str, Any]]:
        anomalies = []
        for log in self.logs:
            if not log.get('success', True):
                anomalies.append(log)
        return anomalies[-10:]  # Last 10 anomalies