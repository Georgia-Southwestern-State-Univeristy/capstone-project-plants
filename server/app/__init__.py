from flask import Flask
from google.cloud import firestore

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')
    app.firestore = firestore.Client()
    return app