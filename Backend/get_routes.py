from app.main import app
import json

def get_routes(r, prefix=''):
    routes=[]
    for route in getattr(r, 'routes', []):
        if hasattr(route, 'methods'):
            routes.append({'path': prefix + getattr(route, 'path', ''), 'methods': list(route.methods), 'name': getattr(route, 'name', '')})
        elif hasattr(route, 'routes'):
            routes.extend(get_routes(route, prefix + getattr(route, 'path', '')))
    return routes

if __name__ == '__main__':
    print(json.dumps(get_routes(app), indent=2))
