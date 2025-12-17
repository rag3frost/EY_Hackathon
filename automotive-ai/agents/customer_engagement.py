import json
import os
from typing import Dict, List, Any
from groq import Groq
from utils.ueba_monitor import UEBAMonitor
from utils.voice_synthesis import VoiceSynthesizer

class CustomerEngagementAgent:
    def __init__(self, ueba_monitor: UEBAMonitor):
        self.ueba = ueba_monitor
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.voice_synth = VoiceSynthesizer()

    def start_conversation(self, vehicle_id: str, diagnosis_result: Dict[str, Any]) -> Dict[str, Any]:
        """Start AI-powered customer conversation"""
        # Check permissions
        permission_check = self.ueba.verify_action("CustomerEngagement", "initiate_conversation", {"vehicle_id": vehicle_id})
        if not permission_check["allowed"]:
            return {"error": permission_check["anomaly"]["message"]}

        # Load customer data
        vehicles = self._load_vehicles()
        vehicle = next((v for v in vehicles if v["id"] == vehicle_id), None)
        if not vehicle:
            return {"error": f"Vehicle {vehicle_id} not found"}

        customer_info = {
            "name": vehicle["owner"],
            "phone": vehicle["phone"],
            "vehicle_model": vehicle["model"],
            "location": vehicle["location"]
        }

        # Generate conversation using Groq
        conversation = self._generate_conversation(customer_info, diagnosis_result)

        # Simulate voice synthesis
        voice_file = f"conversations/{vehicle_id}_conversation.mp3"
        os.makedirs('conversations', exist_ok=True)
        self.voice_synth.generate_voice(conversation["transcript"], voice_file)

        result = {
            "vehicle_id": vehicle_id,
            "customer": customer_info["name"],
            "conversation": conversation,
            "appointment_booked": conversation.get("appointment_booked", False),
            "voice_file": voice_file
        }

        return result

    def _load_vehicles(self) -> List[Dict[str, Any]]:
        if os.path.exists('data/vehicles.json'):
            with open('data/vehicles.json', 'r') as f:
                return json.load(f)
        return []

    def _generate_conversation(self, customer_info: Dict[str, Any], diagnosis_result: Dict[str, Any]) -> Dict[str, Any]:
        """Use Groq to generate persuasive customer conversation"""
        risk_score = diagnosis_result.get("risk_score", 0)
        predictions = diagnosis_result.get("predicted_failures", [])

        # Create prompt for Groq
        prompt = f"""
You are Maya, an AI customer service agent for AutoCare, an automotive maintenance company in India.

Customer Details:
- Name: {customer_info['name']}
- Vehicle: {customer_info['vehicle_model']}
- Location: {customer_info['location']}
- Risk Score: {risk_score}/100

Diagnosis Summary:
{risk_score} risk score indicates {'critical' if risk_score > 70 else 'high' if risk_score > 40 else 'medium'} risk.

Predicted Issues:
{chr(10).join([f"- {p['component']}: {p['failure_type']} (₹{p['cost_estimate']})" for p in predictions[:2]])}

Your task: Conduct a persuasive phone conversation to convince the customer to book a service appointment.
Use these persuasion techniques:
1. Urgency: Emphasize immediate risk of breakdown
2. Cost comparison: Show preventive cost vs repair cost
3. Convenience: Offer pickup/delivery, flexible timing
4. Social proof: Mention other customers' positive experiences
5. Scarcity: Limited slots available

Handle common objections:
- "I'm busy": Offer flexible scheduling and pickup service
- "Too expensive": Compare to much higher repair costs
- "Not urgent": Explain progressive damage risk

The conversation should:
- Start with greeting and problem identification
- Build urgency and explain consequences
- Handle objections persuasively
- End with confirmed booking or follow-up plan

Format the response as a JSON with:
- "transcript": Full conversation dialogue
- "appointment_booked": true/false
- "booking_details": if booked, include date, time, center
- "objections_handled": list of objections encountered
- "persuasion_techniques_used": list of techniques used

Keep the conversation natural, professional, and persuasive.
"""

        try:
            response = self.client.chat.completions.create(
                model="llama-3.1-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=1500
            )

            result_text = response.choices[0].message.content.strip()

            # Try to parse as JSON
            try:
                conversation_data = json.loads(result_text)
            except json.JSONDecodeError:
                # Fallback if not valid JSON
                conversation_data = {
                    "transcript": result_text,
                    "appointment_booked": "book" in result_text.lower(),
                    "booking_details": "Tomorrow 9 AM at Mumbai center" if "book" in result_text.lower() else None,
                    "objections_handled": [],
                    "persuasion_techniques_used": ["urgency", "cost_comparison"]
                }

            return conversation_data

        except Exception as e:
            # Fallback conversation
            return self._fallback_conversation(customer_info, diagnosis_result)

    def _fallback_conversation(self, customer_info: Dict[str, Any], diagnosis_result: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback conversation if Groq fails"""
        transcript = f"""Agent Maya: Good morning {customer_info['name']}! This is Maya from AutoCare AI.

I'm calling about your {customer_info['vehicle_model']}. Our monitoring shows some concerning issues that need attention.

Customer: What issues?

Agent: Your vehicle has a {diagnosis_result.get('risk_score', 50)}% risk score. We detected potential problems that could lead to expensive repairs if not addressed soon.

To keep your vehicle safe and avoid costly breakdowns, I recommend scheduling service soon.

Customer: How much will it cost?

Agent: A preventive service costs around ₹3,500, versus potential repair costs of ₹15,000-₹45,000.

Would you like to book an appointment?

Customer: Yes, that sounds good.

Agent: Perfect! I've booked you for tomorrow at 9 AM. You'll receive a confirmation SMS."""

        return {
            "transcript": transcript,
            "appointment_booked": True,
            "booking_details": "Tomorrow 9 AM at local center",
            "objections_handled": ["cost"],
            "persuasion_techniques_used": ["cost_comparison", "urgency"]
        }