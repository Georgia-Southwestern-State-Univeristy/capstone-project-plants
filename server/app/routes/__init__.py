try:
    from .auth_routes import auth_bp
    from .plants_routes import plants_bp
    from .ai_routes import ai_bp
    from .openai_routes import openai_bp
    from .user_routes import user_bp
except ImportError as e:
    print(f"Error importing routes: {e}")
