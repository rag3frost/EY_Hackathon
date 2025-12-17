import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any
from utils.ueba_monitor import UEBAMonitor

class SchedulingAgent:
    def __init__(self, ueba_monitor: UEBAMonitor):
        self.ueba = ueba_monitor

    def book_appointment(self, vehicle_id: str, diagnosis_result: Dict[str, Any]) -> Dict[str, Any]:
        """Book service appointment based on diagnosis and availability"""
        # Check permissions
        permission_check = self.ueba.verify_action("Scheduling", "book_appointments", {"vehicle_id": vehicle_id})
        if not permission_check["allowed"]:
            return {"error": permission_check["anomaly"]["message"]}

        # Load service centers
        centers = self._load_service_centers()
        if not centers:
            return {"error": "No service centers available"}

        # Determine urgency
        risk_score = diagnosis_result.get("risk_score", 0)
        urgency = "urgent" if risk_score > 70 else "high" if risk_score > 40 else "normal"

        # Find best slot
        booking = self._find_optimal_slot(vehicle_id, centers, urgency)

        if booking:
            # Update availability (in real system, save to database)
            self._update_availability(centers, booking)

            result = {
                "vehicle_id": vehicle_id,
                "appointment_booked": True,
                "booking_details": booking,
                "urgency_level": urgency,
                "estimated_cost": self._estimate_cost(diagnosis_result),
                "parts_required": self._get_parts_list(diagnosis_result)
            }
        else:
            result = {
                "vehicle_id": vehicle_id,
                "appointment_booked": False,
                "reason": "No available slots",
                "next_available": self._get_next_available(centers),
                "urgency_level": urgency
            }

        return result

    def get_available_slots(self, center_id: str = None, days_ahead: int = 7) -> Dict[str, Any]:
        """Get available service slots"""
        centers = self._load_service_centers()

        if center_id:
            center = centers.get(center_id)
            if center:
                available = [slot for slot in center.get("available_slots", []) if self._is_future_slot(slot)]
                return {center_id: available[:days_ahead*8]}  # 8 slots per day
            else:
                return {"error": f"Center {center_id} not found"}

        # All centers
        result = {}
        for cid, center in centers.items():
            available = [slot for slot in center.get("available_slots", []) if self._is_future_slot(slot)]
            result[cid] = available[:days_ahead*8]

        return result

    def _load_service_centers(self) -> Dict[str, Any]:
        if os.path.exists('data/service_centers.json'):
            with open('data/service_centers.json', 'r') as f:
                return json.load(f)
        return {}

    def _find_optimal_slot(self, vehicle_id: str, centers: Dict[str, Any], urgency: str) -> Dict[str, Any]:
        """Find the best available slot based on urgency and location"""
        # Load vehicle for preferred center
        vehicles = self._load_vehicles()
        vehicle = next((v for v in vehicles if v["id"] == vehicle_id), None)
        preferred_center = vehicle.get("preferred_service_center", "Center_A") if vehicle else "Center_A"

        # Priority order based on urgency
        if urgency == "urgent":
            time_window = 1  # Next day
        elif urgency == "high":
            time_window = 3  # Next 3 days
        else:
            time_window = 7  # Next week

        # Check preferred center first
        booking = self._find_slot_in_center(centers.get(preferred_center), time_window)
        if booking:
            booking["center_id"] = preferred_center
            booking["center_name"] = centers[preferred_center]["name"]
            return booking

        # Check other centers
        for cid, center in centers.items():
            if cid != preferred_center:
                booking = self._find_slot_in_center(center, time_window)
                if booking:
                    booking["center_id"] = cid
                    booking["center_name"] = center["name"]
                    return booking

        return None

    def _find_slot_in_center(self, center: Dict[str, Any], days_ahead: int) -> Dict[str, Any]:
        """Find first available slot in center within days_ahead"""
        if not center:
            return None

        available_slots = center.get("available_slots", [])
        cutoff_date = datetime.now() + timedelta(days=days_ahead)

        for slot in available_slots:
            slot_datetime = datetime.fromisoformat(slot.replace('Z', '+00:00'))
            if slot_datetime > datetime.now() and slot_datetime < cutoff_date:
                return {
                    "date_time": slot,
                    "duration": "2 hours",  # Standard service time
                    "technician": f"Technician_{slot_datetime.hour % 3 + 1}"  # Mock assignment
                }

        return None

    def _update_availability(self, centers: Dict[str, Any], booking: Dict[str, Any]):
        """Remove booked slot from availability (mock)"""
        center_id = booking.get("center_id")
        slot = booking.get("date_time")
        if center_id in centers and slot in centers[center_id].get("available_slots", []):
            centers[center_id]["available_slots"].remove(slot)
            # In real system, save back to file/database

    def _is_future_slot(self, slot: str) -> bool:
        """Check if slot is in the future"""
        try:
            slot_datetime = datetime.fromisoformat(slot.replace('Z', '+00:00'))
            return slot_datetime > datetime.now()
        except:
            return False

    def _estimate_cost(self, diagnosis_result: Dict[str, Any]) -> str:
        """Estimate service cost based on diagnosis"""
        predictions = diagnosis_result.get("predicted_failures", [])
        if predictions:
            # Sum up cost estimates
            total = 0
            for pred in predictions:
                cost_range = pred.get("cost_estimate", "₹0")
                # Extract first number from range
                try:
                    cost = int(''.join(filter(str.isdigit, cost_range.split('-')[0])))
                    total += cost
                except:
                    total += 3500  # Default
            return f"₹{total}"
        return "₹3,500"  # Base service

    def _get_parts_list(self, diagnosis_result: Dict[str, Any]) -> List[str]:
        """Get list of parts needed"""
        predictions = diagnosis_result.get("predicted_failures", [])
        parts = []

        for pred in predictions:
            component = pred.get("component", "")
            if "oil" in component.lower():
                parts.extend(["Oil filter", "4L synthetic oil"])
            elif "brake" in component.lower():
                parts.extend(["Brake pads", "Brake rotors"])
            elif "battery" in component.lower():
                parts.append("Car battery")
            elif "tire" in component.lower():
                parts.append("Tire set")

        if not parts:
            parts = ["General service parts"]

        return parts

    def _get_next_available(self, centers: Dict[str, Any]) -> Dict[str, Any]:
        """Get next available slots across all centers"""
        next_slots = {}
        for cid, center in centers.items():
            available = [slot for slot in center.get("available_slots", []) if self._is_future_slot(slot)]
            if available:
                next_slots[cid] = sorted(available)[:3]  # Next 3 slots

        return next_slots

    def _load_vehicles(self) -> List[Dict[str, Any]]:
        if os.path.exists('data/vehicles.json'):
            with open('data/vehicles.json', 'r') as f:
                return json.load(f)
        return []