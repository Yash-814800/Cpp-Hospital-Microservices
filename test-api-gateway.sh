#!/bin/bash

# API Gateway Test Script
# Tests authentication, routing, and service integration through the gateway

BASE_URL="http://localhost:8080/api/v1"
TOKEN=""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to extract HTTP code and body (macOS compatible)
extract_response() {
    local response="$1"
    HTTP_CODE=$(echo "$response" | tail -1)
    BODY=$(echo "$response" | sed '$d')
}

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

echo -e "${BLUE}Starting API Gateway Tests${NC}\n"

# Test 1: Register new user (with unique timestamp)
echo "Test 1: Register new user"
TIMESTAMP=$(date +%s)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"testuser$TIMESTAMP\",
    \"password\": \"testpass123\"
  }")
extract_response "$RESPONSE"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    print_result 0 "User registration"
else
    print_result 1 "User registration (HTTP $HTTP_CODE) - User might already exist"
fi

# Test 2: Login with admin credentials
echo -e "\nTest 2: Login with admin credentials"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }')
extract_response "$RESPONSE"

if [ "$HTTP_CODE" = "200" ]; then
    TOKEN=$(echo "$BODY" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
    if [ -n "$TOKEN" ]; then
        print_result 0 "Admin login and token retrieval"
        echo "Token: ${TOKEN:0:50}..."
    else
        print_result 1 "Token extraction from login response"
    fi
else
    print_result 1 "Admin login (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
fi

# Test 3: Access protected endpoint without token
echo -e "\nTest 3: Access protected endpoint without authentication"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET $BASE_URL/patients)
extract_response "$RESPONSE"

if [ "$HTTP_CODE" = "401" ]; then
    print_result 0 "Unauthorized access blocked"
else
    print_result 1 "Unauthorized access should return 401 (got $HTTP_CODE)"
fi

# Test 4: Access protected endpoint with invalid token
echo -e "\nTest 4: Access protected endpoint with invalid token"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET $BASE_URL/patients \
  -H "Authorization: Bearer invalid_token")
extract_response "$RESPONSE"

if [ "$HTTP_CODE" = "401" ]; then
    print_result 0 "Invalid token rejected"
else
    print_result 1 "Invalid token should return 401 (got $HTTP_CODE)"
fi

# Test 5: Create patient through gateway
echo -e "\nTest 5: Create patient through API Gateway"
TIMESTAMP=$(date +%s)
RANDOM_SUFFIX=$((RANDOM % 10000))
# Generate a valid 10-digit phone number
PHONE_NUM="91${TIMESTAMP:2:8}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"firstName\": \"John\",
    \"lastName\": \"Doe\",
    \"dateOfBirth\": \"1990-05-15\",
    \"gender\": \"MALE\",
    \"email\": \"john.doe${TIMESTAMP}${RANDOM_SUFFIX}@example.com\",
    \"phone\": \"$PHONE_NUM\",
    \"address\": \"123 Main St\"
  }")
extract_response "$RESPONSE"

if [ "$HTTP_CODE" = "201" ]; then
    PATIENT_ID=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', data).get('id', ''))" 2>/dev/null)
    if [ -n "$PATIENT_ID" ]; then
        print_result 0 "Patient creation through gateway"
        echo "Patient ID: $PATIENT_ID"
    else
        print_result 1 "Patient creation - could not extract ID"
        echo "Response: $BODY"
    fi
else
    print_result 1 "Patient creation (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
fi

# Test 6: Get patient through gateway
echo -e "\nTest 6: Get patient through API Gateway"
if [ -z "$PATIENT_ID" ]; then
    print_result 1 "Patient retrieval - No patient ID from previous test"
else
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET $BASE_URL/patients/$PATIENT_ID \
      -H "Authorization: Bearer $TOKEN")
    extract_response "$RESPONSE"

    if [ "$HTTP_CODE" = "200" ]; then
        print_result 0 "Patient retrieval through gateway"
    else
        print_result 1 "Patient retrieval (HTTP $HTTP_CODE)"
    fi
fi

# Test 7: List all patients through gateway
echo -e "\nTest 7: List all patients through API Gateway"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/patients?page=0&size=10" \
  -H "Authorization: Bearer $TOKEN")
extract_response "$RESPONSE"

if [ "$HTTP_CODE" = "200" ]; then
    print_result 0 "Patient list retrieval through gateway"
else
    print_result 1 "Patient list retrieval (HTTP $HTTP_CODE)"
fi

# Test 8: Create doctor through gateway
echo -e "\nTest 8: Create doctor through API Gateway"
TIMESTAMP=$(date +%s)
RANDOM_SUFFIX=$((RANDOM % 10000))
# Generate a valid 10-digit phone number
PHONE_NUM="92${TIMESTAMP:2:8}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/doctors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"firstName\": \"Jane\",
    \"lastName\": \"Smith\",
    \"specialization\": \"CARDIOLOGY\",
    \"email\": \"jane.smith${TIMESTAMP}${RANDOM_SUFFIX}@hospital.com\",
    \"phone\": \"$PHONE_NUM\",
    \"licenseNumber\": \"DOC${TIMESTAMP}${RANDOM_SUFFIX}\"
  }")
extract_response "$RESPONSE"

if [ "$HTTP_CODE" = "201" ]; then
    DOCTOR_ID=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', data).get('id', ''))" 2>/dev/null)
    if [ -n "$DOCTOR_ID" ]; then
        print_result 0 "Doctor creation through gateway"
        echo "Doctor ID: $DOCTOR_ID"
    else
        print_result 1 "Doctor creation - could not extract ID"
        echo "Response: $BODY"
    fi
else
    print_result 1 "Doctor creation (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
fi

# Test 9: Get doctor through gateway
echo -e "\nTest 9: Get doctor through API Gateway"
if [ -z "$DOCTOR_ID" ]; then
    print_result 1 "Doctor retrieval - No doctor ID from previous test"
else
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET $BASE_URL/doctors/$DOCTOR_ID \
      -H "Authorization: Bearer $TOKEN")
    extract_response "$RESPONSE"

    if [ "$HTTP_CODE" = "200" ]; then
        print_result 0 "Doctor retrieval through gateway"
    else
        print_result 1 "Doctor retrieval (HTTP $HTTP_CODE)"
    fi
fi

# Test 10: Create appointment through gateway
echo -e "\nTest 10: Create appointment through API Gateway"
if [ -z "$PATIENT_ID" ] || [ -z "$DOCTOR_ID" ]; then
    print_result 1 "Appointment creation - Missing patient or doctor ID"
else
    # Generate date and time separately
    APPOINTMENT_DATE=$(date -u -v+1d +"%Y-%m-%d" 2>/dev/null || date -u -d "+1 day" +"%Y-%m-%d")
    APPOINTMENT_TIME="10:00:00"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/appointments \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{
        \"patientId\": $PATIENT_ID,
        \"doctorId\": $DOCTOR_ID,
        \"appointmentDate\": \"$APPOINTMENT_DATE\",
        \"appointmentTime\": \"$APPOINTMENT_TIME\",
        \"reason\": \"Regular checkup\",
        \"notes\": \"Patient reports feeling well\"
      }")
    extract_response "$RESPONSE"

    if [ "$HTTP_CODE" = "201" ]; then
        APPOINTMENT_ID=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', data).get('id', ''))" 2>/dev/null)
        if [ -n "$APPOINTMENT_ID" ]; then
            print_result 0 "Appointment creation through gateway"
            echo "Appointment ID: $APPOINTMENT_ID"
        else
            print_result 1 "Appointment creation - could not extract ID"
            echo "Response: $BODY"
        fi
    else
        print_result 1 "Appointment creation (HTTP $HTTP_CODE)"
        echo "Response: $BODY"
    fi
fi

# Test 11: Get appointment through gateway
echo -e "\nTest 11: Get appointment through API Gateway"
if [ -z "$APPOINTMENT_ID" ]; then
    print_result 1 "Appointment retrieval - No appointment ID from previous test"
else
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET $BASE_URL/appointments/$APPOINTMENT_ID \
      -H "Authorization: Bearer $TOKEN")
    extract_response "$RESPONSE"

    if [ "$HTTP_CODE" = "200" ]; then
        print_result 0 "Appointment retrieval through gateway"
    else
        print_result 1 "Appointment retrieval (HTTP $HTTP_CODE)"
    fi
fi

# Test 12: Create invoice through gateway
echo -e "\nTest 12: Create invoice through API Gateway"
if [ -z "$PATIENT_ID" ] || [ -z "$APPOINTMENT_ID" ]; then
    print_result 1 "Invoice creation - Missing patient or appointment ID"
else
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/invoices \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{
        \"patientId\": $PATIENT_ID,
        \"appointmentId\": $APPOINTMENT_ID,
        \"consultationFee\": 150.00,
        \"medicationCharges\": 50.00,
        \"testCharges\": 100.00,
        \"otherCharges\": 0.00,
        \"discount\": 0.00,
        \"tax\": 15.00,
        \"notes\": \"Regular checkup charges\"
      }")
    extract_response "$RESPONSE"

    if [ "$HTTP_CODE" = "201" ]; then
        INVOICE_ID=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', data).get('id', ''))" 2>/dev/null)
        if [ -n "$INVOICE_ID" ]; then
            print_result 0 "Invoice creation through gateway"
            echo "Invoice ID: $INVOICE_ID"
        else
            print_result 1 "Invoice creation - could not extract ID"
            echo "Response: $BODY"
        fi
    else
        print_result 1 "Invoice creation (HTTP $HTTP_CODE)"
        echo "Response: $BODY"
    fi
fi

# Test 13: Get invoice through gateway
echo -e "\nTest 13: Get invoice through API Gateway"
if [ -z "$INVOICE_ID" ]; then
    print_result 1 "Invoice retrieval - No invoice ID from previous test"
else
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET $BASE_URL/invoices/$INVOICE_ID \
      -H "Authorization: Bearer $TOKEN")
    extract_response "$RESPONSE"

    if [ "$HTTP_CODE" = "200" ]; then
        print_result 0 "Invoice retrieval through gateway"
    else
        print_result 1 "Invoice retrieval (HTTP $HTTP_CODE)"
    fi
fi

# Test 14: Test CORS headers
echo -e "\nTest 14: Test CORS headers"
RESPONSE=$(curl -s -I -X OPTIONS $BASE_URL/patients \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET")

if echo "$RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    print_result 0 "CORS headers present"
else
    print_result 1 "CORS headers missing"
fi

# Test 15: Test routing to all services
echo -e "\nTest 15: Verify all service routes are accessible"
SERVICES=("patients" "doctors" "appointments" "invoices")
SERVICE_PASSED=0
for SERVICE in "${SERVICES[@]}"; do
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/$SERVICE?page=0&size=1" \
      -H "Authorization: Bearer $TOKEN")
    extract_response "$RESPONSE"
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}  ✓${NC} $SERVICE service accessible"
        ((SERVICE_PASSED++))
    else
        echo -e "${RED}  ✗${NC} $SERVICE service failed (HTTP $HTTP_CODE)"
    fi
done

if [ $SERVICE_PASSED -eq ${#SERVICES[@]} ]; then
    print_result 0 "All service routes accessible"
else
    print_result 1 "Some service routes failed"
fi

# Summary
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}API Gateway Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Tests Passed: $PASSED${NC}"
echo -e "${RED}Tests Failed: $FAILED${NC}"
echo -e "${BLUE}========================================${NC}"

# Exit with error if any tests failed
if [ $FAILED -gt 0 ]; then
    exit 1
else
    exit 0
fi
