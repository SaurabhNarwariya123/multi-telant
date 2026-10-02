'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, clearToken, enterSupportMode, exitSupportMode, getSupportAgency, getToken } from '@/lib/api';
import { decodeToken, isExpired } from './decodeToken';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [support, setSupport] = useState(null);

  // Updates the context state as well as sessionStorage, so the workspace opens immediately without a reload.
  const startSupport = (agency, href = '/dashboard') => {
    enterSupportMode(agency);
    setSupport({ id: agency._id, name: agency.name });
    api(`/agencies/${agency._id}/support-session`, { method: 'POST' }).catch(() => {});
    router.push(href);
  };

  const leaveSupport = () => {
    exitSupportMode();
    setSupport(null);
    router.push('/dashboard/agencies');
  };

  const logout = () => {
    clearToken();
    exitSupportMode();
    router.push('/login');
  };

  useEffect(() => {
    setSupport(getSupportAgency());
    const token = getToken();
    const payload = token && decodeToken(token);

    if (!payload || isExpired(payload)) {
      clearToken();
      router.replace('/login');
      return;
    }

    if (payload.role) {
      setUser(payload);
      return;
    }

    api('/auth/me')
      .then(setUser)
      .catch(() => {
        clearToken();
        router.replace('/login');
      });
  }, [router]);

  // In support mode a super admin sees the agency workspace as an admin of that agency.
  const effectiveUser = user && support && user.role === 'superadmin' ? { ...user, role: 'admin', isSupport: true } : user;

  return (
    <UserContext.Provider value={{ user: effectiveUser, support: effectiveUser?.isSupport ? support : null, startSupport, leaveSupport, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useAuth = () => useContext(UserContext);

export const useUser = () => useContext(UserContext).user;
