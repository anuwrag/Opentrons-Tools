import json
from datetime import datetime
import os

def create_html_table(json_data):
    # Start HTML content
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Runtime Parameters</title>
        <style>
            table {
                border-collapse: collapse;
                width: 80%;
                margin: 20px auto;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            th {
                background-color: #4CAF50;
                color: white;
            }
            tr:nth-child(even) {
                background-color: #f2f2f2;
            }
            .container {
                width: 90%;
                margin: auto;
                padding: 20px;
            }
            h1 {
                text-align: center;
                color: #333;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Runtime Parameters</h1>
            <table>
                <tr>
                    <th>Command Type</th>
                    <th>Parameter</th>
                    <th>Value</th>
                    <th>Status</th>
                    <th>Timestamp</th>
                </tr>
    """

    # Parse through commands
    for command in json_data['result']['commands']:
        command_type = command.get('commandType', '')
        status = command.get('status', '')
        timestamp = datetime.fromisoformat(command.get('createdAt', '').replace('Z', '+00:00')).strftime('%Y-%m-%d %H:%M:%S')
        
        params = command.get('params', {})
        for param_name, param_value in params.items():
            # Convert param_value to string, handling nested dictionaries
            if isinstance(param_value, dict):
                param_value = json.dumps(param_value, indent=2)
            elif isinstance(param_value, list):
                param_value = ', '.join(map(str, param_value))
            
            html_content += f"""
                <tr>
                    <td>{command_type}</td>
                    <td>{param_name}</td>
                    <td><pre>{param_value}</pre></td>
                    <td>{status}</td>
                    <td>{timestamp}</td>
                </tr>
            """

    # Close HTML content
    html_content += """
            </table>
        </div>
    </body>
    </html>
    """
    
    return html_content

def parse_json_file(file_path):
    try:
        with open(file_path, 'r') as file:
            json_data = json.load(file)
            html_content = create_html_table(json_data)
            
            # Create output HTML file
            output_path = os.path.splitext(file_path)[0] + '_parameters.html'
            with open(output_path, 'w') as html_file:
                html_file.write(html_content)
            
            print(f"HTML file created successfully at: {output_path}")
            
    except Exception as e:
        print(f"Error processing file: {str(e)}")

# Usage
file_path = "THAD_SMC(R) High Sensitivity Immunoassay Kit v17 Final Protocol_15Jan25_All Kits added_2025-02-19T20_52_55.741Z.json"
parse_json_file(file_path)
