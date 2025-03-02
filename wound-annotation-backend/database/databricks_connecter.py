from databricks import sql
from config import Config
from dataclasses import dataclass
from typing import Optional, Dict, Any
from datetime import datetime
import json
import uuid

@dataclass
class WoundInfo:
    wound_assessment_id: int
    wound_type: str
    body_location: str
    patient_id: Optional[str] = None        
    image_data: Optional[bytes] = None
    path: Optional[str] = None
    annotations: Optional[Dict[str, Any]] = None
    
class DatabricksConnector:
    def __init__(self):
        self.connection = None
        
    def connect(self):
        """Establish connection to Databricks"""
        try:
            self.connection = sql.connect(
                server_hostname=Config.DATABRICKS_HOST,
                http_path=Config.DATABRICKS_HTTP_PATH,
                access_token=Config.DATABRICKS_TOKEN
            )
            print("Successfully connected to Databricks")
        except Exception as e:
            print(f"Error connecting to Databricks: {str(e)}")
            raise

    def get_image_by_path(self, image_path: str) -> Optional[bytes]:
        """Fetch image data from images table using path"""
        try:
            if not self.connection:
                self.connect()

            query = f"""
            SELECT content 
            FROM wcr_wound_detection.wcr_wound.wcr_annotation_initial
            WHERE path = '{image_path}'
            """
            
            print(f"Executing image query: {query}")
            cursor = self.connection.cursor()
            cursor.execute(query)
            result = cursor.fetchone()
            cursor.close()

            if result and result[0]:
                return result[0]  # Return binary image data
            return None

        except Exception as e:
            print(f"Error fetching image: {str(e)}")
            return None
    
    def get_wound_assessment(self, assessment_id: str) -> Optional[WoundInfo]:
        try:
            if not self.connection:
                self.connect()
                    
            assessment_id_int = int(assessment_id)
                
            query = f"""
            SELECT 
                WoundAssessmentID,
                WoundType,
                WoundLocationLocation,
                PatientID,             
                path
            FROM wcr_wound_detection.wcr_wound.wcr_annotation_initial
            WHERE WoundAssessmentID = {assessment_id_int}
            """
            print(f"Executing wound query: {query}")
            cursor = self.connection.cursor()
            cursor.execute(query)
            result = cursor.fetchone()
            cursor.close()
                
            if result:
                image_path = result[4]
                image_data = self.get_image_by_path(image_path)
                    
                return WoundInfo(
                    wound_assessment_id=result[0],
                    wound_type=result[1] if result[1] else "Unknown",
                    body_location=result[2] if result[2] else "Unknown",
                    patient_id=result[3],  # Set patient id here
                    image_data=image_data,
                    path=image_path,
                    annotations=None
                )
            return None
        except Exception as e:
            print(f"Error fetching wound assessment: {str(e)}")
            return None


    def create_annotations_table(self):
        """Create annotations table if it doesn't exist"""
        try:
            if not self.connection:
                self.connect()
                
            query = """
            CREATE TABLE IF NOT EXISTS wcr_wound_detection.wcr_wound.wound_annotations (
                annotation_id STRING,
                wound_assessment_id BIGINT,
                category STRING,
                location STRING,
                body_map_id STRING,
                x INT,
                y INT,
                width INT,
                height INT,
                created_by STRING,
                created_at TIMESTAMP,
                last_modified_by STRING,
                last_modified_at TIMESTAMP,
                doctor_notes STRING,
                severity STRING,
                PRIMARY KEY (annotation_id)
            )
            """
            cursor = self.connection.cursor()
            cursor.execute(query)
            self.connection.commit()
            cursor.close()
            print("Annotations table created or verified successfully")
        except Exception as e:
            print(f"Error creating annotations table: {str(e)}")
            raise
            
    def check_column_exists(self, table_name, column_name):
        """Check if a column exists in a table"""
        try:
            if not self.connection:
                self.connect()
                
            # This is a Databricks-specific way to check for column existence
            query = f"""
            SELECT * FROM wcr_wound_detection.wcr_wound.{table_name} 
            WHERE 1=0
            """
            
            cursor = self.connection.cursor()
            cursor.execute(query)
            
            # Get column names from cursor description
            column_names = [desc[0].lower() for desc in cursor.description]
            cursor.close()
            
            return column_name.lower() in column_names
            
        except Exception as e:
            print(f"Error checking if column exists: {str(e)}")
            return False
            
    def add_missing_columns(self):
        """Add doctor_notes and severity columns if they don't exist"""
        try:
            if not self.connection:
                self.connect()
                
            # Check if doctor_notes column exists
            if not self.check_column_exists('wound_annotations', 'doctor_notes'):
                print("Adding doctor_notes column...")
                query = """
                ALTER TABLE wcr_wound_detection.wcr_wound.wound_annotations 
                ADD COLUMN doctor_notes STRING
                """
                cursor = self.connection.cursor()
                cursor.execute(query)
                self.connection.commit()
                cursor.close()
                print("Added doctor_notes column")
            
            # Check if severity column exists
            if not self.check_column_exists('wound_annotations', 'severity'):
                print("Adding severity column...")
                query = """
                ALTER TABLE wcr_wound_detection.wcr_wound.wound_annotations 
                ADD COLUMN severity STRING
                """
                cursor = self.connection.cursor()
                cursor.execute(query)
                self.connection.commit()
                cursor.close()
                print("Added severity column")
                
        except Exception as e:
            print(f"Error adding missing columns: {str(e)}")

    def get_annotations(self, wound_assessment_id: int) -> Optional[Dict]:
        """Get all annotations for a wound assessment"""
        try:
            if not self.connection:
                self.connect()
                
            query = f"""
            SELECT *
            FROM wcr_wound_detection.wcr_wound.wound_annotations
            WHERE wound_assessment_id = {wound_assessment_id}
            ORDER BY created_at
            """
            
            cursor = self.connection.cursor()
            cursor.execute(query)
            results = cursor.fetchall()
            
            # Get column names
            column_names = [desc[0].lower() for desc in cursor.description]
            cursor.close()
            
            if results:
                annotations = {
                    'boxes': []
                }
                
                for row in results:
                    # Create a dictionary to map column names to values
                    row_dict = dict(zip(column_names, row))
                    
                    annotation = {
                        'annotation_id': row_dict.get('annotation_id'),
                        'category': row_dict.get('category'),
                        'location': row_dict.get('location'),
                        'body_map_id': row_dict.get('body_map_id'),
                        'x': row_dict.get('x'),
                        'y': row_dict.get('y'),
                        'width': row_dict.get('width'),
                        'height': row_dict.get('height'),
                        'created_by': row_dict.get('created_by'),
                        'created_at': row_dict.get('created_at').isoformat() if row_dict.get('created_at') else None,
                        'last_modified_by': row_dict.get('last_modified_by'),
                        'last_modified_at': row_dict.get('last_modified_at').isoformat() if row_dict.get('last_modified_at') else None
                    }
                    
                    # Add doctor_notes and severity fields if they exist
                    if 'doctor_notes' in row_dict:
                        annotation['doctor_notes'] = row_dict.get('doctor_notes')
                    
                    if 'severity' in row_dict:
                        annotation['severity'] = row_dict.get('severity')
                        
                    annotations['boxes'].append(annotation)
                
                return annotations
                
            return None
            
        except Exception as e:
            print(f"Error fetching annotations: {str(e)}")
            return None




    def get_all_wound_paths_with_status(self) -> list:
        """Get all unique image paths with their annotation status"""
        try:
            if not self.connection:
                self.connect()

            query = """
            SELECT 
                w.WoundAssessmentID as id, 
                w.path,
                CASE WHEN a.wound_assessment_id IS NOT NULL THEN 1 ELSE 0 END as has_annotations
            FROM wcr_wound_detection.wcr_wound.wcr_annotation_initial w
            LEFT JOIN (
                SELECT DISTINCT wound_assessment_id 
                FROM wcr_wound_detection.wcr_wound.wound_annotations
            ) a ON w.WoundAssessmentID = a.wound_assessment_id
            ORDER BY w.path
            """

            cursor = self.connection.cursor()
            cursor.execute(query)
            results = cursor.fetchall()
            cursor.close()

            return results

        except Exception as e:
            print(f"Error fetching image paths with status: {str(e)}")
            return []

    def save_annotations(self, wound_assessment_id: int, annotations: list) -> bool:
        """Save annotations to database"""
        try:
            if not self.connection:
                self.connect()

            cursor = self.connection.cursor()
            
            # First, delete existing annotations for this wound assessment.
            delete_query = f"""
            DELETE FROM wcr_wound_detection.wcr_wound.wound_annotations
            WHERE wound_assessment_id = {wound_assessment_id}
            """
            cursor.execute(delete_query)
            
            # Use a raw string literal with %s placeholders.
            insert_query = r"""
            INSERT INTO wcr_wound_detection.wcr_wound.wound_annotations (
                annotation_id, wound_assessment_id, category, location, body_map_id,
                x, y, width, height, created_by, created_at, last_modified_by, last_modified_at, doctor_notes, severity
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            # For debugging purposes
            print(f"Number of annotations to save: {len(annotations)}")
            
            for annotation in annotations:
                # Print each annotation for debugging
                print(f"Processing annotation: {annotation}")
                
                # Debug print the parameters to verify their types
                params = (
                    str(uuid.uuid4()),
                    wound_assessment_id,
                    annotation['category'],
                    annotation['location'],
                    annotation.get('body_map_id', ''),
                    annotation['x'],
                    annotation['y'],
                    annotation['width'],
                    annotation['height'],
                    annotation['created_by'],
                    annotation['created_at'],
                    annotation['last_modified_by'],
                    annotation['last_modified_at'],
                    annotation.get('doctor_notes', ''),
                    annotation.get('severity', '')
                )
                print(f"Executing query with parameters: {params}")
                cursor.execute(insert_query, params)
                
            # Update the annotation status in a separate table or field if needed
            # This is optional if you're using the LEFT JOIN approach in get_all_wound_paths_with_status
            
            self.connection.commit()
            cursor.close()
            return True
            
        except Exception as e:
            print(f"Error saving annotations: {str(e)}")
            return False
            
    def verify_saved_annotations(self, wound_assessment_id):
        """Verify that annotations were saved correctly"""
        try:
            if not self.connection:
                self.connect()
                
            query = f"""
            SELECT annotation_id, category, location, doctor_notes, severity
            FROM wcr_wound_detection.wcr_wound.wound_annotations
            WHERE wound_assessment_id = {wound_assessment_id}
            """
            
            cursor = self.connection.cursor()
            cursor.execute(query)
            results = cursor.fetchall()
            cursor.close()
            
            print(f"Verification - saved annotations for wound_assessment_id {wound_assessment_id}:")
            for row in results:
                print(f"  ID: {row[0]}, Category: {row[1]}, Location: {row[2]}, Notes: {row[3]}, Severity: {row[4]}")
                
        except Exception as e:
            print(f"Error verifying saved annotations: {str(e)}")

    def get_all_wound_paths(self) -> list:
        """Get all unique image paths"""
        try:
            if not self.connection:
                self.connect()

            query = """
            SELECT DISTINCT path 
            FROM wcr_wound_detection.wcr_wound.wcr_annotation_initial
            ORDER BY path
            """

            cursor = self.connection.cursor()
            cursor.execute(query)
            results = cursor.fetchall()
            cursor.close()

            return [row[0] for row in results]

        except Exception as e:
            print(f"Error fetching image paths: {str(e)}")
            return []

    def get_wound_types(self) -> list:
        """Get all unique wound types"""
        try:
            if not self.connection:
                self.connect()

            query = """
            SELECT DISTINCT WoundType 
            FROM wcr_wound_detection.wcr_wound.wcr_annotation_initial
            WHERE WoundType IS NOT NULL
            ORDER BY WoundType
            """

            cursor = self.connection.cursor()
            cursor.execute(query)
            results = cursor.fetchall()
            cursor.close()

            return [row[0] for row in results]

        except Exception as e:
            print(f"Error fetching wound types: {str(e)}")
            return []
        
    def get_annotation_counts_by_category(self) -> list:
        """Get counts of annotations grouped by category"""
        try:
            print("Starting get_annotation_counts_by_category database query")
            
            if not self.connection:
                print("No connection, connecting to database")
                self.connect()
            
            # First, check if there are any annotations at all
            check_query = """
            SELECT COUNT(*) FROM wcr_wound_detection.wcr_wound.wound_annotations
            """
            cursor = self.connection.cursor()
            cursor.execute(check_query)
            total_count = cursor.fetchone()[0]
            print(f"Total annotations in database: {total_count}")
            
            if total_count == 0:
                print("No annotations found in database")
                cursor.close()
                return []
                
            # Simplified query matching your working Python implementation
            query = """
            SELECT category, COUNT(*) as count
            FROM wcr_wound_detection.wcr_wound.wound_annotations
            GROUP BY category
            """
            
            print(f"Executing query: {query}")
            cursor.execute(query)
            results = cursor.fetchall()
            print(f"Query returned {len(results)} rows")
            
            # Debug the raw results
            for i, row in enumerate(results):
                print(f"Row {i}: {row}")
            
            # Just return the raw results, let the endpoint format them
            cursor.close()
            return results
            
        except Exception as e:
            print(f"Error getting annotation counts by category: {str(e)}")
            import traceback
            traceback.print_exc()  # Print full stack trace
            return []


    def get_body_locations(self) -> list:
        """Get all unique body locations"""
        try:
            if not self.connection:
                self.connect()

            query = """
            SELECT DISTINCT WoundLocationLocation 
            FROM wcr_wound_detection.wcr_wound.wcr_annotation_initial
            WHERE WoundLocationLocation IS NOT NULL
            ORDER BY WoundLocationLocation
            """

            cursor = self.connection.cursor()
            cursor.execute(query)
            results = cursor.fetchall()
            cursor.close()

            return [row[0] for row in results]

        except Exception as e:
            print(f"Error fetching body locations: {str(e)}")
            return []

    def close(self):
        """Close the Databricks connection"""
        if self.connection:
            self.connection.close()
            self.connection = None