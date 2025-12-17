from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from agents.master_agent import MasterAgent

app = FastAPI(title="Automotive Predictive Maintenance API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize master agent
master_agent = MasterAgent()

@app.get("/")
async def root():
    return {"message": "Automotive Predictive Maintenance API", "status": "running"}

@app.get("/vehicles")
async def get_vehicles():
    """List all vehicles"""
    try:
        with open('data/vehicles.json', 'r') as f:
            vehicles = json.load(f)
        return {"vehicles": vehicles, "count": len(vehicles)}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Vehicles data not found")

@app.get("/vehicles/{vehicle_id}")
async def get_vehicle(vehicle_id: str):
    """Get vehicle details"""
    try:
        with open('data/vehicles.json', 'r') as f:
            vehicles = json.load(f)
        vehicle = next((v for v in vehicles if v["id"] == vehicle_id), None)
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        return vehicle
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Vehicles data not found")

@app.get("/vehicles/{vehicle_id}/health")
async def get_vehicle_health(vehicle_id: str):
    """Get vehicle health analysis"""
    result = master_agent.data_agent.analyze_vehicle(vehicle_id)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.post("/vehicles/{vehicle_id}/predict")
async def predict_failures(vehicle_id: str):
    """Predict vehicle failures"""
    # First get analysis
    analysis = master_agent.data_agent.analyze_vehicle(vehicle_id)
    if "error" in analysis:
        raise HTTPException(status_code=400, detail=analysis["error"])

    # Then diagnose
    result = master_agent.diagnosis_agent.diagnose_issues(vehicle_id, analysis)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.post("/vehicles/{vehicle_id}/engage")
async def engage_customer(vehicle_id: str):
    """Start customer engagement conversation"""
    # Get diagnosis first
    analysis = master_agent.data_agent.analyze_vehicle(vehicle_id)
    if "error" in analysis:
        raise HTTPException(status_code=400, detail=analysis["error"])

    diagnosis = master_agent.diagnosis_agent.diagnose_issues(vehicle_id, analysis)
    if "error" in diagnosis:
        raise HTTPException(status_code=400, detail=diagnosis["error"])

    result = master_agent.engagement_agent.start_conversation(vehicle_id, diagnosis)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.post("/vehicles/{vehicle_id}/schedule")
async def schedule_service(vehicle_id: str):
    """Book service appointment"""
    # Get diagnosis first
    analysis = master_agent.data_agent.analyze_vehicle(vehicle_id)
    if "error" in analysis:
        raise HTTPException(status_code=400, detail=analysis["error"])

    diagnosis = master_agent.diagnosis_agent.diagnose_issues(vehicle_id, analysis)
    if "error" in diagnosis:
        raise HTTPException(status_code=400, detail=diagnosis["error"])

    result = master_agent.scheduling_agent.book_appointment(vehicle_id, diagnosis)
    return result

@app.post("/vehicles/{vehicle_id}/orchestrate")
async def orchestrate_workflow(vehicle_id: str):
    """Run full orchestration workflow"""
    result = master_agent.orchestrate_maintenance_workflow(vehicle_id)
    return result

@app.get("/service-centers")
async def get_service_centers():
    """Get available service slots"""
    result = master_agent.scheduling_agent.get_available_slots()
    return result

@app.get("/manufacturing/insights")
async def get_manufacturing_insights():
    """Get RCA/CAPA manufacturing analysis"""
    result = master_agent.manufacturing_agent.analyze_patterns()
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.get("/security/logs")
async def get_security_logs(limit: int = 50):
    """Get UEBA security logs"""
    logs = master_agent.ueba.get_logs(limit)
    return {"logs": logs, "security_score": master_agent.ueba.get_security_score()}

@app.post("/security/check-action")
async def check_agent_action(agent: str, action: str, data: dict = None):
    """Verify agent action for security"""
    result = master_agent.ueba.verify_action(agent, action, data)
    return result

@app.get("/agent-status")
async def get_agent_status():
    """Get status of all agents"""
    return master_agent.get_agent_status()

@app.get("/feedback/summary")
async def get_feedback_summary():
    """Get feedback summary statistics"""
    return master_agent.feedback_agent.get_feedback_summary()

# ============= AI Chat Endpoint =============
from pydantic import BaseModel
from typing import List, Optional
from groq import Groq

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    vehicle_id: Optional[str] = None

@app.post("/chat")
async def chat_with_ai(request: ChatRequest):
    """AI Assistant chat endpoint with knowledge of vehicle data"""
    try:
        # Gather context from the API
        context_data = await _gather_chat_context(request.vehicle_id)
        
        # Build system prompt with API knowledge
        system_prompt = _build_system_prompt(context_data)
        
        # Build conversation messages
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history
        for msg in request.history[-10:]:  # Keep last 10 messages for context
            messages.append({"role": msg.role, "content": msg.content})
        
        # Add current user message
        messages.append({"role": "user", "content": request.message})
        
        # Call Groq LLM
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
        )
        
        response_text = completion.choices[0].message.content
        
        return {
            "response": response_text,
            "context_used": {
                "vehicle_count": len(context_data.get("vehicles", [])),
                "has_vehicle_context": request.vehicle_id is not None
            }
        }
        
    except Exception as e:
        return {
            "response": f"I apologize, but I'm having trouble processing your request. Please try again. Error: {str(e)}",
            "error": str(e)
        }

async def _gather_chat_context(vehicle_id: Optional[str] = None) -> dict:
    """Gather relevant data from APIs for chat context"""
    context = {}
    
    try:
        # Load vehicles
        with open('data/vehicles.json', 'r') as f:
            vehicles = json.load(f)
            context["vehicles"] = vehicles
            context["vehicle_summary"] = [
                {"id": v["id"], "model": v["model"], "owner": v["owner"], "health": v.get("health_score", "N/A")} 
                for v in vehicles[:10]
            ]
    except:
        context["vehicles"] = []
    
    try:
        # Load service centers
        with open('data/service_centers.json', 'r') as f:
            context["service_centers"] = json.load(f)
    except:
        context["service_centers"] = []
    
    try:
        # Load maintenance history
        with open('data/maintenance_history.json', 'r') as f:
            context["maintenance_history"] = json.load(f)
    except:
        context["maintenance_history"] = []
    
    # If specific vehicle requested, get detailed info
    if vehicle_id:
        try:
            vehicle = next((v for v in context.get("vehicles", []) if v["id"] == vehicle_id), None)
            if vehicle:
                context["selected_vehicle"] = vehicle
                # Get health analysis
                analysis = master_agent.data_agent.analyze_vehicle(vehicle_id)
                if "error" not in analysis:
                    context["vehicle_health"] = analysis
                # Get predictions
                diagnosis = master_agent.diagnosis_agent.diagnose_issues(vehicle_id, analysis)
                if "error" not in diagnosis:
                    context["vehicle_diagnosis"] = diagnosis
        except Exception as e:
            context["vehicle_error"] = str(e)
    
    return context

def _build_system_prompt(context: dict) -> str:
    """Build system prompt with API knowledge"""
    
    vehicles_info = ""
    if context.get("vehicle_summary"):
        vehicles_info = "Available vehicles in the system:\n"
        for v in context["vehicle_summary"]:
            vehicles_info += f"- {v['id']}: {v['model']} (Owner: {v['owner']})\n"
    
    service_centers_info = ""
    if context.get("service_centers"):
        service_centers_info = "\nService Centers:\n"
        centers = context["service_centers"]
        # Handle both dict and list formats
        if isinstance(centers, dict):
            for center_id, center in list(centers.items())[:5]:
                service_centers_info += f"- {center.get('name', center_id)}: {center.get('location', 'Unknown location')}\n"
        else:
            for center in centers[:5]:
                service_centers_info += f"- {center.get('name', 'Unknown')}: {center.get('location', 'Unknown location')}\n"
    
    selected_vehicle_info = ""
    if context.get("selected_vehicle"):
        v = context["selected_vehicle"]
        selected_vehicle_info = f"""
Currently Selected Vehicle:
- ID: {v.get('id')}
- Model: {v.get('model')}
- Owner: {v.get('owner')}
- Mileage: {v.get('mileage', 'N/A')} km
- Last Service: {v.get('last_service', 'N/A')}
"""
        if context.get("vehicle_health"):
            h = context["vehicle_health"]
            selected_vehicle_info += f"""
Health Analysis:
- Health Score: {h.get('health_score', 'N/A')}/100
- Risk Level: {h.get('risk_level', 'N/A')}
- Critical Alerts: {len(h.get('alerts', []))}
"""
        if context.get("vehicle_diagnosis"):
            d = context["vehicle_diagnosis"]
            if d.get("predicted_failures"):
                selected_vehicle_info += "\nPredicted Issues:\n"
                for p in d["predicted_failures"][:3]:
                    selected_vehicle_info += f"- {p.get('component')}: {p.get('failure_type')} (Probability: {p.get('probability', 'N/A')}%, Cost: ₹{p.get('cost_estimate', 'N/A')})\n"

    system_prompt = f"""You are Maya, an expert AI assistant for AutoAide - an automotive predictive maintenance platform. You help customers with:

1. **Vehicle Diagnostics**: Explain sensor data, health scores, and potential issues
2. **Failure Predictions**: Describe predicted failures and their urgency
3. **Service Scheduling**: Help book appointments at service centers
4. **Maintenance Advice**: Provide tips and recommendations
5. **Cost Estimates**: Explain repair costs and priorities

Your Knowledge Base:
{vehicles_info}
{service_centers_info}
{selected_vehicle_info}

Guidelines:
- Be helpful, professional, and concise
- Use the vehicle data provided to give accurate answers
- If asked about a specific vehicle, use the data from the system
- Recommend scheduling service for critical issues
- Provide cost estimates in Indian Rupees (₹) when relevant
- If you don't have specific data, acknowledge it and provide general guidance
- Keep responses focused and under 200 words unless more detail is needed

Remember: You have access to real-time vehicle sensor data, maintenance history, and predictive analytics."""

    return system_prompt

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)