'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ShieldCheckIcon, 
  MapPinIcon, 
  UserCheckIcon, 
  ClockIcon,
  LogInIcon,
  UserPlusIcon,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'admin') {
        router.push('/admin-dashboard');
      } else {
        router.push('/user-dashboard');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Permit Management
              <span className="block text-blue-600">Made Simple</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Streamline your work permit process with real-time location tracking, 
              automated approvals, and comprehensive dashboard management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  <UserPlusIcon className="mr-2 h-5 w-5" />
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <LogInIcon className="mr-2 h-5 w-5" />
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Permit Management
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to manage permits efficiently and securely
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Secure Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  JWT-based secure authentication with role-based access control for users and administrators.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <MapPinIcon className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Real-time Location</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Track user locations in real-time with optional location sharing controls and map integration.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <UserCheckIcon className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Smart Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Streamlined approval workflow with admin dashboard for reviewing and managing permit requests.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <ClockIcon className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Real-time Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get instant notifications on permit status changes and real-time tracking capabilities.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple steps to get your permits approved quickly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Submit Request</h3>
              <p className="text-gray-600">
                Fill out the permit form with your work details and location information.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Admin Review</h3>
              <p className="text-gray-600">
                Administrators review your request and can view your location for safety verification.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Approved</h3>
              <p className="text-gray-600">
                Receive instant notifications when your permit is approved and start your work safely.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who trust our platform for their permit management needs.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary">
              <UserPlusIcon className="mr-2 h-5 w-5" />
              Create Your Account
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Permit Management System. All rights reserved.</p>
          <p className="text-gray-400 mt-2">
            Built with Next.js, MongoDB, and modern web technologies.
          </p>
        </div>
      </footer>
    </div>
  );
}
