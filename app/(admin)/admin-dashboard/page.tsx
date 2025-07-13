'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  FileTextIcon, 
  MapPinIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  AlertCircleIcon,
  LogOutIcon,
  UsersIcon,
  EyeIcon,
  Loader2,
  CheckIcon,
  XIcon,
  MessageSquareIcon,
  SettingsIcon,
  TrashIcon
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import LocationMap from '@/components/LocationMap';
import AdminManagement from '@/components/admin/AdminManagement';

interface Permit {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    isLocationSharingEnabled: boolean;
    lastLocation?: {
      latitude: number;
      longitude: number;
      address: string;
      updatedAt: string;
    };
  };
  woNumber: string;
  wpNumber: string;
  name: string;
  designation: string;
  plant: string;
  workNature: string;
  estimatedDays: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  adminComments?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  isLocationSharingEnabled: boolean;
  lastLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    updatedAt: string;
  };
}

export default function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const { success, error: showError } = useToast();
  const router = useRouter();
  const [permits, setPermits] = useState<Permit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [adminComments, setAdminComments] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permitToDelete, setPermitToDelete] = useState<Permit | null>(null);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [userLocationDialogOpen, setUserLocationDialogOpen] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
      return;
    }

    if (user.role !== 'admin') {
      router.push('/user-dashboard');
      return;
    }

    fetchPermits();
    fetchUsers();
  }, [user, token, router]);

  const fetchPermits = async () => {
    try {
      const response = await fetch('/api/permits', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        setPermits(data.permits);
      } else {
        console.error('Failed to fetch permits');
      }
    } catch (error) {
      console.error('Error fetching permits:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users?withLocation=true', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const updatePermitStatus = async (permitId: string, status: 'approved' | 'rejected') => {
    setUpdating(true);
    
    try {
      const response = await fetch(`/api/permits/${permitId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          adminComments,
        }),
      });

      if (response.ok) {
        await fetchPermits();
        setSelectedPermit(null);
        setAdminComments('');
        success(`Permit ${status} successfully`);
      } else {
        const data = await response.json();
        showError(data.error || 'Failed to update permit');
      }
    } catch (error) {
      console.error('Error updating permit:', error);
      showError('Network error. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const deletePermit = async (permitId: string) => {
    setDeleting(true);
    
    try {
      const response = await fetch(`/api/permits/${permitId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchPermits();
        setDeleteDialogOpen(false);
        setPermitToDelete(null);
        success('Permit deleted successfully');
      } else {
        const data = await response.json();
        showError(data.error || 'Failed to delete permit');
      }
    } catch (error) {
      console.error('Error deleting permit:', error);
      showError('Network error. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (permit: Permit) => {
    setPermitToDelete(permit);
    setDeleteDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircleIcon className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-700 bg-green-100';
      case 'rejected':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-yellow-700 bg-yellow-100';
    }
  };

  const viewLocation = (permit: Permit) => {
    setSelectedPermit(permit);
    setLocationDialogOpen(true);
  };

  const viewUserLocation = (user: User) => {
    setSelectedUser(user);
    setUserLocationDialogOpen(true);
  };

  const getUserInfo = (userId: any) => {
    return {
      name: userId?.name || 'Unknown User',
      email: userId?.email || 'Unknown Email'
    };
  };

  if (!user || !token) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage permits, users, and administrators
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
              className='bg-red-600 text-white'
                onClick={logout}
              >
                <LogOutIcon className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Permits</CardTitle>
              <FileTextIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{permits.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <ClockIcon className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {permits.filter(p => p.status === 'pending').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {permits.filter(p => p.status === 'approved').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UsersIcon className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.isLocationSharingEnabled).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="permits" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="permits" className="flex items-center">
              <FileTextIcon className="mr-2 h-4 w-4" />
              Permits
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center">
              <UsersIcon className="mr-2 h-4 w-4" />
              User Locations
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Admin Management
            </TabsTrigger>
          </TabsList>

          {/* Permits Tab */}
          <TabsContent value="permits">
            <Card>
              <CardHeader>
                <CardTitle>Permit Requests</CardTitle>
                <CardDescription>
                  Review and manage permit requests from users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading permits...</span>
                  </div>
                ) : permits.length === 0 ? (
                  <div className="text-center py-8">
                    <FileTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No permits found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No permit requests have been submitted yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {permits.map((permit) => (
                      <div
                        key={permit._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-lg">WP #{permit.wpNumber}</h3>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(permit.status)}`}>
                                {getStatusIcon(permit.status)}
                                <span className="ml-1 capitalize">{permit.status}</span>
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                              <div>
                                <p><span className="font-medium">Submitted by:</span> {getUserInfo(permit.userId).name}</p>
                                <p><span className="font-medium">Email:</span> {getUserInfo(permit.userId).email}</p>
                                <p><span className="font-medium">WO Number:</span> {permit.woNumber}</p>
                                <p><span className="font-medium">Designation:</span> {permit.designation}</p>
                              </div>
                              <div>
                                <p><span className="font-medium">Plant:</span> {permit.plant}</p>
                                <p><span className="font-medium">Estimated Days:</span> {permit.estimatedDays}</p>
                                <p><span className="font-medium">Submitted:</span> {formatDate(permit.createdAt)}</p>
                                <p><span className="font-medium">Location:</span> {permit.location.address}</p>
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <p className="text-sm font-medium">Work Nature:</p>
                              <p className="text-sm text-gray-600 mt-1">{permit.workNature}</p>
                            </div>

                            {permit.adminComments && (
                              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                                <p className="text-sm font-medium">Admin Comments:</p>
                                <p className="text-sm text-gray-600 mt-1">{permit.adminComments}</p>
                              </div>
                            )}

                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => viewLocation(permit)}
                              >
                                <MapPinIcon className="mr-1 h-4 w-4" />
                                View Location
                              </Button>
                              
                              {permit.status === 'pending' && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedPermit(permit);
                                        setAdminComments(permit.adminComments || '');
                                      }}
                                    >
                                      <MessageSquareIcon className="mr-1 h-4 w-4" />
                                      Review
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>Review Permit</DialogTitle>
                                      <DialogDescription>
                                        WP #{permit.wpNumber} - {permit.name}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <label className="text-sm font-medium">Admin Comments</label>
                                        <textarea
                                          className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                          rows={3}
                                          value={adminComments}
                                          onChange={(e) => setAdminComments(e.target.value)}
                                          placeholder="Add comments (optional)"
                                        />
                                      </div>
                                      
                                      <div className="flex space-x-2">
                                        <Button
                                          onClick={() => updatePermitStatus(permit._id, 'approved')}
                                          disabled={updating}
                                          className="flex-1"
                                        >
                                          {updating ? (
                                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                          ) : (
                                            <CheckIcon className="mr-1 h-4 w-4" />
                                          )}
                                          Approve
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={() => updatePermitStatus(permit._id, 'rejected')}
                                          disabled={updating}
                                          className="flex-1"
                                        >
                                          {updating ? (
                                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                          ) : (
                                            <XIcon className="mr-1 h-4 w-4" />
                                          )}
                                          Reject
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                              
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openDeleteDialog(permit)}
                              >
                                <TrashIcon className="mr-1 h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Locations Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Locations</CardTitle>
                <CardDescription>
                  View real-time and last known locations of users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <p className="text-gray-500">No users found</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.map((user) => (
                      <div
                        key={user._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{user.name}</h4>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${user.isLocationSharingEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <span className="text-xs text-gray-500">
                              {user.isLocationSharingEnabled ? 'Live' : 'Offline'}
                            </span>
                          </div>
                        </div>
                        
                        {user.lastLocation && (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Last Location:</span><br />
                              {user.lastLocation.address}
                            </p>
                            <p className="text-xs text-gray-500">
                              Updated: {formatDate(user.lastLocation.updatedAt)}
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewUserLocation(user)}
                              className="w-full"
                            >
                              <EyeIcon className="mr-1 h-4 w-4" />
                              View on Map
                            </Button>
                          </div>
                        )}
                        
                        {!user.lastLocation && (
                          <p className="text-sm text-gray-500">No location data available</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Management Tab */}
          <TabsContent value="admins">
            <AdminManagement />
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Permit Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Permit</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this permit? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {permitToDelete && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertCircleIcon className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Warning: Permanent Deletion
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        You are about to permanently delete permit{' '}
                        <strong>WP #{permitToDelete.wpNumber}</strong> submitted by{' '}
                        <strong>{getUserInfo(permitToDelete.userId).name}</strong>.
                      </p>
                      <p className="mt-1">This action cannot be undone.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="destructive"
                  onClick={() => deletePermit(permitToDelete._id)}
                  disabled={deleting}
                  className="flex-1"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="mr-2 h-4 w-4" />
                      Delete Permit
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={deleting}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Location Dialog */}
      <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Permit Location</DialogTitle>
            <DialogDescription>
              {selectedPermit && `WP #${selectedPermit.wpNumber} - ${selectedPermit.name}`}
            </DialogDescription>
          </DialogHeader>
          {selectedPermit && (
            <div className="space-y-4">
              <Alert>
                <MapPinIcon className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium">{selectedPermit.location.address}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Coordinates: {selectedPermit.location.latitude.toFixed(6)}, {selectedPermit.location.longitude.toFixed(6)}
                  </p>
                </AlertDescription>
              </Alert>
              
              <LocationMap
                latitude={selectedPermit.location.latitude}
                longitude={selectedPermit.location.longitude}
                height="400px"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Location Dialog */}
      <Dialog open={userLocationDialogOpen} onOpenChange={setUserLocationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Location</DialogTitle>
            <DialogDescription>
              {selectedUser && `${selectedUser.name} - ${selectedUser.email}`}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && selectedUser.lastLocation && (
            <div className="space-y-4">
              <Alert>
                <MapPinIcon className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedUser.lastLocation.address}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Updated: {formatDate(selectedUser.lastLocation.updatedAt)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Coordinates: {selectedUser.lastLocation.latitude.toFixed(6)}, {selectedUser.lastLocation.longitude.toFixed(6)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className={`w-3 h-3 rounded-full ${selectedUser.isLocationSharingEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-sm text-gray-500">
                        {selectedUser.isLocationSharingEnabled ? 'Live Tracking' : 'Last Known'}
                      </span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
              
              <LocationMap
                latitude={selectedUser.lastLocation.latitude}
                longitude={selectedUser.lastLocation.longitude}
                height="400px"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
