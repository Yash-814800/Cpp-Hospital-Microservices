# Hospital Management System - React Frontend

## Overview
Modern, responsive React frontend application built with TypeScript for managing hospital operations including patients, doctors, appointments, and billing.

## Tech Stack
- **React 18** with TypeScript
- **React Router v6** for navigation
- **Axios** for API communication
- **React Context API** for state management
- **React DatePicker** for date/time selection
- **CSS3** for styling (no UI framework for simplicity)

## Project Structure
```
frontend/hospital-ui/
├── public/                    # Static assets
├── src/
│   ├── components/           # Reusable components
│   │   ├── Navbar.tsx       # Navigation bar with logout
│   │   └── PrivateRoute.tsx # Protected route wrapper
│   ├── context/             # React Context providers
│   │   └── AuthContext.tsx  # Authentication state management
│   ├── pages/               # Page components
│   │   ├── Login.tsx        # Login page
│   │   └── Dashboard.tsx    # Dashboard with statistics
│   ├── services/            # API service layer
│   │   ├── apiClient.ts     # Axios configuration with interceptors
│   │   ├── authService.ts   # Authentication API calls
│   │   ├── patientService.ts    # Patient CRUD operations
│   │   ├── doctorService.ts     # Doctor CRUD operations
│   │   ├── appointmentService.ts # Appointment management
│   │   └── billingService.ts    # Invoice and payment operations
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts         # All data models and interfaces
│   ├── utils/               # Helper functions
│   │   └── helpers.ts       # Date formatting, validation, etc.
│   ├── App.tsx              # Main app component with routing
│   ├── App.css              # Global styles
│   └── index.tsx            # App entry point
├── .env                     # Environment variables
└── package.json             # Dependencies and scripts
```

## Features Implemented

### ✅ Authentication
- Login page with JWT token management
- Token stored in localStorage
- Automatic token attachment to API requests
- Auto-redirect to login on 401 errors
- Protected routes with PrivateRoute wrapper

### ✅ Navigation
- Top navbar with links to all sections
- Active route highlighting
- User info display with logout button
- Responsive design

### ✅ Dashboard
- Statistics cards showing totals:
  - Total Patients
  - Total Doctors
  - Total Appointments
  - Total Invoices
- Quick action buttons for common tasks
- Real-time data from backend APIs

### ✅ API Integration
- Axios client with base URL configuration
- Request interceptor for JWT token
- Response interceptor for global error handling
- Service layer for each domain (patients, doctors, appointments, billing)
- Proper TypeScript typing for all API responses

### ✅ Type Safety
- Full TypeScript coverage
- Type definitions for all data models
- Type-safe API calls with generics
- Form data types

## Environment Configuration

### .env File
```bash
REACT_APP_API_URL=http://localhost:8080/api/v1
REACT_APP_NAME=Hospital Management System
```

## API Services

### Auth Service
```typescript
- login(credentials): Promise<LoginResponse>
- logout(): void
- isAuthenticated(): boolean
- getCurrentUser(): { username, role }
```

### Patient Service
```typescript
- getAllPatients(): Promise<Patient[]>
- getPatientById(id): Promise<Patient>
- createPatient(patient): Promise<Patient>
- updatePatient(id, patient): Promise<Patient>
- deletePatient(id): Promise<void>
- searchPatients(query): Promise<Patient[]>
```

### Doctor Service
```typescript
- getAllDoctors(): Promise<Doctor[]>
- getDoctorById(id): Promise<Doctor>
- createDoctor(doctor): Promise<Doctor>
- updateDoctor(id, doctor): Promise<Doctor>
- deleteDoctor(id): Promise<void>
- updateAvailability(id, availability): Promise<Doctor>
- getDoctorsBySpecialization(specialization): Promise<Doctor[]>
```

### Appointment Service
```typescript
- getAllAppointments(): Promise<Appointment[]>
- getAppointmentById(id): Promise<Appointment>
- createAppointment(appointment): Promise<Appointment>
- updateAppointment(id, appointment): Promise<Appointment>
- cancelAppointment(id): Promise<void>
- deleteAppointment(id): Promise<void>
- getAppointmentsByPatient(patientId): Promise<Appointment[]>
- getAppointmentsByDoctor(doctorId): Promise<Appointment[]>
- getAppointmentsByDate(date): Promise<Appointment[]>
```

### Billing Service
```typescript
- getAllInvoices(): Promise<Invoice[]>
- getInvoiceById(id): Promise<Invoice>
- createInvoice(invoice): Promise<Invoice>
- updateInvoice(id, invoice): Promise<Invoice>
- deleteInvoice(id): Promise<void>
- getInvoicesByPatient(patientId): Promise<Invoice[]>
- getPaymentsByInvoice(invoiceId): Promise<Payment[]>
- recordPayment(invoiceId, amount, method, ...): Promise<Payment>
```

## Utility Functions

### Date & Time
```typescript
formatDate(date): string              // YYYY-MM-DD
formatTime(date): string              // HH:MM
formatDateTime(dateTime): string      // Localized date/time
calculateAge(dateOfBirth): number     // Years
```

### Validation
```typescript
isValidEmail(email): boolean          // Email format check
isValidPhone(phone): boolean          // 10-digit phone check
```

### Display
```typescript
formatCurrency(amount): number        // $X,XXX.XX
getStatusColor(status): string        // Status badge color
getSpecializationName(spec): string   // Formatted specialization
getErrorMessage(error): string        // Extract error message
```

## Running the Application

### Development Mode
```bash
cd frontend/hospital-ui
npm start
```
Runs on: http://localhost:3000

### Production Build
```bash
npm run build
```
Creates optimized build in `build/` directory

### Run Tests
```bash
npm test
```

## Default Credentials
```
Username: admin
Password: admin123
```

## Current Status

### ✅ Completed
1. **Project Setup**: React app with TypeScript, routing, dependencies
2. **Authentication Flow**: Login page, JWT management, protected routes
3. **Layout Components**: Navbar with navigation and logout
4. **Dashboard**: Statistics display with real-time data
5. **API Integration**: Complete service layer for all endpoints
6. **Type Definitions**: Full TypeScript coverage for all data models
7. **Utility Functions**: Date formatting, validation, error handling
8. **Styling**: Clean, modern UI with gradient themes

### 🔄 Next Steps (To Be Built)
1. **Patient Management**:
   - Patient list with search/filter
   - Create/edit patient form with validation
   - Patient details view with medical history
   - Delete confirmation modal

2. **Doctor Management**:
   - Doctor list with specialization filter
   - Create/edit doctor form
   - Doctor profile view with availability
   - Availability schedule management

3. **Appointment Scheduling**:
   - Calendar view for appointments
   - Appointment booking form with doctor availability check
   - Appointment list with status filters
   - Cancel/reschedule functionality

4. **Billing Management**:
   - Invoice list with status filters
   - Create invoice form with line items
   - Invoice details with payment history
   - Record payment functionality
   - Payment history view

## Design Principles

### 1. Component Organization
- **Pages**: Top-level route components
- **Components**: Reusable UI components
- **Services**: API communication layer
- **Context**: Global state management

### 2. State Management
- React Context for authentication
- Local state for component-specific data
- Service layer handles API calls

### 3. Error Handling
- Global error interceptor in API client
- Component-level try/catch for user feedback
- Helper function to extract error messages
- Auto-redirect on 401 (unauthorized)

### 4. TypeScript Best Practices
- Strict type checking enabled
- Interface definitions for all data models
- Type-safe API calls
- No `any` types (use proper typing)

### 5. Code Style
- Functional components with hooks
- Arrow functions for consistency
- Async/await for asynchronous operations
- CSS modules for component styles

## Testing the Frontend

### 1. Start Backend Services
```bash
cd /path/to/Hospital-Management-System
docker-compose up -d
```

### 2. Verify API Gateway
```bash
curl http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 3. Start React Dev Server
```bash
cd frontend/hospital-ui
npm start
```

### 4. Test Workflow
1. Navigate to http://localhost:3000
2. You'll be redirected to `/login`
3. Enter credentials: admin / admin123
4. Click "Sign In"
5. You'll be redirected to `/dashboard`
6. Dashboard shows statistics from backend
7. Navigation links are active (placeholder pages for now)

## Browser DevTools

### Check API Calls
1. Open Browser DevTools (F12)
2. Go to Network tab
3. Navigate around the app
4. See API calls to `http://localhost:8080/api/v1/*`
5. Check request headers for `Authorization: Bearer <token>`

### Check localStorage
```javascript
// In browser console
localStorage.getItem('token')      // JWT token
localStorage.getItem('username')   // Current username
localStorage.getItem('role')       // User role
```

## Common Issues & Solutions

### Issue: CORS Errors
**Solution**: Ensure API Gateway has proper CORS configuration (already configured)

### Issue: 401 Unauthorized
**Solution**: Check if backend services are running, verify token in localStorage

### Issue: Network Error
**Solution**: Verify API Gateway is running on port 8080

### Issue: Can't Login
**Solution**: Check if authentication endpoint is accessible:
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## Performance Considerations

### Current Implementation
- Direct API calls to backend through API Gateway
- Backend has Redis caching (40-65% faster for cached data)
- Frontend makes fresh API calls each time

### Future Optimizations
1. Implement React Query for data caching
2. Add optimistic updates for better UX
3. Lazy load routes with React.lazy()
4. Implement virtual scrolling for large lists
5. Add skeleton loaders for better perceived performance

## Accessibility
- Semantic HTML elements
- Proper form labels
- Keyboard navigation support
- Focus states on interactive elements

## Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Next Development Phase
Continue building the remaining CRUD pages:
1. Patients page with full CRUD operations
2. Doctors page with availability management
3. Appointments page with calendar view
4. Billing page with invoice and payment management

Each page will include:
- List view with search/filter
- Create/edit forms with validation
- Details view
- Delete confirmation
- Error handling and loading states
