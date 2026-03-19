# Hospital Management System - Complete Setup Guide

This guide will help you set up and run the Hospital Management System on your local machine.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start (Recommended)](#quick-start-recommended)
3. [Manual Setup (Alternative)](#manual-setup-alternative)
4. [Testing the Application](#testing-the-application)
5. [Stopping the Application](#stopping-the-application)
6. [Troubleshooting](#troubleshooting)
7. [Available Users](#available-users)

---

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

### Required Software

1. **Docker Desktop** (Recommended Approach)
   - **Mac**: Download from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
   - **Windows**: Download from the same link
   - **Linux**: Install Docker Engine and Docker Compose separately
   - Verify installation:
     ```bash
     docker --version
     docker-compose --version
     ```
   - Docker version should be 20.10+ and Docker Compose 2.0+

2. **Node.js and npm** (for Frontend)
   - Download from [https://nodejs.org/](https://nodejs.org/)
   - Use Node.js LTS version (18.x or higher)
   - Verify installation:
     ```bash
     node --version  # Should show v18.x.x or higher
     npm --version   # Should show 9.x.x or higher
     ```

### Optional (for Manual Development)

3. **Java Development Kit (JDK) 17**
   - Download from [https://adoptium.net/](https://adoptium.net/)
   - Verify installation:
     ```bash
     java -version  # Should show version 17
     ```

4. **Maven 3.9+**
   - Download from [https://maven.apache.org/download.cgi](https://maven.apache.org/download.cgi)
   - Verify installation:
     ```bash
     mvn --version
     ```

### System Requirements
- **RAM**: Minimum 8GB (16GB recommended)
- **Disk Space**: At least 10GB free
- **Operating System**: macOS, Windows 10/11, or Linux

---

## Quick Start (Recommended)

This is the easiest way to run the entire application using Docker.

### Step 1: Clone the Repository

```bash
# Navigate to where you want to store the project
cd ~/Documents/Projects

# Clone the repository (replace with your actual repo URL if applicable)
# If you already have the folder, skip this step
cd Hospital-Management-System
```

### Step 2: Start the Backend Services

```bash
# Make sure you're in the project root directory
cd /path/to/Hospital-Management-System

# Start all backend services (PostgreSQL, Redis, API Gateway, Microservices)
docker-compose up -d --build
```

**What this does:**
- Builds 5 microservices (Patient, Doctor, Appointment, Billing, API Gateway)
- Starts 4 PostgreSQL databases (one per service)
- Starts Redis cache
- Networks everything together

**Expected output:**
```
✔ Container redis-cache           Started
✔ Container postgres-patient      Healthy
✔ Container postgres-doctor       Healthy
✔ Container postgres-appointment  Healthy
✔ Container postgres-billing      Healthy
✔ Container patient-service       Started
✔ Container doctor-service        Started
✔ Container appointment-service   Started
✔ Container billing-service       Started
✔ Container api-gateway           Started
```

**Time required**: 2-5 minutes (first time builds take longer)

### Step 3: Verify Backend Services

Check that all containers are running:

```bash
docker-compose ps
```

You should see all containers with status "Up" or "Healthy".

Test the API Gateway:

```bash
# This should return authentication endpoints
curl http://localhost:8080/api/v1/auth/login
```

### Step 4: Start the Frontend

Open a new terminal window:

```bash
# Navigate to the frontend directory
cd /path/to/Hospital-Management-System/frontend/hospital-ui

# Install dependencies (only needed first time or when dependencies change)
npm install

# Start the React development server
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view hospital-ui in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.x:3000
```

**Time required**: 1-2 minutes

### Step 5: Access the Application

1. **Frontend**: Open your browser and go to [http://localhost:3000](http://localhost:3000)
2. **Login**: Use one of the pre-configured users (see [Available Users](#available-users))
3. **Start exploring!**

---

## Manual Setup (Alternative)

If you prefer to run services individually or don't want to use Docker, follow these steps.

### Step 1: Install and Start PostgreSQL

#### macOS (using Homebrew):
```bash
brew install postgresql@15
brew services start postgresql@15

# Create databases
createdb patient_db
createdb doctor_db
createdb appointment_db
createdb billing_db

# Create user and grant permissions
psql postgres -c "CREATE USER postgres WITH PASSWORD 'postgres';"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE patient_db TO postgres;"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE doctor_db TO postgres;"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE appointment_db TO postgres;"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE billing_db TO postgres;"
```

#### Windows (using installer):
1. Download PostgreSQL 15 from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Install with default settings (remember the password you set)
3. Use pgAdmin or command line to create the four databases

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql-15
sudo systemctl start postgresql
sudo -u postgres createdb patient_db
sudo -u postgres createdb doctor_db
sudo -u postgres createdb appointment_db
sudo -u postgres createdb billing_db
```

### Step 2: Install and Start Redis

#### macOS:
```bash
brew install redis
brew services start redis
```

#### Windows:
Download Redis for Windows from [https://github.com/microsoftarchive/redis/releases](https://github.com/microsoftarchive/redis/releases)

#### Linux:
```bash
sudo apt install redis-server
sudo systemctl start redis
```

### Step 3: Build the Common Library

```bash
cd backend/common-lib
mvn clean install
```

### Step 4: Start Each Microservice

Open separate terminal windows for each service:

**Terminal 1 - Patient Service:**
```bash
cd backend/patient-service
mvn spring-boot:run
```

**Terminal 2 - Doctor Service:**
```bash
cd backend/doctor-service
mvn spring-boot:run
```

**Terminal 3 - Appointment Service:**
```bash
cd backend/appointment-service
mvn spring-boot:run
```

**Terminal 4 - Billing Service:**
```bash
cd backend/billing-service
mvn spring-boot:run
```

**Terminal 5 - API Gateway:**
```bash
cd backend/api-gateway
mvn spring-boot:run
```

**Terminal 6 - Frontend:**
```bash
cd frontend/hospital-ui
npm install
npm start
```

---

## Testing the Application

### 1. Login to the System

1. Open [http://localhost:3000](http://localhost:3000)
2. Use these credentials:
   - **Username**: `admin`
   - **Password**: `admin123`
3. Click "Login"

### 2. Test Patient Management

1. Click "Patients" in the navigation
2. Click "Add Patient" button
3. Fill in the form:
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@example.com
   - Phone: 1234567890
   - Date of Birth: Select a date
   - Gender: Male
   - Address: 123 Main St
   - Blood Group: O+
   - Emergency Contact: 9876543210
4. Click "Save Patient"
5. Verify the patient appears in the list
6. Click "View" to see details
7. Click "Edit" to modify
8. Try the search functionality

### 3. Test Doctor Management

1. Click "Doctors" in the navigation
2. Click "Add Doctor"
3. Fill in the form:
   - First Name: Dr. Sarah
   - Last Name: Smith
   - Email: dr.smith@hospital.com
   - Phone: 5551234567
   - Specialization: Select from dropdown
   - License Number: MD12345
   - Qualifications: MD, Internal Medicine
   - Experience Years: 10
   - Consultation Fee: 150
   - Available Days: Select days
   - Available From/To: Set time slots
4. Click "Save Doctor"
5. Test filtering by specialization
6. View doctor details

### 4. Test Appointment Scheduling

1. Click "Appointments" in the navigation
2. Click "Book Appointment"
3. Select a patient (from dropdown)
4. Select a doctor (from dropdown)
5. Choose appointment date and time
6. Enter reason: "Regular checkup"
7. Click "Book Appointment"
8. Verify appointment appears in list
9. Click "Mark as Completed" to update status
10. Filter appointments by status

### 5. Test Billing

1. Click "Billing" in the navigation
2. Click "Create Invoice"
3. Select a patient
4. Add invoice items:
   - Description: Consultation
   - Quantity: 1
   - Unit Price: 150
   - Click "Add Item"
5. Add another item:
   - Description: Lab Tests
   - Quantity: 3
   - Unit Price: 50
6. Verify total calculates correctly ($300)
7. Enter tax rate (e.g., 10%)
8. Click "Create Invoice"
9. View invoice details
10. Click "Record Payment"
11. Select payment method
12. Click "Record Payment"
13. Verify status changes to "PAID"

### 6. Test Search and Filter

- Search patients by name
- Filter appointments by status (SCHEDULED, COMPLETED, CANCELLED)
- Filter invoices by payment status
- Filter doctors by specialization

---

## Stopping the Application

### If Using Docker:

```bash
# Stop all services
docker-compose down

# Stop and remove all data (WARNING: This deletes all database data)
docker-compose down -v
```

### If Running Manually:

- Press `Ctrl+C` in each terminal window where services are running
- Stop PostgreSQL:
  ```bash
  # macOS
  brew services stop postgresql@15
  
  # Linux
  sudo systemctl stop postgresql
  ```
- Stop Redis:
  ```bash
  # macOS
  brew services stop redis
  
  # Linux
  sudo systemctl stop redis
  ```

---

## Troubleshooting

### Problem: Docker containers won't start

**Solution 1**: Check if ports are already in use
```bash
# Check what's using port 8080
lsof -i :8080

# Kill the process if needed
kill -9 <PID>
```

**Solution 2**: Restart Docker Desktop
- Stop Docker Desktop completely
- Wait 10 seconds
- Start Docker Desktop
- Try `docker-compose up -d --build` again

**Solution 3**: Clean Docker cache
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

### Problem: Frontend shows "Network Error" or can't connect to backend

**Check 1**: Verify API Gateway is running
```bash
curl http://localhost:8080/api/v1/auth/login
```

**Check 2**: Check Docker logs
```bash
docker logs api-gateway --tail 50
```

**Check 3**: Verify CORS is configured
- The API Gateway should allow requests from http://localhost:3000
- Check `backend/api-gateway/src/main/java/com/hospital/gateway/config/CorsConfig.java`

**Solution**: Restart the api-gateway container
```bash
docker-compose restart api-gateway
```

### Problem: "Cannot connect to database"

**Check 1**: Verify PostgreSQL containers are healthy
```bash
docker-compose ps | grep postgres
```

**Check 2**: Check database logs
```bash
docker logs postgres-patient
```

**Solution 1**: Restart the database containers
```bash
docker-compose restart postgres-patient postgres-doctor postgres-appointment postgres-billing
```

**Solution 2**: Rebuild with fresh databases
```bash
docker-compose down -v
docker-compose up -d --build
```

### Problem: "Port 3000 already in use"

**Solution**: Kill the process using port 3000
```bash
# Find the process
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use a different port
PORT=3001 npm start
```

### Problem: Frontend compiles with warnings

**Solution**: Warnings are usually safe to ignore. Common warnings:
- React Hook dependency warnings
- Unused variables
- ESLint suggestions

These don't prevent the app from running.

### Problem: "Build failed" during `docker-compose up`

**Solution 1**: Clean Maven cache
```bash
cd backend/common-lib
mvn clean install -U
cd ../..
docker-compose up -d --build
```

**Solution 2**: Increase Docker memory
- Open Docker Desktop Settings
- Go to Resources
- Increase Memory to at least 4GB
- Click "Apply & Restart"

### Problem: Services are slow or unresponsive

**Check**: System resources
```bash
docker stats
```

**Solution**: 
1. Close unnecessary applications
2. Increase Docker resources (CPU and Memory)
3. Restart Docker Desktop

### Problem: Can't login, "Invalid credentials"

**Verify**: You're using the correct credentials
- Username: `admin`, Password: `admin123`
- Username: `doctor`, Password: `doctor123`
- Username: `patient`, Password: `patient123`

**Note**: These are hardcoded in `AuthController.java` for demo purposes

### Problem: Data is lost after restarting Docker

**Explanation**: This is expected if you used `docker-compose down -v`
- The `-v` flag removes volumes (database storage)
- Use `docker-compose down` (without -v) to preserve data

**Solution**: To persist data:
```bash
# Stop without removing volumes
docker-compose down

# Start again - data will still be there
docker-compose up -d
```

---

## Available Users

The system comes with pre-configured demo users (stored in-memory in the API Gateway):

| Username | Password    | Description                    |
|----------|-------------|--------------------------------|
| admin    | admin123    | Full administrative access     |
| doctor   | doctor123   | Healthcare provider access     |
| patient  | patient123  | Patient portal access          |

**Note**: In a production environment, these would be stored in a database with proper password hashing. This is a simplified demo implementation.

---

## Service Ports Reference

| Service             | Port | URL                                    |
|---------------------|------|----------------------------------------|
| Frontend (React)    | 3000 | http://localhost:3000                  |
| API Gateway         | 8080 | http://localhost:8080                  |
| Patient Service     | 8081 | http://localhost:8081/api/v1/patients  |
| Doctor Service      | 8082 | http://localhost:8082/api/v1/doctors   |
| Appointment Service | 8083 | http://localhost:8083/api/v1/appointments |
| Billing Service     | 8084 | http://localhost:8084/api/v1/invoices  |
| Redis Cache         | 6379 | redis://localhost:6379                 |
| Patient DB          | 5432 | postgresql://localhost:5432/patient_db |
| Doctor DB           | 5433 | postgresql://localhost:5433/doctor_db  |
| Appointment DB      | 5434 | postgresql://localhost:5434/appointment_db |
| Billing DB          | 5435 | postgresql://localhost:5435/billing_db |

---

## Database Access

If you need to access the databases directly:

### Using Docker:
```bash
# Connect to patient database
docker exec -it postgres-patient psql -U postgres -d patient_db

# Common SQL commands:
\dt                    # List tables
\d patients           # Describe patients table
SELECT * FROM patients LIMIT 10;  # Query data
\q                    # Quit
```

### Using a GUI Tool (TablePlus, pgAdmin, DBeaver):
```
Host: localhost
Port: 5432 (patient), 5433 (doctor), 5434 (appointment), 5435 (billing)
User: postgres
Password: postgres
Database: patient_db (or doctor_db, appointment_db, billing_db)
```

---

## Redis Cache Access

```bash
# Connect to Redis CLI
docker exec -it redis-cache redis-cli

# Common commands:
KEYS *                 # List all keys
GET patients::1        # Get a cached patient
FLUSHALL              # Clear all cache (use carefully!)
exit                  # Quit
```

---

## Useful Commands

### Check Service Health
```bash
# Check all containers
docker-compose ps

# Check specific service logs
docker logs patient-service --tail 100 --follow

# Check API Gateway logs
docker logs api-gateway --tail 50

# Check all logs
docker-compose logs -f
```

### Restart a Single Service
```bash
# Restart just the doctor service
docker-compose restart doctor-service

# Rebuild and restart
docker-compose up -d --build doctor-service
```

### Database Operations
```bash
# Backup a database
docker exec postgres-patient pg_dump -U postgres patient_db > backup.sql

# Restore a database
docker exec -i postgres-patient psql -U postgres patient_db < backup.sql
```

### Clean Up Resources
```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Full cleanup (careful!)
docker system prune -a --volumes
```

---

## Next Steps

Once you have the application running:

1. **Explore the Codebase**: Read through `LEARNING_GUIDE.md` to understand the architecture
2. **Make Changes**: Try modifying the frontend or backend
3. **Add Features**: Implement new functionality
4. **Learn Microservices**: Understand how services communicate
5. **Study Security**: Review JWT implementation in the API Gateway
6. **Optimize Performance**: Learn about Redis caching strategies

---

## Getting Help

If you encounter issues not covered in this guide:

1. Check the logs: `docker-compose logs -f`
2. Verify all services are running: `docker-compose ps`
3. Check port conflicts: `lsof -i :<port>`
4. Review the code for error messages
5. Consult the `LEARNING_GUIDE.md` for architecture details

---

## Production Deployment Notes

**Important**: This setup is for local development only. For production deployment:

- Use environment variables for all secrets (don't hardcode JWT secret)
- Implement proper user authentication with a database
- Use HTTPS with SSL certificates
- Add API rate limiting
- Implement comprehensive logging and monitoring
- Use managed PostgreSQL and Redis services
- Add health checks and auto-restart policies
- Implement proper backup strategies
- Use container orchestration (Kubernetes)
- Add API documentation (Swagger/OpenAPI)

This application is a learning project and should not be used in a real hospital environment without significant security hardening.
