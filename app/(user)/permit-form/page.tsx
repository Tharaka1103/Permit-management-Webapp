'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPinIcon, SaveIcon, AlertCircleIcon, Loader2, Navigation } from 'lucide-react';
import LocationMap from '@/components/LocationMap';

export default function PermitForm() {
  const { user, token } = useAuth();
  const { success, error: showError } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
    address: string;
    loading: boolean;
    error: string | null;
  }>({
    latitude: null,
    longitude: null,
    address: '',
    loading: true,
    error: null
  });

  const [formData, setFormData] = useState({
    woNumber: '',
    wpNumber: Math.floor(1000 + Math.random() * 9000).toString(),
    name: user?.name || '',
    designation: '',
    plant: '',
    workNature: '',
    estimatedDays: '1'
  });

  // Get user's location when component mounts
  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          
          // Use reverse geocoding to get address (you can replace this with actual geocoding service)
          reverseGeocode(latitude, longitude);
          
          setLocation({
            latitude,
            longitude,
            address: 'Location detected',
            loading: false,
            error: null
          });
        },
        error => {
          console.error('Error getting location:', error);
          setLocation({
            latitude: null,
            longitude: null,
            address: '',
            loading: false,
            error: 'Unable to get your location. Please enable location services.'
          });
        }
      );
    } else {
      setLocation({
        latitude: null,
        longitude: null,
        address: '',
        loading: false,
        error: 'Geolocation is not supported by this browser.'
      });
    }
  }, [user, token, router]);

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      // You can replace this with actual geocoding service like Google Maps API
      // For now, we'll use a simple placeholder
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      const data = await response.json();
      
      setLocation(prev => ({
        ...prev,
        address: data.display_name || `${lat.toFixed(6)}, ${lon.toFixed(6)}`
      }));
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      setLocation(prev => ({
        ...prev,
        address: `${lat.toFixed(6)}, ${lon.toFixed(6)}`
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location.latitude || !location.longitude) {
      showError('Location is required. Please enable location services.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/permits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.address,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        success('Work permit request submitted successfully');
        router.push('/user-dashboard');
      } else {
        showError(data.error || 'Failed to submit permit request');
      }
    } catch (error) {
      console.error('Submit error:', error);
      showError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const retryLocation = () => {
    setLocation(prev => ({ ...prev, loading: true, error: null }));
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          reverseGeocode(latitude, longitude);
          
          setLocation({
            latitude,
            longitude,
            address: 'Location detected',
            loading: false,
            error: null
          });
        },
        error => {
          console.error('Error getting location:', error);
          setLocation({
            latitude: null,
            longitude: null,
            address: '',
            loading: false,
            error: 'Unable to get your location. Please enable location services.'
          });
        }
      );
    }
  };

  if (!user || !token) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            New Work Permit Request
          </h1>
          <p className="mt-2 text-gray-600">
            Fill out the form below to request a new work permit
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Permit Details</CardTitle>
            <CardDescription>
              Please provide accurate information for your work permit request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="woNumber" className="text-sm font-medium">
                    WO Number *
                  </label>
                  <Input
                    id="woNumber"
                    name="woNumber"
                    value={formData.woNumber}
                    onChange={handleChange}
                    required
                    placeholder="Enter work order number"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="wpNumber" className="text-sm font-medium">
                    WP Number
                  </label>
                  <Input
                    id="wpNumber"
                    name="wpNumber"
                    value={formData.wpNumber}
                    readOnly
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">Auto-generated</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="designation" className="text-sm font-medium">
                    Designation *
                  </label>
                  <Input
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    required
                    placeholder="E.g. Engineer, Technician"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="plant" className="text-sm font-medium">
                  Plant/Equipment which is safe to work *
                </label>
                <Input
                  id="plant"
                  name="plant"
                  value={formData.plant}
                  onChange={handleChange}
                  required
                  placeholder="Describe the plant or equipment"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="workNature" className="text-sm font-medium">
                  Nature of the work *
                </label>
                <textarea
                  id="workNature"
                  name="workNature"
                  rows={4}
                  value={formData.workNature}
                  onChange={handleChange}
                  required
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Describe the nature of work to be performed"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="estimatedDays" className="text-sm font-medium">
                  Estimated time required (days) *
                </label>
                <Input
                  id="estimatedDays"
                  name="estimatedDays"
                  type="number"
                  min="1"
                  value={formData.estimatedDays}
                  onChange={handleChange}
                  required
                  className="max-w-xs"
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium">
                  Your Location *
                </label>
                
                {location.loading ? (
                  <Card className="p-6">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600">
                        Detecting your location...
                      </span>
                    </div>
                  </Card>
                ) : location.error ? (
                  <Alert variant="destructive">
                    <AlertCircleIcon className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>{location.error}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={retryLocation}
                      >
                        <Navigation className="h-4 w-4 mr-1" />
                        Retry
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    <Alert>
                      <MapPinIcon className="h-4 w-4" />
                      <AlertDescription>
                        <div>
                          <p className="font-medium">Location detected successfully</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {location.address}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Coordinates: {location.latitude?.toFixed(6)}, {location.longitude?.toFixed(6)}
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>
                    
                    <LocationMap 
                      latitude={location.latitude || 0} 
                      longitude={location.longitude || 0} 
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/user-dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || location.loading || !!location.error}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="mr-2 h-4 w-4" />
                      Submit Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
