import os
import glob
import re

os.makedirs("Frontend/src/utils", exist_ok=True)

auth_fetch = """export const fetchAuth = (url, options = {}) => {
  const token = localStorage.getItem("sih_token");
  const headers = {
    ...options.headers,
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
  return fetch(url, { ...options, headers });
};
"""

with open("Frontend/src/utils/authFetch.js", "w") as f:
    f.write(auth_fetch)

for file in glob.glob("Frontend/src/**/*.jsx", recursive=True):
    if "Login.jsx" in file: continue
    
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "fetch(" in content:
        # figure out import path relative to src/utils
        # if file is in pages or components:
        parts = file.replace("\\", "/").split("src/")
        if len(parts) > 1:
            subpath = parts[1]
            depth = subpath.count("/")
            prefix = "../" * depth if depth > 0 else "./"
            import_stmt = f"import {{ fetchAuth }} from '{prefix}utils/authFetch';\n"
            
            # replace fetch with fetchAuth, but careful not to replace window.fetch or something.
            # Usually it's just `fetch(` or `await fetch(`
            # Let's use regex with word boundary
            new_content = re.sub(r'\bfetch\(', 'fetchAuth(', content)
            
            # Add import after the first import or at top
            if "import { fetchAuth }" not in new_content:
                new_content = import_stmt + new_content
            
            with open(file, "w", encoding="utf-8") as f:
                f.write(new_content)
                print(f"Updated {file}")
