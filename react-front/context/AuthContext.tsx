import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface User {
  id: number;
  gmail: string;
  nome: string;
  matricula?: string;
  curso?: string;
  telefone?: string;
  ativo?: boolean;
  roles?: string[]; // ['ADMIN', 'PROFESSOR', 'ACADEMICO']
  criadoEm?: string;
  atualizadoEm?: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAdmin: () => boolean;
  hasRole: (role: string) => boolean;
  revalidateUser: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

import { API_BASE_URL } from '@/env';
const STORAGE_KEYS = {
  user: '@LabPage:user',
  token: '@LabPage:token',
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    initializeAuthState();
  }, []);

  async function initializeAuthState() {
    try {
      const [storedUser, storedToken] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.user),
        AsyncStorage.getItem(STORAGE_KEYS.token),
      ]);

      console.log("storedToken", storedToken);
      if (storedToken) {
        setToken(storedToken);
        // Tenta restaurar o usuário salvo; se não houver, busca do backend
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          await fetchAndPersistCurrentUser(storedToken);
        }
      } else if (storedUser) {

        // Consistência: se houver usuário sem token, limpa
        await AsyncStorage.removeItem(STORAGE_KEYS.user);
      }
    } catch (error) {
      console.error('Erro ao inicializar autenticação:', error);
    } finally {
      setLoading(false);
    }
  }

  async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      ...options,
    });

    const contentType = response.headers.get('content-type') || '';
    const rawBody = await response.text(); // lê UMA única vez

    if (!response.ok) {
      let message = `Erro HTTP ${response.status}`;
      if (rawBody) {
        if (contentType.includes('application/json')) {
          try {
            const data = JSON.parse(rawBody);
            message = data?.error || data?.message || message;
          } catch {
            message = rawBody;
          }
        } else {
          message = rawBody;
        }
      }
      // Normaliza mensagens por endpoint/status
      if (response.status === 400) {
        if (path.includes('/api/auth/login')) {
          message = 'Credenciais inválidas';
        } else if (path.includes('/api/auth/register')) {
          if (/gmail.+cadastrado/i.test(message) || /email.+cadastrado/i.test(message)) {
            message = 'E-mail já cadastrado';
          } else if (/must be a well-formed email address/i.test(message)) {
            message = 'E-mail inválido';
          } else {
            message = 'Dados inválidos';
          }
        }
      }
      throw new Error(message);
    }

    if (contentType.includes('application/json')) {
      return JSON.parse(rawBody) as T;
    }
    // @ts-expect-error: caller deve saber o tipo esperado
    return rawBody;
  }

  async function fetchAndPersistCurrentUser(activeToken: string) {
    // /api/users/me agora retorna o objeto User completo
    const userData = await request<User>('/api/users/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${activeToken}` },
    });
    console.log("userData", userData);
    await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userData));
    setUser(userData);
  }

  async function signIn(email: string, password: string) {
    if (!email || !password) {
      throw new Error('E-mail e senha são obrigatórios');
    }
    // Login
    try {
    const data = await request<{ token: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ gmail: email, senha: password }),
      }
    );
    console.log("data", data);
    const receivedToken = data.token;
    if (!receivedToken) {
      throw new Error('Token não retornado pela API');
    }
    await AsyncStorage.setItem(STORAGE_KEYS.token, receivedToken);
      setToken(receivedToken);

      await fetchAndPersistCurrentUser(receivedToken);
    } catch (error) {
      throw error;
    }
  }

  async function signUp(name: string, email: string, password: string) {
    if (!name || !email || !password) {
      throw new Error('Todos os campos são obrigatórios');
    }
    // Registro (não autenticamos automaticamente para manter UX atual)
    await request<{ token: string }>(
      // Observação: documentação tinha um typo em "aurth/registe". Usando /api/auth/register.
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({
          gmail: email,
          nome: name,
          senha: password,
          // Demais campos são opcionais e omitidos por ora
        }),
      }
    );
  }

  async function signOut() {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.user),
        AsyncStorage.removeItem(STORAGE_KEYS.token),
      ]);
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  async function resetPassword(email: string) {
    if (!email) {
      throw new Error('E-mail é obrigatório');
    }
    await request<unknown>(
      '/api/auth/forgot-password',
      {
        method: 'POST',
        body: JSON.stringify({ gmail: email })
      }
    );
  }

  function isAdmin(): boolean {
    console.log("isAdmin", user);
    return user?.roles?.includes('ADMIN') ?? false;
  }

  function hasRole(role: string): boolean {
    return user?.roles?.includes(role) ?? false;
  }

  async function revalidateUser(): Promise<boolean> {
    try {
      if (!token) {
        console.log('❌ Revalidação falhou: Sem token');
        return false;
      }

      console.log('🔄 Revalidando usuário...');
      
      const userData = await request<User>('/api/users/me', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('✅ Usuário revalidado:', userData);
      
      // Atualiza os dados do usuário no estado e storage
      await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userData));
      setUser(userData);
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao revalidar usuário:', error);
      // Se falhar na revalidação, limpa tudo por segurança
      await signOut();
      return false;
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      isAdmin,
      hasRole,
      revalidateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}