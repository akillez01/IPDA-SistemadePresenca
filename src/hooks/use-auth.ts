'use client';

import { onAuthStateChange, signInAdmin, signOutAdmin } from '@/lib/auth';
import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((newUser) => {
      setUser(prevUser => {
        // Só atualizar se o usuário mudou
        if (prevUser?.uid !== newUser?.uid) {
          return newUser;
        }
        return prevUser;
      });
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await signInAdmin(email, password);
      if (result.success && result.user) {
        // Não setUser aqui - deixar o onAuthStateChange fazer isso
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Erro no hook de login' };
    }
  };

  const logout = async () => {
    const result = await signOutAdmin();
    if (result.success) {
      setUser(null);
    }
    return result;
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout
  };
}
