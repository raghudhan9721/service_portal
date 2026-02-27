#!/usr/bin/env python3
"""
TypeScript Conversion Backend Testing
Tests specifically the new features requested in the review:
1. Student Upload via Excel/CSV with JSON body format
2. Notification System (new feature)
3. Delete Student (new feature)
4. Basic API verification
"""

import requests
import json
import sys
import os
from datetime import datetime

# Get base URL from environment
BASE_URL = "https://agent-alarm-3.preview.emergentagent.com/api"

class TypeScriptFeaturesTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.test_results = []
        self.student_data = None
        self.request_id = None
        self.notification_id = None
        
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
    
    def test_student_upload_json_format(self):
        """Test NEW: Student Upload via Excel/CSV with JSON body format"""
        try:
            # Test the new JSON format as specified in review request
            payload = {
                "students": [
                    {
                        "name": "Excel Test Student",
                        "email": "excel.test@test.com",
                        "rollNo": "EXL001",
                        "department": "Computer Science"
                    },
                    {
                        "name": "Another Test Student",
                        "email": "another.test@test.com", 
                        "rollNo": "EXL002",
                        "department": "Electronics"
                    }
                ]
            }
            
            response = self.session.post(f"{self.base_url}/students/upload", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if 'count' in data and data['count'] > 0:
                    self.log_test("Excel/JSON Upload", True, f"Uploaded {data['count']} students via JSON format")
                    return True
                else:
                    self.log_test("Excel/JSON Upload", False, f"No students uploaded. Response: {data}")
                    return False
            else:
                self.log_test("Excel/JSON Upload", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Excel/JSON Upload", False, f"Exception: {str(e)}")
            return False
    
    def test_get_students_and_verify_persistence(self):
        """Test: Get Students and verify persistence"""
        try:
            response = self.session.get(f"{self.base_url}/students")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Find our test student
                    test_student = None
                    for student in data:
                        if student.get('email') == 'excel.test@test.com':
                            test_student = student
                            break
                    
                    if test_student:
                        self.student_data = test_student
                        self.log_test("Verify Persistence", True, f"Found uploaded student: {test_student['name']}")
                        return True
                    else:
                        self.log_test("Verify Persistence", False, "Uploaded student not found in database")
                        return False
                else:
                    self.log_test("Verify Persistence", False, "No students found")
                    return False
            else:
                self.log_test("Verify Persistence", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Verify Persistence", False, f"Exception: {str(e)}")
            return False
    
    def test_create_service_request_for_notifications(self):
        """Create a service request to test notification system"""
        if not self.student_data:
            self.log_test("Create Request for Notifications", False, "No student data available")
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
                    "purpose": "Testing Notification System",
                    "urgency": "normal"
                }
            }
            
            response = self.session.post(f"{self.base_url}/requests", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and data['status'] == 'pending':
                    self.request_id = data['id']
                    self.log_test("Create Request for Notifications", True, f"Service request created: {data['id']}")
                    return True
                else:
                    self.log_test("Create Request for Notifications", False, "Invalid response format")
                    return False
            else:
                self.log_test("Create Request for Notifications", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create Request for Notifications", False, f"Exception: {str(e)}")
            return False
    
    def test_approve_request_and_create_notification(self):
        """Test NEW: Approve request to trigger notification creation"""
        if not self.request_id or not self.student_data:
            self.log_test("Approve Request (Notification)", False, "No request ID or student data available")
            return False
            
        try:
            payload = {
                "status": "approved",
                "remarks": "Request approved for notification testing"
            }
            
            response = self.session.put(f"{self.base_url}/requests/{self.request_id}", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data['status'] == 'approved':
                    self.log_test("Approve Request (Notification)", True, "Request approved - notification should be created")
                    return True
                else:
                    self.log_test("Approve Request (Notification)", False, "Status not updated correctly")
                    return False
            else:
                self.log_test("Approve Request (Notification)", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Approve Request (Notification)", False, f"Exception: {str(e)}")
            return False
    
    def test_get_notifications(self):
        """Test NEW: Get notifications for user"""
        if not self.student_data:
            self.log_test("Get Notifications", False, "No student data available")
            return False
            
        try:
            response = self.session.get(f"{self.base_url}/notifications?userId={self.student_data['id']}")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Find notification related to our request
                    notification = None
                    for notif in data:
                        if notif.get('relatedRequestId') == self.request_id:
                            notification = notif
                            break
                    
                    if notification:
                        self.notification_id = notification['id']
                        self.log_test("Get Notifications", True, f"Found notification: {notification['title']}")
                        return True
                    else:
                        self.log_test("Get Notifications", False, f"No notification found for request {self.request_id}")
                        return False
                else:
                    self.log_test("Get Notifications", False, "No notifications found")
                    return False
            else:
                self.log_test("Get Notifications", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Notifications", False, f"Exception: {str(e)}")
            return False
    
    def test_mark_notification_read(self):
        """Test NEW: Mark notification as read"""
        if not self.notification_id:
            self.log_test("Mark Notification Read", False, "No notification ID available")
            return False
            
        try:
            response = self.session.put(f"{self.base_url}/notifications/{self.notification_id}", json={})
            
            if response.status_code == 200:
                data = response.json()
                if 'message' in data:
                    self.log_test("Mark Notification Read", True, "Notification marked as read")
                    return True
                else:
                    self.log_test("Mark Notification Read", False, "Invalid response format")
                    return False
            else:
                self.log_test("Mark Notification Read", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Mark Notification Read", False, f"Exception: {str(e)}")
            return False
    
    def test_get_unread_count(self):
        """Test NEW: Get unread notification count"""
        if not self.student_data:
            self.log_test("Get Unread Count", False, "No student data available")
            return False
            
        try:
            response = self.session.get(f"{self.base_url}/notifications/unread-count?userId={self.student_data['id']}")
            
            if response.status_code == 200:
                data = response.json()
                if 'count' in data and isinstance(data['count'], int):
                    self.log_test("Get Unread Count", True, f"Unread count: {data['count']}")
                    return True
                else:
                    self.log_test("Get Unread Count", False, "Invalid response format")
                    return False
            else:
                self.log_test("Get Unread Count", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Unread Count", False, f"Exception: {str(e)}")
            return False
    
    def test_delete_student(self):
        """Test NEW: Delete student functionality"""
        if not self.student_data:
            self.log_test("Delete Student", False, "No student data available")
            return False
            
        try:
            student_id = self.student_data['id']
            response = self.session.delete(f"{self.base_url}/students/{student_id}")
            
            if response.status_code == 200:
                data = response.json()
                if 'message' in data and 'deleted' in data['message'].lower():
                    self.log_test("Delete Student", True, f"Student deleted successfully")
                    return True
                else:
                    self.log_test("Delete Student", False, f"Invalid response: {data}")
                    return False
            else:
                self.log_test("Delete Student", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Delete Student", False, f"Exception: {str(e)}")
            return False
    
    def test_verify_student_deleted(self):
        """Verify student is removed from database"""
        if not self.student_data:
            self.log_test("Verify Student Deleted", False, "No student data available")
            return False
            
        try:
            student_id = self.student_data['id']
            response = self.session.get(f"{self.base_url}/students/{student_id}")
            
            if response.status_code == 404:
                self.log_test("Verify Student Deleted", True, "Student correctly removed from database")
                return True
            else:
                self.log_test("Verify Student Deleted", False, f"Student still exists. Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Verify Student Deleted", False, f"Exception: {str(e)}")
            return False
    
    def test_basic_apis(self):
        """Test basic APIs as requested"""
        apis_to_test = [
            ("/stats", "Stats API"),
            ("/fee-structures", "Fee Structures API"),
            ("/services", "Services API")
        ]
        
        all_passed = True
        
        for endpoint, name in apis_to_test:
            try:
                response = self.session.get(f"{self.base_url}{endpoint}")
                
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, (list, dict)) and data:
                        self.log_test(name, True, f"{name} working correctly")
                    else:
                        self.log_test(name, False, f"{name} returned empty response")
                        all_passed = False
                else:
                    self.log_test(name, False, f"{name} failed. Status: {response.status_code}")
                    all_passed = False
            except Exception as e:
                self.log_test(name, False, f"{name} exception: {str(e)}")
                all_passed = False
        
        return all_passed
    
    def run_typescript_feature_tests(self):
        """Run all TypeScript feature tests in sequence"""
        print("=" * 70)
        print("TYPESCRIPT CONVERSION - NEW FEATURES TESTING")
        print("=" * 70)
        print(f"Base URL: {self.base_url}")
        print(f"Test started at: {datetime.now().isoformat()}")
        print("=" * 70)
        
        # Test sequence following the review request exactly
        tests = [
            ("Student Upload JSON Format", self.test_student_upload_json_format),
            ("Get Students & Verify Persistence", self.test_get_students_and_verify_persistence),
            ("Create Service Request", self.test_create_service_request_for_notifications),
            ("Approve Request (Notification)", self.test_approve_request_and_create_notification),
            ("Get Notifications", self.test_get_notifications),
            ("Mark Notification Read", self.test_mark_notification_read),
            ("Get Unread Count", self.test_get_unread_count),
            ("Delete Student", self.test_delete_student),
            ("Verify Student Deleted", self.test_verify_student_deleted),
            ("Basic APIs Test", self.test_basic_apis)
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
        print("TYPESCRIPT FEATURES TEST SUMMARY")
        print("=" * 70)
        print(f"Total Tests: {passed + failed}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/(passed+failed)*100):.1f}%")
        print("=" * 70)
        
        return passed, failed, self.test_results

if __name__ == "__main__":
    tester = TypeScriptFeaturesTester()
    passed, failed, results = tester.run_typescript_feature_tests()
    
    # Exit with error code if any tests failed
    sys.exit(0 if failed == 0 else 1)