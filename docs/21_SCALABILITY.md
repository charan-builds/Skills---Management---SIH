# Scalability Plan

The Skilling Impact Intelligence platform is architected as a decoupled, stateless system. This document outlines the theoretical constraints and the upgrade path required to scale from a local prototype to a national deployment handling millions of trainees.

## 1. Frontend Scalability (Vercel)

- **Current State**: Deployed on Vercel's Edge Network.
- **Scalability Limit**: Virtually infinite. Because the React SPA is compiled into static JavaScript/CSS/HTML files, Vercel caches these files globally.
- **Action Required for Scale**: None. The frontend architecture is already production-ready for millions of concurrent users.

## 2. Backend Compute Scalability (FastAPI)

- **Current State**: Deployed on a single Render container instance.
- **Scalability Limit**: The single container can handle thousands of concurrent I/O requests due to FastAPI's async nature, but will bottleneck if ML inference (CPU bound) spikes.
- **Action Required for Scale**: 
  - Migrate to a managed Kubernetes service (e.g., Google Kubernetes Engine or AWS EKS).
  - Implement a Load Balancer to distribute traffic across 10-50 stateless FastAPI pods.
  - Offload heavy ML batch inference (e.g., nightly cohort scoring) to a Celery/Redis worker queue rather than computing it synchronously on the web thread.

## 3. Database Scalability

- **Current State**: In-memory JSON dataset via `DemoRepository`.
- **Scalability Limit**: ~100,000 records before RAM exhaustion and severe latency spikes.
- **Action Required for Scale**: 
  - Implement the `PostgresRepository` class.
  - Deploy a managed PostgreSQL database (e.g., Cloud SQL or AWS RDS).
  - Ensure strict indexing on the `district`, `programme_id`, and `cohort` columns, as these are heavily utilized in cross-filtering queries.

## 4. Search and Matching Scalability

- **Current State**: TF-IDF Cosine Similarity computed in-memory via Scikit-Learn.
- **Scalability Limit**: O(N) complexity. Matching a trainee against 100 jobs is fast. Matching 1,000,000 trainees against 50,000 jobs will fail in memory.
- **Action Required for Scale**: 
  - Migrate the skill matching to a Vector Database (e.g., Pinecone, Milvus, or pgvector in PostgreSQL).
  - This allows O(log N) approximate nearest neighbor (ANN) search, resolving matches instantly regardless of scale.
