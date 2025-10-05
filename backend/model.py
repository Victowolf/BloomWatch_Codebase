import os
import json
import pickle
from dotenv import load_dotenv

# Load .env
load_dotenv()

# Path to your .pkl model
MODEL_PATH = os.getenv("ML_MODEL_PATH", "Bloom.pkl")

# Load model once
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

def get_model_response(prompt: str) -> str:
    """
    Generate JSON output using a local ML model (.pkl).
    The model takes text input and outputs a JSON-serializable object.
    """
    try:
        # Get model prediction
        result = model.predict([prompt])

        # If result is not a string, convert to JSON string
        if not isinstance(result, str):
            return json.dumps(result[0]) if isinstance(result, list) else json.dumps(result)

        return result

    except Exception as e:
        raise Exception(f"Local ML Model Error: {str(e)}")
