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
        return <Badge className="badge badge--pending"><Clock className="w-3 h-3" /> Pending</Badge>;
      case 'approved':
        return <Badge className="badge badge--approved"><CheckCircle2 className="w-3 h-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge className="badge badge--rejected"><XCircle className="w-3 h-3" /> Rejected</Badge>;
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
    <header className="header">
      <div className="header__container">
        <div className="header__logo" onClick={() => setCurrentPage(user ? (user.role === 'student' ? 'student-home' : 'dashboard') : 'home')}>
          <div className="header__logo-icon">
            <GraduationCap />
          </div>
          <span className="header__logo-text">EduPortal</span>
        </div>

        <nav className="header__nav">
          {!user ? (
            <>
              <button className={`header__nav-btn ${currentPage === 'home' ? 'header__nav-btn--active' : ''}`} onClick={() => setCurrentPage('home')}>
                <Home className="w-4 h-4" /> Home
              </button>
              <button className={`header__nav-btn ${currentPage === 'about' ? 'header__nav-btn--active' : ''}`} onClick={() => setCurrentPage('about')}>
                <Info className="w-4 h-4" /> About
              </button>
              <button className={`header__nav-btn ${currentPage === 'courses' ? 'header__nav-btn--active' : ''}`} onClick={() => setCurrentPage('courses')}>
                <BookOpen className="w-4 h-4" /> Courses
              </button>
            </>
          ) : user.role === 'student' ? (
            <>
              <button className={`header__nav-btn ${currentPage === 'student-home' ? 'header__nav-btn--active' : ''}`} onClick={() => setCurrentPage('student-home')}>
                <Home className="w-4 h-4" /> Home
              </button>
              <button className={`header__nav-btn ${currentPage === 'student-profile' ? 'header__nav-btn--active' : ''}`} onClick={() => setCurrentPage('student-profile')}>
                <UserCircle className="w-4 h-4" /> Profile
              </button>
              <button className={`header__nav-btn ${currentPage === 'student-services' ? 'header__nav-btn--active' : ''}`} onClick={() => setCurrentPage('student-services')}>
                <FileText className="w-4 h-4" /> Services
              </button>
            </>
          ) : (
            <>
              <button className={`header__nav-btn ${currentPage === 'dashboard' ? 'header__nav-btn--active' : ''}`} onClick={() => setCurrentPage('dashboard')}>
                <BarChart3 className="w-4 h-4" /> Dashboard
              </button>
              <button className={`header__nav-btn ${currentPage === 'students' ? 'header__nav-btn--active' : ''}`} onClick={() => setCurrentPage('students')}>
                <Users className="w-4 h-4" /> Students
              </button>
              <button className={`header__nav-btn ${currentPage === 'requests' ? 'header__nav-btn--active' : ''}`} onClick={() => setCurrentPage('requests')}>
                <FileCheck className="w-4 h-4" /> Requests
              </button>
            </>
          )}
        </nav>

        <div className="header__actions">
          {user?.role === 'student' && (
            <div className="notification">
              <button className="notification__bell" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && <span className="notification__count">{unreadCount}</span>}
              </button>
              
              {showNotifications && (
                <div className="notification__dropdown">
                  <div className="notification__dropdown-header">
                    <h3>Notifications</h3>
                    {unreadCount > 0 && (
                      <button className="btn btn--ghost btn--sm" onClick={handleMarkAllRead}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="notification__dropdown-list">
                    {notifications.length === 0 ? (
                      <div className="notification__dropdown-empty">
                        <Bell className="w-8 h-8" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map(notif => (
                        <div 
                          key={notif.id} 
                          className={`notification__item ${!notif.read ? 'notification__item--unread' : ''}`}
                          onClick={() => handleMarkNotificationRead(notif.id)}
                        >
                          <div className={`notification__item-icon notification__item-icon--${notif.type}`}>
                            {notif.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                          </div>
                          <div className="notification__item-content">
                            <h4>{notif.title}</h4>
                            <p>{notif.message}</p>
                            <time>{new Date(notif.createdAt).toLocaleDateString()}</time>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {user ? (
            <>
              <div className="header__user">
                <UserCircle className="w-5 h-5 text-blue-600" />
                <span className="header__user-name">{user.name}</span>
                <Badge variant="outline" className="text-xs">{user.role}</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </>
          ) : (
            <Button onClick={() => setShowLoginModal(true)} className="btn btn--primary">
              <LogIn className="w-4 h-4 mr-2" /> Login
            </Button>
          )}

          <button className="header__mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="p-4 border-t md:hidden">
          <nav className="flex flex-col gap-1">
            {!user ? (
              <>
                <button className="header__nav-btn justify-start" onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }}>
                  <Home className="w-4 h-4" /> Home
                </button>
                <button className="header__nav-btn justify-start" onClick={() => { setCurrentPage('about'); setMobileMenuOpen(false); }}>
                  <Info className="w-4 h-4" /> About
                </button>
                <button className="header__nav-btn justify-start" onClick={() => { setCurrentPage('courses'); setMobileMenuOpen(false); }}>
                  <BookOpen className="w-4 h-4" /> Courses
                </button>
              </>
            ) : user.role === 'student' ? (
              <>
                <button className="header__nav-btn justify-start" onClick={() => { setCurrentPage('student-home'); setMobileMenuOpen(false); }}>
                  <Home className="w-4 h-4" /> Home
                </button>
                <button className="header__nav-btn justify-start" onClick={() => { setCurrentPage('student-profile'); setMobileMenuOpen(false); }}>
                  <UserCircle className="w-4 h-4" /> Profile
                </button>
                <button className="header__nav-btn justify-start" onClick={() => { setCurrentPage('student-services'); setMobileMenuOpen(false); }}>
                  <FileText className="w-4 h-4" /> Services
                </button>
              </>
            ) : (
              <>
                <button className="header__nav-btn justify-start" onClick={() => { setCurrentPage('dashboard'); setMobileMenuOpen(false); }}>
                  <BarChart3 className="w-4 h-4" /> Dashboard
                </button>
                <button className="header__nav-btn justify-start" onClick={() => { setCurrentPage('students'); setMobileMenuOpen(false); }}>
                  <Users className="w-4 h-4" /> Students
                </button>
                <button className="header__nav-btn justify-start" onClick={() => { setCurrentPage('requests'); setMobileMenuOpen(false); }}>
                  <FileCheck className="w-4 h-4" /> Requests
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );

  // Public Home Page
  const PublicHome = () => (
    <div className="min-h-screen">
      <section className="hero">
        <div className="hero__bg" />
        <div className="hero__container container">
          <div className="hero__content">
            <div className="hero__badge">🎓 Welcome to EduPortal</div>
            <h1 className="hero__title">
              Your Gateway to
              <span>Academic Excellence</span>
            </h1>
            <p className="hero__description">
              Streamline your academic journey with our comprehensive institute service portal. 
              Access certificates, manage documents, and stay connected with your institution.
            </p>
            <div className="hero__actions">
              <Button size="lg" onClick={() => setShowLoginModal(true)} className="btn btn--primary btn--lg">
                Get Started <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => setCurrentPage('about')} className="btn btn--outline btn--lg">
                Learn More
              </Button>
            </div>
          </div>
          <div className="hero__animation">
            <div className="hero__animation-wrapper">
              <LottieAnimation url="https://assets3.lottiefiles.com/packages/lf20_4DLPwR.json" className="w-full h-full relative z-10" />
            </div>
          </div>
        </div>
      </section>

      <section className="services">
        <div className="container">
          <div className="services__header">
            <h2>Our Services</h2>
            <p>Everything you need to manage your academic requirements in one place</p>
          </div>
          <div className="services__grid">
            {[
              { icon: FileCheck, title: 'Bonafide Certificate', desc: 'Get your bonafide certificate for various purposes', color: 'blue' },
              { icon: CreditCard, title: 'Fee Structure', desc: 'View and download fee details for your category', color: 'purple' },
              { icon: FileText, title: 'Transfer Certificate', desc: 'Apply for TC when transferring institutions', color: 'pink' },
              { icon: Shield, title: 'NOC', desc: 'Request No Objection Certificate easily', color: 'green' }
            ].map((feature, idx) => (
              <div key={idx} className="services__card">
                <div className={`services__card-icon services__card-icon--${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="stats-banner">
        <div className="container">
          <div className="stats-banner__grid">
            {[
              { value: '10K+', label: 'Students' },
              { value: '500+', label: 'Faculty' },
              { value: '50+', label: 'Courses' },
              { value: '95%', label: 'Satisfaction' }
            ].map((stat, idx) => (
              <div key={idx} className="stats-banner__item">
                <div className="stats-banner__item-value">{stat.value}</div>
                <div className="stats-banner__item-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer__container">
          <div className="footer__logo">
            <GraduationCap className="h-6 w-6" />
            <span>EduPortal</span>
          </div>
          <p className="footer__copyright">© 2025 EduPortal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );

  // About Page
  const AboutPage = () => (
    <div className="min-h-screen py-12">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4">About Us</Badge>
            <h1 className="text-4xl font-bold mb-4">About Our Institution</h1>
            <p className="text-gray-600">Excellence in education since 1990</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="card card--hover">
              <CardHeader>
                <Award className="w-10 h-10 text-blue-600 mb-2" />
                <CardTitle>Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  To be a globally recognized institution of higher learning, fostering innovation, 
                  research, and ethical leadership for the betterment of society.
                </p>
              </CardContent>
            </Card>

            <Card className="card card--hover">
              <CardHeader>
                <Briefcase className="w-10 h-10 text-purple-600 mb-2" />
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

          <Card>
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
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  // Courses Page
  const CoursesPage = () => (
    <div className="min-h-screen py-12">
      <div className="container">
        <div className="text-center mb-12">
          <Badge className="mb-4">Programs</Badge>
          <h1 className="text-4xl font-bold mb-4">Our Courses</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our wide range of undergraduate and postgraduate programs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Computer Science', duration: '4 Years', type: 'B.Tech', seats: 120 },
            { name: 'Electronics', duration: '4 Years', type: 'B.Tech', seats: 60 },
            { name: 'Mechanical', duration: '4 Years', type: 'B.Tech', seats: 60 },
            { name: 'Civil Engineering', duration: '4 Years', type: 'B.Tech', seats: 60 },
            { name: 'MBA', duration: '2 Years', type: 'MBA', seats: 120 },
            { name: 'MCA', duration: '2 Years', type: 'MCA', seats: 60 }
          ].map((course, idx) => (
            <Card key={idx} className="card card--hover">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant="outline">{course.type}</Badge>
                  <span className="text-sm text-gray-500">{course.duration}</span>
                </div>
                <CardTitle className="mt-2">{course.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>{course.seats} Seats</span>
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
    <div className="dashboard">
      <div className="container">
        <div className="dashboard__header">
          <h1>Academic Dashboard</h1>
          <p>Welcome back, {user?.name}</p>
        </div>

        <div className="dashboard__stats">
          <div className="dashboard__stat-card dashboard__stat-card--blue">
            <div className="dashboard__stat-card-label">Total Students</div>
            <div className="dashboard__stat-card-value">{stats?.totalStudents || 0}</div>
            <div className="dashboard__stat-card-icon"><Users /></div>
          </div>
          <div className="dashboard__stat-card dashboard__stat-card--purple">
            <div className="dashboard__stat-card-label">Total Requests</div>
            <div className="dashboard__stat-card-value">{stats?.totalRequests || 0}</div>
            <div className="dashboard__stat-card-icon"><FileText /></div>
          </div>
          <div className="dashboard__stat-card dashboard__stat-card--yellow">
            <div className="dashboard__stat-card-label">Pending</div>
            <div className="dashboard__stat-card-value">{stats?.pendingRequests || 0}</div>
            <div className="dashboard__stat-card-icon"><Clock /></div>
          </div>
          <div className="dashboard__stat-card dashboard__stat-card--green">
            <div className="dashboard__stat-card-label">Approved</div>
            <div className="dashboard__stat-card-value">{stats?.approvedRequests || 0}</div>
            <div className="dashboard__stat-card-icon"><CheckCircle2 /></div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Service Requests</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage('requests')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="students__empty">
                <FileText />
                <h4>No requests yet</h4>
              </div>
            ) : (
              <div className="requests__list">
                {requests.slice(0, 5).map((req) => (
                  <div key={req.id} className="requests__item">
                    <div className="requests__item-info">
                      <div className="requests__item-info-avatar">
                        <UserCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4>{req.studentName}</h4>
                        <p>{getServiceName(req.serviceType)}</p>
                      </div>
                    </div>
                    <div className="requests__item-actions">
                      <StatusBadge status={req.status} />
                      {req.status === 'approved' && (
                        <Button size="sm" variant="outline" onClick={() => handleDownloadPDF(req)}>
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
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
    <div className="dashboard">
      <div className="container">
        <div className="dashboard__header">
          <h1>Students Management</h1>
          <p>Upload and manage student data</p>
        </div>

        <div className="students__grid">
          {/* File Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" /> Upload Students
              </CardTitle>
              <CardDescription>
                Upload Excel (.xlsx, .xls) or CSV file with columns: Name, Email, Roll No, Department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`file-upload__container ${isDragging ? 'file-upload__container--dragging' : ''} ${selectedFile ? 'file-upload__container--has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="file-upload__icon">
                  {selectedFile ? <CheckCircle2 /> : <FileSpreadsheet />}
                </div>
                <div className="file-upload__text">
                  {selectedFile ? (
                    <>
                      <h4>{selectedFile.name}</h4>
                      <p>{parsedStudents.length} students found</p>
                    </>
                  ) : (
                    <>
                      <h4>Drop your file here or click to browse</h4>
                      <p>Supports Excel (.xlsx, .xls) and CSV files</p>
                      <small>Max file size: 5MB</small>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="file-upload__input"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
              </div>

              {selectedFile && (
                <div className="file-upload__file-info">
                  <FileSpreadsheet className="w-5 h-5" />
                  <span>{selectedFile.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setParsedStudents([]); }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {parsedStudents.length > 0 && (
                <div className="file-upload__preview">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Roll No</th>
                        <th>Department</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedStudents.slice(0, 5).map((student, idx) => (
                        <tr key={idx}>
                          <td>{student.name}</td>
                          <td>{student.email}</td>
                          <td>{student.rollNo}</td>
                          <td>{student.department}</td>
                        </tr>
                      ))}
                      {parsedStudents.length > 5 && (
                        <tr>
                          <td colSpan={4} className="text-center text-gray-500">
                            ...and {parsedStudents.length - 5} more
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleUploadStudents} 
                disabled={isLoading || parsedStudents.length === 0} 
                className="btn btn--primary btn--full"
              >
                {isLoading ? 'Uploading...' : `Upload ${parsedStudents.length} Students`}
              </Button>
            </CardFooter>
          </Card>

          {/* Students List */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Student Records ({students.length})</CardTitle>
                <Button variant="outline" size="sm" onClick={fetchStudents}>
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="students__empty">
                  <Users />
                  <h4>No students uploaded yet</h4>
                  <p>Upload an Excel or CSV file to add students</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table className="students__table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Roll No</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.rollNo}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{student.department}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600"
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
  );

  // Requests Management Page
  const RequestsPage = () => (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard__header">
          <h1>Service Requests</h1>
          <p>Manage student service requests</p>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="requests__tabs">
            <TabsTrigger value="all" className="requests__tab">All ({requests.length})</TabsTrigger>
            <TabsTrigger value="pending" className="requests__tab">Pending ({requests.filter(r => r.status === 'pending').length})</TabsTrigger>
            <TabsTrigger value="approved" className="requests__tab">Approved ({requests.filter(r => r.status === 'approved').length})</TabsTrigger>
            <TabsTrigger value="rejected" className="requests__tab">Rejected ({requests.filter(r => r.status === 'rejected').length})</TabsTrigger>
          </TabsList>

          {['all', 'pending', 'approved', 'rejected'].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <Card>
                <CardContent className="pt-6">
                  {requests.filter(r => tab === 'all' || r.status === tab).length === 0 ? (
                    <div className="students__empty">
                      <FileText />
                      <h4>No {tab !== 'all' ? tab : ''} requests</h4>
                    </div>
                  ) : (
                    <ScrollArea className="h-[500px]">
                      <Table className="students__table">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {requests
                            .filter(r => tab === 'all' || r.status === tab)
                            .map((req) => (
                              <TableRow key={req.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{req.studentName}</p>
                                    <p className="text-sm text-gray-500">{req.studentEmail}</p>
                                  </div>
                                </TableCell>
                                <TableCell>{getServiceName(req.serviceType)}</TableCell>
                                <TableCell>{req.department}</TableCell>
                                <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell><StatusBadge status={req.status} /></TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => setRequestDetailDialog(req)}>
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    {req.status === 'approved' && (
                                      <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleDownloadPDF(req)}>
                                        <Download className="w-4 h-4" />
                                      </Button>
                                    )}
                                    {req.status === 'pending' && (
                                      <>
                                        <Button size="sm" variant="ghost" className="text-green-600" onClick={() => handleUpdateRequest(req.id, 'approved')}>
                                          <CheckCircle2 className="w-4 h-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleUpdateRequest(req.id, 'rejected')}>
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
    <div className="dashboard">
      <div className="container">
        <div className="dashboard__header">
          <h1>Welcome, {user?.name}!</h1>
          <p>Access your academic services and track your requests</p>
        </div>

        <Card className="mb-8" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white' }}>
          <CardContent className="py-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <UserCircle className="w-10 h-10" />
                <div>
                  <p className="text-blue-100 text-sm">Name</p>
                  <p className="font-semibold">{user?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-10 h-10" />
                <div>
                  <p className="text-blue-100 text-sm">Email</p>
                  <p className="font-semibold">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Hash className="w-10 h-10" />
                <div>
                  <p className="text-blue-100 text-sm">Roll No</p>
                  <p className="font-semibold">{user?.rollNo || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-10 h-10" />
                <div>
                  <p className="text-blue-100 text-sm">Department</p>
                  <p className="font-semibold">{user?.department || 'N/A'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="quick-actions mb-8">
          {[
            { icon: FileCheck, title: 'Bonafide Certificate', service: 'bonafide' as ServiceType, color: 'blue' },
            { icon: CreditCard, title: 'Fee Structure', service: 'fee' as ServiceType, color: 'purple' },
            { icon: FileText, title: 'Transfer Certificate', service: 'tc' as ServiceType, color: 'pink' },
            { icon: Shield, title: 'NOC', service: 'noc' as ServiceType, color: 'green' }
          ].map((item, idx) => (
            <div key={idx} className="quick-actions__card" onClick={() => { setActiveService(item.service); setShowServiceDialog(true); }}>
              <div className={`quick-actions__card-icon quick-actions__card-icon--${item.color}`}>
                <item.icon />
              </div>
              <h3>{item.title}</h3>
              <Button variant="outline" size="sm">Request</Button>
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Requests</CardTitle>
            <CardDescription>Track the status of your service requests</CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="students__empty">
                <FileText />
                <h4>No requests yet</h4>
                <p>Click on a service above to make a request</p>
              </div>
            ) : (
              <div className="requests__list">
                {requests.map((req) => (
                  <div key={req.id} className="requests__item">
                    <div>
                      <h4 className="font-medium">{getServiceName(req.serviceType)}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(req.createdAt).toLocaleDateString()} - {new Date(req.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={req.status} />
                      {req.status === 'approved' && (
                        <Button size="sm" variant="outline" onClick={() => handleDownloadPDF(req)}>
                          <Download className="w-4 h-4 mr-1" /> Download
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
    <div className="profile">
      <div className="container">
        <div className="profile__header">
          <h1>My Profile</h1>
          <p>View and manage your personal information</p>
        </div>

        <div className="profile__hero">
          <div className="profile__hero-banner">
            <div className="profile__hero-avatar">
              <div className="profile__hero-avatar-inner">
                <span>{user?.name?.charAt(0)?.toUpperCase() || 'S'}</span>
              </div>
            </div>
          </div>
          <div className="profile__hero-content">
            <div className="profile__hero-content-info">
              <h2>{user?.name || 'Student Name'}</h2>
              <p>
                <GraduationCap />
                {user?.department || 'Department'} • Roll No: {user?.rollNo || 'N/A'}
              </p>
            </div>
            <Button 
              onClick={() => isEditingProfile ? handleUpdateProfile() : setIsEditingProfile(true)}
              disabled={isLoading}
              className={isEditingProfile ? 'btn btn--green' : 'btn btn--primary'}
            >
              {isLoading ? 'Saving...' : isEditingProfile ? <><Save className="w-4 h-4 mr-2" /> Save Changes</> : <><Edit3 className="w-4 h-4 mr-2" /> Edit Profile</>}
            </Button>
          </div>
        </div>

        <div className="profile__grid">
          <div className="space-y-6">
            {/* Academic Information */}
            <div className="profile__section">
              <div className="profile__section-header profile__section-header--blue">
                <div className="profile__section-header-icon profile__section-header-icon--blue">
                  <GraduationCap />
                </div>
                <div className="profile__section-header-text">
                  <h3>Academic Information</h3>
                  <p>Your enrollment details (Read-only)</p>
                </div>
              </div>
              <div className="profile__section-content">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="profile__field">
                    <label><Lock className="w-3 h-3" /> Email ID</label>
                    <div className="profile__field-value">{user?.email || 'Not provided'}</div>
                  </div>
                  <div className="profile__field">
                    <label><Lock className="w-3 h-3" /> Roll Number</label>
                    <div className="profile__field-value">{user?.rollNo || 'Not provided'}</div>
                  </div>
                  <div className="profile__field">
                    <label><Lock className="w-3 h-3" /> Department</label>
                    <div className="profile__field-value">{user?.department || 'Not provided'}</div>
                  </div>
                  <div className="profile__field">
                    <label><Lock className="w-3 h-3" /> Student ID</label>
                    <div className="profile__field-value" style={{ fontSize: '0.75rem' }}>{user?.id || 'Not provided'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="profile__section">
              <div className="profile__section-header profile__section-header--purple">
                <div className="profile__section-header-icon profile__section-header-icon--purple">
                  <User />
                </div>
                <div className="profile__section-header-text">
                  <h3>Personal Information</h3>
                  <p>Update your personal details</p>
                </div>
              </div>
              <div className="profile__section-content">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="profile__field">
                    <label>Full Name</label>
                    {isEditingProfile ? (
                      <Input
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        placeholder="Enter your full name"
                        className="input"
                      />
                    ) : (
                      <div className="profile__field-value">{user?.name || 'Not provided'}</div>
                    )}
                  </div>
                  <div className="profile__field">
                    <label>Phone Number</label>
                    {isEditingProfile ? (
                      <Input
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="Enter phone number"
                        className="input"
                      />
                    ) : (
                      <div className={`profile__field-value ${!user?.phone ? 'profile__field-value--empty' : ''}`}>
                        {user?.phone || 'Not provided'}
                      </div>
                    )}
                  </div>
                  <div className="profile__field">
                    <label>Date of Birth</label>
                    {isEditingProfile ? (
                      <Input
                        type="date"
                        value={profileForm.dateOfBirth}
                        onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                        className="input"
                      />
                    ) : (
                      <div className={`profile__field-value ${!user?.dateOfBirth ? 'profile__field-value--empty' : ''}`}>
                        {user?.dateOfBirth || 'Not provided'}
                      </div>
                    )}
                  </div>
                  <div className="profile__field">
                    <label>Blood Group</label>
                    {isEditingProfile ? (
                      <Select value={profileForm.bloodGroup} onValueChange={(v) => setProfileForm({ ...profileForm, bloodGroup: v })}>
                        <SelectTrigger className="input"><SelectValue placeholder="Select blood group" /></SelectTrigger>
                        <SelectContent>
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                            <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className={`profile__field-value ${!user?.bloodGroup ? 'profile__field-value--empty' : ''}`}>
                        {user?.bloodGroup || 'Not provided'}
                      </div>
                    )}
                  </div>
                  <div className="profile__field sm:col-span-2">
                    <label>Address</label>
                    {isEditingProfile ? (
                      <Textarea
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                        placeholder="Enter your complete address"
                        className="textarea"
                        rows={3}
                      />
                    ) : (
                      <div className={`profile__field-value ${!user?.address ? 'profile__field-value--empty' : ''}`} style={{ minHeight: '80px' }}>
                        {user?.address || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Guardian Information */}
            <div className="profile__section">
              <div className="profile__section-header profile__section-header--green">
                <div className="profile__section-header-icon profile__section-header-icon--green">
                  <Users />
                </div>
                <div className="profile__section-header-text">
                  <h3>Guardian Information</h3>
                  <p>Your guardian/parent details</p>
                </div>
              </div>
              <div className="profile__section-content">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="profile__field">
                    <label>Guardian Name</label>
                    {isEditingProfile ? (
                      <Input
                        value={profileForm.guardianName}
                        onChange={(e) => setProfileForm({ ...profileForm, guardianName: e.target.value })}
                        placeholder="Enter guardian's name"
                        className="input"
                      />
                    ) : (
                      <div className={`profile__field-value ${!user?.guardianName ? 'profile__field-value--empty' : ''}`}>
                        {user?.guardianName || 'Not provided'}
                      </div>
                    )}
                  </div>
                  <div className="profile__field">
                    <label>Guardian Phone</label>
                    {isEditingProfile ? (
                      <Input
                        value={profileForm.guardianPhone}
                        onChange={(e) => setProfileForm({ ...profileForm, guardianPhone: e.target.value })}
                        placeholder="Enter guardian's phone"
                        className="input"
                      />
                    ) : (
                      <div className={`profile__field-value ${!user?.guardianPhone ? 'profile__field-value--empty' : ''}`}>
                        {user?.guardianPhone || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Profile Stats */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" /> My Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="profile__stats">
                  <div className="profile__stats-item profile__stats-item--blue">
                    <div className="profile__stats-item-label">
                      <FileText className="text-blue-600" />
                      <span>Total Requests</span>
                    </div>
                    <Badge className="bg-blue-500">{requests.length}</Badge>
                  </div>
                  <div className="profile__stats-item profile__stats-item--yellow">
                    <div className="profile__stats-item-label">
                      <Clock className="text-yellow-600" />
                      <span>Pending</span>
                    </div>
                    <Badge className="bg-yellow-500">{requests.filter(r => r.status === 'pending').length}</Badge>
                  </div>
                  <div className="profile__stats-item profile__stats-item--green">
                    <div className="profile__stats-item-label">
                      <CheckCircle2 className="text-green-600" />
                      <span>Approved</span>
                    </div>
                    <Badge className="bg-green-500">{requests.filter(r => r.status === 'approved').length}</Badge>
                  </div>
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
                <Button className="btn btn--primary btn--full" onClick={() => setCurrentPage('student-services')}>
                  <FileCheck className="w-4 h-4 mr-2" /> Request Certificate
                </Button>
                <Button variant="outline" className="btn btn--outline btn--full" onClick={() => setCurrentPage('student-home')}>
                  <Home className="w-4 h-4 mr-2" /> Go to Dashboard
                </Button>
              </CardContent>
            </Card>

            {isEditingProfile && (
              <div className="profile__edit-banner">
                <div className="profile__edit-banner-header">
                  <Edit3 className="w-5 h-5" />
                  <span>Edit Mode Active</span>
                </div>
                <p>You can now edit your personal information. Click "Save Changes" when done.</p>
                <Button 
                  variant="outline" 
                  className="btn btn--outline btn--full"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setProfileForm({
                      name: user?.name || '',
                      phone: user?.phone || '',
                      address: user?.address || '',
                      dateOfBirth: user?.dateOfBirth || '',
                      guardianName: user?.guardianName || '',
                      guardianPhone: user?.guardianPhone || '',
                      bloodGroup: user?.bloodGroup || ''
                    });
                  }}
                >
                  <X className="w-4 h-4 mr-2" /> Cancel Editing
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Student Services Page
  const StudentServices = () => (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard__header">
          <h1>Student Services</h1>
          <p>Request certificates and documents</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {[
            { icon: FileCheck, title: 'Bonafide Certificate', desc: 'Request a bonafide certificate for bank loans, visa applications, etc.', service: 'bonafide' as ServiceType, color: 'blue' },
            { icon: CreditCard, title: 'Fee Structure', desc: 'Get detailed fee structure based on your category and payment mode.', service: 'fee' as ServiceType, color: 'purple' },
            { icon: FileText, title: 'Transfer Certificate', desc: 'Apply for TC when transferring to another institution.', service: 'tc' as ServiceType, color: 'pink' },
            { icon: Shield, title: 'No Objection Certificate', desc: 'Request NOC for internships, competitions, or other activities.', service: 'noc' as ServiceType, color: 'green' }
          ].map((item, idx) => (
            <Card key={idx} className="card card--hover">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`quick-actions__card-icon quick-actions__card-icon--${item.color}`} style={{ width: '3.5rem', height: '3.5rem', flexShrink: 0 }}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <CardTitle className="text-lg mb-1">{item.title}</CardTitle>
                    <CardDescription>{item.desc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardFooter>
                <Button className="btn btn--primary btn--full" onClick={() => { setActiveService(item.service); setShowServiceDialog(true); }}>
                  <Send className="w-4 h-4 mr-2" /> Request Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request History</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="students__empty">
                <FileText />
                <h4>No requests submitted yet</h4>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <Table className="students__table">
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
                        <TableCell className="text-sm text-gray-500">{req.details?.purpose || req.details?.category || '-'}</TableCell>
                        <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell><StatusBadge status={req.status} /></TableCell>
                        <TableCell>
                          {req.status === 'approved' && (
                            <Button size="sm" variant="outline" onClick={() => handleDownloadPDF(req)}>
                              <Download className="w-4 h-4 mr-1" /> PDF
                            </Button>
                          )}
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
  );

  // Login Modal
  const LoginModal = () => (
    <Dialog open={showLoginModal} onOpenChange={(open) => !open && handleCloseLoginModal()}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-0 shadow-2xl" onPointerDownOutside={(e) => e.preventDefault()}>
        <div className="login-modal__header">
          <div className="login-modal__header-content">
            <div className="login-modal__header-icon">
              <GraduationCap />
            </div>
            <div className="login-modal__header-text">
              <h2>Welcome to EduPortal</h2>
              <p>Your gateway to academic excellence</p>
            </div>
          </div>
          {selectedRole && (
            <div className="login-modal__header-badge">
              {selectedRole === 'student' && <GraduationCap className="w-3 h-3" />}
              {selectedRole === 'faculty' && <Briefcase className="w-3 h-3" />}
              {selectedRole === 'academic' && <Shield className="w-3 h-3" />}
              Logging in as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
            </div>
          )}
        </div>

        <div className="login-modal__body">
          {!selectedRole ? (
            <div className="login-modal__roles">
              <p className="login-modal__roles-title">Select your role to continue</p>
              {[
                { role: 'student', icon: GraduationCap, title: 'Student', desc: 'Access your academic services & certificates' },
                { role: 'faculty', icon: Briefcase, title: 'Faculty', desc: 'Manage your courses and students' },
                { role: 'academic', icon: Shield, title: 'Academic (Admin)', desc: 'Manage institute services & requests' }
              ].map((item) => (
                <div 
                  key={item.role}
                  className={`login-modal__role-card login-modal__role-card--${item.role}`}
                  onClick={() => setSelectedRole(item.role)}
                >
                  <div className={`login-modal__role-card-icon login-modal__role-card-icon--${item.role}`}>
                    <item.icon />
                  </div>
                  <div className="login-modal__role-card-content">
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                  <ChevronRight className="login-modal__role-card-arrow w-6 h-6" />
                </div>
              ))}
              <div className="login-modal__close">
                <Button variant="ghost" onClick={handleCloseLoginModal}>
                  <X className="w-4 h-4 mr-2" /> Close
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="login-modal__form">
              <div className={`login-modal__form-icon login-modal__form-icon--${selectedRole}`}>
                {selectedRole === 'student' && <GraduationCap />}
                {selectedRole === 'faculty' && <Briefcase />}
                {selectedRole === 'academic' && <Shield />}
              </div>

              <div className="form-group">
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {selectedRole === 'student' ? 'Email ID' : 'User ID'}
                </Label>
                <Input
                  type={selectedRole === 'student' ? 'email' : 'text'}
                  placeholder={selectedRole === 'student' ? 'your.email@example.com' : 'Enter your user ID'}
                  value={loginForm.userId}
                  onChange={(e) => setLoginForm({ ...loginForm, userId: e.target.value })}
                  className="input"
                  autoComplete="username"
                />
              </div>

              <div className="form-group">
                <Label className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-400" />
                  Password
                </Label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="input"
                  autoComplete="current-password"
                />
                {selectedRole === 'student' && (
                  <div className="login-modal__form-hint">
                    <Info className="w-3 h-3" />
                    Default password for students: <span>student@123</span>
                  </div>
                )}
              </div>

              {selectedRole !== 'student' && (
                <div className="form-group">
                  <Label className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    Your Name
                  </Label>
                  <Input
                    placeholder="Enter your full name"
                    value={loginForm.name}
                    onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })}
                    className="input"
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="login-modal__form-actions">
                <Button type="button" variant="outline" onClick={() => setSelectedRole(null)} className="btn btn--outline">
                  <ChevronRight className="w-4 h-4 mr-2 rotate-180" /> Back
                </Button>
                <Button type="submit" disabled={isLoading} className={`btn btn--${selectedRole === 'student' ? 'primary' : selectedRole === 'faculty' ? 'purple' : 'green'}`}>
                  {isLoading ? 'Logging in...' : <><LogIn className="w-4 h-4 mr-2" /> Login</>}
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
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{getServiceName(activeService || '')}</DialogTitle>
          <DialogDescription>Fill in the details to submit your request</DialogDescription>
        </DialogHeader>

        {activeService === 'bonafide' && (
          <div className="form-group">
            <Label>Purpose of Bonafide</Label>
            <Textarea
              placeholder="E.g., Bank loan application, Visa application, etc."
              value={bonafideForm.purpose}
              onChange={(e) => setBonafideForm({ purpose: e.target.value })}
              className="textarea"
            />
          </div>
        )}

        {activeService === 'fee' && (
          <>
            <div className="form-group">
              <Label>Payment Mode</Label>
              <Select value={feeForm.paymentMode} onValueChange={(v) => setFeeForm({ ...feeForm, paymentMode: v })}>
                <SelectTrigger className="input"><SelectValue placeholder="Select payment mode" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_payment">Full Payment</SelectItem>
                  <SelectItem value="installment">Installment</SelectItem>
                  <SelectItem value="scholarship">Scholarship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="form-group">
              <Label>Category</Label>
              <Select value={feeForm.category} onValueChange={(v) => setFeeForm({ ...feeForm, category: v })}>
                <SelectTrigger className="input"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {feeStructures.map((fee) => (
                    <SelectItem key={fee.id} value={fee.category}>{fee.category} - ₹{fee.totalFee.toLocaleString()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {(activeService === 'tc' || activeService === 'noc') && (
          <p className="text-gray-600">
            Click submit to request your {getServiceName(activeService || '')}. The academic section will process your request.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowServiceDialog(false)}>Cancel</Button>
          <Button onClick={handleServiceRequest} disabled={isLoading} className="btn btn--primary">
            {isLoading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Request Detail Modal
  const RequestDetailModal = () => (
    <Dialog open={!!requestDetailDialog} onOpenChange={() => setRequestDetailDialog(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Details</DialogTitle>
          <DialogDescription>View and manage this service request</DialogDescription>
        </DialogHeader>

        {requestDetailDialog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-500">Student Name</Label>
                <p className="font-medium">{requestDetailDialog.studentName}</p>
              </div>
              <div>
                <Label className="text-gray-500">Email</Label>
                <p className="font-medium">{requestDetailDialog.studentEmail}</p>
              </div>
              <div>
                <Label className="text-gray-500">Roll No</Label>
                <p className="font-medium">{requestDetailDialog.rollNo || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-gray-500">Department</Label>
                <p className="font-medium">{requestDetailDialog.department || 'N/A'}</p>
              </div>
            </div>
            <Separator />
            <div>
              <Label className="text-gray-500">Service Type</Label>
              <p className="font-medium">{getServiceName(requestDetailDialog.serviceType)}</p>
            </div>
            {requestDetailDialog.details && Object.keys(requestDetailDialog.details).length > 0 && (
              <div>
                <Label className="text-gray-500">Details</Label>
                <Card className="mt-2 bg-gray-50">
                  <CardContent className="py-3">
                    {Object.entries(requestDetailDialog.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key.replace(/_/g, ' ')}</span>
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
            <Button variant="outline" onClick={() => handleDownloadPDF(requestDetailDialog)}>
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </Button>
          )}
          {requestDetailDialog?.status === 'pending' && (
            <>
              <Button variant="outline" className="text-red-600" onClick={() => handleUpdateRequest(requestDetailDialog.id, 'rejected')}>
                <XCircle className="w-4 h-4 mr-2" /> Reject
              </Button>
              <Button className="btn btn--green" onClick={() => handleUpdateRequest(requestDetailDialog.id, 'approved')}>
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
