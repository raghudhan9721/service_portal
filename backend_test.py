#!/usr/bin/env python3
"""
Institute Service Portal Backend API Testing
Tests all backend endpoints systematically
"""

import requests
import json
import sys
import os
from datetime import datetime

# Get base URL from environment
BASE_URL = "https://agent-alarm-3.preview.emergentagent.com/api"

class APITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.test_results = []
        self.student_data = None
        self.request_id = None
        
    def log_test(self, test_name, success, message, response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'response_data': response_data,
            'timestamp': datetime.now().isoformat()
        })
        
    def test_root_endpoint(self):
        """Test root API endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                if 'message' in data:
                    self.log_test("Root Endpoint", True, f"API accessible: {data['message']}")
                    return True
                else:
                    self.log_test("Root Endpoint", False, "No message in response")
                    return False
            else:
                self.log_test("Root Endpoint", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Root Endpoint", False, f"Exception: {str(e)}")
            return False
    
    def test_csv_upload(self):
        """Test CSV student upload"""
        try:
            csv_data = "Name,Email,Roll No,Department\nJohn Doe,john.doe@test.com,CS001,Computer Science\nJane Smith,jane.smith@test.com,CS002,Computer Science\nBob Wilson,bob.wilson@test.com,EE001,Electrical Engineering"
            
            payload = {"csvData": csv_data}
            response = self.session.post(f"{self.base_url}/students/upload", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if 'count' in data and data['count'] > 0:
                    self.log_test("CSV Upload", True, f"Uploaded {data['count']} students successfully")
                    return True
                else:
                    self.log_test("CSV Upload", False, "No students uploaded")
                    return False
            else:
                self.log_test("CSV Upload", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("CSV Upload", False, f"Exception: {str(e)}")
            return False
    
    def test_get_students(self):
        """Test getting all students"""
        try:
            response = self.session.get(f"{self.base_url}/students")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Store first student for later tests
                    self.student_data = data[0]
                    self.log_test("Get Students", True, f"Retrieved {len(data)} students")
                    return True
                else:
                    self.log_test("Get Students", False, "No students found or invalid response format")
                    return False
            else:
                self.log_test("Get Students", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get Students", False, f"Exception: {str(e)}")
            return False
    
    def test_student_login(self):
        """Test student login"""
        if not self.student_data:
            self.log_test("Student Login", False, "No student data available for login test")
            return False
            
        try:
            payload = {
                "userId": self.student_data['email'],
                "password": "student@123",
                "role": "student"
            }
            
            response = self.session.post(f"{self.base_url}/auth/login", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if 'user' in data and data['user']['role'] == 'student':
                    self.log_test("Student Login", True, f"Student login successful for {data['user']['name']}")
                    return True
                else:
                    self.log_test("Student Login", False, "Invalid response format")
                    return False
            else:
                self.log_test("Student Login", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Student Login", False, f"Exception: {str(e)}")
            return False
    
    def test_academic_login(self):
        """Test academic/admin login"""
        try:
            payload = {
                "userId": "admin@institute.edu",
                "password": "admin123",
                "role": "academic",
                "name": "Academic Administrator"
            }
            
            response = self.session.post(f"{self.base_url}/auth/login", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if 'user' in data and data['user']['role'] == 'academic':
                    self.log_test("Academic Login", True, f"Academic login successful for {data['user']['name']}")
                    return True
                else:
                    self.log_test("Academic Login", False, "Invalid response format")
                    return False
            else:
                self.log_test("Academic Login", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Academic Login", False, f"Exception: {str(e)}")
            return False
    
    def test_faculty_login(self):
        """Test faculty login"""
        try:
            payload = {
                "userId": "faculty@institute.edu",
                "password": "faculty123",
                "role": "faculty",
                "name": "Faculty Member"
            }
            
            response = self.session.post(f"{self.base_url}/auth/login", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if 'user' in data and data['user']['role'] == 'faculty':
                    self.log_test("Faculty Login", True, f"Faculty login successful for {data['user']['name']}")
                    return True
                else:
                    self.log_test("Faculty Login", False, "Invalid response format")
                    return False
            else:
                self.log_test("Faculty Login", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Faculty Login", False, f"Exception: {str(e)}")
            return False
    
    def test_create_service_request(self):
        """Test creating a service request"""
        if not self.student_data:
            self.log_test("Create Service Request", False, "No student data available")
            return False
            
        try:
            payload = {
                "studentId": self.student_data['id'],
                "studentName": self.student_data['name'],
                "studentEmail": self.student_data['email'],
                "rollNo": self.student_data['rollNo'],
                "department": self.student_data['department'],
                "serviceType": "bonafide",
                "details": {
                    "purpose": "Job Application",
                    "urgency": "normal"
                }
            }
            
            response = self.session.post(f"{self.base_url}/requests", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and data['status'] == 'pending':
                    self.request_id = data['id']
                    self.log_test("Create Service Request", True, f"Service request created with ID: {data['id']}")
                    return True
                else:
                    self.log_test("Create Service Request", False, "Invalid response format")
                    return False
            else:
                self.log_test("Create Service Request", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create Service Request", False, f"Exception: {str(e)}")
            return False
    
    def test_get_all_requests(self):
        """Test getting all service requests"""
        try:
            response = self.session.get(f"{self.base_url}/requests")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get All Requests", True, f"Retrieved {len(data)} service requests")
                    return True
                else:
                    self.log_test("Get All Requests", False, "Invalid response format")
                    return False
            else:
                self.log_test("Get All Requests", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get All Requests", False, f"Exception: {str(e)}")
            return False
    
    def test_get_student_requests(self):
        """Test getting requests for a specific student"""
        if not self.student_data:
            self.log_test("Get Student Requests", False, "No student data available")
            return False
            
        try:
            response = self.session.get(f"{self.base_url}/requests?studentId={self.student_data['id']}")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get Student Requests", True, f"Retrieved {len(data)} requests for student")
                    return True
                else:
                    self.log_test("Get Student Requests", False, "Invalid response format")
                    return False
            else:
                self.log_test("Get Student Requests", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get Student Requests", False, f"Exception: {str(e)}")
            return False
    
    def test_update_request_status(self):
        """Test updating request status"""
        if not self.request_id:
            self.log_test("Update Request Status", False, "No request ID available")
            return False
            
        try:
            payload = {
                "status": "approved",
                "remarks": "Request approved by testing agent"
            }
            
            response = self.session.put(f"{self.base_url}/requests/{self.request_id}", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data['status'] == 'approved':
                    self.log_test("Update Request Status", True, f"Request status updated to approved")
                    return True
                else:
                    self.log_test("Update Request Status", False, "Status not updated correctly")
                    return False
            else:
                self.log_test("Update Request Status", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Update Request Status", False, f"Exception: {str(e)}")
            return False
    
    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        try:
            response = self.session.get(f"{self.base_url}/stats")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['totalStudents', 'totalRequests', 'pendingRequests', 'approvedRequests', 'rejectedRequests']
                
                if all(field in data for field in required_fields):
                    self.log_test("Dashboard Stats", True, f"Stats retrieved: {data['totalStudents']} students, {data['totalRequests']} requests")
                    return True
                else:
                    self.log_test("Dashboard Stats", False, "Missing required fields in stats response")
                    return False
            else:
                self.log_test("Dashboard Stats", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Dashboard Stats", False, f"Exception: {str(e)}")
            return False
    
    def test_fee_structures(self):
        """Test fee structures endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/fee-structures")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    self.log_test("Fee Structures", True, f"Retrieved {len(data)} fee structures")
                    return True
                else:
                    self.log_test("Fee Structures", False, "No fee structures found")
                    return False
            else:
                self.log_test("Fee Structures", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Fee Structures", False, f"Exception: {str(e)}")
            return False
    
    def test_services(self):
        """Test services endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/services")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    self.log_test("Services", True, f"Retrieved {len(data)} services")
                    return True
                else:
                    self.log_test("Services", False, "No services found")
                    return False
            else:
                self.log_test("Services", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Services", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests in sequence"""
        print("=" * 60)
        print("INSTITUTE SERVICE PORTAL - BACKEND API TESTING")
        print("=" * 60)
        print(f"Base URL: {self.base_url}")
        print(f"Test started at: {datetime.now().isoformat()}")
        print("=" * 60)
        
        # Test sequence following the review request
        tests = [
            ("Root API", self.test_root_endpoint),
            ("CSV Upload", self.test_csv_upload),
            ("Get Students", self.test_get_students),
            ("Student Login", self.test_student_login),
            ("Academic Login", self.test_academic_login),
            ("Faculty Login", self.test_faculty_login),
            ("Create Service Request", self.test_create_service_request),
            ("Get All Requests", self.test_get_all_requests),
            ("Get Student Requests", self.test_get_student_requests),
            ("Update Request Status", self.test_update_request_status),
            ("Dashboard Stats", self.test_dashboard_stats),
            ("Fee Structures", self.test_fee_structures),
            ("Services", self.test_services)
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ FAIL {test_name}: Unexpected error - {str(e)}")
                failed += 1
            print("-" * 60)
        
        # Summary
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {passed + failed}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/(passed+failed)*100):.1f}%")
        print("=" * 60)
        
        return passed, failed, self.test_results

if __name__ == "__main__":
    tester = APITester()
    passed, failed, results = tester.run_all_tests()
    
    # Exit with error code if any tests failed
    sys.exit(0 if failed == 0 else 1)