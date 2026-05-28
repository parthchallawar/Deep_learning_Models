import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RESULTS_FILE = os.path.join(BASE_DIR, "results.json")
MOCK_RESULTS_FILE = os.path.join(BASE_DIR, "..", "frontend", "src", "utils", "mock_results.json")
_results_cache = []

def load_results():
    global _results_cache
    
    # Try to load real results
    if os.path.exists(RESULTS_FILE):
        with open(RESULTS_FILE, 'r') as f:
            _results_cache = json.load(f)
            return

    # Fallback to mock results
    if os.path.exists(MOCK_RESULTS_FILE):
        with open(MOCK_RESULTS_FILE, 'r') as f:
            _results_cache = json.load(f)
            return
            
    print(f"Warning: Neither {RESULTS_FILE} nor {MOCK_RESULTS_FILE} found.")
    _results_cache = []

def get_all_experiments():
    return _results_cache

def get_experiment(exp_id: str):
    for exp in _results_cache:
        if exp["exp_id"] == exp_id:
            return exp
    return None

def find_experiment_id(arch: str, optimizer: str, batch_size: int, augmented: bool):
    for exp in _results_cache:
        if (exp["arch"] == arch and 
            exp["optimizer"] == optimizer and 
            exp["batch_size"] == batch_size and 
            exp["augmented"] == augmented):
            return exp["exp_id"]
    return None

def get_comparison(exp_ids: list):
    comparison = []
    for exp_id in exp_ids:
        exp = get_experiment(exp_id)
        if exp:
            comparison.append(exp)
    return comparison
