'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  GraduationCap, Users, BookOpen, Home, Info, LogIn, LogOut,
  Upload, FileText, CreditCard, FileCheck, FileX, Clock,
  CheckCircle2, XCircle, Building2, UserCircle, Mail, Hash,
  ChevronRight, Shield, Award, Briefcase, Send, Eye, Settings,
  BarChart3, PieChart, TrendingUp, Calendar, Bell, Menu, X, Download
} from 'lucide-react'

// Lottie animation URLs
const LOTTIE_URLS = {
  education: 'https://assets3.lottiefiles.com/packages/lf20_4DLPwR.json',
  success: 'https://assets3.lottiefiles.com/packages/lf20_jbrw3hcz.json',
  loading: 'https://assets2.lottiefiles.com/packages/lf20_szlepvdh.json'
}

// Dynamic Lottie component
const LottieAnimation = ({ url, className = '' }) => {
  const [Lottie, setLottie] = useState(null)
  const [animationData, setAnimationData] = useState(null)

  useEffect(() => {
    import('lottie-react').then(mod => setLottie(() => mod.default))
    fetch(url)
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(() => {})
  }, [url])

  if (!Lottie || !animationData) {
    return <div className={`${className} bg-gradient-to-br from-blue-100 to-purple-100 rounded-full animate-pulse`} />
  }

  return <Lottie animationData={animationData} loop className={className} />
}

// PDF Generator function
const generatePDF = async (request, feeStructures = []) => {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  
  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })

  if (request.serviceType === 'bonafide') {
    // Bonafide Certificate
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('BONAFIDE CERTIFICATE', 105, 30, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    
    // Institute Header
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('EduPortal Institute of Technology', 105, 50, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('(Affiliated to State University)', 105, 57, { align: 'center' })
    doc.text('123 Education Lane, Knowledge City - 500001', 105, 63, { align: 'center' })
    
    doc.line(20, 70, 190, 70)
    
    doc.setFontSize(11)
    doc.text(`Ref No: BON/${request.id?.substring(0, 8).toUpperCase()}`, 20, 85)
    doc.text(`Date: ${today}`, 150, 85)
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('TO WHOM IT MAY CONCERN', 105, 105, { align: 'center' })
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    
    const content = `This is to certify that ${request.studentName || 'the student'} bearing Roll No. ${request.rollNo || 'N/A'} is a bonafide student of this institution, currently enrolled in the Department of ${request.department || 'N/A'}.

The student's email ID registered with us is: ${request.studentEmail || 'N/A'}

Purpose: ${request.details?.purpose || 'General Purpose'}

This certificate is issued upon the request of the student for the purpose mentioned above.`

    const splitContent = doc.splitTextToSize(content, 170)
    doc.text(splitContent, 20, 125)
    
    doc.setFontSize(11)
    doc.text('This certificate is valid for a period of 6 months from the date of issue.', 20, 185)
    
    doc.setFont('helvetica', 'bold')
    doc.text('Academic Section', 150, 220)
    doc.text('EduPortal Institute', 150, 227)
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.text('Note: This is a computer generated certificate.', 105, 270, { align: 'center' })
    
  } else if (request.serviceType === 'fee') {
    // Fee Structure
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('FEE STRUCTURE', 105, 30, { align: 'center' })
    
    // Institute Header
    doc.setFontSize(16)
    doc.text('EduPortal Institute of Technology', 105, 50, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Academic Year 2025-26', 105, 57, { align: 'center' })
    
    doc.line(20, 65, 190, 65)
    
    doc.setFontSize(11)
    doc.text(`Date: ${today}`, 150, 80)
    doc.text(`Student: ${request.studentName || 'N/A'}`, 20, 80)
    doc.text(`Roll No: ${request.rollNo || 'N/A'}`, 20, 87)
    doc.text(`Department: ${request.department || 'N/A'}`, 20, 94)
    doc.text(`Category: ${request.details?.category || 'General'}`, 20, 101)
    doc.text(`Payment Mode: ${request.details?.paymentMode?.replace('_', ' ').toUpperCase() || 'N/A'}`, 20, 108)
    
    doc.line(20, 115, 190, 115)
    
    // Fee Table
    const selectedFee = feeStructures.find(f => f.category === request.details?.category) || {
      tuitionFee: 50000,
      examFee: 5000,
      libraryFee: 2000,
      totalFee: 57000
    }
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Fee Breakdown', 105, 130, { align: 'center' })
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    
    // Table headers
    doc.setFillColor(240, 240, 240)
    doc.rect(30, 140, 150, 10, 'F')
    doc.setFont('helvetica', 'bold')
    doc.text('Particulars', 35, 147)
    doc.text('Amount (INR)', 145, 147)
    
    doc.setFont('helvetica', 'normal')
    doc.text('Tuition Fee', 35, 160)
    doc.text(`₹ ${selectedFee.tuitionFee?.toLocaleString()}`, 145, 160)
    
    doc.text('Examination Fee', 35, 172)
    doc.text(`₹ ${selectedFee.examFee?.toLocaleString()}`, 145, 172)
    
    doc.text('Library Fee', 35, 184)
    doc.text(`₹ ${selectedFee.libraryFee?.toLocaleString()}`, 145, 184)
    
    doc.line(30, 192, 180, 192)
    
    doc.setFont('helvetica', 'bold')
    doc.text('Total Fee', 35, 202)
    doc.text(`₹ ${selectedFee.totalFee?.toLocaleString()}`, 145, 202)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('* Fee is subject to change as per institute policy.', 30, 230)
    doc.text('* Late fee of ₹500 will be charged after due date.', 30, 238)
    
    doc.setFont('helvetica', 'bold')
    doc.text('Accounts Section', 150, 260)
    doc.text('EduPortal Institute', 150, 267)
    
  } else if (request.serviceType === 'tc') {
    // Transfer Certificate
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('TRANSFER CERTIFICATE', 105, 30, { align: 'center' })
    
    doc.setFontSize(16)
    doc.text('EduPortal Institute of Technology', 105, 50, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('123 Education Lane, Knowledge City - 500001', 105, 57, { align: 'center' })
    
    doc.line(20, 65, 190, 65)
    
    doc.setFontSize(11)
    doc.text(`TC No: TC/${request.id?.substring(0, 8).toUpperCase()}`, 20, 80)
    doc.text(`Date: ${today}`, 150, 80)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Student Details:', 20, 100)
    
    doc.setFont('helvetica', 'normal')
    doc.text(`Name: ${request.studentName || 'N/A'}`, 30, 115)
    doc.text(`Roll No: ${request.rollNo || 'N/A'}`, 30, 125)
    doc.text(`Department: ${request.department || 'N/A'}`, 30, 135)
    doc.text(`Email: ${request.studentEmail || 'N/A'}`, 30, 145)
    
    doc.text('Conduct: Good', 30, 160)
    doc.text('Dues: Cleared', 30, 170)
    doc.text('Remarks: None', 30, 180)
    
    const tcContent = `This is to certify that the above-named student was enrolled at this institution and is now being transferred at their own request. All dues have been cleared and no objection is raised for the transfer.`
    
    const splitTC = doc.splitTextToSize(tcContent, 170)
    doc.text(splitTC, 20, 200)
    
    doc.setFont('helvetica', 'bold')
    doc.text('Principal', 150, 250)
    doc.text('EduPortal Institute', 150, 257)
    
  } else if (request.serviceType === 'noc') {
    // NOC
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('NO OBJECTION CERTIFICATE', 105, 30, { align: 'center' })
    
    doc.setFontSize(16)
    doc.text('EduPortal Institute of Technology', 105, 50, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('123 Education Lane, Knowledge City - 500001', 105, 57, { align: 'center' })
    
    doc.line(20, 65, 190, 65)
    
    doc.setFontSize(11)
    doc.text(`Ref No: NOC/${request.id?.substring(0, 8).toUpperCase()}`, 20, 80)
    doc.text(`Date: ${today}`, 150, 80)
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('TO WHOM IT MAY CONCERN', 105, 100, { align: 'center' })
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    
    const nocContent = `This is to certify that we have no objection to ${request.studentName || 'the student'}, Roll No. ${request.rollNo || 'N/A'}, Department of ${request.department || 'N/A'}, participating in external activities, internships, competitions, or any other academic/professional engagements.

The student is in good academic standing and has fulfilled all requirements as per institute regulations.

This NOC is issued upon the request of the student.`
    
    const splitNOC = doc.splitTextToSize(nocContent, 170)
    doc.text(splitNOC, 20, 120)
    
    doc.text('This certificate is valid for a period of 3 months from the date of issue.', 20, 190)
    
    doc.setFont('helvetica', 'bold')
    doc.text('HOD / Dean', 150, 230)
    doc.text('EduPortal Institute', 150, 237)
  }
  
  // Save the PDF
  const filename = `${request.serviceType}_${request.studentName?.replace(/\s+/g, '_') || 'certificate'}_${request.id?.substring(0, 8)}.pdf`
  doc.save(filename)
  
  return filename
}

export default function App() {
  // Auth state
  const [user, setUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('home')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [loginForm, setLoginForm] = useState({ userId: '', password: '', name: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Data state
  const [students, setStudents] = useState([])
  const [requests, setRequests] = useState([])
  const [stats, setStats] = useState(null)
  const [services, setServices] = useState([])
  const [feeStructures, setFeeStructures] = useState([])

  // Form states
  const [csvContent, setCsvContent] = useState('')
  const [bonafideForm, setBonafideForm] = useState({ purpose: '' })
  const [feeForm, setFeeForm] = useState({ paymentMode: '', category: '' })
  const [showServiceDialog, setShowServiceDialog] = useState(false)
  const [activeService, setActiveService] = useState(null)
  const [requestDetailDialog, setRequestDetailDialog] = useState(null)
  
  // Profile edit state
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    guardianName: '',
    guardianPhone: '',
    bloodGroup: ''
  })
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  // Load data based on user role
  useEffect(() => {
    if (user?.role === 'academic') {
      fetchStudents()
      fetchRequests()
      fetchStats()
      fetchServices()
      fetchFeeStructures()
    } else if (user?.role === 'student') {
      fetchMyRequests()
      fetchFeeStructures()
      // Initialize profile form with user data
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth || '',
        guardianName: user.guardianName || '',
        guardianPhone: user.guardianPhone || '',
        bloodGroup: user.bloodGroup || ''
      })
    }
  }, [user])

  // API calls
  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students')
      const data = await res.json()
      setStudents(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests')
      const data = await res.json()
      setRequests(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching requests:', error)
    }
  }

  const fetchMyRequests = async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/requests?studentId=${user.id}`)
      const data = await res.json()
      setRequests(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching requests:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services')
      const data = await res.json()
      setServices(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const fetchFeeStructures = async () => {
    try {
      const res = await fetch('/api/fee-structures')
      const data = await res.json()
      setFeeStructures(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching fee structures:', error)
    }
  }

  // Login handler
  const handleLogin = async (e) => {
    if (e) e.preventDefault()
    
    if (!loginForm.userId || !loginForm.password) {
      toast.error('Please fill all required fields')
      return
    }

    setIsLoading(true)
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
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Login failed')
        setIsLoading(false)
        return
      }

      setUser(data.user)
      setShowLoginModal(false)
      setSelectedRole(null)
      setLoginForm({ userId: '', password: '', name: '' })
      setCurrentPage(selectedRole === 'student' ? 'student-home' : 'dashboard')
      toast.success(`Welcome, ${data.user.name}!`)
    } catch (error) {
      toast.error('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Logout handler
  const handleLogout = () => {
    setUser(null)
    setCurrentPage('home')
    setStudents([])
    setRequests([])
    setStats(null)
    toast.success('Logged out successfully')
  }

  // CSV Upload handler
  const handleCSVUpload = async () => {
    if (!csvContent.trim()) {
      toast.error('Please paste CSV content')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/students/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: csvContent })
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Upload failed')
        return
      }

      toast.success(data.message)
      setCsvContent('')
      fetchStudents()
      fetchStats()
    } catch (error) {
      toast.error('Upload failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Service request handler
  const handleServiceRequest = async () => {
    if (!user || !activeService) return

    let details = {}
    if (activeService === 'bonafide') {
      if (!bonafideForm.purpose.trim()) {
        toast.error('Please enter the purpose')
        return
      }
      details = { purpose: bonafideForm.purpose }
    } else if (activeService === 'fee') {
      if (!feeForm.paymentMode || !feeForm.category) {
        toast.error('Please select payment mode and category')
        return
      }
      details = { paymentMode: feeForm.paymentMode, category: feeForm.category }
    }

    setIsLoading(true)
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
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Request failed')
        return
      }

      toast.success('Request submitted successfully!')
      setShowServiceDialog(false)
      setActiveService(null)
      setBonafideForm({ purpose: '' })
      setFeeForm({ paymentMode: '', category: '' })
      fetchMyRequests()
    } catch (error) {
      toast.error('Request failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Update request status (Academic)
  const handleUpdateRequest = async (requestId, status) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Update failed')
        return
      }

      toast.success(`Request ${status}!`)
      setRequestDetailDialog(null)
      fetchRequests()
      fetchStats()
    } catch (error) {
      toast.error('Update failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Download PDF handler
  const handleDownloadPDF = async (request) => {
    try {
      toast.info('Generating PDF...')
      const filename = await generatePDF(request, feeStructures)
      toast.success(`Downloaded: ${filename}`)
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF')
    }
  }

  // Update student profile
  const handleUpdateProfile = async () => {
    if (!user?.id) return
    
    setIsLoading(true)
    try {
      const res = await fetch(`/api/students/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Update failed')
        return
      }

      // Update user state with new data
      setUser({ ...user, ...data, role: 'student' })
      setIsEditingProfile(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Update failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Get service display name
  const getServiceName = (type) => {
    switch (type) {
      case 'bonafide': return 'Bonafide Certificate'
      case 'fee': return 'Fee Structure'
      case 'tc': return 'Transfer Certificate'
      case 'noc': return 'NOC'
      default: return type
    }
  }

  // Close login modal handler
  const handleCloseLoginModal = () => {
    setShowLoginModal(false)
    setSelectedRole(null)
    setLoginForm({ userId: '', password: '', name: '' })
  }

  // ============ RENDER COMPONENTS ============

  // Header
  const Header = () => (
    <header className="sticky top-0 z-50 w-full glass-effect border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage(user ? (user.role === 'student' ? 'student-home' : 'dashboard') : 'home')}>
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
              EduPortal
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {!user ? (
              <>
                <Button variant="ghost" onClick={() => setCurrentPage('home')} className={currentPage === 'home' ? 'bg-blue-50 text-blue-600' : ''}>
                  <Home className="w-4 h-4 mr-2" /> Home
                </Button>
                <Button variant="ghost" onClick={() => setCurrentPage('about')} className={currentPage === 'about' ? 'bg-blue-50 text-blue-600' : ''}>
                  <Info className="w-4 h-4 mr-2" /> About
                </Button>
                <Button variant="ghost" onClick={() => setCurrentPage('courses')} className={currentPage === 'courses' ? 'bg-blue-50 text-blue-600' : ''}>
                  <BookOpen className="w-4 h-4 mr-2" /> Courses
                </Button>
              </>
            ) : user.role === 'student' ? (
              <>
                <Button variant="ghost" onClick={() => setCurrentPage('student-home')} className={currentPage === 'student-home' ? 'bg-blue-50 text-blue-600' : ''}>
                  <Home className="w-4 h-4 mr-2" /> Home
                </Button>
                <Button variant="ghost" onClick={() => setCurrentPage('student-profile')} className={currentPage === 'student-profile' ? 'bg-blue-50 text-blue-600' : ''}>
                  <UserCircle className="w-4 h-4 mr-2" /> Profile
                </Button>
                <Button variant="ghost" onClick={() => setCurrentPage('student-services')} className={currentPage === 'student-services' ? 'bg-blue-50 text-blue-600' : ''}>
                  <FileText className="w-4 h-4 mr-2" /> Services
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setCurrentPage('dashboard')} className={currentPage === 'dashboard' ? 'bg-blue-50 text-blue-600' : ''}>
                  <BarChart3 className="w-4 h-4 mr-2" /> Dashboard
                </Button>
                <Button variant="ghost" onClick={() => setCurrentPage('students')} className={currentPage === 'students' ? 'bg-blue-50 text-blue-600' : ''}>
                  <Users className="w-4 h-4 mr-2" /> Students
                </Button>
                <Button variant="ghost" onClick={() => setCurrentPage('requests')} className={currentPage === 'requests' ? 'bg-blue-50 text-blue-600' : ''}>
                  <FileCheck className="w-4 h-4 mr-2" /> Requests
                </Button>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border">
                  <UserCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-sm">{user.name}</span>
                  <Badge variant="outline" className="text-xs">{user.role}</Badge>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
              </div>
            ) : (
              <Button onClick={() => setShowLoginModal(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <LogIn className="w-4 h-4 mr-2" /> Login
              </Button>
            )}
            
            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-1">
              {!user ? (
                <>
                  <Button variant="ghost" onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false) }} className="justify-start">
                    <Home className="w-4 h-4 mr-2" /> Home
                  </Button>
                  <Button variant="ghost" onClick={() => { setCurrentPage('about'); setMobileMenuOpen(false) }} className="justify-start">
                    <Info className="w-4 h-4 mr-2" /> About
                  </Button>
                  <Button variant="ghost" onClick={() => { setCurrentPage('courses'); setMobileMenuOpen(false) }} className="justify-start">
                    <BookOpen className="w-4 h-4 mr-2" /> Courses
                  </Button>
                </>
              ) : user.role === 'student' ? (
                <>
                  <Button variant="ghost" onClick={() => { setCurrentPage('student-home'); setMobileMenuOpen(false) }} className="justify-start">
                    <Home className="w-4 h-4 mr-2" /> Home
                  </Button>
                  <Button variant="ghost" onClick={() => { setCurrentPage('student-department'); setMobileMenuOpen(false) }} className="justify-start">
                    <Building2 className="w-4 h-4 mr-2" /> Department
                  </Button>
                  <Button variant="ghost" onClick={() => { setCurrentPage('student-services'); setMobileMenuOpen(false) }} className="justify-start">
                    <FileText className="w-4 h-4 mr-2" /> Services
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => { setCurrentPage('dashboard'); setMobileMenuOpen(false) }} className="justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" /> Dashboard
                  </Button>
                  <Button variant="ghost" onClick={() => { setCurrentPage('students'); setMobileMenuOpen(false) }} className="justify-start">
                    <Users className="w-4 h-4 mr-2" /> Students
                  </Button>
                  <Button variant="ghost" onClick={() => { setCurrentPage('requests'); setMobileMenuOpen(false) }} className="justify-start">
                    <FileCheck className="w-4 h-4 mr-2" /> Requests
                  </Button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )

  // Public Home Page
  const PublicHome = () => (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjAyIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjLTIgMC00IDItNCAycy0yIDItMiA0IDIgNCAyIDQgMiAyIDQgMmMyIDAgNC0yIDQtMnMyLTIgMi00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="mb-4 px-4 py-1 bg-blue-100 text-blue-700 hover:bg-blue-100">
                🎓 Welcome to EduPortal
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Your Gateway to
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Academic Excellence
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                Streamline your academic journey with our comprehensive institute service portal. 
                Access certificates, manage documents, and stay connected with your institution.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Button size="lg" onClick={() => setShowLoginModal(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                  Get Started <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => setCurrentPage('about')}>
                  Learn More
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-80 h-80 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 blur-3xl animate-pulse" />
                <LottieAnimation url={LOTTIE_URLS.education} className="w-full h-full relative z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your academic requirements in one place
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FileCheck, title: 'Bonafide Certificate', desc: 'Get your bonafide certificate for various purposes', color: 'blue' },
              { icon: CreditCard, title: 'Fee Structure', desc: 'View and download fee details for your category', color: 'purple' },
              { icon: FileText, title: 'Transfer Certificate', desc: 'Apply for TC when transferring institutions', color: 'pink' },
              { icon: Shield, title: 'NOC', desc: 'Request No Objection Certificate easily', color: 'green' }
            ].map((feature, idx) => (
              <Card key={idx} className="card-hover border-0 shadow-lg">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-${feature.color}-100 flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10K+', label: 'Students' },
              { value: '500+', label: 'Faculty' },
              { value: '50+', label: 'Courses' },
              { value: '95%', label: 'Satisfaction' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6" />
              <span className="font-bold">EduPortal</span>
            </div>
            <p className="text-gray-400 text-sm">© 2025 EduPortal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )

  // About Page
  const AboutPage = () => (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4">About Us</Badge>
            <h1 className="text-4xl font-bold mb-4">About Our Institution</h1>
            <p className="text-muted-foreground">
              Excellence in education since 1990
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="card-hover">
              <CardHeader>
                <Award className="w-10 h-10 text-blue-600 mb-2" />
                <CardTitle>Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To be a globally recognized institution of higher learning, fostering innovation, 
                  research, and ethical leadership for the betterment of society.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <Briefcase className="w-10 h-10 text-purple-600 mb-2" />
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
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
  )

  // Courses Page
  const CoursesPage = () => (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4">Programs</Badge>
          <h1 className="text-4xl font-bold mb-4">Our Courses</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
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
            <Card key={idx} className="card-hover">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant="outline">{course.type}</Badge>
                  <span className="text-sm text-muted-foreground">{course.duration}</span>
                </div>
                <CardTitle className="mt-2">{course.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
  )

  // Academic Dashboard
  const AcademicDashboard = () => (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Academic Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-100">Total Students</CardDescription>
              <CardTitle className="text-3xl">{stats?.totalStudents || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <Users className="w-8 h-8 opacity-50" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-purple-100">Total Requests</CardDescription>
              <CardTitle className="text-3xl">{stats?.totalRequests || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <FileText className="w-8 h-8 opacity-50" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-yellow-100">Pending</CardDescription>
              <CardTitle className="text-3xl">{stats?.pendingRequests || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <Clock className="w-8 h-8 opacity-50" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-green-100">Approved</CardDescription>
              <CardTitle className="text-3xl">{stats?.approvedRequests || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <CheckCircle2 className="w-8 h-8 opacity-50" />
            </CardContent>
          </Card>
        </div>

        {/* Recent Requests */}
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
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No requests yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.slice(0, 5).map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <UserCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{req.studentName}</p>
                        <p className="text-sm text-muted-foreground">{getServiceName(req.serviceType)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(req.status)}
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
  )

  // Students Management Page
  const StudentsPage = () => (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Students Management</h1>
          <p className="text-muted-foreground">Upload and manage student data</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* CSV Upload */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" /> Upload Students
              </CardTitle>
              <CardDescription>
                Paste CSV content with columns: Name, Email, Roll No, Department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Name,Email,Roll No,Department
John Doe,john@example.com,CS001,Computer Science
Jane Smith,jane@example.com,CS002,Computer Science"
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </CardContent>
            <CardFooter>
              <Button onClick={handleCSVUpload} disabled={isLoading} className="w-full">
                {isLoading ? 'Uploading...' : 'Upload Students'}
              </Button>
            </CardFooter>
          </Card>

          {/* Students List */}
          <Card className="lg:col-span-2">
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
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No students uploaded yet</p>
                  <p className="text-sm">Upload a CSV file to add students</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Roll No</TableHead>
                        <TableHead>Department</TableHead>
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
  )

  // Requests Management Page
  const RequestsPage = () => (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Service Requests</h1>
          <p className="text-muted-foreground">Manage student service requests</p>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({requests.filter(r => r.status === 'pending').length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({requests.filter(r => r.status === 'approved').length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({requests.filter(r => r.status === 'rejected').length})</TabsTrigger>
          </TabsList>

          {['all', 'pending', 'approved', 'rejected'].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <Card>
                <CardContent className="p-0">
                  {requests.filter(r => tab === 'all' || r.status === tab).length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No {tab !== 'all' ? tab : ''} requests</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[500px]">
                      <Table>
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
                                    <p className="text-sm text-muted-foreground">{req.studentEmail}</p>
                                  </div>
                                </TableCell>
                                <TableCell>{getServiceName(req.serviceType)}</TableCell>
                                <TableCell>{req.department}</TableCell>
                                <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>{getStatusBadge(req.status)}</TableCell>
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
  )

  // Student Home
  const StudentHome = () => (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}!</h1>
          <p className="text-muted-foreground">Access your academic services and track your requests</p>
        </div>

        {/* Student Info Card */}
        <Card className="mb-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
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

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: FileCheck, title: 'Bonafide Certificate', service: 'bonafide', color: 'blue' },
            { icon: CreditCard, title: 'Fee Structure', service: 'fee', color: 'purple' },
            { icon: FileText, title: 'Transfer Certificate', service: 'tc', color: 'pink' },
            { icon: Shield, title: 'NOC', service: 'noc', color: 'green' }
          ].map((item, idx) => (
            <Card key={idx} className="card-hover cursor-pointer" onClick={() => { setActiveService(item.service); setShowServiceDialog(true) }}>
              <CardHeader className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-${item.color}-400 to-${item.color}-600 flex items-center justify-center mb-4 shadow-lg`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardFooter className="justify-center">
                <Button variant="outline" size="sm">Request</Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* My Requests */}
        <Card>
          <CardHeader>
            <CardTitle>My Requests</CardTitle>
            <CardDescription>Track the status of your service requests</CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No requests yet</p>
                <p className="text-sm">Click on a service above to make a request</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium">{getServiceName(req.serviceType)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(req.createdAt).toLocaleDateString()} - {new Date(req.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(req.status)}
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
  )

  // Student Department Page
  const StudentDepartment = () => (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Department Information</h1>
          <p className="text-muted-foreground">View details about your department</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">{user?.department || 'Your Department'}</CardTitle>
                <CardDescription>Department of Engineering & Technology</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Department Head</h3>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
                  <UserCircle className="w-12 h-12 text-gray-400" />
                  <div>
                    <p className="font-medium">Dr. John Smith</p>
                    <p className="text-sm text-muted-foreground">HOD, Professor</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="space-y-2 p-4 rounded-lg bg-gray-50">
                  <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> dept@institute.edu</p>
                  <p className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Block A, Room 101</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: 'Mid-term Exams Schedule', date: '2025-06-15', desc: 'Mid-term examinations will begin from June 20th' },
                { title: 'Project Submission Deadline', date: '2025-06-10', desc: 'Final year projects must be submitted by June 25th' },
                { title: 'Workshop on AI/ML', date: '2025-06-05', desc: 'A 3-day workshop on AI/ML will be conducted next week' }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{item.title}</h4>
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // Student Services Page
  const StudentServices = () => (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Student Services</h1>
          <p className="text-muted-foreground">Request certificates and documents</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {[
            { 
              icon: FileCheck, 
              title: 'Bonafide Certificate', 
              desc: 'Request a bonafide certificate for bank loans, visa applications, etc.',
              service: 'bonafide',
              color: 'from-blue-400 to-blue-600'
            },
            { 
              icon: CreditCard, 
              title: 'Fee Structure', 
              desc: 'Get detailed fee structure based on your category and payment mode.',
              service: 'fee',
              color: 'from-purple-400 to-purple-600'
            },
            { 
              icon: FileText, 
              title: 'Transfer Certificate', 
              desc: 'Apply for TC when transferring to another institution.',
              service: 'tc',
              color: 'from-pink-400 to-pink-600'
            },
            { 
              icon: Shield, 
              title: 'No Objection Certificate', 
              desc: 'Request NOC for internships, competitions, or other activities.',
              service: 'noc',
              color: 'from-green-400 to-green-600'
            }
          ].map((item, idx) => (
            <Card key={idx} className="card-hover">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg mb-1">{item.title}</CardTitle>
                    <CardDescription>{item.desc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => { setActiveService(item.service); setShowServiceDialog(true) }}
                >
                  <Send className="w-4 h-4 mr-2" /> Request Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Request History */}
        <Card>
          <CardHeader>
            <CardTitle>Request History</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No requests submitted yet</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
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
                        <TableCell className="text-sm text-muted-foreground">
                          {req.details?.purpose || req.details?.category || '-'}
                        </TableCell>
                        <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
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
  )

  // Login Modal - Fixed version
  const LoginModal = () => (
    <Dialog open={showLoginModal} onOpenChange={(open) => {
      if (!open) {
        handleCloseLoginModal()
      }
    }}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Login to EduPortal</DialogTitle>
          <DialogDescription>
            {selectedRole ? `Login as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}` : 'Select your role to continue'}
          </DialogDescription>
        </DialogHeader>

        {!selectedRole ? (
          <div className="grid gap-4 py-4">
            {[
              { role: 'student', icon: GraduationCap, title: 'Student', desc: 'Access your academic services', color: 'blue' },
              { role: 'faculty', icon: Briefcase, title: 'Faculty', desc: 'Manage your courses and students', color: 'purple' },
              { role: 'academic', icon: Shield, title: 'Academic (Admin)', desc: 'Manage institute services', color: 'green' }
            ].map((item) => (
              <Card 
                key={item.role} 
                className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
                onClick={() => setSelectedRole(item.role)}
              >
                <CardHeader className="flex-row items-center gap-4 py-4">
                  <div className={`w-12 h-12 rounded-xl bg-${item.color}-100 flex items-center justify-center`}>
                    <item.icon className={`w-6 h-6 text-${item.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription>{item.desc}</CardDescription>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <form onSubmit={handleLogin} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="userId">
                {selectedRole === 'student' ? 'Email ID' : 'User ID'}
              </Label>
              <Input
                id="userId"
                type={selectedRole === 'student' ? 'email' : 'text'}
                placeholder={selectedRole === 'student' ? 'your.email@example.com' : 'Enter your user ID'}
                value={loginForm.userId}
                onChange={(e) => setLoginForm({ ...loginForm, userId: e.target.value })}
                autoComplete="username"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder={selectedRole === 'student' ? 'student@123' : 'Enter your password'}
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                autoComplete="current-password"
              />
              {selectedRole === 'student' && (
                <p className="text-xs text-muted-foreground">Default password: student@123</p>
              )}
            </div>
            {selectedRole !== 'student' && (
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={loginForm.name}
                  onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })}
                  autoComplete="name"
                />
              </div>
            )}
            
            <DialogFooter className="gap-2 sm:gap-0 pt-4">
              <Button type="button" variant="outline" onClick={() => setSelectedRole(null)}>
                Back
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </DialogFooter>
          </form>
        )}

        {!selectedRole && (
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseLoginModal}>
              Cancel
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )

  // Service Request Dialog
  const ServiceDialog = () => (
    <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{getServiceName(activeService)} Request</DialogTitle>
          <DialogDescription>
            Fill in the details to submit your request
          </DialogDescription>
        </DialogHeader>

        {activeService === 'bonafide' && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="purpose">Purpose of Bonafide</Label>
              <Textarea
                id="purpose"
                placeholder="E.g., Bank loan application, Visa application, etc."
                value={bonafideForm.purpose}
                onChange={(e) => setBonafideForm({ purpose: e.target.value })}
              />
            </div>
          </div>
        )}

        {activeService === 'fee' && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Payment Mode</Label>
              <Select value={feeForm.paymentMode} onValueChange={(v) => setFeeForm({ ...feeForm, paymentMode: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="pms">PMS</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={feeForm.category} onValueChange={(v) => setFeeForm({ ...feeForm, category: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your category" />
                </SelectTrigger>
                <SelectContent>
                  {feeStructures.map((fee) => (
                    <SelectItem key={fee.id} value={fee.category}>
                      {fee.category} - ₹{fee.totalFee?.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {feeForm.category && (
              <Card className="bg-blue-50">
                <CardContent className="py-4">
                  {feeStructures.filter(f => f.category === feeForm.category).map((fee) => (
                    <div key={fee.id} className="space-y-2 text-sm">
                      <div className="flex justify-between"><span>Tuition Fee</span><span>₹{fee.tuitionFee?.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>Exam Fee</span><span>₹{fee.examFee?.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>Library Fee</span><span>₹{fee.libraryFee?.toLocaleString()}</span></div>
                      <Separator />
                      <div className="flex justify-between font-semibold"><span>Total</span><span>₹{fee.totalFee?.toLocaleString()}</span></div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {(activeService === 'tc' || activeService === 'noc') && (
          <div className="py-4">
            <p className="text-muted-foreground">
              Your request for {getServiceName(activeService)} will be sent to the Academic section for processing.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => { setShowServiceDialog(false); setActiveService(null) }}>
            Cancel
          </Button>
          <Button onClick={handleServiceRequest} disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // Request Detail Dialog (for Academic)
  const RequestDetailModal = () => (
    <Dialog open={!!requestDetailDialog} onOpenChange={() => setRequestDetailDialog(null)}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Request Details</DialogTitle>
        </DialogHeader>
        {requestDetailDialog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Student Name</Label>
                <p className="font-medium">{requestDetailDialog.studentName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium">{requestDetailDialog.studentEmail}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Roll No</Label>
                <p className="font-medium">{requestDetailDialog.rollNo || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Department</Label>
                <p className="font-medium">{requestDetailDialog.department || 'N/A'}</p>
              </div>
            </div>
            <Separator />
            <div>
              <Label className="text-muted-foreground">Service Type</Label>
              <p className="font-medium">{getServiceName(requestDetailDialog.serviceType)}</p>
            </div>
            {requestDetailDialog.details && Object.keys(requestDetailDialog.details).length > 0 && (
              <div>
                <Label className="text-muted-foreground">Details</Label>
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
              <Label className="text-muted-foreground">Status:</Label>
              {getStatusBadge(requestDetailDialog.status)}
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
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateRequest(requestDetailDialog.id, 'approved')}>
                <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Page Content */}
      {!user && currentPage === 'home' && <PublicHome />}
      {!user && currentPage === 'about' && <AboutPage />}
      {!user && currentPage === 'courses' && <CoursesPage />}
      
      {user?.role === 'academic' && currentPage === 'dashboard' && <AcademicDashboard />}
      {user?.role === 'academic' && currentPage === 'students' && <StudentsPage />}
      {user?.role === 'academic' && currentPage === 'requests' && <RequestsPage />}
      
      {user?.role === 'faculty' && currentPage === 'dashboard' && <AcademicDashboard />}
      
      {user?.role === 'student' && currentPage === 'student-home' && <StudentHome />}
      {user?.role === 'student' && currentPage === 'student-department' && <StudentDepartment />}
      {user?.role === 'student' && currentPage === 'student-services' && <StudentServices />}

      {/* Modals */}
      <LoginModal />
      <ServiceDialog />
      <RequestDetailModal />
    </div>
  )
}
