import { MongoClient, Db } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';

// MongoDB connection
let client: MongoClient | null = null;
let db: Db | null = null;

async function connectToMongo(): Promise<Db> {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL!);
    await client.connect();
    db = client.db(process.env.DB_NAME);
  }
  return db!;
}

// Helper function to handle CORS
function handleCORS(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// OPTIONS handler for CORS
export async function OPTIONS(): Promise<NextResponse> {
  return handleCORS(new NextResponse(null, { status: 200 }));
}

// Parse CSV string to array of objects
function parseCSV(csvString: string): Record<string, string>[] {
  const lines = csvString.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const data: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = values[index]?.trim() || '';
    });
    data.push(obj);
  }
  
  return data;
}

// Get service name for notifications
function getServiceName(type: string): string {
  switch (type) {
    case 'bonafide': return 'Bonafide Certificate';
    case 'fee': return 'Fee Structure';
    case 'tc': return 'Transfer Certificate';
    case 'noc': return 'NOC';
    default: return type;
  }
}

// Create notification helper
async function createNotification(
  db: Db,
  userId: string,
  title: string,
  message: string,
  type: 'success' | 'info' | 'warning' | 'error',
  relatedRequestId?: string
): Promise<void> {
  await db.collection('notifications').insertOne({
    id: uuidv4(),
    userId,
    title,
    message,
    type,
    read: false,
    relatedRequestId,
    createdAt: new Date()
  });
}

// Route handler function
async function handleRoute(
  request: NextRequest,
  { params }: { params: { path?: string[] } }
): Promise<NextResponse> {
  const { path = [] } = params;
  const route = `/${path.join('/')}`;
  const method = request.method;

  try {
    const db = await connectToMongo();

    // Root endpoint
    if ((route === '/' || route === '/root') && method === 'GET') {
      return handleCORS(NextResponse.json({ message: 'Institute Service Portal API' }));
    }

    // ============ AUTH ROUTES ============
    
    // Login - POST /api/auth/login
    if (route === '/auth/login' && method === 'POST') {
      const body = await request.json();
      const { userId, password, role, name } = body;
      
      if (!userId || !password || !role) {
        return handleCORS(NextResponse.json(
          { error: 'userId, password, and role are required' },
          { status: 400 }
        ));
      }

      // For Academic/Admin login
      if (role === 'academic') {
        let user = await db.collection('users').findOne({ userId, role: 'academic' });
        
        if (!user) {
          user = {
            id: uuidv4(),
            userId,
            name: name || 'Academic Admin',
            role: 'academic',
            password,
            createdAt: new Date()
          };
          await db.collection('users').insertOne(user);
        } else if (user.password !== password) {
          return handleCORS(NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
          ));
        }
        
        const { password: _, _id, ...userData } = user;
        return handleCORS(NextResponse.json({ user: userData, message: 'Login successful' }));
      }

      // For Faculty login
      if (role === 'faculty') {
        let user = await db.collection('users').findOne({ userId, role: 'faculty' });
        
        if (!user) {
          user = {
            id: uuidv4(),
            userId,
            name: name || 'Faculty Member',
            role: 'faculty',
            password,
            department: 'General',
            createdAt: new Date()
          };
          await db.collection('users').insertOne(user);
        } else if (user.password !== password) {
          return handleCORS(NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
          ));
        }
        
        const { password: _, _id, ...userData } = user;
        return handleCORS(NextResponse.json({ user: userData, message: 'Login successful' }));
      }

      // For Student login
      if (role === 'student') {
        const student = await db.collection('students').findOne({ email: userId });
        
        if (!student) {
          return handleCORS(NextResponse.json(
            { error: 'Student not found. Please contact Academic section.' },
            { status: 404 }
          ));
        }
        
        const studentPassword = student.password || 'student@123';
        if (password !== studentPassword) {
          return handleCORS(NextResponse.json(
            { error: 'Invalid password' },
            { status: 401 }
          ));
        }
        
        const { _id, password: _, ...studentData } = student;
        return handleCORS(NextResponse.json({ 
          user: { ...studentData, role: 'student' }, 
          message: 'Login successful' 
        }));
      }

      return handleCORS(NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      ));
    }

    // ============ STUDENT ROUTES ============
    
    // Upload students via CSV/Excel - POST /api/students/upload
    if (route === '/students/upload' && method === 'POST') {
      const body = await request.json();
      const { csvData, students: studentsList } = body;
      
      let studentsToInsert: any[] = [];

      // Handle direct student list (from Excel)
      if (studentsList && Array.isArray(studentsList)) {
        studentsToInsert = studentsList.map((s: any) => ({
          id: uuidv4(),
          name: s.name || '',
          email: s.email || '',
          rollNo: s.rollNo || '',
          department: s.department || '',
          password: 'student@123',
          createdAt: new Date()
        }));
      }
      // Handle CSV data
      else if (csvData) {
        const students = parseCSV(csvData);
        
        if (students.length === 0) {
          return handleCORS(NextResponse.json(
            { error: 'No valid data found' },
            { status: 400 }
          ));
        }

        studentsToInsert = students.map(s => ({
          id: uuidv4(),
          name: s.name || '',
          email: s.email || s.email_id || '',
          rollNo: s.roll_no || s.rollno || '',
          department: s.department || '',
          password: 'student@123',
          createdAt: new Date()
        }));
      } else {
        return handleCORS(NextResponse.json(
          { error: 'No data provided' },
          { status: 400 }
        ));
      }

      // Remove duplicates based on email using upsert
      let insertedCount = 0;
      for (const student of studentsToInsert) {
        if (student.email) {
          await db.collection('students').updateOne(
            { email: student.email },
            { $set: student },
            { upsert: true }
          );
          insertedCount++;
        }
      }

      return handleCORS(NextResponse.json({ 
        message: `${insertedCount} students uploaded successfully`,
        count: insertedCount
      }));
    }

    // Get all students - GET /api/students
    if (route === '/students' && method === 'GET') {
      const students = await db.collection('students').find({}).toArray();
      const cleanedStudents = students.map(({ _id, password, ...rest }) => rest);
      return handleCORS(NextResponse.json(cleanedStudents));
    }

    // Get single student by ID - GET /api/students/:id
    if (route.startsWith('/students/') && method === 'GET' && path.length === 2) {
      const studentId = path[1];
      const student = await db.collection('students').findOne({ id: studentId });
      
      if (!student) {
        return handleCORS(NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        ));
      }
      
      const { _id, password, ...cleanedStudent } = student;
      return handleCORS(NextResponse.json(cleanedStudent));
    }

    // Update student profile - PUT /api/students/:id
    if (route.startsWith('/students/') && method === 'PUT' && path.length === 2) {
      const studentId = path[1];
      const body = await request.json();
      const { name, phone, address, dateOfBirth, guardianName, guardianPhone, bloodGroup } = body;
      
      const updateData: Record<string, any> = {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(dateOfBirth && { dateOfBirth }),
        ...(guardianName && { guardianName }),
        ...(guardianPhone && { guardianPhone }),
        ...(bloodGroup && { bloodGroup }),
        updatedAt: new Date()
      };

      const result = await db.collection('students').findOneAndUpdate(
        { id: studentId },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      if (!result) {
        return handleCORS(NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        ));
      }

      const { _id, password: _, ...cleanedResult } = result;
      return handleCORS(NextResponse.json(cleanedResult));
    }

    // Delete student - DELETE /api/students/:id
    if (route.startsWith('/students/') && method === 'DELETE' && path.length === 2) {
      const studentId = path[1];
      
      const result = await db.collection('students').deleteOne({ id: studentId });
      
      if (result.deletedCount === 0) {
        return handleCORS(NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        ));
      }

      return handleCORS(NextResponse.json({ message: 'Student deleted successfully' }));
    }

    // ============ SERVICE REQUEST ROUTES ============
    
    // Create service request - POST /api/requests
    if (route === '/requests' && method === 'POST') {
      const body = await request.json();
      const { studentId, studentName, studentEmail, rollNo, department, serviceType, details } = body;
      
      if (!studentId || !serviceType) {
        return handleCORS(NextResponse.json(
          { error: 'studentId and serviceType are required' },
          { status: 400 }
        ));
      }

      const request_doc = {
        id: uuidv4(),
        studentId,
        studentName: studentName || '',
        studentEmail: studentEmail || '',
        rollNo: rollNo || '',
        department: department || '',
        serviceType,
        details: details || {},
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('service_requests').insertOne(request_doc);
      const { _id, ...cleanedRequest } = request_doc as any;
      return handleCORS(NextResponse.json(cleanedRequest));
    }

    // Get all requests - GET /api/requests
    if (route === '/requests' && method === 'GET') {
      const url = new URL(request.url);
      const studentId = url.searchParams.get('studentId');
      
      let query: Record<string, any> = {};
      if (studentId) {
        query.studentId = studentId;
      }
      
      const requests = await db.collection('service_requests')
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      
      const cleanedRequests = requests.map(({ _id, ...rest }) => rest);
      return handleCORS(NextResponse.json(cleanedRequests));
    }

    // Update request status - PUT /api/requests/:id
    if (route.startsWith('/requests/') && method === 'PUT') {
      const requestId = path[1];
      const body = await request.json();
      const { status, remarks } = body;
      
      if (!status) {
        return handleCORS(NextResponse.json(
          { error: 'status is required' },
          { status: 400 }
        ));
      }

      const updateData = {
        status,
        remarks: remarks || '',
        updatedAt: new Date()
      };

      const result = await db.collection('service_requests').findOneAndUpdate(
        { id: requestId },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      if (!result) {
        return handleCORS(NextResponse.json(
          { error: 'Request not found' },
          { status: 404 }
        ));
      }

      // Create notification for student when request is approved/rejected
      if (status === 'approved' || status === 'rejected') {
        const serviceName = getServiceName(result.serviceType);
        const notificationTitle = status === 'approved' 
          ? `${serviceName} Approved!` 
          : `${serviceName} Rejected`;
        const notificationMessage = status === 'approved'
          ? `Your ${serviceName} request has been approved. You can now download it from your dashboard.`
          : `Your ${serviceName} request has been rejected. ${remarks ? `Reason: ${remarks}` : 'Please contact the academic section for more details.'}`;
        
        await createNotification(
          db,
          result.studentId,
          notificationTitle,
          notificationMessage,
          status === 'approved' ? 'success' : 'error',
          requestId
        );
      }

      const { _id, ...cleanedResult } = result;
      return handleCORS(NextResponse.json(cleanedResult));
    }

    // ============ NOTIFICATION ROUTES ============
    
    // Get notifications for user - GET /api/notifications
    if (route === '/notifications' && method === 'GET') {
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');
      
      if (!userId) {
        return handleCORS(NextResponse.json(
          { error: 'userId is required' },
          { status: 400 }
        ));
      }
      
      const notifications = await db.collection('notifications')
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();
      
      const cleanedNotifications = notifications.map(({ _id, ...rest }) => rest);
      return handleCORS(NextResponse.json(cleanedNotifications));
    }

    // Mark notification as read - PUT /api/notifications/:id
    if (route.startsWith('/notifications/') && method === 'PUT') {
      const notificationId = path[1];
      
      await db.collection('notifications').updateOne(
        { id: notificationId },
        { $set: { read: true } }
      );

      return handleCORS(NextResponse.json({ message: 'Notification marked as read' }));
    }

    // Mark all notifications as read - PUT /api/notifications/mark-all-read
    if (route === '/notifications/mark-all-read' && method === 'PUT') {
      const body = await request.json();
      const { userId } = body;
      
      if (!userId) {
        return handleCORS(NextResponse.json(
          { error: 'userId is required' },
          { status: 400 }
        ));
      }

      await db.collection('notifications').updateMany(
        { userId, read: false },
        { $set: { read: true } }
      );

      return handleCORS(NextResponse.json({ message: 'All notifications marked as read' }));
    }

    // Get unread notification count - GET /api/notifications/unread-count
    if (route === '/notifications/unread-count' && method === 'GET') {
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');
      
      if (!userId) {
        return handleCORS(NextResponse.json(
          { error: 'userId is required' },
          { status: 400 }
        ));
      }
      
      const count = await db.collection('notifications').countDocuments({ 
        userId, 
        read: false 
      });
      
      return handleCORS(NextResponse.json({ count }));
    }

    // ============ SERVICES MANAGEMENT ============
    
    // Get services - GET /api/services
    if (route === '/services' && method === 'GET') {
      const services = await db.collection('services').find({}).toArray();
      
      if (services.length === 0) {
        const defaultServices = [
          { id: uuidv4(), name: 'Bonafide Certificate', enabled: true, description: 'Certificate for various purposes' },
          { id: uuidv4(), name: 'Fee Structure', enabled: true, description: 'Get fee details for your category' },
          { id: uuidv4(), name: 'Transfer Certificate', enabled: true, description: 'TC for institute transfer' },
          { id: uuidv4(), name: 'NOC', enabled: true, description: 'No Objection Certificate' }
        ];
        await db.collection('services').insertMany(defaultServices);
        return handleCORS(NextResponse.json(defaultServices));
      }
      
      const cleanedServices = services.map(({ _id, ...rest }) => rest);
      return handleCORS(NextResponse.json(cleanedServices));
    }

    // Update service - PUT /api/services/:id
    if (route.startsWith('/services/') && method === 'PUT') {
      const serviceId = path[1];
      const body = await request.json();
      
      const result = await db.collection('services').findOneAndUpdate(
        { id: serviceId },
        { $set: { ...body, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );

      if (!result) {
        return handleCORS(NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        ));
      }

      const { _id, ...cleanedResult } = result;
      return handleCORS(NextResponse.json(cleanedResult));
    }

    // ============ FEE STRUCTURE ============
    
    // Get fee structures - GET /api/fee-structures
    if (route === '/fee-structures' && method === 'GET') {
      const feeStructures = await db.collection('fee_structures').find({}).toArray();
      
      if (feeStructures.length === 0) {
        const defaultFees = [
          { id: uuidv4(), category: 'General', tuitionFee: 50000, examFee: 5000, libraryFee: 2000, totalFee: 57000 },
          { id: uuidv4(), category: 'OBC', tuitionFee: 40000, examFee: 4000, libraryFee: 1500, totalFee: 45500 },
          { id: uuidv4(), category: 'SC/ST', tuitionFee: 25000, examFee: 2500, libraryFee: 1000, totalFee: 28500 },
          { id: uuidv4(), category: 'EWS', tuitionFee: 30000, examFee: 3000, libraryFee: 1200, totalFee: 34200 }
        ];
        await db.collection('fee_structures').insertMany(defaultFees);
        return handleCORS(NextResponse.json(defaultFees));
      }
      
      const cleanedFees = feeStructures.map(({ _id, ...rest }) => rest);
      return handleCORS(NextResponse.json(cleanedFees));
    }

    // ============ STATS ============
    
    // Get dashboard stats - GET /api/stats
    if (route === '/stats' && method === 'GET') {
      const totalStudents = await db.collection('students').countDocuments();
      const totalRequests = await db.collection('service_requests').countDocuments();
      const pendingRequests = await db.collection('service_requests').countDocuments({ status: 'pending' });
      const approvedRequests = await db.collection('service_requests').countDocuments({ status: 'approved' });
      const rejectedRequests = await db.collection('service_requests').countDocuments({ status: 'rejected' });
      
      return handleCORS(NextResponse.json({
        totalStudents,
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests
      }));
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` },
      { status: 404 }
    ));

  } catch (error: any) {
    console.error('API Error:', error);
    return handleCORS(NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    ));
  }
}

// Export all HTTP methods
export const GET = handleRoute;
export const POST = handleRoute;
export const PUT = handleRoute;
export const DELETE = handleRoute;
export const PATCH = handleRoute;
