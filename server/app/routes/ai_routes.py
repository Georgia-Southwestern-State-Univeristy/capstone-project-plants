from flask import Blueprint, request, jsonify
from tensorflow.keras.models import load_model
import torch
from PIL import Image
import io

bp = Blueprint('ai', __name__, url_prefix='/ai')

# Load models
inception_model = load_model('path/to/inceptionv3_model.h5')
yolo_model = torch.hub.load('ultralytics/yolov5', 'custom', path='path/to/yolov5_model.pt')

@bp.route('/analyze', methods=['POST'])
def analyze_image():
    file = request.files['image']
    image = Image.open(io.BytesIO(file.read()))
    # Example: Preprocess image and make predictions
    result = inception_model.predict(image)
    return jsonify({"health_status": str(result)})
