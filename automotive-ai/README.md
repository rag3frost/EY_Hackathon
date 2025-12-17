# Automotive Predictive Maintenance Backend

A FastAPI-based backend system for automotive predictive maintenance with Agentic AI orchestration.

## Features

- **6 AI Agents**: Data Analysis, Diagnosis, Customer Engagement, Scheduling, Feedback, Manufacturing Insights
- **Master Orchestrator**: Coordinates workflow from detection to manufacturing feedback
- **UEBA Security**: Monitors agent behavior and detects anomalies
- **Voice Synthesis**: Generates customer conversation audio
- **Predictive Maintenance**: Rule-based failure prediction with risk scoring
- **Manufacturing RCA/CAPA**: Pattern analysis and quality feedback

## Setup Instructions

### 1. Prerequisites
- Python 3.8+
- Groq API key (free from https://console.groq.com/)

### 2. Installation
```bash
cd automotive-ai
pip install -r requirements.txt
```

### 3. Environment Setup
```bash
cp .env.example .env
# Edit .env and add your Groq API key
```

### 4. Generate Synthetic Data
```bash
python generate_data.py
```

### 5. Run the API
```bash
python main.py
```

The API will be available at http://localhost:8000

## API Endpoints

### Vehicles
```bash
# List all vehicles
curl http://localhost:8000/vehicles

# Get specific vehicle
curl http://localhost:8000/vehicles/VEH001

# Get vehicle health analysis
curl http://localhost:8000/vehicles/VEH001/health

# Predict failures
curl -X POST http://localhost:8000/vehicles/VEH001/predict

# Start customer engagement
curl -X POST http://localhost:8000/vehicles/VEH001/engage

# Book service appointment
curl -X POST http://localhost:8000/vehicles/VEH001/schedule

# Run full orchestration workflow
curl -X POST http://localhost:8000/vehicles/VEH001/orchestrate
```

### Service Centers
```bash
# Get available slots
curl http://localhost:8000/service-centers
```

### Manufacturing Insights
```bash
# Get RCA/CAPA analysis
curl http://localhost:8000/manufacturing/insights
```

### Security & Monitoring
```bash
# Get security logs
curl http://localhost:8000/security/logs

# Check agent action (example)
curl -X POST "http://localhost:8000/security/check-action?agent=DataAnalysis&action=read_vehicle_data"

# Get agent status
curl http://localhost:8000/agent-status

# Get feedback summary
curl http://localhost:8000/feedback/summary
```

## Agent Workflow

The system follows this orchestrated workflow:

1. **Data Analysis Agent**: Analyzes sensor data for anomalies
2. **Diagnosis Agent**: Predicts failures and calculates risk scores
3. **Customer Engagement Agent**: Conducts persuasive conversations (uses Groq AI)
4. **Scheduling Agent**: Books optimal service appointments
5. **Feedback Agent**: Collects post-service satisfaction surveys
6. **Manufacturing Insights Agent**: Performs RCA/CAPA analysis for quality improvement

## Key Features

- **Risk Scoring**: 0-100 scale based on sensor anomalies, mileage, and service history
- **Voice Synthesis**: Generates MP3 files for customer conversations using Edge-TTS
- **UEBA Monitoring**: Logs all agent actions and detects permission violations
- **Manufacturing Feedback**: Identifies failure patterns and recommends corrective actions
- **Persuasive AI**: Uses Groq LLM for natural, objection-handling conversations

## Data Files

- `data/vehicles.json`: 10 vehicle records with sensor data
- `data/maintenance_history.json`: Historical service records
- `data/service_centers.json`: Service center availability
- `data/rca_capa_data.json`: Manufacturing quality data
- `data/security_logs.json`: UEBA activity logs (generated)

## Example Usage

For a vehicle with issues (VEH001 has low oil pressure):

```bash
# Check health
curl http://localhost:8000/vehicles/VEH001/health

# Predict failures
curl -X POST http://localhost:8000/vehicles/VEH001/predict

# Run full workflow
curl -X POST http://localhost:8000/vehicles/VEH001/orchestrate
```

This will trigger the complete maintenance workflow, potentially booking a service appointment and generating manufacturing insights.

## Security

The system includes UEBA (User and Entity Behavior Analytics) monitoring:
- Permission checking for all agent actions
- Anomaly detection (high frequency, unauthorized access)
- Comprehensive logging with timestamps
- Security score calculation

## Voice Synthesis

Customer conversations are synthesized to MP3 files in the `conversations/` directory using Microsoft Edge TTS voices.

## Manufacturing Feedback Loop

The system analyzes maintenance patterns to identify:
- Component failure trends
- Supplier quality issues
- Design flaws
- Corrective and preventive action recommendations

This creates a closed-loop system from vehicle monitoring to manufacturing improvement.