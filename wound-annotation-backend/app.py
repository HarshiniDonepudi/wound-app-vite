# app.py
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import io
import uuid
import json
from database.connection_manager import DatabaseConnectionManager
from database.user_manager import UserManager

app = Flask(__name__)
# CORS(app, resources={r"/api/*": {"origins": [
#     "wound-app-vite.vercel.app",
#     "https://wound-app-vite-1.onrender.com",
#     "http://localhost:5173",                
#     "http://127.0.0.1:5173",                 
# ]}})
# CORS(app, supports_credentials=True)
CORS(app, resources={r"/api/*": {"origins": "https://wound-app-vite.vercel.app"}}, supports_credentials=True)



app.config['JWT_SECRET_KEY'] = '29b9f018215f7e6c993acc91da9ea526' 
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
jwt = JWTManager(app)


db_manager = DatabaseConnectionManager()
connector = db_manager.get_connector()
user_manager = UserManager(connector)

def send_image_response(image_data):
    return send_file(
        io.BytesIO(image_data),
        mimetype='image/jpeg',
        as_attachment=False,
        download_name='wound_image.jpg'
    )


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400
    
    # Use the existing user manager to authenticate
    user_profile = user_manager.authenticate_user(username, password)
    
    if user_profile:
        # Create access token
        access_token = create_access_token(identity={
            'user_id': user_profile.user_id,
            'username': user_profile.username,
            'full_name': user_profile.full_name,
            'role': user_profile.role
        })
        
        return jsonify({
            'access_token': access_token,
            'user': {
                'user_id': user_profile.user_id,
                'username': user_profile.username,
                'full_name': user_profile.full_name,
                'role': user_profile.role
            }
        }), 200
    else:
        return jsonify({'error': 'Invalid username or password'}), 401

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    full_name = data.get('fullName')
    role = data.get('role', 'annotator')
    
    if not username or not password or not full_name:
        return jsonify({'error': 'All fields are required'}), 400
    
   
    user_profile = user_manager.create_user(username, password, full_name, role)
    
    if user_profile:

        access_token = create_access_token(identity={
            'user_id': user_profile.user_id,
            'username': user_profile.username,
            'full_name': user_profile.full_name,
            'role': user_profile.role
        })
        
        return jsonify({
            'access_token': access_token,
            'user': {
                'user_id': user_profile.user_id,
                'username': user_profile.username,
                'full_name': user_profile.full_name,
                'role': user_profile.role
            }
        }), 201
    else:
        return jsonify({'error': 'Username already exists or an error occurred'}), 400

# Wound image routes
@app.route('/api/wounds', methods=['GET'])
@jwt_required()
def get_all_wounds():
    try:
        # Get all wound paths
        wound_paths = connector.get_all_wound_paths()
        
        # Format response
        wounds = [{'id': path.split('/')[-1], 'path': path} for path in wound_paths]
        
        return jsonify(wounds), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/wounds/<wound_id>', methods=['GET'])
@jwt_required()
def get_wound(wound_id):
    try:
        # Get wound assessment data
        wound_info = connector.get_wound_assessment(wound_id)
        
        if not wound_info:
            return jsonify({'error': 'Wound not found'}), 404
        
        # Prepare response with wound info (without image data)
        wound_data = {
            'wound_assessment_id': wound_info.wound_assessment_id,
            'wound_type': wound_info.wound_type,
            'body_location': wound_info.body_location,
            'patient_id': wound_info.patient_id,
            'path': wound_info.path
        }
        
        return jsonify(wound_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/wounds/<wound_id>/image', methods=['GET'])
@jwt_required()
def get_wound_image(wound_id):
    try:
        # Get wound assessment data
        wound_info = connector.get_wound_assessment(wound_id)
        
        if not wound_info or not wound_info.image_data:
            return jsonify({'error': 'Wound image not found'}), 404
        
        # Return the binary image
        return send_image_response(wound_info.image_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Annotation routes
@app.route('/api/annotations/<wound_id>', methods=['GET'])
@jwt_required()
def get_annotations(wound_id):
    try:
        # Convert to integer for the database query
        wound_assessment_id = int(wound_id)
        
        # Get annotations for the wound
        annotations = connector.get_annotations(wound_assessment_id)
        
        if not annotations:
            return jsonify({'boxes': []}), 200
        
        return jsonify(annotations), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/annotations/<wound_id>', methods=['POST'])
@jwt_required()
def save_annotations(wound_id):
    try:
        # Get user identity from JWT
        user_identity = get_jwt_identity()
        username = user_identity['username']
        
        # Get annotations from request
        annotations_data = request.json
        print(f"Received annotations data: {json.dumps(annotations_data, indent=2)}")  # Debug print
        
        # Convert wound_id to integer
        wound_assessment_id = int(wound_id)
        
        # Process annotations to add metadata
        annotations = []
        now = datetime.now().isoformat()
        
        for ann in annotations_data:
            # Ensure required fields are present
            ann['created_by'] = ann.get('created_by', username)
            ann['last_modified_by'] = username
            ann['created_at'] = ann.get('created_at', now)
            ann['last_modified_at'] = now
            
            # Ensure doctor_notes and severity are included (even if empty)
            if 'doctor_notes' not in ann:
                ann['doctor_notes'] = ''
            if 'severity' not in ann:
                ann['severity'] = ''
                
            annotations.append(ann)
            
        # Print annotations after processing
        print(f"Processed annotations to save: {json.dumps(annotations, indent=2)}")
        
        # Save annotations to database
        success = connector.save_annotations(wound_assessment_id, annotations)
        
        if success:
            return jsonify({'message': 'Annotations saved successfully'}), 200
        else:
            return jsonify({'error': 'Failed to save annotations'}), 500
            
    except Exception as e:
        import traceback
        print(f"Error saving annotations: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

# Configuration data routes
@app.route('/api/config/etiology-options', methods=['GET'])
@jwt_required()
def get_etiology_options():
    from config import Config
    return jsonify(Config.ETIOLOGY_OPTIONS), 200

@app.route('/api/config/body-locations', methods=['GET'])
@jwt_required()
def get_body_locations():
    from config import Config
    return jsonify(Config.BODY_LOCATIONS), 200

# Add this endpoint to your app.py file

@app.route('/api/wounds/annotation-status', methods=['GET'])
@jwt_required()
def get_wounds_annotation_status():
    try:
        # Get all wound paths
        wound_paths = connector.get_all_wound_paths()
        
        # Format initial response
        wounds = [{'id': path.split('/')[-1], 'path': path, 'annotated': False} for path in wound_paths]
        
        # Check each wound for annotations
        for wound in wounds:
            try:
                wound_id = int(wound['id'])
                annotations = connector.get_annotations(wound_id)
                wound['annotated'] = bool(annotations and annotations.get('boxes') and len(annotations['boxes']) > 0)
            except Exception as e:
                print(f"Error checking annotations for wound {wound['id']}: {str(e)}")
                # Continue with the next wound rather than failing the whole request
                continue
        
        return jsonify(wounds), 200
    except Exception as e:
        print(f"Error getting wound annotation status: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/config/category-colors', methods=['GET'])
@jwt_required()
def get_category_colors():
    from config import Config
    return jsonify(Config.CATEGORY_COLORS), 200

@app.route('/api/wounds/with-status', methods=['GET'])
@jwt_required()
def get_wounds_with_status():
    try:
        # Get all wound paths
        wound_paths = connector.get_all_wound_paths_with_status()
        
        # Format response - the status field is now included from the database query
        wounds = [{'id': path[0], 'path': path[1], 'annotated': bool(path[2])} for path in wound_paths]
        
        return jsonify(wounds), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/annotations/count-by-category', methods=['GET'])
@jwt_required()
def get_annotation_counts_by_category():
    try:
        print("🚀 API Request Received: count-by-category")

        # Debug connection
        if not connector.connection:
            print("⚠️ No database connection detected, reconnecting...")
            connector.connect()
            if not connector.connection:
                print("❌ Database connection failed!")
                return jsonify({"error": "Database connection failed"}), 500
        
        print("✅ Database connection is active.")

        cursor = connector.connection.cursor()

        # Check if the cursor is valid
        if cursor is None:
            print("❌ Error: Cursor could not be created!")
            return jsonify({"error": "Database cursor failed"}), 500

        # Run the SQL query
        query = """
        SELECT 
            COALESCE(category, 'Uncategorized') AS category, 
            COUNT(*) as count
        FROM wcr_wound_detection.wcr_wound.wound_annotations
        GROUP BY category
        """
        print(f"🔍 Executing Query: {query}")

        cursor.execute(query)  # 🚀 Query Execution
        results = cursor.fetchall()
        
        print(f"📊 Raw Query Results: {results}")

        if not results:
            print("⚠️ No annotations found")
            return jsonify({"logs": ["No annotations found"], "data": []}), 200

        # Ensure all values are valid before converting
        formatted_results = []
        for i, row in enumerate(results):
            category = row[0] if row[0] else "Uncategorized"
            count = row[1] if row[1] is not None else 0  # Fixing None issue
            
            # Debugging: Print each row before adding it
            print(f"🔹 Row {i}: category={category}, count={count}")

            formatted_results.append({"category": category, "count": count})

        print(f"✅ Processed Data: {formatted_results}")

        return jsonify({"logs": ["Query executed successfully"], "data": formatted_results}), 200

    except Exception as e:
        print(f"❌ Error before query execution: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500





if __name__ == '__main__':
    app.run(debug=True, port=3000)