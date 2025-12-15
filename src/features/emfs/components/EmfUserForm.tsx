import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { userService } from '@/services/user.service';
import { EMF_USER_ROLES, CreateUserPayload, UserRole } from '@/types/user.types';
import { Emf } from '@/types/emf.types';

interface EmfUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  emf: Emf;
  onSuccess?: () => void;
}

interface FormDataState {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: UserRole;
}

export const EmfUserForm = ({ isOpen, onClose, emf, onSuccess }: EmfUserFormProps) => {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<FormDataState>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'agent',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserPayload) => {
      return await userService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emf-stats', emf.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      resetForm();
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.response?.data?.message || 'Une erreur est survenue' });
      }
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: 'agent',
    });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Le nom doit contenir au moins 3 caractères';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Les mots de passe ne correspondent pas';
    }
    
    if (!formData.role) {
      newErrors.role = 'Le rôle est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const payload: CreateUserPayload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.password_confirmation,
      role: formData.role,
      emf_id: emf.id,
    };
    
    createUserMutation.mutate(payload);
  };

  const handleChange = (field: keyof FormDataState, value: string) => {
    if (field === 'role') {
      setFormData(prev => ({ ...prev, [field]: value as UserRole }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    // Clear error when field changes
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const roleOptions = EMF_USER_ROLES.map(r => ({
    value: r.value,
    label: r.label,
  }));

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Nouvel utilisateur - ${emf.sigle}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Banner */}
        {errors.general && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{errors.general}</p>
          </div>
        )}

        {/* EMF Info */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Établissement</p>
              <p className="font-semibold text-gray-900">{emf.raison_sociale}</p>
            </div>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Nom complet</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="name"
              type="text"
              placeholder="Jean Dupont"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`pl-10 ${errors.name ? 'border-red-300 focus:ring-red-200' : ''}`}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Adresse email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="jean.dupont@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`pl-10 ${errors.email ? 'border-red-300 focus:ring-red-200' : ''}`}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Role */}
        <div className="space-y-2">
          <Label htmlFor="role">Rôle</Label>
          <Select
            id="role"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            options={roleOptions}
          />
          {/* Role description */}
          <p className="text-xs text-gray-500">
            {EMF_USER_ROLES.find(r => r.value === formData.role)?.description}
          </p>
          {errors.role && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.role}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`pl-10 pr-10 ${errors.password ? 'border-red-300 focus:ring-red-200' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.password}
            </p>
          )}
          <p className="text-xs text-gray-500">Minimum 8 caractères</p>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="password_confirmation">Confirmer le mot de passe</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="password_confirmation"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password_confirmation}
              onChange={(e) => handleChange('password_confirmation', e.target.value)}
              className={`pl-10 pr-10 ${errors.password_confirmation ? 'border-red-300 focus:ring-red-200' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password_confirmation && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.password_confirmation}
            </p>
          )}
          {formData.password && formData.password_confirmation && formData.password === formData.password_confirmation && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Les mots de passe correspondent
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={createUserMutation.isPending}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={createUserMutation.isPending}
          >
            {createUserMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Créer l'utilisateur
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
