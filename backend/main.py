import sys
import os

# Add backend directory to sys.path to support robust absolute imports in serverless deployments
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from typing import List, Optional
import uvicorn
import asyncio

import results_loader
import model_runner
import inference

app = FastAPI(title="Caltech-101 Experiment Tracker API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Initialize the results cache on startup
    results_loader.load_results()
    print("Backend started and results loaded.")

@app.get("/api/experiments")
async def get_all_experiments():
    """Return summary for all 24 experiments."""
    return results_loader.get_all_experiments()

@app.get("/api/experiment/{exp_id}")
async def get_experiment(exp_id: str):
    """Return full details for a specific experiment."""
    exp = results_loader.get_experiment(exp_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return exp

@app.post("/api/run")
async def run_model(arch: str = Form(...), optimizer: str = Form(...), batch_size: int = Form(...), augmented: bool = Form(...)):
    """
    Finds the matching experiment based on hyperparams, 
    simulates running a training/eval loop, and returns SSE stream.
    """
    exp_id = results_loader.find_experiment_id(arch, optimizer, batch_size, augmented)
    if not exp_id:
        raise HTTPException(status_code=404, detail="No matching experiment found")
    
    return EventSourceResponse(model_runner.run_eval_stream(exp_id))

@app.post("/api/infer")
async def infer_image(exp_id: str = Form(...), file: UploadFile = File(...)):
    """
    Predict the class of an uploaded image using the specified model.
    """
    exp = results_loader.get_experiment(exp_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    try:
        image_bytes = await file.read()
        results = await inference.predict(exp_id, image_bytes, exp['class_names'])
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/compare")
async def compare_experiments(ids: str = Query(..., description="Comma-separated experiment IDs")):
    """Side-by-side metrics for comparison."""
    exp_ids = ids.split(",")
    return results_loader.get_comparison(exp_ids)

@app.get("/api/architecture/{exp_id}")
async def get_architecture(exp_id: str):
    """Return layer-by-layer details."""
    exp = results_loader.get_experiment(exp_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return exp.get('architecture', [])

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
