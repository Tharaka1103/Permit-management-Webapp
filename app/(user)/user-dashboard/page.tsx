'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  PlusIcon, 
  FileTextIcon, 
  MapPinIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  AlertCircleIcon,
  LogOutIcon,
  SettingsIcon,
  Loader2,
  Eye,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Permit {
  _id: string;
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

export default function UserDashboard() {
  const { user, token, logout, updateUser } = useAuth();
  const { success, error: showError } = useToast();
  const router = useRouter();
  const [permits, setPermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationSharing, setLocationSharing] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
      return;
    }

    if (user.role !== 'user') {
      router.push('/admin-dashboard');
      return;
    }

    setLocationSharing(user.isLocationSharingEnabled);
    fetchPermits();
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

  const toggleLocationSharing = async () => {
    setUpdatingLocation(true);
    
    try {
      const response = await fetch('/api/location/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          enabled: !locationSharing,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLocationSharing(data.isLocationSharingEnabled);
        updateUser({ isLocationSharingEnabled: data.isLocationSharingEnabled });
        
        if (data.isLocationSharingEnabled) {
          startLocationTracking();
        }
      } else {
        showError('Failed to update location sharing preference');
      }
    } catch (error) {
      console.error('Error toggling location sharing:', error);
      showError('Network error. Please try again.');
    } finally {
      setUpdatingLocation(false);
    }
  };

  const startLocationTracking = () => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            await fetch('/api/location/update', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                latitude,
                longitude,
                address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              }),
            });
          } catch (error) {
            console.error('Error updating location:', error);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 30000,
        }
      );

      // Store watchId to clear it when location sharing is disabled
      (window as any).locationWatchId = watchId;
    }
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
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, {user.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                className='bg-primary'
                onClick={() => router.push('/permit-form')}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                New Permit
              </Button>
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
        {/* Location Sharing Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPinIcon className="mr-2 h-5 w-5" />
              Location Sharing
            </CardTitle>
            <CardDescription>
              Control whether admins can see your real-time location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {locationSharing ? 'Location sharing is enabled' : 'Location sharing is disabled'}
                </p>
                <p className="text-sm text-gray-600">
                  {locationSharing 
                    ? 'Admins can see your current location in real-time'
                    : 'Admins can only see your last known location'
                  }
                </p>
              </div>
              <Button
                onClick={toggleLocationSharing}
                disabled={updatingLocation}
                variant={locationSharing ? "destructive" : "default"}
              >
                {updatingLocation ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : locationSharing ? (
                  <ToggleRight className="mr-2 h-4 w-4" />
                ) : (
                  <ToggleLeft className="mr-2 h-4 w-4" />
                )}
                {locationSharing ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <ClockIcon className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {permits.filter(p => p.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Permits List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Permit Requests</CardTitle>
            <CardDescription>
              View and manage your submitted permit requests
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
                  Get started by creating your first permit request.
                </p>
                <div className="mt-6">
                  <Button onClick={() => router.push('/permit-form')}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    New Permit Request
                  </Button>
                </div>
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p><span className="font-medium">WO Number:</span> {permit.woNumber}</p>
                            <p><span className="font-medium">Designation:</span> {permit.designation}</p>
                            <p><span className="font-medium">Plant:</span> {permit.plant}</p>
                          </div>
                          <div>
                            <p><span className="font-medium">Estimated Days:</span> {permit.estimatedDays}</p>
                            <p><span className="font-medium">Submitted:</span> {formatDate(permit.createdAt)}</p>
                            <p><span className="font-medium">Location:</span> {permit.location.address}</p>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-sm"><span className="font-medium">Work Nature:</span></p>
                          <p className="text-sm text-gray-600 mt-1">{permit.workNature}</p>
                        </div>

                        {permit.adminComments && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm font-medium">Admin Comments:</p>
                            <p className="text-sm text-gray-600 mt-1">{permit.adminComments}</p>
                          </div>
                        )}
                      </div>
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
}
