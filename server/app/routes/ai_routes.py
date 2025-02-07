import json
import requests
from flask import Blueprint, request, jsonify
import numpy as np
from PIL import Image
import io
import tensorflow as tf
import tensorflow_hub as hub

# Suppress TensorFlow warnings
import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

# Initialize Flask Blueprint
ai_bp = Blueprint('ai', __name__, url_prefix='/ai')

# Load EfficientNetB0 from TensorFlow Hub
MODEL_URL = "https://tfhub.dev/google/efficientnet/b0/classification/1"
model = hub.load(MODEL_URL)

# Load ImageNet labels
IMAGENET_LABELS_URL = "https://storage.googleapis.com/download.tensorflow.org/data/imagenet_class_index.json"
imagenet_labels = requests.get(IMAGENET_LABELS_URL).json()

@ai_bp.route('/analyze', methods=['POST'])
def analyze_image():
    """
    Analyze an image using EfficientNetB0 and return the top predictions.
    """
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    try:
        # Load image from request
        file = request.files['image']
        image = Image.open(file.stream).convert("RGB")

        # Resize image to EfficientNet input size
        image = image.resize((224, 224))

        # Convert to numpy array
        img_array = np.array(image, dtype=np.float32)

        # Normalize pixel values
        img_array = img_array / 255.0

        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)

        # Convert NumPy array to TensorFlow Tensor
        img_tensor = tf.convert_to_tensor(img_array, dtype=tf.float32)

        # Extract the correct function for inference
        classifier = model.signatures["default"]

        # Run inference
        output = classifier(img_tensor)

        # Get correct output key dynamically
        output_key = list(output.keys())[0]
        predictions = output[output_key].numpy()

        # Get top predictions
        top_predictions = np.argsort(predictions[0])[::-1][:3]

        # Convert numerical labels to class names
        results = [
            {
                "label": imagenet_labels[str(idx)][1],  # Convert index to class name
                "probability": float(predictions[0][idx])
            }
            for idx in top_predictions
        ]

        return jsonify({"predictions": results})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
