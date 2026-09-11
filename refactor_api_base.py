import os

frontend_dir = r'C:\Pictures\Documents\Cherry 💗💗\Desktop\SmartFins\Charan\Skilling-Impact-Intelligence\Frontend\src'
target_string = 'const API_BASE = import.meta.env.VITE_API_BASE ?? (import.meta.env.DEV ? "http://localhost:8001" : "");'

config_content = """export const API_BASE = import.meta.env.VITE_API_BASE ?? (import.meta.env.DEV ? "http://localhost:8001" : "");
"""
with open(os.path.join(frontend_dir, 'utils', 'config.js'), 'w', encoding='utf-8') as f:
    f.write(config_content)

for root, dirs, files in os.walk(frontend_dir):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            if target_string in content:
                # Correct the relative path based on depth
                depth = filepath.replace(frontend_dir, '').count(os.sep) - 1
                if depth == 1:
                    import_stmt = "import { API_BASE } from '../utils/config';\n"
                elif depth == 2:
                    import_stmt = "import { API_BASE } from '../../utils/config';\n"
                else:
                    import_stmt = "import { API_BASE } from './utils/config';\n"
                
                content = content.replace(target_string, '')
                # Insert import at top after other imports
                lines = content.split('\n')
                last_import = 0
                for i, line in enumerate(lines):
                    if line.startswith('import '):
                        last_import = i
                lines.insert(last_import + 1, import_stmt.strip())
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write('\n'.join(lines))
                print(f'Updated {file}')
