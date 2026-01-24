# 🎓 Institute Service Portal (EduPortal)

A complete web-based Institute Service Portal with role-based authentication for Admin/Academic, Faculty, and Students.

## 📋 Features

### 🌐 Public Website
- **Home Page** - Beautiful landing page with hero section, services overview, and statistics
- **About Page** - Institution information, vision, and mission
- **Courses Page** - Available programs and courses

### 🔐 Role-Based Authentication
- **Student** - Login with email (uploaded via CSV) and default password `student@123`
- **Faculty** - Login with custom credentials
- **Academic (Admin)** - Full administrative access

### 👨‍💼 Academic (Admin) Dashboard
- **Dashboard** - View statistics (total students, requests, pending/approved/rejected)
- **Student Management** - Upload students via CSV file
- **Request Management** - View, approve, or reject student service requests

### 👨‍🎓 Student Dashboard
- **Home** - Personal info card and quick access to services
- **Department** - Department information and announcements
- **Services** - Request certificates and documents:
  - Bonafide Certificate
  - Fee Structure
  - Transfer Certificate (TC)
  - NOC (No Objection Certificate)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Animations**: Lottie React
- **Icons**: Lucide React
- **Styling**: SCSS, Tailwind CSS

## 📁 Project Structure

```
/app
├── app/
│   ├── api/[[...path]]/route.js  # All API endpoints
│   ├── page.js                    # Main frontend (all pages)
│   ├── layout.js                  # Root layout
│   └── globals.css                # Global styles
├── components/ui/                 # shadcn/ui components
├── lib/                           # Utility functions
├── .env                           # Environment variables
├── package.json                   # Dependencies
└── tailwind.config.js             # Tailwind configuration
```

## 🚀 How to Run Locally (VS Code)

### Prerequisites
1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use MongoDB Atlas (cloud)
3. **Yarn** package manager - `npm install -g yarn`
4. **VS Code** - [Download](https://code.visualstudio.com/)

### Step 1: Clone/Download the Project
```bash
# If using git
git clone <your-repo-url>
cd app

# Or download and extract the ZIP file
```

### Step 2: Install Dependencies
```bash
# Open terminal in VS Code (Ctrl + `)
cd app
yarn install
```

### Step 3: Configure Environment Variables
Create or edit `.env` file in the root directory:

```env
# MongoDB Connection
MONGO_URL=mongodb://localhost:27017

# Database Name
DB_NAME=institute_portal

# Base URL (for local development)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# CORS Origins
CORS_ORIGINS=*
```

**For MongoDB Atlas (Cloud):**
```env
MONGO_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net
DB_NAME=institute_portal
```

### Step 4: Start MongoDB (Local)
```bash
# Windows
mongod

# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Step 5: Run the Development Server
```bash
yarn dev
```

### Step 6: Open in Browser
```
http://localhost:3000
```

## 📖 Usage Guide

### 1️⃣ Admin/Academic Login
1. Click **Login** button
2. Select **Academic (Admin)**
3. Enter any User ID, Password, and Name
4. Click **Login**

### 2️⃣ Upload Students (Admin)
1. Go to **Students** tab in Admin dashboard
2. Paste CSV data in the text area:
```csv
Name,Email,Roll No,Department
John Doe,john@example.com,CS001,Computer Science
Jane Smith,jane@example.com,CS002,Computer Science
Bob Wilson,bob@example.com,EC001,Electronics
```
3. Click **Upload Students**

### 3️⃣ Student Login
1. Click **Login** button
2. Select **Student**
3. Enter:
   - **Email ID**: Student's email (from CSV)
   - **Password**: `student@123` (default)
4. Click **Login**

### 4️⃣ Request a Service (Student)
1. Go to **Services** tab
2. Click on desired service (e.g., Bonafide Certificate)
3. Fill in the required details
4. Click **Submit Request**

### 5️⃣ Approve/Reject Requests (Admin)
1. Go to **Requests** tab in Admin dashboard
2. View all pending requests
3. Click ✅ to Approve or ❌ to Reject

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (all roles) |
| GET | `/api/students` | Get all students |
| POST | `/api/students/upload` | Upload students via CSV |
| GET | `/api/requests` | Get all service requests |
| POST | `/api/requests` | Create service request |
| PUT | `/api/requests/:id` | Update request status |
| GET | `/api/stats` | Get dashboard statistics |
| GET | `/api/fee-structures` | Get fee structures |
| GET | `/api/services` | Get available services |

## 🧪 Test the APIs (using curl)

```bash
# Login as Academic Admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userId":"admin@edu.com","password":"admin123","role":"academic","name":"Dr. Admin"}'

# Upload Students
curl -X POST http://localhost:3000/api/students/upload \
  -H "Content-Type: application/json" \
  -d '{"csvData":"Name,Email,Roll No,Department\nJohn Doe,john@test.com,CS001,Computer Science"}'

# Login as Student
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userId":"john@test.com","password":"student@123","role":"student"}'

# Get Stats
curl http://localhost:3000/api/stats
```

## 🎨 Customization

### Change Colors
Edit `app/globals.css` - modify the CSS variables in `:root`

### Add New Services
Edit `app/api/[[...path]]/route.js` - add to the default services array

### Modify Fee Structure
Edit the `defaultFees` array in the route.js file

## 📝 VS Code Extensions (Recommended)

- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- MongoDB for VS Code
- Thunder Client (API testing)

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or run on different port
yarn dev -p 3001
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules
rm yarn.lock
yarn install
```

## 📄 License

MIT License - Feel free to use for educational purposes.

## 🤝 Support

For any issues or questions, please create an issue in the repository.

---

**Built with ❤️ using Next.js, MongoDB, and shadcn/ui**
