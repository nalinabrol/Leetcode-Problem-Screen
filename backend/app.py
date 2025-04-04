from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import tempfile
import os
import json

app = Flask(__name__)
CORS(app)

def execute_python(code, input_data):
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
        f.write(code)
        temp_path = f.name

    try:
        process = subprocess.Popen(
            ['python', temp_path],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        stdout, stderr = process.communicate(input=input_data)
        return stdout if stdout else stderr
    finally:
        os.unlink(temp_path)

def execute_javascript(code, input_data):
    with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
        f.write(code)
        temp_path = f.name

    try:
        process = subprocess.Popen(
            ['node', temp_path],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        stdout, stderr = process.communicate(input=input_data)
        return stdout if stdout else stderr
    finally:
        os.unlink(temp_path)

def execute_java(code, input_data):
    # Create a temporary directory for Java files
    with tempfile.TemporaryDirectory() as temp_dir:
        # Write the Java code to a file
        class_name = "Main"  # Assuming the class name is Main
        java_file = os.path.join(temp_dir, f"{class_name}.java")
        with open(java_file, 'w') as f:
            f.write(code)

        try:
            # Compile the Java code
            subprocess.run(['javac', java_file], check=True, capture_output=True)
            
            # Execute the compiled code
            process = subprocess.Popen(
                ['java', '-cp', temp_dir, class_name],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            stdout, stderr = process.communicate(input=input_data)
            return stdout if stdout else stderr
        except subprocess.CalledProcessError as e:
            return f"Compilation Error: {e.stderr}"

@app.route('/api/run', methods=['POST'])
def run_code():
    data = request.json
    code = data.get('code', '')
    language = data.get('language', 'python')
    input_data = data.get('input', '')

    try:
        if language == 'python':
            output = execute_python(code, input_data)
        elif language in ['javascript', 'typescript']:
            output = execute_javascript(code, input_data)
        elif language == 'java':
            output = execute_java(code, input_data)
        else:
            return jsonify({'error': 'Unsupported language'}), 400

        return jsonify({'output': output})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 