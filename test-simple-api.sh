#!/bin/bash

# Simple API Test Script for Banks
# This script tests basic API functionality with seeded data

set -e

BASE_URL="http://localhost:3000"
TOKEN=""

echo "🧪 Testing Banks API with Seeded Data"
echo "======================================="

# Function to check if server is running
check_server() {
    if curl -s "$BASE_URL/health" > /dev/null 2>&1; then
        echo "✅ Server is running at $BASE_URL"
        return 0
    else
        echo "❌ Server is not running at $BASE_URL"
        return 1
    fi
}

# Function to register a test user
register_user() {
    echo "📝 Registering test user..."
    response=$(curl -s -X POST "$BASE_URL/app/users/register" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "testuser@example.com",
            "password": "TestPass123",
            "firstName": "Test",
            "lastName": "User"
        }')
    
    if echo "$response" | grep -q '"success":true'; then
        echo "✅ User registered successfully"
    else
        echo "⚠️  User registration response: $response"
    fi
}

# Function to login and get token
login_user() {
    echo "🔐 Logging in test user..."
    response=$(curl -s -X POST "$BASE_URL/app/users/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "testuser@example.com",
            "password": "TestPass123"
        }')
    
    echo "Login response: $response"
    TOKEN=$(echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$TOKEN" ]; then
        echo "✅ Login successful, token obtained"
        echo "Token: ${TOKEN:0:50}..."
    else
        echo "❌ Login failed - no token found"
        return 1
    fi
}

# Function to test GET banks
test_get_banks() {
    echo "📋 Testing GET banks..."
    response=$(curl -s -X GET "$BASE_URL/api/banks" \
        -H "Authorization: Bearer $TOKEN")
    
    echo "GET banks response: $response"
    
    if echo "$response" | grep -q '"success":true'; then
        echo "✅ GET banks successful"
        
        # Count banks
        count=$(echo "$response" | grep -o '"bank_id"' | wc -l)
        echo "📊 Found $count banks in database"
    else
        echo "❌ GET banks failed"
        return 1
    fi
}

# Function to test GET bank details
test_get_bank_details() {
    echo "🔍 Testing GET bank details..."
    
    # First get a bank ID from the list
    response=$(curl -s -X GET "$BASE_URL/api/banks" \
        -H "Authorization: Bearer $TOKEN")
    
    # Extract first bank ID
    bank_id=$(echo "$response" | grep -o '"bank_id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -z "$bank_id" ]; then
        echo "❌ No bank ID found in response"
        return 1
    fi
    
    echo "Testing with bank ID: $bank_id"
    
    response=$(curl -s -X GET "$BASE_URL/api/banks/$bank_id/details" \
        -H "Authorization: Bearer $TOKEN")
    
    echo "GET bank details response: $response"
    
    if echo "$response" | grep -q '"success":true'; then
        echo "✅ GET bank details successful"
    else
        echo "❌ GET bank details failed"
        return 1
    fi
}

# Function to test GET bank groups
test_get_bank_groups() {
    echo "🏦 Testing GET bank groups..."
    response=$(curl -s -X GET "$BASE_URL/api/bank-groups" \
        -H "Authorization: Bearer $TOKEN")
    
    echo "GET bank groups response: $response"
    
    if echo "$response" | grep -q '"success":true'; then
        echo "✅ GET bank groups successful"
        
        # Count groups
        count=$(echo "$response" | grep -o '"group_id"' | wc -l)
        echo "📊 Found $count bank groups in database"
    else
        echo "❌ GET bank groups failed"
        return 1
    fi
}

# Main test execution
main() {
    echo "🚀 Starting simple API tests..."
    
    check_server
    register_user
    login_user
    test_get_banks
    test_get_bank_details
    test_get_bank_groups
    
    echo ""
    echo "🎉 All simple API tests passed successfully!"
    echo "======================================="
    echo "✅ API endpoints are working correctly"
    echo "✅ Authentication is working"
    echo "✅ Database seeding was successful"
    echo "✅ Frontend can now connect to backend"
}

# Run main function
main "$@"