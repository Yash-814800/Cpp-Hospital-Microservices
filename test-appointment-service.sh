#!/bin/bash

BASE_URL="http://localhost:8083/api/v1/appointments"
PATIENT_URL="http://localhost:8081/api/v1/patients"
DOCTOR_URL="http://localhost:8082/api/v1/doctors"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASSED${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}: $2"
        ((FAILED++))
    fi
}

echo "=========================================="
echo "Appointment Service Integration Tests"
echo "=========================================="
echo ""

# Setup: Create a patient for testing
echo -e "${YELLOW}Setting up test data...${NC}"

# Generate unique email using timestamp
TIMESTAMP=$(date +%s)

PATIENT_RESPONSE=$(curl -s -X POST "$PATIENT_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Test\",
    \"lastName\": \"Patient\",
    \"email\": \"test.patient.${TIMESTAMP}@appointment.com\",
    \"phone\": \"987654${TIMESTAMP: -4}\",
    \"dateOfBirth\": \"1990-01-15\",
    \"gender\": \"MALE\",
    \"address\": \"Test Address\",
    \"bloodGroup\": \"O+\"
  }")

echo "Patient Response: $PATIENT_RESPONSE"
PATIENT_ID=$(echo $PATIENT_RESPONSE | grep -o '"data":{"id":[0-9]*' | grep -o '[0-9]*')
echo "Created test patient with ID: $PATIENT_ID"

# Setup: Create a doctor for testing
DOCTOR_RESPONSE=$(curl -s -X POST "$DOCTOR_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Dr. Test\",
    \"lastName\": \"Doctor\",
    \"email\": \"test.doctor.${TIMESTAMP}@appointment.com\",
    \"phone\": \"876543${TIMESTAMP: -4}\",
    \"licenseNumber\": \"LIC-APPT-${TIMESTAMP}\",
    \"specialization\": \"Cardiology\",
    \"qualification\": \"MBBS, MD\",
    \"experienceYears\": 15,
    \"consultationFee\": 1500.00,
    \"department\": \"Cardiology\",
    \"roomNumber\": \"C-101\",
    \"availableDays\": [\"MONDAY\", \"TUESDAY\", \"WEDNESDAY\"],
    \"startTime\": \"09:00\",
    \"endTime\": \"17:00\",
    \"isAvailable\": true
  }")

echo "Doctor Response: $DOCTOR_RESPONSE"
DOCTOR_ID=$(echo $DOCTOR_RESPONSE | grep -o '"data":{"id":[0-9]*' | grep -o '[0-9]*')
echo "Created test doctor with ID: $DOCTOR_ID"
echo ""

# Test 1: Create an appointment
echo "Test 1: Create an appointment"
APPOINTMENT_RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "{\"patientId\":$PATIENT_ID,\"doctorId\":$DOCTOR_ID,\"appointmentDate\":\"2024-12-15\",\"appointmentTime\":\"10:00\",\"reason\":\"Regular checkup\"}")

APPOINTMENT_ID=$(echo $APPOINTMENT_RESPONSE | grep -o '"data":{"id":[0-9]*' | grep -o '[0-9]*')

if [ ! -z "$APPOINTMENT_ID" ] && echo $APPOINTMENT_RESPONSE | grep -q "Test Patient"; then
    print_result 0 "Create appointment"
    echo "   Response includes patient name: $(echo $APPOINTMENT_RESPONSE | grep -o '"patientName":"[^"]*"')"
    echo "   Response includes doctor name: $(echo $APPOINTMENT_RESPONSE | grep -o '"doctorName":"[^"]*"')"
else
    print_result 1 "Create appointment"
    echo "   Response: $APPOINTMENT_RESPONSE"
fi
echo ""

# Test 2: Get appointment by ID
echo "Test 2: Get appointment by ID"
GET_RESPONSE=$(curl -s "$BASE_URL/$APPOINTMENT_ID")

if echo $GET_RESPONSE | grep -q "\"id\":$APPOINTMENT_ID" && echo $GET_RESPONSE | grep -q "Test Patient"; then
    print_result 0 "Get appointment by ID with enriched data"
else
    print_result 1 "Get appointment by ID"
    echo "   Response: $GET_RESPONSE"
fi
echo ""

# Test 3: Get all appointments
echo "Test 3: Get all appointments"
ALL_RESPONSE=$(curl -s "$BASE_URL")

if echo $ALL_RESPONSE | grep -q "\"id\":$APPOINTMENT_ID"; then
    print_result 0 "Get all appointments"
else
    print_result 1 "Get all appointments"
fi
echo ""

# Test 4: Get appointments by patient
echo "Test 4: Get appointments by patient"
PATIENT_APPTS=$(curl -s "$BASE_URL/patient/$PATIENT_ID")

if echo $PATIENT_APPTS | grep -q "\"id\":$APPOINTMENT_ID"; then
    print_result 0 "Get appointments by patient"
else
    print_result 1 "Get appointments by patient"
    echo "   Response: $PATIENT_APPTS"
fi
echo ""

# Test 5: Get appointments by doctor
echo "Test 5: Get appointments by doctor"
DOCTOR_APPTS=$(curl -s "$BASE_URL/doctor/$DOCTOR_ID")

if echo $DOCTOR_APPTS | grep -q "\"id\":$APPOINTMENT_ID"; then
    print_result 0 "Get appointments by doctor"
else
    print_result 1 "Get appointments by doctor"
    echo "   Response: $DOCTOR_APPTS"
fi
echo ""

# Test 6: Get appointments by date
echo "Test 6: Get appointments by date"
DATE_APPTS=$(curl -s "$BASE_URL/date/2024-12-15")

if echo $DATE_APPTS | grep -q "\"id\":$APPOINTMENT_ID"; then
    print_result 0 "Get appointments by date"
else
    print_result 1 "Get appointments by date"
    echo "   Response: $DATE_APPTS"
fi
echo ""

# Test 7: Get appointments by status
echo "Test 7: Get appointments by status"
STATUS_APPTS=$(curl -s "$BASE_URL/status/SCHEDULED")

if echo $STATUS_APPTS | grep -q "\"id\":$APPOINTMENT_ID"; then
    print_result 0 "Get appointments by status"
else
    print_result 1 "Get appointments by status"
    echo "   Response: $STATUS_APPTS"
fi
echo ""

# Test 8: Update appointment status to CONFIRMED
echo "Test 8: Update appointment status to CONFIRMED"
UPDATE_STATUS=$(curl -s -X PATCH "$BASE_URL/$APPOINTMENT_ID/status?status=CONFIRMED")

if echo $UPDATE_STATUS | grep -q "\"status\":\"CONFIRMED\""; then
    print_result 0 "Update status to CONFIRMED"
else
    print_result 1 "Update status to CONFIRMED"
    echo "   Response: $UPDATE_STATUS"
fi
echo ""

# Test 9: Update appointment status to COMPLETED with medical details
echo "Test 9: Update status to COMPLETED and add medical details"
# First create a new appointment for this test
NEW_APPT=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "{\"patientId\":$PATIENT_ID,\"doctorId\":$DOCTOR_ID,\"appointmentDate\":\"2024-12-16\",\"appointmentTime\":\"11:00\",\"reason\":\"Follow-up\"}")

# Extract ID using python for reliable JSON parsing
NEW_APPT_ID=$(echo "$NEW_APPT" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)

if [ -z "$NEW_APPT_ID" ]; then
    print_result 1 "Update medical details (failed to create appointment for test)"
    echo "   Response: $NEW_APPT"
else
    # Update status to COMPLETED
    curl -s -X PATCH "$BASE_URL/$NEW_APPT_ID/status?status=COMPLETED" > /dev/null

    # Then add medical details
    UPDATE_MEDICAL=$(curl -s -X PATCH "$BASE_URL/$NEW_APPT_ID/medical-details" \
      -H "Content-Type: application/json" \
      -d '{
        "diagnosis": "Patient is healthy, routine checkup completed",
        "prescription": "Vitamin D supplements, 1 tablet daily",
        "notes": "Next checkup recommended in 6 months"
      }')

    if echo $UPDATE_MEDICAL | grep -q "\"status\":\"COMPLETED\"" && echo $UPDATE_MEDICAL | grep -q "Vitamin D"; then
        print_result 0 "Update medical details and complete appointment"
    else
        print_result 1 "Update medical details"
        echo "   Response: $UPDATE_MEDICAL"
    fi
fi
echo ""

# Test 10: Create another appointment to test conflict detection
echo "Test 10: Test conflict detection (double booking prevention)"
CONFLICT_RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "{\"patientId\":$PATIENT_ID,\"doctorId\":$DOCTOR_ID,\"appointmentDate\":\"2024-12-15\",\"appointmentTime\":\"10:00\",\"reason\":\"Another appointment at same time\"}")

if echo $CONFLICT_RESPONSE | grep -q "conflict\|already has an appointment"; then
    print_result 0 "Conflict detection prevents double booking"
else
    print_result 1 "Conflict detection"
    echo "   Response: $CONFLICT_RESPONSE"
fi
echo ""

# Test 11: Create appointment at different time (should succeed)
echo "Test 11: Create appointment at different time"
SECOND_APPOINTMENT=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "{\"patientId\":$PATIENT_ID,\"doctorId\":$DOCTOR_ID,\"appointmentDate\":\"2024-12-15\",\"appointmentTime\":\"14:00\",\"reason\":\"Follow-up consultation\"}")

SECOND_APPT_ID=$(echo $SECOND_APPOINTMENT | grep -o '"data":{"id":[0-9]*' | grep -o '[0-9]*')

if [ ! -z "$SECOND_APPT_ID" ] && [ "$SECOND_APPT_ID" != "$APPOINTMENT_ID" ]; then
    print_result 0 "Create appointment at different time"
else
    print_result 1 "Create appointment at different time"
    echo "   Response: $SECOND_APPOINTMENT"
fi
echo ""

# Test 12: Cancel appointment
echo "Test 12: Cancel appointment"
CANCEL_RESPONSE=$(curl -s -X PATCH "$BASE_URL/$SECOND_APPT_ID/status?status=CANCELLED")

if echo $CANCEL_RESPONSE | grep -q "\"status\":\"CANCELLED\"" && echo $CANCEL_RESPONSE | grep -q "cancelledAt"; then
    print_result 0 "Cancel appointment (sets cancelledAt timestamp)"
else
    print_result 1 "Cancel appointment"
    echo "   Response: $CANCEL_RESPONSE"
fi
echo ""

# Test 13: Try to book with invalid patient ID
echo "Test 13: Error handling - Invalid patient ID"
INVALID_PATIENT=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "{\"patientId\":99999,\"doctorId\":$DOCTOR_ID,\"appointmentDate\":\"2024-12-20\",\"appointmentTime\":\"10:00\",\"reason\":\"Test\"}")

if echo $INVALID_PATIENT | grep -q "not found\|does not exist"; then
    print_result 0 "Invalid patient ID returns error"
else
    print_result 1 "Invalid patient ID error handling"
    echo "   Response: $INVALID_PATIENT"
fi
echo ""

# Test 14: Try to book with invalid doctor ID
echo "Test 14: Error handling - Invalid doctor ID"
INVALID_DOCTOR=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "{\"patientId\":$PATIENT_ID,\"doctorId\":99999,\"appointmentDate\":\"2024-12-20\",\"appointmentTime\":\"10:00\",\"reason\":\"Test\"}")

if echo $INVALID_DOCTOR | grep -q "not found\|does not exist"; then
    print_result 0 "Invalid doctor ID returns error"
else
    print_result 1 "Invalid doctor ID error handling"
    echo "   Response: $INVALID_DOCTOR"
fi
echo ""

# Test 15: Try to book with unavailable doctor
echo "Test 15: Error handling - Unavailable doctor"
# First, make the doctor unavailable
TOGGLE_RESPONSE=$(curl -s -X PATCH "$DOCTOR_URL/$DOCTOR_ID/availability?isAvailable=false")
echo "   Toggle response: $TOGGLE_RESPONSE"

# Verify doctor is unavailable
DOCTOR_CHECK=$(curl -s "$DOCTOR_URL/$DOCTOR_ID")
echo "   Doctor status: $(echo $DOCTOR_CHECK | grep -o '"isAvailable":[^,}]*')"

UNAVAILABLE_DOCTOR=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "{\"patientId\":$PATIENT_ID,\"doctorId\":$DOCTOR_ID,\"appointmentDate\":\"2024-12-25\",\"appointmentTime\":\"10:00\",\"reason\":\"Test\"}")

if echo $UNAVAILABLE_DOCTOR | grep -q "not available\|unavailable"; then
    print_result 0 "Unavailable doctor returns error"
else
    print_result 1 "Unavailable doctor error handling"
    echo "   Response: $UNAVAILABLE_DOCTOR"
fi

# Restore doctor availability
curl -s -X PATCH "$DOCTOR_URL/$DOCTOR_ID/availability?isAvailable=true" > /dev/null
echo ""

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed.${NC}"
    exit 1
fi
