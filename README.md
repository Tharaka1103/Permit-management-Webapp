# Permit Management System

A comprehensive permit management system with real-time location tracking, JWT authentication, and admin dashboard. Built with Next.js, MongoDB Atlas, and modern web technologies.

## 🚀 Features

- **Secure Authentication**: JWT-based authentication with role-based access control
- **Real-time Location Tracking**: Track user locations with optional sharing controls
- **Permit Management**: Complete permit request and approval workflow
- **Admin Dashboard**: Comprehensive dashboard for managing permits and monitoring users
- **User Dashboard**: User-friendly interface for submitting and tracking permits
- **Location Controls**: Users can enable/disable location sharing
- **Admin Management**: Complete CRUD operations for administrator accounts
- **Permit Deletion**: Admins can delete permit submissions with confirmation
- **Toast Notifications**: Modern toast notification system for all user interactions
- **Mobile Responsive**: Fully responsive design for all devices
- **Modern UI**: Built with Tailwind CSS and Radix UI components

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Lucide React Icons
- **Maps**: OpenStreetMap integration
- **State Management**: React Context API

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB instance)
- Git installed

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd permit-management-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB Atlas Connection String
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/permit-management?retryWrites=true&w=majority
   
   # JWT Secret Key (generate a secure random string)
   JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production
   
   # Next.js Environment
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=another-super-secure-secret-for-nextauth
   ```

4. **MongoDB Atlas Setup**
   
   - Create a MongoDB Atlas account at [mongodb.com](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster
   - Create a database user with read/write access
   - Whitelist your IP address (or use 0.0.0.0/0 for development)
   - Get your connection string and update the `MONGODB_URI` in `.env.local`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 👥 User Roles & Default Accounts

The system supports two types of users:

### User Account
- Can submit permit requests
- Can view their own permits
- Can control location sharing preferences
- Can track permit approval status

### Admin Account
- Can view all permit requests
- Can approve/reject permits
- Can view user locations (if sharing is enabled)
- Can monitor system activity

To create accounts, use the registration page and select the appropriate role.

## 🗺️ API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Permits
- `GET /api/permits` - Get permits (filtered by role)
- `POST /api/permits` - Create new permit
- `GET /api/permits/[id]` - Get specific permit
- `PUT /api/permits/[id]` - Update permit (admin only)

### Location
- `POST /api/location/update` - Update user location
- `POST /api/location/toggle` - Toggle location sharing

### Users
- `GET /api/users` - Get users with location data (admin only)

## 📱 How to Use

### For Users:
1. **Register**: Create an account with "User" role
2. **Login**: Sign in to access your dashboard
3. **Enable Location**: Toggle location sharing in your dashboard
4. **Submit Permit**: Click "New Permit" and fill out the form
5. **Track Status**: Monitor your permit status in the dashboard

### For Admins:
1. **Register**: Create an account with "Admin" role
2. **Login**: Access the admin dashboard
3. **Review Permits**: View all submitted permits
4. **Check Locations**: View user locations on map
5. **Approve/Reject**: Review and update permit status

## 🚀 Production Deployment

### Environment Variables for Production:
```env
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-nextauth-secret
```

### Deployment Options:
- **Vercel**: Recommended for Next.js apps
- **Netlify**: Alternative deployment platform
- **AWS/Azure/GCP**: For custom server deployments

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- API route protection
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## 🛡️ Best Practices

- Always use HTTPS in production
- Regularly rotate JWT secrets
- Monitor database access logs
- Implement rate limiting for APIs
- Keep dependencies updated
- Use strong password policies

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "user" | "admin",
  isLocationSharingEnabled: Boolean,
  lastLocation: {
    latitude: Number,
    longitude: Number,
    address: String,
    updatedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Permits Collection
```javascript
{
  _id: ObjectId,
  userId: String (reference to User),
  woNumber: String,
  wpNumber: String (unique),
  name: String,
  designation: String,
  plant: String,
  workNature: String,
  estimatedDays: Number,
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  status: "pending" | "approved" | "rejected",
  adminComments: String,
  approvedBy: String,
  approvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📈 Future Enhancements

- Push notifications for permit updates
- Email notifications
- Advanced reporting and analytics
- File attachments for permits
- Integration with external mapping services
- Mobile app version
- Audit logging
- Advanced user management
```
