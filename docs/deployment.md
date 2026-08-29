# SentinelPay — Deployment Guide

This document provides instructions for running SentinelPay locally or in containerized Docker environments.

---

## 1. Local Prerequisites

- **Python:** 3.11 or higher
- **Node.js:** 18.x or higher (npm 9.x+)
- **Git**

---

## 2. Local Manual Setup

### Step A: Clone & Set Up Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend API Docs will be available at: `http://localhost:8000/docs`

### Step B: Set Up Frontend Portal

```bash
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

Frontend Merchant Portal will be available at: `http://localhost:3000`

---

## 3. Containerized Setup via Docker Compose

SentinelPay includes production-ready Docker containers for both backend and frontend.

```bash
# Build and launch all services in detached mode
docker-compose up --build -d
```

### Services Launched
- **Backend API:** `http://localhost:8000`
- **Frontend Portal:** `http://localhost:3000`

To stop container services:
```bash
docker-compose down
```
