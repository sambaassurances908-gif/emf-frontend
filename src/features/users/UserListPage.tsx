import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Plus, Search, Eye, Edit, Users, Shield, Building2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { userService } from '@/services/user.service';
import { User } from '@/types/user.types';

const ROLES = [
  { value: '', label: 'Tous les rôles' },
  { value: 'admin', label: 'Administrateur' },
  { value: 'emf_user', label: 'Utilisateur EMF' },
  { value: 'bank_user', label: 'Utilisateur Banque' },
  { value: 'assureur', label: 'Assureur' },
];

const STATUTS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'actif', label: 'Actif' },
  { value: 'inactif', label: 'Inactif' },
  { value: 'suspendu', label: 'Suspendu' },
];

export const UserListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['users', { search, roleFilter, statutFilter, page }],
    queryFn: async () => {
      return await userService.getAll({
        search,
        role: roleFilter,
        statut: statutFilter,
        page,
      });
    },
  });

  const { data: statsResponse } = useQuery({
    queryKey: ['users-stats'],
    queryFn: async () => {
      return await userService.getStats();
    },
  });

  const stats = statsResponse?.data;

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      actif: 'bg-green-100 text-green-800',
      inactif: 'bg-gray-100 text-gray-800',
      suspendu: 'bg-orange-100 text-orange-800',
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      emf_user: 'bg-blue-100 text-blue-800',
      bank_user: 'bg-purple-100 text-purple-800',
      assureur: 'bg-green-100 text-green-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Admin',
      emf_user: 'EMF',
      bank_user: 'Banque',
      assureur: 'Assureur',
    };
    return labels[role] || role;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-600 mt-1">
            Gestion des comptes utilisateurs
          </p>
        </div>
        <Button onClick={() => navigate('/users/nouveau')}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Utilisateur
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.total}
                  </p>
                </div>
                <Users className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {stats.admins}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">EMF</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {stats.emf_users}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Banques</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {stats.bank_users}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Actifs</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {stats.actifs}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              placeholder="Tous les rôles"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={ROLES}
            />
            <Select
              placeholder="Tous les statuts"
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
              options={STATUTS}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12">
              <LoadingSpinner size="lg" text="Chargement des utilisateurs..." />
            </div>
          ) : !data?.data || data.data.length === 0 ? (
            <EmptyState
              title="Aucun utilisateur trouvé"
              description="Commencez par créer un nouveau compte utilisateur"
              action={
                <Button onClick={() => navigate('/users/nouveau')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un utilisateur
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>EMF/Banque</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière Connexion</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.emf ? (
                        <span className="text-sm text-gray-600">{user.emf.sigle}</span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatutColor(user.statut)}>
                        {user.statut}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.last_login ? (
                        <span className="text-sm text-gray-600">
                          {formatDate(user.last_login)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Jamais</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/users/${user.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/users/${user.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data?.meta && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Affichage de {data.meta.from} à {data.meta.to} sur {data.meta.total} utilisateurs
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Précédent
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} sur {data.meta.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === data.meta.last_page}
              onClick={() => setPage(page + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
