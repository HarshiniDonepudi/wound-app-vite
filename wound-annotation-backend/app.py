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
from utils.email_utils import send_email
import random
import string

app = Flask(__name__)
# CORS(app, resources={r"/api/*": {"origins": [
#     "wound-app-vite.vercel.app",
#     "https://wound-app-vite-1.onrender.com",
#     "http://localhost:5173",                
#     "http://127.0.0.1:5173",                 
# ]}})
# CORS(app, supports_credentials=True)
#CORS(app, resources={r"/api/*": {"origins": "https://wound-app-vite.vercel.app"}}, supports_credentials=True)
CORS(app, resources={r"/api/*": {"origins": [
    "https://wound-app-vite.vercel.app"
]}}, supports_credentials=True)


app.config['JWT_SECRET_KEY'] = '29b9f018215f7e6c993acc91da9ea526' 
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
jwt = JWTManager(app)


db_manager = DatabaseConnectionManager()
connector = db_manager.get_connector()
connector.create_review_queue_table()
connector.create_omit_queue_table()
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
    
    # Use the user_manager to authenticate against the database
    user_profile = user_manager.authenticate_user(username, password)
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
        }), 200
    else:
        return jsonify({'error': 'Invalid username or password'}), 401

# @app.route('/api/auth/register', methods=['POST'])
# def register():
#     # Registration endpoint disabled. Only admin can add users.
#     return jsonify({'error': 'Registration is disabled. Contact admin.'}), 403

# Move these endpoints to the top of the wound routes section
@app.route('/api/wounds/review-queue', methods=['GET'])
@jwt_required()
def get_review_queue():
    wounds = connector.get_review_queue()
    return jsonify(wounds), 200

@app.route('/api/wounds/omit-queue', methods=['GET'])
@jwt_required()
def get_omit_queue():
    wounds = connector.get_omit_queue()
    return jsonify(wounds), 200

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
        user_id = user_identity['user_id']
        # Get annotations from request
        annotations_data = request.json
        print(f"Received annotations data: {json.dumps(annotations_data, indent=2)}")  # Debug print
        # Convert wound_id to integer
        wound_assessment_id = int(wound_id)
        # Process annotations to add metadata
        annotations = []
        now = datetime.now().isoformat()
        for ann in annotations_data:
            # Always use the user ID for created_by and last_modified_by
            ann['created_by'] = user_id
            ann['last_modified_by'] = user_id
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
        print("wound_paths sample:", wound_paths[:3])  # Debug print
        # Format response - now includes annotators, fallback to '-' if empty
        wounds = [
            {
                'id': path[0],
                'path': path[1],
                'annotated': bool(path[2]),
                'annotators': path[3] if path[3] else '-'
            } for path in wound_paths
        ]
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

@app.route('/api/admin/add-annotator', methods=['POST'])
@jwt_required()
def add_annotator():
    user_identity = get_jwt_identity()
    if user_identity['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    data = request.json
    full_name = data.get('full_name')
    username = data.get('username')
    email = data.get('email')
    if not full_name or not username or not email:
        return jsonify({'error': 'Missing required fields'}), 400

    # Generate random password
    password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))

    # Create user
    user_profile = user_manager.create_user(username, password, full_name, role='annotator')
    if not user_profile:
        return jsonify({'error': 'Username already exists or error occurred'}), 400

    # Send email
    subject = 'Your Annotator Account Credentials'
    body = f"""Hello {full_name},\n\nYour annotator account has been created.\n\nUsername: {username}\nPassword: {password}\n\nPlease log in and change your password after first login."""
    try:
        send_email(email, subject, body)
    except Exception as e:
        return jsonify({'error': f'User created but failed to send email: {str(e)}'}), 500

    return jsonify({'message': 'Annotator created and credentials sent via email.'}), 201

@app.route('/api/admin/users', methods=['GET'])
@jwt_required()
def list_users():
    user_identity = get_jwt_identity()
    if user_identity['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    try:
        users = user_manager.get_all_users()
        # Convert user objects to dicts
        users_list = [
            {
                'user_id': u.user_id,
                'username': u.username,
                'full_name': u.full_name,
                'email': getattr(u, 'email', ''),
                'role': u.role
            } for u in users
        ]
        return jsonify({'users': users_list}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    user_identity = get_jwt_identity()
    if user_identity['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    try:
        success = user_manager.delete_user(user_id)
        if success:
            return jsonify({'message': f'User {user_id} deleted.'}), 200
        else:
            return jsonify({'error': 'Failed to delete user'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/annotation-stats', methods=['GET'])
@jwt_required()
def annotation_stats():
    user_identity = get_jwt_identity()
    if user_identity['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    try:
        # Query: count annotations per user and calculate rate
        cursor = connector.connection.cursor()
        query = '''
            SELECT u.user_id, u.username, u.full_name, u.role,
                   COUNT(a.annotation_id) as annotation_count,
                   MIN(a.created_at) as first_annotation,
                   MAX(a.created_at) as last_annotation
            FROM wcr_wound_detection.wcr_wound.users u
            LEFT JOIN wcr_wound_detection.wcr_wound.wound_annotations a
              ON u.user_id = a.created_by
            WHERE u.is_active = TRUE
            GROUP BY u.user_id, u.username, u.full_name, u.role
        '''
        cursor.execute(query)
        results = cursor.fetchall()
        users = []
        for row in results:
            user_id, username, full_name, role, count, first, last = row
            # Calculate annotation rate per day
            if count and first and last and first != last:
                days = (last - first).days or 1
                rate = round(count / days, 2)
            else:
                rate = count if count else 0
            users.append({
                'user_id': user_id,
                'username': username,
                'full_name': full_name,
                'role': role,
                'annotation_count': count,
                'annotation_rate_per_day': rate
            })
        return jsonify({'users': users}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/change-password', methods=['POST'])
@jwt_required()
def change_password():
    user_identity = get_jwt_identity()
    user_id = user_identity['user_id']
    data = request.json
    old_password = data.get('old_password')
    new_password = data.get('new_password')
    if not old_password or not new_password:
        return jsonify({'error': 'Old and new password are required'}), 400
    success = user_manager.change_password(user_id, old_password, new_password)
    if success:
        return jsonify({'message': 'Password changed successfully'}), 200
    else:
        return jsonify({'error': 'Old password is incorrect or failed to change password'}), 400

@app.route('/api/wounds/<int:wound_id>/status', methods=['POST'])
@jwt_required()
def update_wound_status(wound_id):
    user_identity = get_jwt_identity()
    allowed_roles = ['admin', 'annotator']
    if user_identity['role'] not in allowed_roles:
        return jsonify({'error': 'Access denied'}), 403
    data = request.json
    status = data.get('status')
    username = user_identity['username']
    try:
        if status == 'omitted':
            connector.add_to_omit_queue(wound_id, username)
            return jsonify({'message': 'Wound added to omit queue'}), 200
        elif status == 'clear_omit':
            # Remove from omit queue
            if not connector.connection:
                connector.connect()
            query = "DELETE FROM wound_omit_queue WHERE wound_id = ?"
            cursor = connector.connection.cursor()
            cursor.execute(query, (wound_id,))
            connector.connection.commit()
            cursor.close()
            return jsonify({'message': 'Wound removed from omit queue'}), 200
        elif status == 'expert_review':
            connector.add_to_review_queue(wound_id, username)
            return jsonify({'message': 'Wound added to review queue'}), 200
        elif status == 'clear_review':
            # Remove from review queue
            if not connector.connection:
                connector.connect()
            query = "DELETE FROM wound_review_queue WHERE wound_id = ?"
            cursor = connector.connection.cursor()
            cursor.execute(query, (wound_id,))
            connector.connection.commit()
            cursor.close()
            return jsonify({'message': 'Wound removed from review queue'}), 200
        else:
            return jsonify({'error': 'Invalid status value'}), 400
    except Exception as e:
        print(f"Error updating wound status: {e}")
        return jsonify({'error': 'Failed to update status', 'details': str(e)}), 500

@app.route('/api/wounds/<int:wound_id>/request-omit', methods=['POST'])
@jwt_required()
def request_wound_omit(wound_id):
    user_identity = get_jwt_identity()
    username = user_identity['username']
    connector.add_to_omit_queue(wound_id, username)
    return jsonify({'message': 'Wound added to omit queue'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=3000)