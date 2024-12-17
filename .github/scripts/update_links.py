import os
from pathlib import Path

def get_folders():
    # Get all directories in the root folder, excluding hidden folders and specific directories
    excluded = {'.git', '.github', 'assets', 'scripts', 'styles'}
    folders = [f for f in os.listdir('.')
              if os.path.isdir(f) and not f.startswith('.') and f not in excluded]
    return sorted(folders)

def update_html():
    folders = get_folders()
    html_template = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Opentrons Tools</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            font-family: system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue","Noto Sans","Liberation Sans",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
        }
    </style>
</head>
<body class="bg-light">
    <div class="container py-4">
        <h1 class="mb-4">Opentrons Tools</h1>
        <h2>Available Tools</h2>
        <ul class="list-group">
{links}
        </ul>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>'''
    
    links = []
    for folder in folders:
        display_name = folder.replace('_', ' ')
        link = f'            <li class="list-group-item">\n                <a href="https://anuwrag.github.io/Opentrons-Tools/{folder}" target="_blank">{display_name}</a>\n            </li>'
        links.append(link)
    
    content = html_template.format(links='\n'.join(links))
    
    with open('index.html', 'w') as f:
        f.write(content)

def update_readme():
    folders = get_folders()
    readme_template = '''# Opentrons-Tools

## Available Tools

{links}'''
    
    links = []
    for folder in folders:
        display_name = folder.replace('_', ' ')
        link = f'- [{display_name}](https://anuwrag.github.io/Opentrons-Tools/{folder})'
        links.append(link)
    
    content = readme_template.format(links='\n'.join(links))
    
    with open('README.md', 'w') as f:
        f.write(content)

if __name__ == '__main__':
    update_html()
    update_readme() 