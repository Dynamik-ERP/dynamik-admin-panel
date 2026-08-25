'use client';

import { useAuthGuard } from '@/lib/auth/use-auth-guard';
import { useStaff, useDeactivateUser, useActivateUser, useUpdateUser } from '@/lib/api/staff';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useConfirmDialog } from '@/components/shared/confirm-dialog';
import { useToast } from '@/components/shared/toast';
import { useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import cn from 'clsx';
import type { UserRole } from '@/lib/types/domain';

const AVAILABLE_ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'design', label: 'Design' },
  { value: 'operations', label: 'Operations' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'cutting', label: 'Cutting' },
  { value: 'cnc', label: 'CNC' },
  { value: 'edge_banding', label: 'Edge Banding' },
  { value: 'qc', label: 'Quality Control' },
];

export default function StaffListPage() {
  useAuthGuard(['admin']);
  const { data: staffData, isLoading, isFetching, isError, error, refetch } = useStaff();
  const isRefreshing = isLoading || isFetching;
  const updateMutation = useUpdateUser();
  const deactivateMutation = useDeactivateUser();
  const activateMutation = useActivateUser();
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();
  const { showToast } = useToast();
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editData, setEditData] = useState({ fullName: '', email: '', role: 'admin' as UserRole });

  // Exclude clients from staff management (clients have their own dedicated portal and tab)
  const staff = (Array.isArray(staffData) ? staffData : []).filter(
    (member: any) => member.role !== 'client'
  );

  const handleDeactivate = (userId: string, userName: string) => {
    confirm(
      {
        title: 'Deactivate User',
        message: `Are you sure you want to deactivate ${userName}? This will prevent them from accessing the system.`,
        confirmText: 'Deactivate',
        cancelText: 'Cancel',
      },
      () => {
        deactivateMutation.mutate(userId, {
          onSuccess: () => showToast('success', 'User deactivated successfully'),
          onError: () => showToast('error', 'Failed to deactivate user. Please try again.'),
        });
      }
    );
  };

  const handleActivate = (userId: string, userName: string) => {
    confirm(
      {
        title: 'Activate User',
        message: `Are you sure you want to activate ${userName}? This will restore their system access.`,
        confirmText: 'Activate',
        cancelText: 'Cancel',
      },
      () => {
        activateMutation.mutate(userId, {
          onSuccess: () => showToast('success', 'User activated successfully'),
          onError: () => showToast('error', 'Failed to activate user. Please try again.'),
        });
      }
    );
  };

  const handleEdit = (user: any) => {
    setEditingUser(user.id);
    setEditData({
      fullName: user.full_name || user.fullName || '',
      email: user.email || '',
      role: user.role || 'admin',
    });
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;
    updateMutation.mutate(
      {
        id: editingUser,
        data: {
          fullName: editData.fullName,
          email: editData.email,
          role: editData.role,
        },
      },
      {
        onSuccess: () => {
          setEditingUser(null);
          showToast('success', 'User updated successfully');
        },
        onError: () => {
          showToast('error', 'Failed to update user');
        },
      }
    );
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditData({ fullName: '', email: '', role: 'admin' });
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#12141C] border border-[#1F2330] rounded p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Staff Management</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">View and manage staff members and their roles</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                const res = await refetch();
                if (res.isSuccess) showToast('success', 'Staff list refreshed');
                else showToast('error', 'Failed to refresh staff');
              }}
              disabled={isRefreshing}
            >
              <RefreshCcw className={cn("w-3 h-3 mr-2", isRefreshing && "animate-spin")} />
              {isRefreshing ? "Syncing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]" />
            <p className="mt-2 text-sm text-gray-500">Loading staff...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-sm text-red-400">Error loading staff: {(error as any)?.message || 'Unknown error'}</p>
          </div>
        ) : staff.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No staff found</p>
          </div>
        ) : (
          <DataTable headers={['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions']}>
            {staff.map((member: any) => {
              const memberName = member.full_name || member.fullName || 'Unknown';
              const email = member.email || '—';
              const role = member.role || 'user';
              const isActive = member.isActive ?? (member.deleted_at === null && !member.locked_until);
              const joinedDate = member.created_at || member.createdAt;

              return (
                <tr key={member.id} className="hover:bg-[#161922]/50 text-gray-300 border-b border-[#1F2330]">
                  {editingUser === member.id ? (
                    <>
                      <td className="p-3">
                        <input
                          type="text"
                          value={editData.fullName}
                          onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                          className="px-2 py-1 border border-[#2B3143] rounded bg-[#0E1016] text-white text-xs focus:outline-none focus:border-[#FF6B00]"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="email"
                          value={editData.email}
                          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                          className="px-2 py-1 border border-[#2B3143] rounded bg-[#0E1016] text-white text-xs focus:outline-none focus:border-[#FF6B00]"
                        />
                      </td>
                      <td className="p-3">
                        <select
                          value={editData.role}
                          onChange={(e) => setEditData({ ...editData, role: e.target.value as UserRole })}
                          className="px-2 py-1 border border-[#2B3143] rounded bg-[#0E1016] text-white text-xs focus:outline-none focus:border-[#FF6B00]"
                        >
                          {AVAILABLE_ROLES.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <Badge variant={isActive ? 'success' : 'error'}>
                          {isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-3 text-gray-500 text-xs">
                        {joinedDate ? new Date(joinedDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button variant="success" size="sm" onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                            Save
                          </Button>
                          <Button variant="secondary" size="sm" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-3 font-sans text-white">{memberName}</td>
                      <td className="p-3 text-gray-400 text-xs">{email}</td>
                      <td className="p-3">
                        <Badge variant="info" className="capitalize">
                          {role}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={isActive ? 'success' : 'error'}>
                          {isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-3 text-gray-500 text-xs">
                        {joinedDate ? new Date(joinedDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(member)}>
                            Edit
                          </Button>
                          {isActive ? (
                            <Button variant="danger" size="sm" onClick={() => handleDeactivate(member.id, memberName)}>
                              Deactivate
                            </Button>
                          ) : (
                            <Button variant="success" size="sm" onClick={() => handleActivate(member.id, memberName)}>
                              Activate
                            </Button>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </DataTable>
        )}
      </div>
      <ConfirmDialogComponent />
    </div>
  );
}
