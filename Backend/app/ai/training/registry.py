import os
import json
from datetime import datetime, timezone

REGISTRY_FILE = "Backend/app/ai/artifacts/registry.json"

def _load_registry():
    if not os.path.exists(REGISTRY_FILE):
        return []
    with open(REGISTRY_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def _save_registry(registry):
    os.makedirs(os.path.dirname(REGISTRY_FILE), exist_ok=True)
    with open(REGISTRY_FILE, "w", encoding="utf-8") as f:
        json.dump(registry, f, indent=4)

def register_model(model_name, version, model_type, metrics, artifact_path, status="candidate"):
    registry = _load_registry()
    
    for entry in registry:
        if entry["model_name"] == model_name and entry["version"] == version:
            entry["metrics"] = metrics
            entry["artifact_path"] = artifact_path
            entry["status"] = status
            entry["updated_at"] = datetime.now(timezone.utc).isoformat()
            _save_registry(registry)
            return entry
            
    entry = {
        "model_name": model_name,
        "version": version,
        "model_type": model_type,
        "metrics": metrics,
        "artifact_path": artifact_path,
        "status": status,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    registry.append(entry)
    _save_registry(registry)
    return entry

def get_production_model(model_name):
    registry = _load_registry()
    prod_models = [m for m in registry if m["model_name"] == model_name and m["status"] == "production"]
    if not prod_models:
        return None
    prod_models.sort(key=lambda x: x["updated_at"], reverse=True)
    return prod_models[0]
