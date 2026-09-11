from app.main import app

def verify_routes():
    print("Enumerating all registered FastAPI endpoints from OpenAPI schema...")
    
    # Generate openapi schema to flatten all routes
    openapi_schema = app.openapi()
    paths = openapi_schema.get("paths", {})
    
    count = 0
    for path, methods in paths.items():
        for method, operation in methods.items():
            count += 1
            print(f"[{method.upper()}] {path}")
            
            # Extract security requirements
            security = operation.get("security", [])
            auth = "Unknown"
            rbac = "Unknown"
            
            if security:
                auth = "Bearer Token"
                # Check description for role
                description = operation.get("description", "").lower()
                if "admin" in description:
                    rbac = "Admin Only"
                elif "employer" in description:
                    rbac = "Employer Only"
                else:
                    rbac = "Any Authenticated User"
            else:
                auth = "None"
                rbac = "Public"
                
            print(f"  Auth: {auth}")
            print(f"  RBAC: {rbac}")
            print("  ---")
            
    print(f"Total endpoints registered: {count}")

if __name__ == "__main__":
    verify_routes()
