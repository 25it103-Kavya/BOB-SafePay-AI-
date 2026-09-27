"""
BOB SafePay AI — Central Backend Application
Flask Server with CORS, Environment Configuration & Blueprint Routing
"""

import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv()

def create_app():
    """Application Factory Pattern for Flask"""
    app = Flask(__name__)

    # Security Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'bob_safepay_secret_2026_hackathon')
    app.config['JSON_SORT_KEYS'] = False

    # Enable Cross-Origin Resource Sharing (CORS)
    # Allows our frontend HTML/JS files to make API requests without browser blocks
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register API Routes Blueprint
    from routes import api_bp
    app.register_blueprint(api_bp)

    # Global 404 Error Handler
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "status": "error",
            "message": "The requested API endpoint was not found on BOB SafePay server.",
            "code": 404
        }), 404

    # Global 500 Error Handler
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "status": "error",
            "message": "Internal security engine exception.",
            "code": 500
        }), 500

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('FLASK_PORT', 5000))
    print(f"\n==================================================")
    print(f"🛡️  BOB SafePay AI — Security Gateway Active")
    print(f"📡  Listening on: http://127.0.0.1:{port}")
    print(f"⚡  API Health check: http://127.0.0.1:{port}/api/health")
    print(f"==================================================\n")
    app.run(host='127.0.0.1', port=port, debug=True)