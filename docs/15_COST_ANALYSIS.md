# Cost Analysis

The Skilling Impact Intelligence platform is architected to minimize operational costs, particularly during the prototype and pilot phases.

## 1. Current Prototype Costs (Monthly)

The current deployment utilizes strictly free-tier services.

| Service | Component | Tier | Est. Cost / Mo |
| :--- | :--- | :--- | :--- |
| **Vercel** | Frontend Hosting (React/Vite) | Hobby / Free | $0.00 |
| **Render** | Backend Hosting (FastAPI/Docker) | Free Web Service | $0.00 |
| **Firebase** | Authentication | Spark (Free) | $0.00 |
| **Database** | Demo Repository (In-Memory JSON) | N/A | $0.00 |
| **Total** | | | **$0.00** |

## 2. Projected Pilot Costs (10,000 Users)

When migrating from the prototype to a live pilot, the in-memory database must be replaced with a persistent datastore, and backend compute must be upgraded to prevent cold-starts.

| Service | Component | Tier/Spec | Est. Cost / Mo |
| :--- | :--- | :--- | :--- |
| **Vercel** | Frontend Hosting | Pro Tier (Bandwidth scaling) | ~$20.00 |
| **Render** | Backend Hosting | Starter/Standard (1GB+ RAM, no sleep) | ~$25.00 |
| **Firebase / GCP** | Authentication & Cloud SQL (PostgreSQL) | Standard DB Instance (1 vCPU, 3.75GB) | ~$50.00 |
| **Total** | | | **~$95.00** |

## 3. Cost Mitigation Strategies

- **Stateless AI Computation**: By utilizing `scikit-learn` and Random Forests rather than heavy Deep Learning (LLMs/Neural Nets), the backend does not require expensive GPU instances. Standard CPU instances are sufficient.
- **Client-Side Rendering**: By using a pure React SPA rather than Server-Side Rendering (Next.js), the bulk of the compute (rendering the dashboard charts) is offloaded to the user's browser, significantly reducing backend CPU load.
