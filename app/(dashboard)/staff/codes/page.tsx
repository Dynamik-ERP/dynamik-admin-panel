'use client';

import { useAuthGuard } from '@/lib/auth/use-auth-guard';
import { useRegistrationCodes, useGenerateCode } from '@/lib/api/staff';
import { useState } from 'react';
import type { UserRole } from '@/lib/types/domain';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/shared/table';
import { Badge } from '@/components/shared/badge';
import { Card } from '@/components/shared/card';

const STAFF_ROLES: UserRole[] = [
  'admin', 'design', 'operations', 'warehouse', 'cutting', 'cnc', 'edge_banding', 'qc',
];

const CODE_STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
  active: { label: 'Active', variant: 'success' },
  used: { label: 'Used', variant: 'default' },
  revoked: { label: 'Revoked', variant: 'error' },
};

const getCodeStatusConfig = (status?: string) => {
  const safeStatus = status || 'active';
  return CODE_STATUS_CONFIG[safeStatus] ?? { label: safeStatus, variant: 'default' as const };
};

export default function RegistrationCodesPage() {
  useAuthGuard(['admin']);
  const { data: codes = [] } = useRegistrationCodes();
  const generate = useGenerateCode();
  const [role, setRole] = useState<UserRole>('operations');
  const [newCode, setNewCode] = useState<string | null>(null);

  const handleGenerateCode = () => {
    generate.mutate(role, {
      onSuccess: (code) => {
        setNewCode(code.code);
      },
    });
  };

  const handleCopyCode = () => {
    if (newCode) {
      navigator.clipboard.writeText(newCode);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Registration Codes</h1>
        <p className="mt-1 text-sm text-gray-500">Generate and manage staff registration codes</p>
      </div>

      {/* Generate Code Form */}
      <Card variant="bordered" className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate New Code</h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STAFF_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerateCode}
            disabled={generate.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            {generate.isPending ? 'Generating...' : 'Generate code'}
          </button>
        </div>

        {newCode && (
          <Card variant="bordered" className="mt-4 p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Generated Code:</p>
                <code className="text-lg font-mono text-gray-900">{newCode}</code>
                <p className="text-xs text-gray-500 mt-2">Single-use. Send this to the new hire out of band.</p>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                type="button"
              >
                Copy
              </button>
            </div>
          </Card>
        )}
      </Card>

      {/* Codes Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Code</TableHeader>
            <TableHeader>Role</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Issued</TableHeader>
            <TableHeader>Used by</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {codes.map((c) => {
            const status = getCodeStatusConfig(c.status);
            return (
              <TableRow key={c.id}>
                <TableCell>
                  <code className="text-sm font-mono">{c.code}</code>
                </TableCell>
                <TableCell className="capitalize">{c.role}</TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{c.usedBy ?? '-'}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
