from flask import Blueprint, request, jsonify
from ..services.openai_service import generate_response 

openai_bp = Blueprint('openai_bp', __name__)

@openai_bp.route('/generate', methods=['POST'])
def generate_text():
    data = request.get_json()
    prompt = data.get("prompt", "")

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    response = generate_response(prompt)
    return jsonify({"response": response})
