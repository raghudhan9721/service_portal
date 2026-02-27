'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

// Types
import type { 
  User, Student, ServiceRequest, Notification, FeeStructure, 
  DashboardStats, ServiceType, RequestStatus, LoginForm, 
  BonafideForm, FeeForm, ProfileForm 
} from '@/types';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

// Icons
import {
  GraduationCap, Users, BookOpen, Home, Info, LogIn, LogOut,
  Upload, FileText, CreditCard, FileCheck, Clock, Trash2,
  CheckCircle2, XCircle, Building2, UserCircle, Mail, Hash,
  ChevronRight, Shield, Award, Briefcase, Send, Eye, Bell,
  BarChart3, Calendar, Menu, X, Download, FileSpreadsheet,
  Phone, User, Edit3, Save, Sparkles, Star, Lock, AlertCircle
} from 'lucide-react';

// Lottie animation component
const LottieAnimation = ({ url, className = '' }: { url: string; className?: string }) => {
  const [Lottie, setLottie] = useState<any>(null);
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    import('lottie-react').then(mod => setLottie(() => mod.default));
    fetch(url)
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(() => {});
  }, [url]);

  if (!Lottie || !animationData) {
    return <div className={`${className} bg-gradient-to-br from-blue-100 to-purple-100 rounded-full animate-pulse`} />;
  }

  return <Lottie animationData={animationData} loop className={className} />;
};

// PDF Generator
const generatePDF = async (request: ServiceRequest, feeStructures: FeeStructure[] = []) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  
  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  if (request.serviceType === 'bonafide') {
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('BONAFIDE CERTIFICATE', 105, 30, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('EduPortal Institute of Technology', 105, 50, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('(Affiliated to State University)', 105, 57, { align: 'center' });
    doc.text('123 Education Lane, Knowledge City - 500001', 105, 63, { align: 'center' });
    
    doc.line(20, 70, 190, 70);
    
    doc.setFontSize(11);
    doc.text(`Ref No: BON/${request.id?.substring(0, 8).toUpperCase()}`, 20, 85);
    doc.text(`Date: ${today}`, 150, 85);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TO WHOM IT MAY CONCERN', 105, 105, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const content = `This is to certify that ${request.studentName || 'the student'} bearing Roll No. ${request.rollNo || 'N/A'} is a bonafide student of this institution, currently enrolled in the Department of ${request.department || 'N/A'}.

The student's email ID registered with us is: ${request.studentEmail || 'N/A'}

Purpose: ${request.details?.purpose || 'General Purpose'}

This certificate is issued upon the request of the student for the purpose mentioned above.`;

    const splitContent = doc.splitTextToSize(content, 170);
    doc.text(splitContent, 20, 125);
    
    doc.text('This certificate is valid for a period of 6 months from the date of issue.', 20, 185);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Academic Section', 150, 220);
    doc.text('EduPortal Institute', 150, 227);
  } else if (request.serviceType === 'fee') {
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FEE STRUCTURE', 105, 30, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('EduPortal Institute of Technology', 105, 50, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Academic Year 2025-26', 105, 57, { align: 'center' });
    
    doc.line(20, 65, 190, 65);
    
    doc.setFontSize(11);
    doc.text(`Date: ${today}`, 150, 80);
    doc.text(`Student: ${request.studentName || 'N/A'}`, 20, 80);
    doc.text(`Roll No: ${request.rollNo || 'N/A'}`, 20, 87);
    doc.text(`Department: ${request.department || 'N/A'}`, 20, 94);
    doc.text(`Category: ${request.details?.category || 'General'}`, 20, 101);
    
    doc.line(20, 115, 190, 115);
    
    const selectedFee = feeStructures.find(f => f.category === request.details?.category) || {
      tuitionFee: 50000, examFee: 5000, libraryFee: 2000, totalFee: 57000
    };
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Fee Breakdown', 105, 130, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    doc.setFillColor(240, 240, 240);
    doc.rect(30, 140, 150, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Particulars', 35, 147);
    doc.text('Amount (INR)', 145, 147);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Tuition Fee', 35, 160);
    doc.text(`₹ ${selectedFee.tuitionFee?.toLocaleString()}`, 145, 160);
    doc.text('Examination Fee', 35, 172);
    doc.text(`₹ ${selectedFee.examFee?.toLocaleString()}`, 145, 172);
    doc.text('Library Fee', 35, 184);
    doc.text(`₹ ${selectedFee.libraryFee?.toLocaleString()}`, 145, 184);
    
    doc.line(30, 192, 180, 192);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Fee', 35, 202);
    doc.text(`₹ ${selectedFee.totalFee?.toLocaleString()}`, 145, 202);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Accounts Section', 150, 260);
  } else if (request.serviceType === 'tc') {
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('TRANSFER CERTIFICATE', 105, 30, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('EduPortal Institute of Technology', 105, 50, { align: 'center' });
    
    doc.line(20, 65, 190, 65);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`TC No: TC/${request.id?.substring(0, 8).toUpperCase()}`, 20, 80);
    doc.text(`Date: ${today}`, 150, 80);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Details:', 20, 100);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${request.studentName || 'N/A'}`, 30, 115);
    doc.text(`Roll No: ${request.rollNo || 'N/A'}`, 30, 125);
    doc.text(`Department: ${request.department || 'N/A'}`, 30, 135);
    doc.text('Conduct: Good', 30, 150);
    doc.text('Dues: Cleared', 30, 160);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Principal', 150, 250);
  } else if (request.serviceType === 'noc') {
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('NO OBJECTION CERTIFICATE', 105, 30, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('EduPortal Institute of Technology', 105, 50, { align: 'center' });
    
    doc.line(20, 65, 190, 65);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ref No: NOC/${request.id?.substring(0, 8).toUpperCase()}`, 20, 80);
    doc.text(`Date: ${today}`, 150, 80);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TO WHOM IT MAY CONCERN', 105, 100, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const nocContent = `This is to certify that we have no objection to ${request.studentName || 'the student'}, Roll No. ${request.rollNo || 'N/A'}, Department of ${request.department || 'N/A'}, participating in external activities, internships, or competitions.`;
    
    const splitNOC = doc.splitTextToSize(nocContent, 170);
    doc.text(splitNOC, 20, 120);
    
    doc.text('This certificate is valid for a period of 3 months from the date of issue.', 20, 180);
    
    doc.setFont('helvetica', 'bold');
    doc.text('HOD / Dean', 150, 230);
  }
  
  const filename = `${request.serviceType}_${request.studentName?.replace(/\s+/g, '_') || 'certificate'}_${request.id?.substring(0, 8)}.pdf`;
  doc.save(filename);
  return filename;
};

// Service name helper
const getServiceName = (type: string): string => {
  switch (type) {
    case 'bonafide': return 'Bonafide Certificate';
    case 'fee': return 'Fee Structure';
    case 'tc': return 'Transfer Certificate';
    case 'noc': return 'NOC';
    default: return type;
  }
};

// Main App Component
export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState<LoginForm>({ userId: '', password: '', name: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data state
  const [students, setStudents] = useState<Student[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Form states
  const [bonafideForm, setBonafideForm] = useState<BonafideForm>({ purpose: '' });
  const [feeForm, setFeeForm] = useState<FeeForm>({ paymentMode: '', category: '' });
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [activeService, setActiveService] = useState<ServiceType | null>(null);
  const [requestDetailDialog, setRequestDetailDialog] = useState<ServiceRequest | null>(null);

  // Profile state
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: '', phone: '', address: '', dateOfBirth: '',
    guardianName: '', guardianPhone: '', bloodGroup: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedStudents, setParsedStudents] = useState<Student[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data based on user role
  useEffect(() => {
    if (user?.role === 'academic') {
      fetchStudents();
      fetchRequests();
      fetchStats();
      fetchFeeStructures();
    } else if (user?.role === 'student') {
      fetchMyRequests();
      fetchFeeStructures();
      fetchNotifications();
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth || '',
        guardianName: user.guardianName || '',
        guardianPhone: user.guardianPhone || '',
        bloodGroup: user.bloodGroup || ''
      });
    }
  }, [user]);

  // Fetch notifications periodically for students
  useEffect(() => {
    if (user?.role === 'student') {
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // API calls
  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests');
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const fetchMyRequests = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/requests?studentId=${user.id}`);
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchFeeStructures = async () => {
    try {
      const res = await fetch('/api/fee-structures');
      const data = await res.json();
      setFeeStructures(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching fee structures:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      const [notifRes, countRes] = await Promise.all([
        fetch(`/api/notifications?userId=${user.id}`),
        fetch(`/api/notifications/unread-count?userId=${user.id}`)
      ]);
      const notifData = await notifRes.json();
      const countData = await countRes.json();
      setNotifications(Array.isArray(notifData) ? notifData : []);
      setUnreadCount(countData.count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Login handler
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!loginForm.userId || !loginForm.password) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: loginForm.userId,
          password: loginForm.password,
          role: selectedRole,
          name: loginForm.name
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Login failed');
        return;
      }

      setUser(data.user);
      setShowLoginModal(false);
      setSelectedRole(null);
      setLoginForm({ userId: '', password: '', name: '' });
      setCurrentPage(selectedRole === 'student' ? 'student-home' : 'dashboard');
      toast.success(`Welcome, ${data.user.name}!`);
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
    setStudents([]);
    setRequests([]);
    setStats(null);
    setNotifications([]);
    setUnreadCount(0);
    toast.success('Logged out successfully');
  };

  // File upload handlers
  const handleFileSelect = useCallback((file: File) => {
    if (!file) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please upload a valid Excel (.xlsx, .xls) or CSV file');
      return;
    }

    setSelectedFile(file);
    parseFile(file);
  }, []);

  const parseFile = async (file: File) => {
    try {
      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        const parsed = parseCSVContent(text);
        setParsedStudents(parsed);
        toast.success(`Found ${parsed.length} students in file`);
      } else {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
        
        if (jsonData.length < 2) {
          toast.error('File is empty or has no data rows');
          return;
        }

        const headers = jsonData[0].map(h => String(h).trim().toLowerCase().replace(/\s+/g, '_'));
        const parsed: Student[] = [];

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0 || !row.some(cell => cell)) continue;

          const student: Record<string, string> = {};
          headers.forEach((header, index) => {
            student[header] = String(row[index] || '').trim();
          });

          if (student.email || student.email_id) {
            parsed.push({
              id: '',
              name: student.name || student.student_name || '',
              email: student.email || student.email_id || '',
              rollNo: student.roll_no || student.rollno || student.roll_number || '',
              department: student.department || student.dept || ''
            });
          }
        }

        setParsedStudents(parsed);
        toast.success(`Found ${parsed.length} students in file`);
      }
    } catch (error) {
      console.error('Parse error:', error);
      toast.error('Failed to parse file');
    }
  };

  const parseCSVContent = (content: string): Student[] => {
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
    const parsed: Student[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const student: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        student[header] = values[index]?.trim() || '';
      });

      if (student.email || student.email_id) {
        parsed.push({
          id: '',
          name: student.name || student.student_name || '',
          email: student.email || student.email_id || '',
          rollNo: student.roll_no || student.rollno || student.roll_number || '',
          department: student.department || student.dept || ''
        });
      }
    }

    return parsed;
  };

  const handleUploadStudents = async () => {
    if (parsedStudents.length === 0) {
      toast.error('No students to upload');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/students/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: parsedStudents })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Upload failed');
        return;
      }

      toast.success(data.message);
      setSelectedFile(null);
      setParsedStudents([]);
      fetchStudents();
      fetchStats();
    } catch (error) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  // Delete student handler
  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      const res = await fetch(`/api/students/${studentId}`, { method: 'DELETE' });
      
      if (!res.ok) {
        toast.error('Failed to delete student');
        return;
      }

      toast.success('Student deleted successfully');
      fetchStudents();
      fetchStats();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  // Service request handler
  const handleServiceRequest = async () => {
    if (!user || !activeService) return;

    let details: Record<string, string> = {};
    if (activeService === 'bonafide') {
      if (!bonafideForm.purpose.trim()) {
        toast.error('Please enter the purpose');
        return;
      }
      details = { purpose: bonafideForm.purpose };
    } else if (activeService === 'fee') {
      if (!feeForm.paymentMode || !feeForm.category) {
        toast.error('Please select payment mode and category');
        return;
      }
      details = { paymentMode: feeForm.paymentMode, category: feeForm.category };
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          studentName: user.name,
          studentEmail: user.email,
          rollNo: user.rollNo,
          department: user.department,
          serviceType: activeService,
          details
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Request failed');
        return;
      }

      toast.success('Request submitted successfully!');
      setShowServiceDialog(false);
      setActiveService(null);
      setBonafideForm({ purpose: '' });
      setFeeForm({ paymentMode: '', category: '' });
      fetchMyRequests();
    } catch (error) {
      toast.error('Request failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update request status (Admin)
  const handleUpdateRequest = async (requestId: string, status: RequestStatus, remarks?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, remarks })
      });

      if (!res.ok) {
        toast.error('Update failed');
        return;
      }

      toast.success(`Request ${status}!`);
      setRequestDetailDialog(null);
      fetchRequests();
      fetchStats();
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile handler
  const handleUpdateProfile = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/students/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Update failed');
        return;
      }

      setUser({ ...user, ...data, role: 'student' });
      setIsEditingProfile(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, { method: 'PUT' });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all read:', error);
    }
  };

  // Download PDF handler
  const handleDownloadPDF = async (request: ServiceRequest) => {
    try {
      toast.info('Generating PDF...');
      const filename = await generatePDF(request, feeStructures);
      toast.success(`Downloaded: ${filename}`);
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Close login modal
  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
    setSelectedRole(null);
    setLoginForm({ userId: '', password: '', name: '' });
  };

  // ============ RENDER COMPONENTS ============

  // Header Component
  const Header = () => (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => setCurrentPage(user ? (user.role === 'student' ? 'student-home' : 'dashboard') : 'home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-200">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hidden sm:block">
              EduPortal
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {!user ? (
              <>
                <Button variant="ghost" onClick={() => setCurrentPage('home')} className={`${currentPage === 'home' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                  <Home className="w-4 h-4 mr-2" /> Home
                </Button>
                <Button variant="ghost" onClick={() => setCurrentPage('about')} className={`${currentPage === 'about' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                  <Info className="w-4 h-4 mr-2" /> About
                </Button>
                <Button variant="ghost" onClick={() => setCurrentPage('courses')} className={`${currentPage === 'courses' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                  <BookOpen className="w-4 h-4 mr-2" /> Courses
                </Button>
              </>
            ) : user.role === 'student' ? (
              <>
                <Button variant="ghost" onClick={() => setCurrentPage('student-home')} className={`${currentPage === 'student-home' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                  <Home className="w-4 h-4 mr-2" /> Home
                </Button>
                <Button variant="ghost" onClick={() => setCurrentPage('student-profile')} className={`${currentPage === 'student-profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                  <UserCircle className="w-4 h-4 mr-2" /> Profile
                </Button>
                <Button variant="ghost" onClick={() => setCurrentPage('student-services')} className={`${currentPage === 'student-services' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                  <FileText className="w-4 h-4 mr-2" /> Services
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setCurrentPage('dashboard')} className={`${currentPage === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                  <BarChart3 className="w-4 h-4 mr-2" /> Dashboard
                </Button>
                <Button variant="ghost" onClick={() => setCurrentPage('students')} className={`${currentPage === 'students' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                  <Users className="w-4 h-4 mr-2" /> Students
                </Button>
                <Button variant="ghost" onClick={() => setCurrentPage('requests')} className={`${currentPage === 'requests' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                  <FileCheck className="w-4 h-4 mr-2" /> Requests
                </Button>
              </>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Notification Bell for Students */}
            {user?.role === 'student' && (
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                      <h3 className="font-semibold text-gray-800">Notifications</h3>
                      {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:text-blue-700">
                          Mark all read
                        </Button>
                      )}
                    </div>
                    <ScrollArea className="max-h-80">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.slice(0, 10).map(notif => (
                          <div 
                            key={notif.id} 
                            onClick={() => handleMarkNotificationRead(notif.id)}
                            className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-blue-50/50' : ''}`}
                          >
                            <div className="flex gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                notif.type === 'success' ? 'bg-green-100 text-green-600' : 
                                notif.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                              }`}>
                                {notif.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-gray-800">{notif.title}</p>
                                <p className="text-xs text-gray-500 truncate">{notif.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}

            {/* User Info / Login Button */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-100">
                  <UserCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  <Badge variant="outline" className="text-xs capitalize border-blue-200 text-blue-600">{user.role}</Badge>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
              </div>
            ) : (
              <Button onClick={() => setShowLoginModal(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-200">
                <LogIn className="w-4 h-4 mr-2" /> Login
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-1">
              {!user ? (
                <>
                  <Button variant="ghost" onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }} className="justify-start"><Home className="w-4 h-4 mr-2" /> Home</Button>
                  <Button variant="ghost" onClick={() => { setCurrentPage('about'); setMobileMenuOpen(false); }} className="justify-start"><Info className="w-4 h-4 mr-2" /> About</Button>
                  <Button variant="ghost" onClick={() => { setCurrentPage('courses'); setMobileMenuOpen(false); }} className="justify-start"><BookOpen className="w-4 h-4 mr-2" /> Courses</Button>
                </>
              ) : user.role === 'student' ? (
                <>
                  <Button variant="ghost" onClick={() => { setCurrentPage('student-home'); setMobileMenuOpen(false); }} className="justify-start"><Home className="w-4 h-4 mr-2" /> Home</Button>
                  <Button variant="ghost" onClick={() => { setCurrentPage('student-profile'); setMobileMenuOpen(false); }} className="justify-start"><UserCircle className="w-4 h-4 mr-2" /> Profile</Button>
                  <Button variant="ghost" onClick={() => { setCurrentPage('student-services'); setMobileMenuOpen(false); }} className="justify-start"><FileText className="w-4 h-4 mr-2" /> Services</Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => { setCurrentPage('dashboard'); setMobileMenuOpen(false); }} className="justify-start"><BarChart3 className="w-4 h-4 mr-2" /> Dashboard</Button>
                  <Button variant="ghost" onClick={() => { setCurrentPage('students'); setMobileMenuOpen(false); }} className="justify-start"><Users className="w-4 h-4 mr-2" /> Students</Button>
                  <Button variant="ghost" onClick={() => { setCurrentPage('requests'); setMobileMenuOpen(false); }} className="justify-start"><FileCheck className="w-4 h-4 mr-2" /> Requests</Button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );

  // Public Home Page
  const PublicHome = () => (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" /> Welcome to EduPortal
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                Your Gateway to
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Academic Excellence
                </span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Streamline your academic journey with our comprehensive institute service portal. 
                Access certificates, manage documents, and stay connected with your institution.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  onClick={() => setShowLoginModal(true)} 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl shadow-blue-200 px-8"
                >
                  Get Started <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => setCurrentPage('about')}
                  className="border-2 border-gray-200 hover:border-gray-300 px-8"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-72 h-72 lg:w-96 lg:h-96">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-20 blur-3xl animate-pulse" />
                <LottieAnimation 
                  url="https://assets3.lottiefiles.com/packages/lf20_4DLPwR.json" 
                  className="w-full h-full relative z-10" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Everything you need to manage your academic requirements in one place</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FileCheck, title: 'Bonafide Certificate', desc: 'Get your bonafide certificate for various purposes', color: 'blue', gradient: 'from-blue-500 to-blue-600' },
              { icon: CreditCard, title: 'Fee Structure', desc: 'View and download fee details for your category', color: 'purple', gradient: 'from-purple-500 to-purple-600' },
              { icon: FileText, title: 'Transfer Certificate', desc: 'Apply for TC when transferring institutions', color: 'pink', gradient: 'from-pink-500 to-pink-600' },
              { icon: Shield, title: 'NOC', desc: 'Request No Objection Certificate easily', color: 'green', gradient: 'from-green-500 to-green-600' }
            ].map((feature, idx) => (
              <Card key={idx} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1 overflow-hidden">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10K+', label: 'Students' },
              { value: '500+', label: 'Faculty' },
              { value: '50+', label: 'Courses' },
              { value: '95%', label: 'Satisfaction' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl md:text-5xl font-extrabold mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6" />
              <span className="font-bold">EduPortal</span>
            </div>
            <p className="text-gray-400 text-sm">© 2025 EduPortal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );

  // About Page
  const AboutPage = () => (
    <div className="min-h-screen py-12 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">About Us</Badge>
          <h1 className="text-4xl font-bold mb-4">About Our Institution</h1>
          <p className="text-gray-600">Excellence in education since 1990</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-3">
                <Award className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                To be a globally recognized institution of higher learning, fostering innovation, 
                research, and ethical leadership for the betterment of society.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-3">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                To provide quality education, promote research excellence, and develop skilled 
                professionals who contribute to national and global development.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Why Choose Us?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'State-of-the-art infrastructure',
                'Experienced faculty members',
                'Industry collaborations',
                'Research opportunities',
                'Placement assistance',
                'Student support services'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Courses Page
  const CoursesPage = () => (
    <div className="min-h-screen py-12 bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-100">Programs</Badge>
          <h1 className="text-4xl font-bold mb-4">Our Courses</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our wide range of undergraduate and postgraduate programs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Computer Science', duration: '4 Years', type: 'B.Tech', seats: 120, color: 'blue' },
            { name: 'Electronics', duration: '4 Years', type: 'B.Tech', seats: 60, color: 'purple' },
            { name: 'Mechanical', duration: '4 Years', type: 'B.Tech', seats: 60, color: 'green' },
            { name: 'Civil Engineering', duration: '4 Years', type: 'B.Tech', seats: 60, color: 'orange' },
            { name: 'MBA', duration: '2 Years', type: 'MBA', seats: 120, color: 'pink' },
            { name: 'MCA', duration: '2 Years', type: 'MCA', seats: 60, color: 'cyan' }
          ].map((course, idx) => (
            <Card key={idx} className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="border-blue-200 text-blue-600">{course.type}</Badge>
                  <span className="text-sm text-gray-500">{course.duration}</span>
                </div>
                <CardTitle className="mt-2">{course.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>{course.seats} Seats Available</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">Learn More</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  // Admin Dashboard
  const AdminDashboard = () => (
    <div className="min-h-screen py-8 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Academic Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Students', value: stats?.totalStudents || 0, icon: Users, gradient: 'from-blue-500 to-blue-600' },
            { label: 'Total Requests', value: stats?.totalRequests || 0, icon: FileText, gradient: 'from-purple-500 to-purple-600' },
            { label: 'Pending', value: stats?.pendingRequests || 0, icon: Clock, gradient: 'from-yellow-500 to-orange-500' },
            { label: 'Approved', value: stats?.approvedRequests || 0, icon: CheckCircle2, gradient: 'from-green-500 to-green-600' }
          ].map((stat, idx) => (
            <div key={idx} className={`p-6 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white shadow-xl`}>
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-8 h-8 opacity-80" />
              </div>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm opacity-90">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Requests */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Service Requests</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage('requests')}>View All</Button>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No requests yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.slice(0, 5).map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <UserCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{req.studentName}</p>
                        <p className="text-sm text-gray-500">{getServiceName(req.serviceType)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={req.status} />
                      <Button size="sm" variant="ghost" onClick={() => setRequestDetailDialog(req)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Students Management Page
  const StudentsPage = () => (
    <div className="min-h-screen py-8 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Students Management</h1>
          <p className="text-gray-600">Upload and manage student data</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* File Upload Section */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl sticky top-24">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Upload Students</CardTitle>
                    <CardDescription>Excel (.xlsx) or CSV file</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Drag & Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    isDragging ? 'border-blue-500 bg-blue-50' : 
                    selectedFile ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                    selectedFile ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {selectedFile ? (
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    ) : (
                      <FileSpreadsheet className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  {selectedFile ? (
                    <>
                      <p className="font-semibold text-green-700">{selectedFile.name}</p>
                      <p className="text-sm text-green-600">{parsedStudents.length} students found</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-gray-700">Drop your file here</p>
                      <p className="text-sm text-gray-500">or click to browse</p>
                      <p className="text-xs text-gray-400 mt-2">Columns: Name, Email, Roll No, Department</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  />
                </div>

                {/* File Info */}
                {selectedFile && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium truncate">{selectedFile.name}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setParsedStudents([]); }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                )}

                {/* Preview Table */}
                {parsedStudents.length > 0 && (
                  <div className="mt-4 border rounded-lg overflow-hidden">
                    <div className="max-h-48 overflow-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th className="p-2 text-left font-semibold">Name</th>
                            <th className="p-2 text-left font-semibold">Email</th>
                            <th className="p-2 text-left font-semibold">Roll</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedStudents.slice(0, 5).map((s, i) => (
                            <tr key={i} className="border-t">
                              <td className="p-2">{s.name}</td>
                              <td className="p-2 truncate max-w-[100px]">{s.email}</td>
                              <td className="p-2">{s.rollNo}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {parsedStudents.length > 5 && (
                      <div className="p-2 text-center text-xs text-gray-500 bg-gray-50">
                        +{parsedStudents.length - 5} more students
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gray-50 border-t">
                <Button 
                  onClick={handleUploadStudents} 
                  disabled={isLoading || parsedStudents.length === 0} 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {isLoading ? 'Uploading...' : `Upload ${parsedStudents.length} Students`}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Students List */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50 border-b">
                <div>
                  <CardTitle>Student Records</CardTitle>
                  <CardDescription>{students.length} students in database</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={fetchStudents}>Refresh</Button>
              </CardHeader>
              <CardContent className="p-0">
                {students.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="font-medium">No students uploaded yet</p>
                    <p className="text-sm">Upload an Excel or CSV file to add students</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Roll No</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student) => (
                          <TableRow key={student.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell className="text-gray-600">{student.email}</TableCell>
                            <TableCell>{student.rollNo}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {student.department}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteStudent(student.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );

  // Requests Management Page
  const RequestsPage = () => (
    <div className="min-h-screen py-8 bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Service Requests</h1>
          <p className="text-gray-600">Manage student service requests</p>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-white p-1 rounded-xl shadow-md">
            <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              All ({requests.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
              Pending ({requests.filter(r => r.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="rounded-lg data-[state=active]:bg-green-500 data-[state=active]:text-white">
              Approved ({requests.filter(r => r.status === 'approved').length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="rounded-lg data-[state=active]:bg-red-500 data-[state=active]:text-white">
              Rejected ({requests.filter(r => r.status === 'rejected').length})
            </TabsTrigger>
          </TabsList>

          {['all', 'pending', 'approved', 'rejected'].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <Card className="border-0 shadow-xl">
                <CardContent className="p-0">
                  {requests.filter(r => tab === 'all' || r.status === tab).length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                      <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p>No {tab !== 'all' ? tab : ''} requests</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[500px]">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead>Student</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {requests
                            .filter(r => tab === 'all' || r.status === tab)
                            .map((req) => (
                              <TableRow key={req.id} className="hover:bg-gray-50">
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{req.studentName}</p>
                                    <p className="text-sm text-gray-500">{req.studentEmail}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">{getServiceName(req.serviceType)}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{req.department || 'N/A'}</Badge>
                                </TableCell>
                                <TableCell className="text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell><StatusBadge status={req.status} /></TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button size="sm" variant="ghost" onClick={() => setRequestDetailDialog(req)}>
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    {req.status === 'approved' && (
                                      <Button size="sm" variant="ghost" className="text-green-600" onClick={() => handleDownloadPDF(req)}>
                                        <Download className="w-4 h-4" />
                                      </Button>
                                    )}
                                    {req.status === 'pending' && (
                                      <>
                                        <Button size="sm" variant="ghost" className="text-green-600 hover:bg-green-50" onClick={() => handleUpdateRequest(req.id, 'approved')}>
                                          <CheckCircle2 className="w-4 h-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => handleUpdateRequest(req.id, 'rejected')}>
                                          <XCircle className="w-4 h-4" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );

  // Student Home Page
  const StudentHome = () => (
    <div className="min-h-screen py-8 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}!</h1>
          <p className="text-gray-600">Access your academic services and track your requests</p>
        </div>

        {/* Student Info Card */}
        <Card className="mb-8 border-0 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6 text-white">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <UserCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Name</p>
                  <p className="font-semibold">{user?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Email</p>
                  <p className="font-semibold truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Hash className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Roll No</p>
                  <p className="font-semibold">{user?.rollNo || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Department</p>
                  <p className="font-semibold">{user?.department || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: FileCheck, title: 'Bonafide Certificate', service: 'bonafide' as ServiceType, gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-200' },
            { icon: CreditCard, title: 'Fee Structure', service: 'fee' as ServiceType, gradient: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-200' },
            { icon: FileText, title: 'Transfer Certificate', service: 'tc' as ServiceType, gradient: 'from-pink-500 to-pink-600', shadow: 'shadow-pink-200' },
            { icon: Shield, title: 'NOC', service: 'noc' as ServiceType, gradient: 'from-green-500 to-green-600', shadow: 'shadow-green-200' }
          ].map((item, idx) => (
            <Card 
              key={idx} 
              className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1"
              onClick={() => { setActiveService(item.service); setShowServiceDialog(true); }}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 shadow-lg ${item.shadow}`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <Button size="sm" variant="outline" className="w-full">Request</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* My Requests */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>My Requests</CardTitle>
            <CardDescription>Track the status of your service requests</CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="font-medium">No requests yet</p>
                <p className="text-sm">Click on a service above to make a request</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium">{getServiceName(req.serviceType)}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(req.createdAt).toLocaleDateString()} • {new Date(req.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={req.status} />
                      {req.status === 'approved' && (
                        <Button size="sm" variant="outline" onClick={() => handleDownloadPDF(req)} className="text-green-600 border-green-200 hover:bg-green-50">
                          <Download className="w-4 h-4 mr-1" /> PDF
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Student Profile Page
  const StudentProfile = () => (
    <div className="min-h-screen py-8 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">My Profile</h1>
          <p className="text-gray-600">View and manage your personal information</p>
        </div>

        {/* Profile Header */}
        <Card className="mb-6 border-0 shadow-xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
            <div className="absolute -bottom-12 left-6">
              <div className="w-24 h-24 rounded-2xl bg-white shadow-2xl flex items-center justify-center border-4 border-white">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="pt-16 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{user?.name || 'Student'}</h2>
                <p className="text-gray-600 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  {user?.department || 'Department'} • Roll No: {user?.rollNo || 'N/A'}
                </p>
              </div>
              <Button 
                onClick={() => isEditingProfile ? handleUpdateProfile() : setIsEditingProfile(true)}
                disabled={isLoading}
                className={isEditingProfile 
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700" 
                  : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                }
              >
                {isLoading ? 'Saving...' : isEditingProfile ? <><Save className="w-4 h-4 mr-2" /> Save Changes</> : <><Edit3 className="w-4 h-4 mr-2" /> Edit Profile</>}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Academic Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Academic Information</CardTitle>
                    <CardDescription>Your enrollment details (Read-only)</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Email ID', value: user?.email, icon: Lock },
                    { label: 'Roll Number', value: user?.rollNo, icon: Lock },
                    { label: 'Department', value: user?.department, icon: Lock },
                    { label: 'Student ID', value: user?.id, icon: Lock, small: true }
                  ].map((field, idx) => (
                    <div key={idx}>
                      <Label className="text-gray-500 text-sm flex items-center gap-1 mb-2">
                        <field.icon className="w-3 h-3" /> {field.label}
                      </Label>
                      <div className={`p-3 bg-gray-50 rounded-lg border ${field.small ? 'text-xs' : ''}`}>
                        {field.value || 'Not provided'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Personal Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500 text-sm mb-2 block">Full Name</Label>
                    {isEditingProfile ? (
                      <Input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} placeholder="Enter your name" />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg border">{user?.name || 'Not provided'}</div>
                    )}
                  </div>
                  <div>
                    <Label className="text-gray-500 text-sm mb-2 block">Phone Number</Label>
                    {isEditingProfile ? (
                      <Input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="Enter phone" />
                    ) : (
                      <div className={`p-3 bg-gray-50 rounded-lg border ${!user?.phone ? 'text-gray-400 italic' : ''}`}>{user?.phone || 'Not provided'}</div>
                    )}
                  </div>
                  <div>
                    <Label className="text-gray-500 text-sm mb-2 block">Date of Birth</Label>
                    {isEditingProfile ? (
                      <Input type="date" value={profileForm.dateOfBirth} onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })} />
                    ) : (
                      <div className={`p-3 bg-gray-50 rounded-lg border ${!user?.dateOfBirth ? 'text-gray-400 italic' : ''}`}>{user?.dateOfBirth || 'Not provided'}</div>
                    )}
                  </div>
                  <div>
                    <Label className="text-gray-500 text-sm mb-2 block">Blood Group</Label>
                    {isEditingProfile ? (
                      <Select value={profileForm.bloodGroup} onValueChange={(v) => setProfileForm({ ...profileForm, bloodGroup: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className={`p-3 bg-gray-50 rounded-lg border ${!user?.bloodGroup ? 'text-gray-400 italic' : ''}`}>{user?.bloodGroup || 'Not provided'}</div>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-gray-500 text-sm mb-2 block">Address</Label>
                    {isEditingProfile ? (
                      <Textarea value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} placeholder="Enter address" rows={3} />
                    ) : (
                      <div className={`p-3 bg-gray-50 rounded-lg border min-h-[80px] ${!user?.address ? 'text-gray-400 italic' : ''}`}>{user?.address || 'Not provided'}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guardian Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Guardian Information</CardTitle>
                    <CardDescription>Your guardian/parent details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500 text-sm mb-2 block">Guardian Name</Label>
                    {isEditingProfile ? (
                      <Input value={profileForm.guardianName} onChange={(e) => setProfileForm({ ...profileForm, guardianName: e.target.value })} placeholder="Guardian name" />
                    ) : (
                      <div className={`p-3 bg-gray-50 rounded-lg border ${!user?.guardianName ? 'text-gray-400 italic' : ''}`}>{user?.guardianName || 'Not provided'}</div>
                    )}
                  </div>
                  <div>
                    <Label className="text-gray-500 text-sm mb-2 block">Guardian Phone</Label>
                    {isEditingProfile ? (
                      <Input value={profileForm.guardianPhone} onChange={(e) => setProfileForm({ ...profileForm, guardianPhone: e.target.value })} placeholder="Guardian phone" />
                    ) : (
                      <div className={`p-3 bg-gray-50 rounded-lg border ${!user?.guardianPhone ? 'text-gray-400 italic' : ''}`}>{user?.guardianPhone || 'Not provided'}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Activity Stats */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" /> My Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">Total Requests</span>
                  </div>
                  <Badge className="bg-blue-500">{requests.length}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <Badge className="bg-yellow-500">{requests.filter(r => r.status === 'pending').length}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Approved</span>
                  </div>
                  <Badge className="bg-green-500">{requests.filter(r => r.status === 'approved').length}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-500" /> Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600" onClick={() => setCurrentPage('student-services')}>
                  <FileCheck className="w-4 h-4 mr-2" /> Request Certificate
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setCurrentPage('student-home')}>
                  <Home className="w-4 h-4 mr-2" /> Go to Dashboard
                </Button>
              </CardContent>
            </Card>

            {isEditingProfile && (
              <Card className="border-2 border-dashed border-yellow-400 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Edit3 className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold text-yellow-800">Edit Mode Active</span>
                  </div>
                  <p className="text-sm text-yellow-700 mb-4">Click "Save Changes" when done.</p>
                  <Button 
                    variant="outline" 
                    className="w-full border-yellow-400 text-yellow-700"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileForm({
                        name: user?.name || '', phone: user?.phone || '', address: user?.address || '',
                        dateOfBirth: user?.dateOfBirth || '', guardianName: user?.guardianName || '',
                        guardianPhone: user?.guardianPhone || '', bloodGroup: user?.bloodGroup || ''
                      });
                    }}
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Student Services Page
  const StudentServices = () => (
    <div className="min-h-screen py-8 bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Student Services</h1>
          <p className="text-gray-600">Request certificates and documents</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {[
            { icon: FileCheck, title: 'Bonafide Certificate', desc: 'Request a bonafide certificate for bank loans, visa applications, etc.', service: 'bonafide' as ServiceType, gradient: 'from-blue-500 to-blue-600' },
            { icon: CreditCard, title: 'Fee Structure', desc: 'Get detailed fee structure based on your category and payment mode.', service: 'fee' as ServiceType, gradient: 'from-purple-500 to-purple-600' },
            { icon: FileText, title: 'Transfer Certificate', desc: 'Apply for TC when transferring to another institution.', service: 'tc' as ServiceType, gradient: 'from-pink-500 to-pink-600' },
            { icon: Shield, title: 'No Objection Certificate', desc: 'Request NOC for internships, competitions, or other activities.', service: 'noc' as ServiceType, gradient: 'from-green-500 to-green-600' }
          ].map((item, idx) => (
            <Card key={idx} className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{item.desc}</p>
                    <Button onClick={() => { setActiveService(item.service); setShowServiceDialog(true); }} className={`bg-gradient-to-r ${item.gradient} hover:opacity-90`}>
                      <Send className="w-4 h-4 mr-2" /> Request Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Request History</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>No requests submitted yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{getServiceName(req.serviceType)}</TableCell>
                      <TableCell className="text-gray-500">{req.details?.purpose || req.details?.category || '-'}</TableCell>
                      <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell><StatusBadge status={req.status} /></TableCell>
                      <TableCell>
                        {req.status === 'approved' && (
                          <Button size="sm" variant="outline" onClick={() => handleDownloadPDF(req)} className="text-green-600">
                            <Download className="w-4 h-4 mr-1" /> PDF
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Login Modal - Fixed cursor issue
  const LoginModal = () => (
    <Dialog open={showLoginModal} onOpenChange={(open) => !open && handleCloseLoginModal()}>
      <DialogContent 
        className="sm:max-w-xl p-0 overflow-hidden border-0 shadow-2xl" 
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 px-8 py-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Welcome to EduPortal</h2>
              <p className="text-blue-100 text-sm">Your gateway to academic excellence</p>
            </div>
          </div>
          {selectedRole && (
            <Badge className="mt-4 bg-white/20 text-white border-white/30">
              {selectedRole === 'student' && <GraduationCap className="w-3 h-3 mr-1" />}
              {selectedRole === 'faculty' && <Briefcase className="w-3 h-3 mr-1" />}
              {selectedRole === 'academic' && <Shield className="w-3 h-3 mr-1" />}
              Logging in as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
            </Badge>
          )}
        </div>

        <div className="p-8">
          {!selectedRole ? (
            <div className="space-y-4">
              <p className="text-center text-gray-500 mb-6">Select your role to continue</p>
              {[
                { role: 'student', icon: GraduationCap, title: 'Student', desc: 'Access your academic services & certificates', bgColor: 'from-blue-50 to-blue-100', hoverColor: 'hover:from-blue-100 hover:to-blue-200', iconBg: 'from-blue-500 to-blue-600' },
                { role: 'faculty', icon: Briefcase, title: 'Faculty', desc: 'Manage your courses and students', bgColor: 'from-purple-50 to-purple-100', hoverColor: 'hover:from-purple-100 hover:to-purple-200', iconBg: 'from-purple-500 to-purple-600' },
                { role: 'academic', icon: Shield, title: 'Academic (Admin)', desc: 'Manage institute services & requests', bgColor: 'from-green-50 to-green-100', hoverColor: 'hover:from-green-100 hover:to-green-200', iconBg: 'from-green-500 to-green-600' }
              ].map((item) => (
                <div 
                  key={item.role}
                  className={`group flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r ${item.bgColor} ${item.hoverColor} cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg`}
                  onClick={() => setSelectedRole(item.role)}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
              <div className="text-center pt-4">
                <Button variant="ghost" onClick={handleCloseLoginModal} className="text-gray-500">
                  <X className="w-4 h-4 mr-2" /> Close
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className={`w-20 h-20 mx-auto rounded-2xl shadow-xl flex items-center justify-center bg-gradient-to-br ${
                selectedRole === 'student' ? 'from-blue-500 to-blue-600' :
                selectedRole === 'faculty' ? 'from-purple-500 to-purple-600' : 'from-green-500 to-green-600'
              }`}>
                {selectedRole === 'student' && <GraduationCap className="w-10 h-10 text-white" />}
                {selectedRole === 'faculty' && <Briefcase className="w-10 h-10 text-white" />}
                {selectedRole === 'academic' && <Shield className="w-10 h-10 text-white" />}
              </div>

              <div>
                <Label className="flex items-center gap-2 text-gray-600 mb-2">
                  <Mail className="w-4 h-4" /> {selectedRole === 'student' ? 'Email ID' : 'User ID'}
                </Label>
                <Input
                  type={selectedRole === 'student' ? 'email' : 'text'}
                  placeholder={selectedRole === 'student' ? 'your.email@example.com' : 'Enter your user ID'}
                  value={loginForm.userId}
                  onChange={(e) => setLoginForm({ ...loginForm, userId: e.target.value })}
                  className="h-12 rounded-xl border-2 focus:border-blue-400"
                  autoComplete="username"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 text-gray-600 mb-2">
                  <Lock className="w-4 h-4" /> Password
                </Label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="h-12 rounded-xl border-2 focus:border-blue-400"
                  autoComplete="current-password"
                />
                {selectedRole === 'student' && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg flex items-center gap-2 text-sm text-blue-700">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    <span>Default password: <code className="font-mono font-bold">student@123</code></span>
                  </div>
                )}
              </div>

              {selectedRole !== 'student' && (
                <div>
                  <Label className="flex items-center gap-2 text-gray-600 mb-2">
                    <User className="w-4 h-4" /> Your Name
                  </Label>
                  <Input
                    placeholder="Enter your full name"
                    value={loginForm.name}
                    onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })}
                    className="h-12 rounded-xl border-2 focus:border-blue-400"
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setSelectedRole(null)} className="flex-1 h-12 rounded-xl">
                  <ChevronRight className="w-4 h-4 mr-2 rotate-180" /> Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className={`flex-1 h-12 rounded-xl shadow-lg bg-gradient-to-r ${
                    selectedRole === 'student' ? 'from-blue-500 to-blue-600' :
                    selectedRole === 'faculty' ? 'from-purple-500 to-purple-600' : 'from-green-500 to-green-600'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Logging in...
                    </>
                  ) : (
                    <><LogIn className="w-4 h-4 mr-2" /> Login</>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  // Service Request Dialog
  const ServiceDialog = () => (
    <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
      <DialogContent className="border-0 shadow-2xl" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl">{getServiceName(activeService || '')}</DialogTitle>
          <DialogDescription>Fill in the details to submit your request</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {activeService === 'bonafide' && (
            <div>
              <Label className="text-gray-600 mb-2 block">Purpose of Bonafide</Label>
              <Textarea
                placeholder="E.g., Bank loan application, Visa application, etc."
                value={bonafideForm.purpose}
                onChange={(e) => setBonafideForm({ purpose: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
          )}

          {activeService === 'fee' && (
            <div className="space-y-4">
              <div>
                <Label className="text-gray-600 mb-2 block">Payment Mode</Label>
                <Select value={feeForm.paymentMode} onValueChange={(v) => setFeeForm({ ...feeForm, paymentMode: v })}>
                  <SelectTrigger><SelectValue placeholder="Select payment mode" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_payment">Full Payment</SelectItem>
                    <SelectItem value="installment">Installment</SelectItem>
                    <SelectItem value="scholarship">Scholarship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-600 mb-2 block">Category</Label>
                <Select value={feeForm.category} onValueChange={(v) => setFeeForm({ ...feeForm, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {feeStructures.map((fee) => (
                      <SelectItem key={fee.id} value={fee.category}>
                        {fee.category} - ₹{fee.totalFee.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {(activeService === 'tc' || activeService === 'noc') && (
            <div className="p-4 bg-blue-50 rounded-xl text-center">
              <p className="text-gray-600">
                Click submit to request your {getServiceName(activeService || '')}. 
                The academic section will process your request.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={() => setShowServiceDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleServiceRequest} 
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-600"
          >
            {isLoading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Request Detail Modal
  const RequestDetailModal = () => (
    <Dialog open={!!requestDetailDialog} onOpenChange={() => setRequestDetailDialog(null)}>
      <DialogContent className="border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle>Request Details</DialogTitle>
          <DialogDescription>View and manage this service request</DialogDescription>
        </DialogHeader>

        {requestDetailDialog && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Student Name', value: requestDetailDialog.studentName },
                { label: 'Email', value: requestDetailDialog.studentEmail },
                { label: 'Roll No', value: requestDetailDialog.rollNo || 'N/A' },
                { label: 'Department', value: requestDetailDialog.department || 'N/A' }
              ].map((item, idx) => (
                <div key={idx}>
                  <Label className="text-gray-500 text-sm">{item.label}</Label>
                  <p className="font-medium">{item.value}</p>
                </div>
              ))}
            </div>
            <Separator />
            <div>
              <Label className="text-gray-500 text-sm">Service Type</Label>
              <p className="font-medium">{getServiceName(requestDetailDialog.serviceType)}</p>
            </div>
            {requestDetailDialog.details && Object.keys(requestDetailDialog.details).length > 0 && (
              <div>
                <Label className="text-gray-500 text-sm">Details</Label>
                <Card className="mt-2 bg-gray-50 border-0">
                  <CardContent className="py-3">
                    {Object.entries(requestDetailDialog.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-1">
                        <span className="capitalize text-gray-600">{key.replace(/_/g, ' ')}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Label className="text-gray-500">Status:</Label>
              <StatusBadge status={requestDetailDialog.status} />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {requestDetailDialog?.status === 'approved' && (
            <Button variant="outline" onClick={() => handleDownloadPDF(requestDetailDialog)} className="text-green-600">
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </Button>
          )}
          {requestDetailDialog?.status === 'pending' && (
            <>
              <Button variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleUpdateRequest(requestDetailDialog.id, 'rejected')}>
                <XCircle className="w-4 h-4 mr-2" /> Reject
              </Button>
              <Button className="bg-gradient-to-r from-green-500 to-green-600" onClick={() => handleUpdateRequest(requestDetailDialog.id, 'approved')}>
                <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Main Render
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {!user && currentPage === 'home' && <PublicHome />}
      {!user && currentPage === 'about' && <AboutPage />}
      {!user && currentPage === 'courses' && <CoursesPage />}
      
      {user?.role === 'academic' && currentPage === 'dashboard' && <AdminDashboard />}
      {user?.role === 'academic' && currentPage === 'students' && <StudentsPage />}
      {user?.role === 'academic' && currentPage === 'requests' && <RequestsPage />}
      
      {user?.role === 'faculty' && currentPage === 'dashboard' && <AdminDashboard />}
      
      {user?.role === 'student' && currentPage === 'student-home' && <StudentHome />}
      {user?.role === 'student' && currentPage === 'student-profile' && <StudentProfile />}
      {user?.role === 'student' && currentPage === 'student-services' && <StudentServices />}

      <LoginModal />
      <ServiceDialog />
      <RequestDetailModal />
    </div>
  );
}
