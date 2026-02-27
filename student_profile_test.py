#!/usr/bin/env python3
"""
Institute Service Portal - Student Profile API Testing
Focused testing for GET /api/students/:id and PUT /api/students/:id endpoints
"""

import requests
import json
import sys
from datetime import datetime

# Get base URL from environment
BASE_URL = "https://agent-alarm-3.preview.emergentagent.com/api"

class StudentProfileTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.test_results = []
        self.student_id = None
        
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
        
    def setup_test_data(self):
        """Upload a test student and get the student ID for testing"""
        try:
            # Step 1: Upload a student via CSV
            csv_data = "Name,Email,Roll No,Department\nTest User,test@example.com,TEST001,Computer Science"
            
            payload = {"csvData": csv_data}
            response = self.session.post(f"{self.base_url}/students/upload", json=payload)
            
            if response.status_code != 200:
                self.log_test("Setup - CSV Upload", False, f"CSV upload failed: {response.status_code}")
                return False
            
            # Step 2: Get all students to find the uploaded student
            response = self.session.get(f"{self.base_url}/students")
            
            if response.status_code != 200:
                self.log_test("Setup - Get Students", False, f"Get students failed: {response.status_code}")
                return False
                
            students = response.json()
            test_student = None
            
            for student in students:
                if student.get('email') == 'test@example.com':
                    test_student = student
                    break
            
            if not test_student:
                self.log_test("Setup - Find Test Student", False, "Test student not found in response")
                return False
                
            self.student_id = test_student['id']
            self.log_test("Setup Complete", True, f"Test student found with ID: {self.student_id}")
            return True
            
        except Exception as e:
            self.log_test("Setup", False, f"Exception: {str(e)}")
            return False
    
    def test_get_student_by_id(self):
        """Test GET /api/students/:id - Should fetch a single student by their UUID"""
        if not self.student_id:
            self.log_test("GET Single Student", False, "No student ID available")
            return False
            
        try:
            response = self.session.get(f"{self.base_url}/students/{self.student_id}")
            
            if response.status_code == 200:
                data = response.json()
                if ('id' in data and data['id'] == self.student_id and 
                    'email' in data and data['email'] == 'test@example.com'):
                    self.log_test("GET Single Student", True, f"Successfully retrieved student: {data.get('name')}")
                    return True
                else:
                    self.log_test("GET Single Student", False, "Response missing required fields or data mismatch")
                    return False
            else:
                self.log_test("GET Single Student", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("GET Single Student", False, f"Exception: {str(e)}")
            return False
    
    def test_update_student_profile(self):
        """Test PUT /api/students/:id - Should update student profile fields"""
        if not self.student_id:
            self.log_test("PUT Student Profile", False, "No student ID available")
            return False
            
        try:
            update_data = {
                "name": "Test User Updated",
                "phone": "9876543210",
                "address": "123 Test Street, Test City, State - 123456",
                "dateOfBirth": "1995-05-15",
                "guardianName": "Test Guardian",
                "guardianPhone": "9876543211",
                "bloodGroup": "A+"
            }
            
            response = self.session.put(f"{self.base_url}/students/{self.student_id}", json=update_data)
            
            if response.status_code == 200:
                data = response.json()
                # Check if all fields were updated correctly
                all_fields_updated = True
                missing_fields = []
                
                for field, expected_value in update_data.items():
                    if data.get(field) != expected_value:
                        all_fields_updated = False
                        missing_fields.append(f"{field}: expected '{expected_value}', got '{data.get(field)}'")
                
                if all_fields_updated:
                    self.log_test("PUT Student Profile", True, "All profile fields updated successfully")
                    return True
                else:
                    self.log_test("PUT Student Profile", False, f"Some fields not updated correctly: {', '.join(missing_fields)}")
                    return False
            else:
                self.log_test("PUT Student Profile", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("PUT Student Profile", False, f"Exception: {str(e)}")
            return False
    
    def test_verify_update_persistence(self):
        """Test GET /api/students/:id again to verify the update persisted"""
        if not self.student_id:
            self.log_test("Verify Update Persistence", False, "No student ID available")
            return False
            
        try:
            response = self.session.get(f"{self.base_url}/students/{self.student_id}")
            
            if response.status_code == 200:
                data = response.json()
                expected_updates = {
                    "phone": "9876543210",
                    "address": "123 Test Street, Test City, State - 123456",
                    "dateOfBirth": "1995-05-15",
                    "guardianName": "Test Guardian",
                    "guardianPhone": "9876543211",
                    "bloodGroup": "A+"
                }
                
                all_persisted = True
                issues = []
                
                for field, expected_value in expected_updates.items():
                    if data.get(field) != expected_value:
                        all_persisted = False
                        issues.append(f"{field}: expected '{expected_value}', got '{data.get(field)}'")
                
                if all_persisted:
                    self.log_test("Verify Update Persistence", True, "All updates persisted correctly in database")
                    return True
                else:
                    self.log_test("Verify Update Persistence", False, f"Update persistence issues: {', '.join(issues)}")
                    return False
            else:
                self.log_test("Verify Update Persistence", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Verify Update Persistence", False, f"Exception: {str(e)}")
            return False
    
    def test_get_invalid_uuid(self):
        """Test GET /api/students/invalid-uuid - Should return 404"""
        try:
            response = self.session.get(f"{self.base_url}/students/invalid-uuid-12345")
            
            if response.status_code == 404:
                data = response.json()
                if 'error' in data:
                    self.log_test("GET Invalid UUID", True, f"Correctly returned 404 with error: {data['error']}")
                    return True
                else:
                    self.log_test("GET Invalid UUID", True, "Correctly returned 404")
                    return True
            else:
                self.log_test("GET Invalid UUID", False, f"Expected 404 but got: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("GET Invalid UUID", False, f"Exception: {str(e)}")
            return False
    
    def test_put_invalid_uuid(self):
        """Test PUT /api/students/invalid-uuid - Should return 404"""
        try:
            update_data = {"phone": "1234567890", "address": "Invalid Address"}
            response = self.session.put(f"{self.base_url}/students/invalid-uuid-12345", json=update_data)
            
            if response.status_code == 404:
                data = response.json()
                if 'error' in data:
                    self.log_test("PUT Invalid UUID", True, f"Correctly returned 404 with error: {data['error']}")
                    return True
                else:
                    self.log_test("PUT Invalid UUID", True, "Correctly returned 404")
                    return True
            else:
                self.log_test("PUT Invalid UUID", False, f"Expected 404 but got: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("PUT Invalid UUID", False, f"Exception: {str(e)}")
            return False
    
    def run_student_profile_tests(self):
        """Run all student profile tests in sequence"""
        print("=" * 70)
        print("INSTITUTE SERVICE PORTAL - STUDENT PROFILE API TESTING")
        print("=" * 70)
        print(f"Base URL: {self.base_url}")
        print(f"Test started at: {datetime.now().isoformat()}")
        print("=" * 70)
        
        # Setup test data first
        if not self.setup_test_data():
            print("❌ Setup failed - cannot proceed with tests")
            return 0, 1, self.test_results
        
        print("-" * 70)
        
        # Test sequence as requested in review
        tests = [
            ("GET /api/students/:id", self.test_get_student_by_id),
            ("PUT /api/students/:id", self.test_update_student_profile),
            ("Verify Update Persistence", self.test_verify_update_persistence),
            ("GET Invalid UUID (404)", self.test_get_invalid_uuid),
            ("PUT Invalid UUID (404)", self.test_put_invalid_uuid)
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
            print("-" * 70)
        
        # Summary
        print("=" * 70)
        print("STUDENT PROFILE API TEST SUMMARY")
        print("=" * 70)
        print(f"Total Tests: {passed + failed}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/(passed+failed)*100) if (passed+failed) > 0 else 0:.1f}%")
        print("=" * 70)
        
        return passed, failed, self.test_results

if __name__ == "__main__":
    tester = StudentProfileTester()
    passed, failed, results = tester.run_student_profile_tests()
    
    # Exit with error code if any tests failed
    sys.exit(0 if failed == 0 else 1)