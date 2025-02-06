from flask import Blueprint, request, jsonify
import numpy as np
from PIL import Image
import io
from keras.applications.efficientnet import EfficientNetB0
from keras.applications.efficientnet import preprocess_input, decode_predictions

# Initialize Flask Blueprint
ai_bp = Blueprint('ai', __name__, url_prefix='/ai')

# Load EfficientNet model (pre-trained on ImageNet)
model = EfficientNetB0(weights="imagenet")

@ai_bp.route('/analyze', methods=['POST'])
def analyze_image():
    """
    Analyze an image using EfficientNet and return the top prediction.
    """
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files['image']
    image = Image.open(io.BytesIO(file.read())).convert("RGB")

    # Resize image to match EfficientNet input size (224x224)
    image = image.resize((224, 224))
    
    # Convert image to numpy array
    img_array = np.array(image)
    
    # Expand dimensions to match model input shape
    img_array = np.expand_dims(img_array, axis=0)

    # Preprocess image
    img_array = preprocess_input(img_array)

    # Make prediction
    predictions = model.predict(img_array)

    # Decode prediction to readable labels
    decoded_predictions = decode_predictions(predictions, top=3)[0]

    # Format response
    results = [{"label": pred[1], "probability": float(pred[2])} for pred in decoded_predictions]

    return jsonify({"predictions": results})

