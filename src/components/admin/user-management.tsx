'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { isSuperUser } from '@/lib/auth';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import {
  Check,
  Edit,
  Eye,
  EyeOff,
  Info,
  MoreVertical,
  RefreshCw,
  Shield,
  Trash2,
  User,
  UserPlus,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface FirebaseUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  creationTime?: string;
  lastSignInTime?: string;
  disabled?: boolean;
  isFromFirestore?: boolean;
}

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastLoginAt?: string;
  active: boolean;
}

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<FirebaseUser[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingUser, setAddingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ displayName: '', role: 'user' as 'user' | 'admin' });
  
  // Form state
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'user' as 'user' | 'admin'
  });

  // Carregar usuários do Firestore
  const loadUserProfiles = async () => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      const profiles: UserProfile[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        profiles.push({
          uid: doc.id,
          email: data.email || '',
          displayName: data.displayName || data.nome || 'Usuário',
          role: data.role || 'user',
          createdAt: data.createdAt || new Date().toISOString(),
          lastLoginAt: data.lastLoginAt,
          active: data.active !== false
        });
      });
      
      setUserProfiles(profiles);
      return profiles;
    } catch (error) {
      console.error('Erro ao carregar perfis de usuários:', error);
      return [];
    }
  };

  // Carregar usuários do Firebase
  const loadUsers = async () => {
    setLoading(true);
    try {
      // Carregar perfis do Firestore
      const profiles = await loadUserProfiles();
      
      // Super usuários conhecidos (sempre incluídos)
      const knownSuperUsers: FirebaseUser[] = [
        {
          uid: 'super-admin-uid',
          email: 'admin@ipda.org.br',
          emailVerified: true,
          displayName: 'Administrador Principal',
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString()
        },
        {
          uid: 'super-marcio-uid', 
          email: 'marciodesk@ipda.app.br',
          emailVerified: true,
          displayName: 'Marcio - Admin Técnico',
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString()
        }
      ];
      
      // Converter perfis do Firestore para formato de usuário
      const firestoreUsers: FirebaseUser[] = profiles.map(profile => ({
        uid: profile.uid,
        email: profile.email,
        emailVerified: true,
        displayName: profile.displayName,
        creationTime: profile.createdAt,
        lastSignInTime: profile.lastLoginAt || undefined,
        isFromFirestore: true
      }));
      
      // Adicionar usuário atual se não estiver na lista
      const currentUserData: FirebaseUser[] = [];
      if (currentUser && !profiles.find(p => p.uid === currentUser.uid) && !isSuperUser(currentUser.email || '')) {
        currentUserData.push({
          uid: currentUser.uid,
          email: currentUser.email || '',
          emailVerified: currentUser.emailVerified,
          displayName: currentUser.displayName || 'Usuário Atual',
          creationTime: currentUser.metadata.creationTime || new Date().toISOString(),
          lastSignInTime: currentUser.metadata.lastSignInTime || new Date().toISOString()
        });
      }
      
      // Combinar todas as listas, removendo duplicatas
      const allUsers = [...knownSuperUsers, ...firestoreUsers, ...currentUserData];
      const uniqueUsers = allUsers.filter((user, index, arr) => 
        arr.findIndex(u => u.email === user.email) === index
      );
      
      setUsers(uniqueUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Adicionar novo usuário
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingUser(true);

    try {
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        newUserForm.email, 
        newUserForm.password
      );

      // Atualizar perfil no Auth se nome foi fornecido
      if (newUserForm.displayName) {
        await updateProfile(userCredential.user, {
          displayName: newUserForm.displayName
        });
      }

      // Criar perfil no Firestore
      const userProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || '',
        displayName: newUserForm.displayName || 'Usuário',
        role: newUserForm.role,
        createdAt: new Date().toISOString(),
        active: true
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);

      // Atualizar lista local
      const newUser: FirebaseUser = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || '',
        emailVerified: userCredential.user.emailVerified,
        displayName: newUserForm.displayName || 'Usuário',
        creationTime: new Date().toISOString(),
        isFromFirestore: true
      };

      setUsers(prev => [...prev, newUser]);

      // Limpar formulário
      setNewUserForm({
        email: '',
        password: '',
        displayName: '',
        role: 'user'
      });

      setIsDialogOpen(false);

      toast({
        title: "Sucesso!",
        description: `Usuário ${newUserForm.email} criado com sucesso.`,
        variant: "default"
      });

    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar usuário.",
        variant: "destructive"
      });
    } finally {
      setAddingUser(false);
    }
  };

  // Atualizar usuário
  const handleUpdateUser = async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        displayName: editForm.displayName,
        role: editForm.role,
        updatedAt: new Date().toISOString()
      });

      // Atualizar lista local
      setUsers(prev => prev.map(user => 
        user.uid === userId 
          ? { ...user, displayName: editForm.displayName }
          : user
      ));

      setEditingUserId(null);
      
      toast({
        title: "Sucesso!",
        description: "Usuário atualizado com sucesso.",
        variant: "default"
      });

    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar usuário.",
        variant: "destructive"
      });
    }
  };

  // Excluir usuário
  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${userEmail}?`)) {
      return;
    }

    try {
      // Remover do Firestore
      await deleteDoc(doc(db, 'users', userId));

      // Atualizar lista local
      setUsers(prev => prev.filter(user => user.uid !== userId));

      toast({
        title: "Sucesso!",
        description: `Usuário ${userEmail} excluído com sucesso.`,
        variant: "default"
      });

    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir usuário.",
        variant: "destructive"
      });
    }
  };

  // Iniciar edição
  const startEdit = (user: FirebaseUser) => {
    setEditingUserId(user.uid);
    setEditForm({
      displayName: user.displayName || '',
      role: isUserSuperUser(user.email) ? 'admin' : 'user'
    });
  };

  // Corrigir perfil de usuário específico
  const handleFixUserRole = async (userEmail: string, newRole: 'user' | 'admin') => {
    try {
      const result = await fixUserRole(userEmail, newRole);
      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message,
          variant: "default"
        });
        // Recarregar a lista de usuários
        loadUsers();
      } else {
        toast({
          title: "Erro",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao corrigir perfil do usuário.",
        variant: "destructive"
      });
    }
  };

  // Verificar se é super usuário
  const isUserSuperUser = (email: string) => {
    return isSuperUser(email);
  };

  // Verificar o tipo de usuário baseado no perfil do Firestore
  const getUserRole = (user: FirebaseUser) => {
    // Primeiro verifica se é super usuário (hardcoded)
    if (isUserSuperUser(user.email)) {
      return 'super';
    }
    
    // Depois verifica o perfil no Firestore
    const profile = userProfiles.find(p => p.uid === user.uid || p.email === user.email);
    if (profile && profile.role === 'admin') {
      return 'admin';
    }
    
    return 'user';
  };

  // Verificar se é administrador (super usuário ou admin do Firestore)
  const isUserAdmin = (user: FirebaseUser) => {
    const role = getUserRole(user);
    return role === 'super' || role === 'admin';
  };

  // Carregar usuários ao montar o componente
  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Carregando usuários...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Gerenciamento de Usuários
            </div>
            <div className="flex gap-2">
              {/* Botão para corrigir usuário específico */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleFixUserRole('achilles.oliveira.souza@gmail.com', 'user')}
                className="text-xs"
              >
                Corrigir 👨‍💻 Achilles → Usuário
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Adicionar Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                  <DialogDescription>
                    Criar uma nova conta de usuário para acesso ao sistema.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="usuario@ipda.org.br"
                        value={newUserForm.email}
                        onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Nome de Exibição</Label>
                      <Input
                        id="displayName"
                        placeholder="Nome do usuário"
                        value={newUserForm.displayName}
                        onChange={(e) => setNewUserForm(prev => ({ ...prev, displayName: e.target.value }))}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Tipo de Usuário</Label>
                      <select
                        id="role"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newUserForm.role}
                        onChange={(e) => setNewUserForm(prev => ({ ...prev, role: e.target.value as 'user' | 'admin' }))}
                      >
                        <option value="user">Usuário Normal</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Senha forte (min. 6 caracteres)"
                          value={newUserForm.password}
                          onChange={(e) => setNewUserForm(prev => ({ ...prev, password: e.target.value }))}
                          required
                          minLength={6}
                          className="w-full pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Informação:</strong> Usuários criados aqui terão acesso imediato ao sistema. 
                      Administradores têm acesso total às configurações.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={addingUser} className="w-full sm:w-auto">
                      {addingUser ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          Criando...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Criar Usuário
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Super Usuários</p>
                <p className="text-2xl font-bold">
                  {users.filter(user => isUserSuperUser(user.email)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Administradores</p>
                <p className="text-2xl font-bold">
                  {users.filter(user => !isUserSuperUser(user.email) && getUserRole(user) === 'admin').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Usuários Normais</p>
                <p className="text-2xl font-bold">
                  {users.filter(user => getUserRole(user) === 'user').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span>Usuários Cadastrados</span>
            <Button variant="outline" size="sm" onClick={loadUsers}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Email</TableHead>
                  <TableHead className="min-w-[150px]">Nome</TableHead>
                  <TableHead className="min-w-[120px]">Tipo</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[150px] hidden md:table-cell">Último Acesso</TableHead>
                  <TableHead className="min-w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    {editingUserId === user.uid ? (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <Input
                          value={editForm.displayName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                          className="w-full sm:w-32"
                          placeholder="Nome do usuário"
                        />
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleUpdateUser(user.uid)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingUserId(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="truncate">{user.displayName || 'Sem nome'}</span>
                        {!isUserSuperUser(user.email) && user.isFromFirestore && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => startEdit(user)}
                            className="flex-shrink-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingUserId === user.uid ? (
                      <select
                        className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                        value={editForm.role}
                        onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value as 'user' | 'admin' }))}
                      >
                        <option value="user">Usuário Normal</option>
                        <option value="admin">Administrador</option>
                      </select>
                    ) : (
                      <>
                        {(() => {
                          const role = getUserRole(user);
                          if (role === 'super') {
                            return (
                              <Badge variant="destructive" className="gap-1">
                                <Shield className="h-3 w-3" />
                                Super Usuário
                              </Badge>
                            );
                          } else if (role === 'admin') {
                            return (
                              <Badge variant="default" className="gap-1">
                                <Shield className="h-3 w-3" />
                                Administrador
                              </Badge>
                            );
                          } else {
                            return (
                              <Badge variant="secondary" className="gap-1">
                                <User className="h-3 w-3" />
                                Usuário Normal
                              </Badge>
                            );
                          }
                        })()}
                      </>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.emailVerified ? "default" : "secondary"}>
                      {user.emailVerified ? "Verificado" : "Não verificado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.lastSignInTime 
                      ? new Date(user.lastSignInTime).toLocaleString('pt-BR')
                      : 'Nunca'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/* Botão de ações para mobile */}
                      <div className="md:hidden">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-2">
                            <div className="space-y-2 text-sm">
                              <div>
                                <strong>Último Acesso:</strong>
                                <br />
                                {user.lastSignInTime 
                                  ? new Date(user.lastSignInTime).toLocaleString('pt-BR')
                                  : 'Nunca'
                                }
                              </div>
                              {user.isFromFirestore && !isUserSuperUser(user.email) && user.email !== currentUser?.email && (
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  className="w-full"
                                  onClick={() => handleDeleteUser(user.uid, user.email)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir Usuário
                                </Button>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      {/* Botões para desktop */}
                      <div className="hidden md:flex items-center gap-2">
                        {user.isFromFirestore && !isUserSuperUser(user.email) && user.email !== currentUser?.email && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteUser(user.uid, user.email)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
