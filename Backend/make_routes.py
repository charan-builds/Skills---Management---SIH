from app.main import app
import json

routes = []
for p, methods in app.openapi()['paths'].items():
    for m, info in methods.items():
        routes.append('| ' + m.upper() + ' | ' + p + ' | ' + info.get('operationId', '') + ' |')

content = """# Phase 2I Backend Route Inventory

This document enumerates the actual application routes exposed by the FastAPI application.

| Method | Path | Operation ID |
|---|---|---|
""" + "\n".join(routes)

with open(r'c:\Pictures\Documents\Cherry 💗💗\Desktop\SmartFins\Charan\Skilling-Impact-Intelligence\PHASE_2I_BACKEND_ROUTE_INVENTORY.md', 'w') as f:
    f.write(content)
