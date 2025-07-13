'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  UserPlusIcon, 
  UsersIcon, 
  EyeIcon,
  PencilIcon,
  TrashIcon,
  Loader2,
  AlertCircleIcon,
  CheckIcon,
  XIcon
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Admin {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminManagement() {
  const { token } = useAuth();
  const { success, error: showError } = useToast();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admin/admins', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins);
      } else {
        showError('Failed to fetch admins');
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      showError('Network error while fetching admins');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();

      if (response.ok) {
        success('Admin created successfully');
        setCreateForm({ name: '', email: '', password: '' });
        setIsCreateDialogOpen(false);
        fetchAdmins();
      } else {
        showError(data.error || 'Failed to create admin');
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      showError('Network error. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;

    setFormSubmitting(true);

    try {
      const response = await fetch(`/api/admin/admins/${selectedAdmin._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (response.ok) {
        success('Admin updated successfully');
        setIsEditDialogOpen(false);
        setSelectedAdmin(null);
        fetchAdmins();
      } else {
        showError(data.error || 'Failed to update admin');
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      showError('Network error. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;

    setFormSubmitting(true);

    try {
      const response = await fetch(`/api/admin/admins/${selectedAdmin._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        success('Admin deleted successfully');
        setIsDeleteDialogOpen(false);
        setSelectedAdmin(null);
        fetchAdmins();
      } else {
        showError(data.error || 'Failed to delete admin');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      showError('Network error. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const openEditDialog = (admin: Admin) => {
    setSelectedAdmin(admin);
    setEditForm({
      name: admin.name,
      email: admin.email,
      password: ''
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsDeleteDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <UsersIcon className="mr-2 h-5 w-5" />
              Admin Management
            </CardTitle>
            <CardDescription>
              Manage administrator accounts and permissions
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlusIcon className="mr-2 h-4 w-4" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Administrator</DialogTitle>
                <DialogDescription>
                  Add a new administrator to the system
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="Enter full name"
                    required
                    disabled={formSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="Enter email address"
                    required
                    disabled={formSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="Enter password (min 6 characters)"
                    required
                    disabled={formSubmitting}
                    minLength={6}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={formSubmitting} className="flex-1">
                    {formSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="mr-2 h-4 w-4" />
                        Create Admin
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    disabled={formSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>


        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading administrators...</span>
          </div>
        ) : admins.length === 0 ? (
          <div className="text-center py-8">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No administrators found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create the first administrator account.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {admins.map((admin) => (
              <div
                key={admin._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-lg">{admin.name}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Administrator
                      </span>
                    </div>
                    <p className="text-gray-600">{admin.email}</p>
                    <p className="text-sm text-gray-500">
                      Created: {formatDate(admin.createdAt)}
                    </p>
                    {admin.updatedAt !== admin.createdAt && (
                      <p className="text-sm text-gray-500">
                        Updated: {formatDate(admin.updatedAt)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openViewDialog(admin)}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(admin)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openDeleteDialog(admin)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* View Admin Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Administrator Details</DialogTitle>
            <DialogDescription>
              View administrator information
            </DialogDescription>
          </DialogHeader>
          {selectedAdmin && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-lg font-semibold">{selectedAdmin.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email Address</label>
                <p className="text-lg">{selectedAdmin.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <p className="text-lg capitalize">{selectedAdmin.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="text-lg">{formatDate(selectedAdmin.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-lg">{formatDate(selectedAdmin.updatedAt)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Administrator</DialogTitle>
            <DialogDescription>
              Update administrator information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditAdmin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Enter full name"
                required
                disabled={formSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="Enter email address"
                required
                disabled={formSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                placeholder="Leave empty to keep current password"
                disabled={formSubmitting}
                minLength={6}
              />
              <p className="text-xs text-gray-500">
                Leave password field empty to keep the current password
              </p>
            </div>
            <div className="flex space-x-2">
              <Button type="submit" disabled={formSubmitting} className="flex-1">
                {formSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckIcon className="mr-2 h-4 w-4" />
                    Update Admin
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                disabled={formSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Admin Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Administrator</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this administrator? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedAdmin && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> You are about to delete the administrator account for{' '}
                  <strong>{selectedAdmin.name}</strong> ({selectedAdmin.email}). 
                  This action is permanent and cannot be undone.
                </AlertDescription>
              </Alert>
              <div className="flex space-x-2">
                <Button
                  variant="destructive"
                  onClick={handleDeleteAdmin}
                  disabled={formSubmitting}
                  className="flex-1"
                >
                  {formSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="mr-2 h-4 w-4" />
                      Delete Admin
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={formSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
