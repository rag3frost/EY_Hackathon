from agents.data_analysis import DataAnalysisAgent
from agents.diagnosis import DiagnosisAgent
from agents.customer_engagement import CustomerEngagementAgent
from agents.scheduling import SchedulingAgent
from agents.feedback import FeedbackAgent
from agents.manufacturing_insights import ManufacturingInsightsAgent
from utils.ueba_monitor import UEBAMonitor
import json
import os

class MasterAgent:
    def __init__(self):
        self.ueba = UEBAMonitor()
        self.data_agent = DataAnalysisAgent(self.ueba)
        self.diagnosis_agent = DiagnosisAgent(self.ueba)
        self.engagement_agent = CustomerEngagementAgent(self.ueba)
        self.scheduling_agent = SchedulingAgent(self.ueba)
        self.feedback_agent = FeedbackAgent(self.ueba)
        self.manufacturing_agent = ManufacturingInsightsAgent(self.ueba)

    def orchestrate_maintenance_workflow(self, vehicle_id: str) -> dict:
        """Main orchestration workflow: analyze → diagnose → engage → schedule → feedback"""
        workflow_result = {
            "vehicle_id": vehicle_id,
            "steps": [],
            "status": "in_progress",
            "final_outcome": None
        }

        try:
            # Step 1: Data Analysis
            analysis_result = self.data_agent.analyze_vehicle(vehicle_id)
            workflow_result["steps"].append({
                "step": "analysis",
                "result": analysis_result,
                "status": "completed"
            })

            # Step 2: Diagnosis
            diagnosis_result = self.diagnosis_agent.diagnose_issues(vehicle_id, analysis_result)
            workflow_result["steps"].append({
                "step": "diagnosis",
                "result": diagnosis_result,
                "status": "completed"
            })

            # Only proceed if issues detected
            if diagnosis_result.get("risk_score", 0) > 20:  # Threshold for intervention
                # Step 3: Customer Engagement
                engagement_result = self.engagement_agent.start_conversation(vehicle_id, diagnosis_result)
                workflow_result["steps"].append({
                    "step": "engagement",
                    "result": engagement_result,
                    "status": "completed"
                })

                # Step 4: Scheduling (if customer agrees)
                if engagement_result.get("appointment_booked", False):
                    schedule_result = self.scheduling_agent.book_appointment(vehicle_id, diagnosis_result)
                    workflow_result["steps"].append({
                        "step": "scheduling",
                        "result": schedule_result,
                        "status": "completed"
                    })

                    # Step 5: Feedback (post-service)
                    feedback_result = self.feedback_agent.collect_feedback(vehicle_id)
                    workflow_result["steps"].append({
                        "step": "feedback",
                        "result": feedback_result,
                        "status": "completed"
                    })

                    # Step 6: Manufacturing Insights
                    insights_result = self.manufacturing_agent.analyze_patterns()
                    workflow_result["steps"].append({
                        "step": "manufacturing_insights",
                        "result": insights_result,
                        "status": "completed"
                    })

                    workflow_result["final_outcome"] = "maintenance_scheduled"
                else:
                    workflow_result["final_outcome"] = "customer_declined"
            else:
                workflow_result["final_outcome"] = "no_action_needed"

            workflow_result["status"] = "completed"

        except Exception as e:
            workflow_result["status"] = "failed"
            workflow_result["error"] = str(e)

        return workflow_result

    def get_workflow_status(self, vehicle_id: str) -> dict:
        """Get current status of workflow for a vehicle"""
        # In a real system, this would check a database
        # For demo, return mock status
        return {
            "vehicle_id": vehicle_id,
            "current_step": "analysis",
            "progress": 20,
            "next_action": "diagnosis"
        }

    def get_agent_status(self) -> dict:
        """Get status of all agents"""
        return {
            "master_agent": "active",
            "data_analysis": "ready",
            "diagnosis": "ready",
            "customer_engagement": "ready",
            "scheduling": "ready",
            "feedback": "ready",
            "manufacturing_insights": "ready",
            "ueba_security_score": self.ueba.get_security_score()
        }