import { useState } from 'react';
import { X } from 'lucide-react';
import { UsuarioOrganizador } from '@/shared/types/roles';
import { useCrearOrganizador, useAsignarRolOrganizador } from '../hooks/useOrganizadores';
import { useRoles } from '../hooks/useRoles';

interface OrganizadorFormModalProps {
  organizador?: UsuarioOrganizador;
  onClose: () => void;
  onSuccess: () => void;
}

export function OrganizadorFormModal({
  organizador,
  onClose,
  onSuccess,
}: OrganizadorFormModalProps) {
  const isEditing = !!organizador;
  const crearOrganizador = useCrearOrganizador();
  const asignarRol = useAsignarRolOrganizador();
  const { data: rolesData } = useRoles();

  const [formData, setFormData] = useState({
    email: organizador?.email || '',
    nombre_completo: organizador?.nombre_completo || '',
    password: '',
    rol_id: organizador?.rol?.id || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!isEditing && !formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!isEditing && formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (!formData.rol_id) {
      newErrors.rol_id = 'Debe seleccionar un rol';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      if (isEditing && organizador) {
        // Solo actualizar el rol
        await asignarRol.mutateAsync({
          id: organizador.id,
          rol_id: formData.rol_id,
        });
      } else {
        // Crear nuevo organizador
        await crearOrganizador.mutateAsync({
          email: formData.email,
          password: formData.password,
          nombre_completo: formData.nombre_completo || '',
          rol_id: formData.rol_id,
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Error al guardar organizador:', error);
    }
  };

  // Filtrar solo roles de organizador (no sistema o solo los que no sean Admin/Empresa)
  const rolesDisponibles =
    rolesData?.roles.filter((r) => r.activo && r.nombre !== 'Administrador' && r.nombre !== 'Empresa') ||
    [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-6 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {isEditing ? 'Editar Organizador' : 'Crear Nuevo Organizador'}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isEditing}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } ${isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="correo@ejemplo.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Nombre Completo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre Completo
            </label>
            <input
              type="text"
              value={formData.nombre_completo}
              onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
              disabled={isEditing}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              placeholder="Juan Pérez"
            />
          </div>

          {/* Contraseña (solo crear) */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Mínimo 6 caracteres"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
          )}

          {/* Rol */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Rol *
            </label>
            <select
              value={formData.rol_id}
              onChange={(e) => setFormData({ ...formData, rol_id: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.rol_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccionar rol...</option>
              {rolesDisponibles.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre} - {rol.permisos.length} permisos
                </option>
              ))}
            </select>
            {errors.rol_id && <p className="text-red-500 text-sm mt-1">{errors.rol_id}</p>}
            {formData.rol_id && (
              <p className="text-sm text-gray-600 mt-2">
                {rolesDisponibles.find((r) => r.id === formData.rol_id)?.descripcion ||
                  'Sin descripción'}
              </p>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={crearOrganizador.isPending || asignarRol.isPending}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {crearOrganizador.isPending || asignarRol.isPending
              ? 'Guardando...'
              : isEditing
              ? 'Actualizar'
              : 'Crear Organizador'}
          </button>
        </div>
      </div>
    </div>
  );
}
