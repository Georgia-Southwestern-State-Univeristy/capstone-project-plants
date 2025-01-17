from flask import Blueprint, request, jsonify
from tensorflow.keras.models import load_model
import torch
from PIL import Image
import io

bp = Blueprint('ai', __name__, url_prefix='/ai')

inception_model = load_model('server/models/inceptionv3.h5')
yolo_model = torch.hub.load('ultralytics/yolov5', 'yolov5s')