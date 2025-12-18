# 🚗 AutoAide AI - Automotive Predictive Maintenance System

<div align="center">

![AutoAide AI](https://img.shields.io/badge/AutoAide-AI%20Powered-00f0ff?style=for-the-badge&logo=openai&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-LLM-FF6B35?style=for-the-badge&logo=openai&logoColor=white)

**An Agentic AI Solution for Automotive Predictive Maintenance**

*Master Agent orchestrating 6 Worker AI Agents for end-to-end vehicle maintenance automation*

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Agent System](#-agent-system)

---

## 🎯 Overview

AutoAide AI is a comprehensive **Agentic AI solution** designed for automotive OEMs to provide intelligent aftersales maintenance services. The system monitors 10+ vehicles with real-time telematics, predicts failures before they occur, and autonomously handles customer engagement through voice-based AI conversations.

### Business Context
- 🇮🇳 Automotive OEM in India providing aftersales maintenance
- 📡 Real-time telematics monitoring for vehicle fleet
- 🤖 Master Agent orchestrating 6 specialized Worker AI agents
- 🔄 End-to-end automation: Prediction → Engagement → Scheduling → Feedback

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **🔮 Predictive Analytics** | AI-powered failure prediction using sensor data analysis |
| **🗣️ Voice AI Agent** | Maya - Conversational AI for customer engagement |
| **📅 Smart Scheduling** | Autonomous service appointment booking |
| **🏭 RCA/CAPA Analysis** | Root Cause Analysis with manufacturing feedback |
| **🛡️ UEBA Security** | User Entity Behavior Analytics for agent monitoring |
| **📊 Real-time Dashboard** | Interactive monitoring with health scores |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MASTER AGENT                              │
│                   (Orchestration Layer)                          │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌───────────┐  ┌───────────┐  ┌───────────┐
│   Data    │  │ Diagnosis │  │ Customer  │
│ Analysis  │  │   Agent   │  │Engagement │
│   Agent   │  │           │  │   Agent   │
└───────────┘  └───────────┘  └───────────┘
        │             │             │
        ▼             ▼             ▼
┌───────────┐  ┌───────────┐  ┌───────────┐
│Scheduling │  │ Feedback  │  │Manufacturing│
│   Agent   │  │   Agent   │  │  Insights   │
└───────────┘  └───────────┘  └─────────────┘
                      │
                      ▼
            ┌─────────────────┐
            │  UEBA Monitor   │
            │ (Security Layer)│
            └─────────────────┘
```

---

## 📸 Screenshots

### 1. Vehicle Diagnostics Dashboard
The main diagnostics view featuring a 3D car model with interactive part selection and real-time sensor readings.

![Vehicle Diagnostics](demo/Screenshot%202025-12-17%20232648.png)
*Interactive 3D vehicle model with AI-powered diagnostics and health scoring*

---

### 2. Vehicle Fleet Monitoring
Grid view of all monitored vehicles with health scores, sensor alerts, and quick status indicators.

![Fleet Monitoring](demo/Screenshot%202025-12-17%20222314.png)
*Fleet overview showing 10 vehicles with color-coded health status (Green/Yellow/Red)*

---

### 3. Agent Orchestration View
Visualization of the Master Agent coordinating with 6 Worker Agents in real-time workflows.

![Agent Orchestration](demo/Screenshot%202025-12-17%20222114.png)
*Master Agent orchestrating Data Analysis, Diagnosis, Customer Engagement, Scheduling, Feedback, and Manufacturing agents*

---

### 4. Voice AI Customer Engagement
Maya - the AI voice agent conducting persuasive customer conversations for service booking.

![Voice Agent](demo/Screenshot%202025-12-17%20222549.png)
*AI-powered voice conversations with transcript, sentiment analysis, and persuasion tactics*

---

### 5. Service Scheduling Calendar
Smart scheduling system with service center capacity management and appointment optimization.

![Service Scheduling](demo/Screenshot%202025-12-17%20222723.png)
*Weekly calendar view with service center cards, capacity bars, and booked appointments*

---

### 6. Service Demand Forecasting
AI-powered demand prediction for service centers with capacity planning insights.

![Demand Forecast](demo/Screenshot%202025-12-18%20082414.png)
*Predictive analytics for service demand with weekly forecasts and AI recommendations*

---

### 7. Manufacturing Insights (RCA/CAPA)
Root Cause Analysis and Corrective Action dashboard for manufacturing feedback loop.

![Manufacturing Insights](demo/Screenshot%202025-12-18%20084052.png)
*Defect pattern detection, supplier analysis, and corrective action tracking*

---

### 8. UEBA Security Monitor
User Entity Behavior Analytics for monitoring agent activities and detecting anomalies.

![Security Monitor](demo/Screenshot%202025-12-18%20082757.png)
*Real-time security scoring, activity logs, and agent permission matrix*

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI Framework
- **Tailwind CSS** - Styling
- **Three.js / React Three Fiber** - 3D Car Model
- **Lucide React** - Icons
- **Vite** - Build Tool

### Backend
- **FastAPI** - Python API Framework
- **Groq** - LLM Provider (Llama 3.1)
- **Pydantic** - Data Validation
- **Uvicorn** - ASGI Server

### AI/ML
- **Groq API** - Fast LLM Inference
- **Custom Agents** - Specialized AI workers
- **UEBA** - Security monitoring

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Groq API Key (free at [console.groq.com](https://console.groq.com))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/rag3frost/EY_Hackathon
cd EY_Hackathon
```

2. **Setup Backend**
```bash
cd automotive-ai
pip install -r requirements.txt

# Create .env file
echo "GROQ_API_KEY=your_groq_api_key_here" > .env

# Generate sample data
python generate_data.py

# Start the server
python main.py
```

3. **Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

4. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/vehicles` | List all vehicles |
| `GET` | `/vehicles/{id}` | Get vehicle details |
| `GET` | `/vehicles/{id}/health` | Get health analysis |
| `POST` | `/vehicles/{id}/predict` | Predict failures |
| `POST` | `/vehicles/{id}/engage` | Start customer engagement |
| `POST` | `/vehicles/{id}/schedule` | Schedule service |
| `POST` | `/vehicles/{id}/orchestrate` | Run full workflow |
| `POST` | `/chat` | AI Assistant chat |
| `GET` | `/service-centers` | Get service centers |
| `GET` | `/manufacturing/insights` | Get RCA/CAPA data |
| `GET` | `/security/logs` | Get UEBA logs |
| `GET` | `/agent-status` | Get all agent statuses |

---

## 🤖 Agent System

### Master Agent
The orchestrator that coordinates all worker agents and manages the complete maintenance workflow.

### Worker Agents

| Agent | Responsibility |
|-------|----------------|
| **Data Analysis** | Sensor data processing and health scoring |
| **Diagnosis** | Failure prediction and issue identification |
| **Customer Engagement** | Voice-based persuasive conversations |
| **Scheduling** | Appointment booking and optimization |
| **Feedback** | Customer satisfaction and NPS tracking |
| **Manufacturing Insights** | RCA/CAPA analysis for production feedback |

### UEBA Security Monitor
- Monitors all agent activities
- Detects anomalous behavior patterns
- Enforces permission boundaries
- Maintains security score (target: 95+)

---

## 📄 License

This project is built for demonstration purposes as part of a business challenge presentation.

---

<div align="center">

**Built with ❤️ for Automotive Innovation**

*Powered by Agentic AI*

</div>
