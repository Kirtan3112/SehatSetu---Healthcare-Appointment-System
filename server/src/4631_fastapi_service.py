"""
SehatSetu Healthcare Appointment System - FastAPI Analytics & Triage Microservice
Group Code: 4631
Course: JavaScript Framework (PBL) - C2620A3
Provides independent, high-performance Python microservice endpoints for:
1. Patient Clinical Triage & Urgency Assessment
2. Doctor Wait-time & Appointment Demand Forecasting
3. Automated Reminder Trigger Dispatching
"""

import os
from typing import List, Optional
from datetime import datetime
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="SehatSetu Health Analytics & Triage Microservice (4631)",
    description="Dedicated Python FastAPI microservice for AI triage scoring, appointment analytics, and clinical reminder services.",
    version="1.0.0"
)

# Enable CORS for React frontend and Express backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Data Models ---

class TriageRequest(BaseModel):
    patient_id: str = Field(..., description="Unique patient identifier")
    age: int = Field(..., ge=0, le=125, description="Patient age in years")
    reason: str = Field(..., min_length=3, description="Appointment consultation reason")
    symptoms: List[str] = Field(default=[], description="List of reported clinical symptoms")
    has_pre_existing_conditions: bool = Field(default=False)

class TriageResponse(BaseModel):
    urgency_level: str = Field(..., description="ROUTINE, URGENT, or PRIORITY")
    triage_score: float = Field(..., description="Urgency index between 1.0 and 10.0")
    recommended_department: str
    estimated_consultation_minutes: int
    recommendations: List[str]

class DemandForecastRequest(BaseModel):
    department_id: str
    department_name: str
    booked_slots_count: int
    total_slots_count: int
    date: str

class DemandForecastResponse(BaseModel):
    department: str
    occupancy_rate: float
    capacity_status: str
    wait_time_minutes_estimate: int
    peak_hours: List[str]

class ReminderDispatchRequest(BaseModel):
    appointment_id: str
    patient_email: str
    doctor_name: str
    scheduled_time: str

# --- Endpoints ---

@app.get("/api/py/health", tags=["Telemetry"])
def health_check():
    return {
        "status": "HEALTHY",
        "service": "SehatSetu FastAPI Analytics Microservice",
        "group_code": "4631",
        "timestamp": datetime.utcnow().isoformat(),
        "documentation": "/docs"
    }

@app.post("/api/py/triage", response_model=TriageResponse, tags=["Clinical Triage"])
def assess_patient_triage(request: TriageRequest):
    """
    Evaluates patient symptoms, consultation reason, and clinical urgency score.
    """
    urgent_keywords = ["chest pain", "breathing difficulty", "severe bleeding", "acute trauma", "high fever", "unconscious"]
    reason_lower = request.reason.lower()
    
    score = 2.0
    for kw in urgent_keywords:
        if kw in reason_lower or any(kw in s.lower() for s in request.symptoms):
            score += 4.5

    if request.has_pre_existing_conditions:
        score += 1.5

    if request.age < 5 or request.age > 70:
        score += 1.0

    score = min(max(round(score, 1), 1.0), 10.0)

    if score >= 7.0:
        urgency = "URGENT"
        dept = "Cardiology" if "chest" in reason_lower else "Emergency & Critical Care"
        minutes = 45
        recs = ["Immediate clinical attention recommended", "Notify attending triage physician", "Prepare diagnostic vitals"]
    elif score >= 4.0:
        urgency = "PRIORITY"
        dept = "General Medicine"
        minutes = 30
        recs = ["Same-day consultation priority", "Monitor vital signs prior to physician encounter"]
    else:
        urgency = "ROUTINE"
        dept = "Outpatient Clinic"
        minutes = 20
        recs = ["Standard outpatient scheduling", "No acute emergency markers identified"]

    return TriageResponse(
        urgency_level=urgency,
        triage_score=score,
        recommended_department=dept,
        estimated_consultation_minutes=minutes,
        recommendations=recs
    )

@app.post("/api/py/demand-forecast", response_model=DemandForecastResponse, tags=["Analytics"])
def forecast_department_demand(request: DemandForecastRequest):
    """
    Forecasts clinic waiting times and department capacity occupancy rate.
    """
    total = max(request.total_slots_count, 1)
    occupancy = round((request.booked_slots_count / total) * 100, 1)

    if occupancy > 85.0:
        status_str = "CRITICAL_CAPACITY"
        wait_mins = 35
    elif occupancy > 60.0:
        status_str = "MODERATE_CAPACITY"
        wait_mins = 15
    else:
        status_str = "OPTIMAL_AVAILABILITY"
        wait_mins = 5

    return DemandForecastResponse(
        department=request.department_name,
        occupancy_rate=occupancy,
        capacity_status=status_str,
        wait_time_minutes_estimate=wait_mins,
        peak_hours=["09:30 - 11:30", "15:00 - 17:00"]
    )

@app.post("/api/py/reminders/dispatch", tags=["Reminders"])
def dispatch_automated_reminder(request: ReminderDispatchRequest):
    """
    Simulates sending multi-channel automated appointment reminder SMS and Email.
    """
    return {
        "success": True,
        "appointment_id": request.appointment_id,
        "dispatched_to": request.patient_email,
        "message": f"Reminder successfully queued: Appointment with {request.doctor_name} at {request.scheduled_time}.",
        "channel": "SMS & Email",
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    print("Starting SehatSetu FastAPI Analytics Microservice on port 8000...")
    uvicorn.run("4631_fastapi_service:app", host="127.0.0.1", port=8000, reload=True)
