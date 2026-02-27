#!/usr/bin/env python3
"""
Institute Service Portal Backend API - Edge Case Testing
Tests error handling and edge cases
"""

import requests
import json
import sys
from datetime import datetime

BASE_URL = "https://agent-alarm-3.preview.emergentagent.com/api"

class EdgeCaseTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        
    def log_test(self, test_name, success, message):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
    def test_invalid_login_credentials(self):
        """Test login with invalid credentials"""
        try:
            payload = {
                "userId": "nonexistent@test.com",
                "password": "wrongpassword",
                "role": "student"
            }
            
            response = self.session.post(f"{self.base_url}/auth/login", json=payload)
            
            if response.status_code == 404:
                self.log_test("Invalid Student Login", True, "Correctly rejected non-existent student")
                return True
            else:
                self.log_test("Invalid Student Login", False, f"Expected 404, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Invalid Student Login", False, f"Exception: {str(e)}")
            return False
    
    def test_missing_required_fields(self):
        """Test API with missing required fields"""
        try:
            # Test login without required fields
            payload = {"userId": "test@test.com"}  # Missing password and role
            response = self.session.post(f"{self.base_url}/auth/login", json=payload)
            
            if response.status_code == 400:
                self.log_test("Missing Login Fields", True, "Correctly rejected incomplete login data")
                return True
            else:
                self.log_test("Missing Login Fields", False, f"Expected 400, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Missing Login Fields", False, f"Exception: {str(e)}")
            return False
    
    def test_invalid_csv_upload(self):
        """Test CSV upload with invalid data"""
        try:
            payload = {"csvData": ""}  # Empty CSV
            response = self.session.post(f"{self.base_url}/students/upload", json=payload)
            
            if response.status_code == 400:
                self.log_test("Empty CSV Upload", True, "Correctly rejected empty CSV")
                return True
            else:
                self.log_test("Empty CSV Upload", False, f"Expected 400, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Empty CSV Upload", False, f"Exception: {str(e)}")
            return False
    
    def test_invalid_service_request(self):
        """Test service request with missing required fields"""
        try:
            payload = {"serviceType": "bonafide"}  # Missing studentId
            response = self.session.post(f"{self.base_url}/requests", json=payload)
            
            if response.status_code == 400:
                self.log_test("Invalid Service Request", True, "Correctly rejected incomplete request")
                return True
            else:
                self.log_test("Invalid Service Request", False, f"Expected 400, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Invalid Service Request", False, f"Exception: {str(e)}")
            return False
    
    def test_nonexistent_request_update(self):
        """Test updating a non-existent request"""
        try:
            payload = {"status": "approved"}
            response = self.session.put(f"{self.base_url}/requests/nonexistent-id", json=payload)
            
            if response.status_code == 404:
                self.log_test("Update Nonexistent Request", True, "Correctly handled non-existent request")
                return True
            else:
                self.log_test("Update Nonexistent Request", False, f"Expected 404, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Update Nonexistent Request", False, f"Exception: {str(e)}")
            return False
    
    def test_invalid_route(self):
        """Test accessing non-existent route"""
        try:
            response = self.session.get(f"{self.base_url}/nonexistent-route")
            
            if response.status_code == 404:
                self.log_test("Invalid Route", True, "Correctly returned 404 for invalid route")
                return True
            else:
                self.log_test("Invalid Route", False, f"Expected 404, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Invalid Route", False, f"Exception: {str(e)}")
            return False
    
    def run_edge_case_tests(self):
        """Run all edge case tests"""
        print("=" * 60)
        print("BACKEND API - EDGE CASE TESTING")
        print("=" * 60)
        
        tests = [
            ("Invalid Student Login", self.test_invalid_login_credentials),
            ("Missing Login Fields", self.test_missing_required_fields),
            ("Empty CSV Upload", self.test_invalid_csv_upload),
            ("Invalid Service Request", self.test_invalid_service_request),
            ("Update Nonexistent Request", self.test_nonexistent_request_update),
            ("Invalid Route", self.test_invalid_route)
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
        
        print("=" * 60)
        print("EDGE CASE TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {passed + failed}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/(passed+failed)*100):.1f}%")
        print("=" * 60)
        
        return passed, failed

if __name__ == "__main__":
    tester = EdgeCaseTester()
    passed, failed = tester.run_edge_case_tests()
    sys.exit(0 if failed == 0 else 1)