from pathlib import Path
import numpy as np
from typing import Dict, Any

def map_training_data(results, csv_data: list, model, concurrent_trainings: int) -> dict:
    """Combine YOLO results, CSV data, and model info into API-ready format."""
    
    # Get class names from model
    class_names = []
    if hasattr(model, "names"):
        if isinstance(model.names, dict):
            class_names = list(model.names.values())
        elif isinstance(model.names, (list, tuple)):
            class_names = model.names
        else:
            class_names = []

    # Base structure
    mapped = {
        "metadata": {
            "task": getattr(results, "task", "classify"),
            "total_epochs": len(csv_data),
            "class_names": class_names
        },
        "metrics": {
            "summary": {
                "fitness": getattr(results, "fitness", None),
                "top1_accuracy": getattr(results, "top1", None),
                "top5_accuracy": getattr(results, "top5", None),
                "confusion_matrix": parse_confusion_matrix(results, class_names),
                "final_metrics": getattr(results, "results_dict", {})
            },
            "epochs": [],
            "system": {}
        }
    }

    # Add epoch details from CSV data
    for epoch in csv_data:
        mapped["metrics"]["epochs"].append({
            "epoch": epoch.get("epoch"),
            "time": epoch.get("time"),
            "training": {
                "loss": epoch.get("train/loss"),
                "learning_rates": {
                    "pg0": epoch.get("lr/pg0"),
                    "pg1": epoch.get("lr/pg1"),
                    "pg2": epoch.get("lr/pg2")
                }
            },
            "validation": {
                "loss": epoch.get("val/loss"),
                "accuracy_top1": epoch.get("metrics/accuracy_top1"),
                "accuracy_top5": epoch.get("metrics/accuracy_top5")
            }
        })

    # Add system metrics
    if hasattr(results, "speed"):
        mapped["metrics"]["system"] = {
            "preprocess_ms": results.speed.get("preprocess", 0) * 1000,
            "inference_ms": results.speed.get("inference", 0) * 1000,
            "postprocess_ms": results.speed.get("postprocess", 0) * 1000,
            "loss_calculation_ms": results.speed.get("loss", 0) * 1000,
            "concurrent_trainings": concurrent_trainings
        }

    return mapped

def parse_confusion_matrix(results, class_names: list) -> Dict[str, Any]:
    """Extract and format confusion matrix data with provided class names."""
    if not hasattr(results, "confusion_matrix") or not results.confusion_matrix:
        return None
    
    try:
        return {
            "matrix": results.confusion_matrix.matrix.tolist(),
            "class_names": class_names,  # Use names from model
            "normalized": False
        }
    except AttributeError as e:
        print(f"Matrix parsing error: {e}")
        return None