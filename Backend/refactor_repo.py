import re

with open('app/firebase/repository.py', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = 0

for i, line in enumerate(lines):
    if skip > 0:
        skip -= 1
        continue

    # Remove _load_local_demo_data completely
    if "def _load_local_demo_data(cls):" in line:
        # skip next 13 lines (the whole method)
        skip = 14
        # also remove the @classmethod from previous line
        if new_lines and "@classmethod" in new_lines[-1]:
            new_lines.pop()
        continue

    if "_demo_data_cache = None" in line:
        continue

    if "from app.core.config import settings" in line:
        skip = 0 # Sometimes it's needed, we'll keep it or remove it. Let's keep it for now.
        new_lines.append(line)
        continue

    if "if settings.ENABLE_DEMO_MODE:" in line:
        # Determine how many lines this block has by checking indentation
        indent = len(line) - len(line.lstrip())
        skip_count = 0
        for j in range(i + 1, len(lines)):
            next_line = lines[j]
            if next_line.strip() == "":
                skip_count += 1
                continue
            next_indent = len(next_line) - len(next_line.lstrip())
            if next_indent <= indent and not next_line.strip().startswith("elif") and not next_line.strip().startswith("else:"):
                break
            skip_count += 1
        skip = skip_count
        continue
    
    if "elif db:" in line:
        new_lines.append(line.replace("elif db:", "if db:"))
        continue

    if "elif not db:" in line:
        new_lines.append(line.replace("elif not db:", "if not db:"))
        continue

    new_lines.append(line)

with open('app/firebase/repository.py', 'w') as f:
    f.writelines(new_lines)

print("Cleaned repository.py!")
