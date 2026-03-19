# C++ Hospital Management System

A blazing fast, native microservices-based Hospital Management System built from scratch with **C++17**, **Crow Framework**, **React.js**, **PostgreSQL**, **Redis**, and **Docker**.

## 🚀 How to Run

It is incredibly simple to boot everything up because Docker automatically caches all the compiled C++ code and PostgreSQL data!

### 1. Start the C++ Backend (Docker)
Open your terminal, navigate to the **`cpp-backend`** folder, and run:
```bash
docker-compose up -d
```
*(Note: You do **not** need to add `--build` because all 10 containers are already perfectly compiled. The `-d` flag runs them silently in the background.)*

### 2. Start the React Frontend
Open a second terminal, navigate to the **`frontend/hospital-ui`** folder, and run:
```bash
npm start
```
*(Note: You only need to run `npm install` if you add new Javascript packages in the future.)*

**That's it!** Open `http://localhost:3000` in your browser. The entire C++ architecture, the PostgreSQL database persistence, and the Redis caching layer will instantly come back to life exactly as you left them!

---

## 🏗️ Architecture

This system follows a high-performance microservices architecture with the following **10 tightly coupled containers**:

- 🌐 **api-gateway** (Port 8080): NGINX reverse-proxy handling CORS, static routing, and load balancing natively.
- 👨‍⚕️ **doctor-service** (Port 8082): Fast C++ API managing doctor profiles and scheduling.
  - ⚡ **redis-cache**: Uses `hiredis` C bindings to memcache Doctor GET requests for blistering sub-millisecond responses.
  - 🩺 **postgres-doctor**: Dedicated PostgreSQL 15 database.
- 🤒 **patient-service** (Port 8081): Fast C++ API managing patient records and demographics.
  - 🏥 **postgres-patient**: Dedicated PostgreSQL 15 database.
- 🗓️ **appointment-service** (Port 8083): Fast C++ API handling appointment bookings.
  - 📅 **postgres-appointment**: Dedicated PostgreSQL 15 database.
- 🧾 **billing-service** (Port 8084): Fast C++ API managing invoices and payment history.
  - 💰 **postgres-billing**: Dedicated PostgreSQL 15 database.
- ⚛️ **frontend** (Port 3000): React.js Single Page Application.

## 🛠️ Tech Stack

- **Backend**: C++17, Crow Web Framework, `nlohmann/json`
- **Database Driver**: `libpqxx` (C++ PostgreSQL natively compiled)
- **Cache Driver**: `hiredis` (C API for Redis)
- **Frontend**: React.js, TypeScript, TailwindCSS
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Containerization**: Docker Compose (Debian Bookworm containers)

## 📡 API Documentation
All endpoints reside behind the `api-gateway` on Port `8080`.

- `GET /api/v1/patients`
- `GET /api/v1/doctors` *(Redis Cached)*
- `GET /api/v1/appointments`
- `GET /api/v1/invoices`
- `POST /api/v1/patients`
- `DELETE /api/v1/patients/{id}`
*(... and corresponding CRUD operations for each microservice)*

## 🛑 Stopping Services

```bash
# Stop all services gracefully
cd cpp-backend
docker-compose down

# Destroy all databases and wipe memory completely
docker-compose down -v
```
