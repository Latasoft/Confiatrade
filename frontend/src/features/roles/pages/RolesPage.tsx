import { useState } from 'react';
import { useRoles, useEliminarRol } from '../hooks/useRoles';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/EmptyState';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { Shield, Plus, Edit, Trash2, Users, AlertCircle } from 'lucide-react';
import { Rol } from '@/shared/types/roles';
import { RolFormModal } from '../components/RolFormModal';
import { RolDetailsModal } from '../components/RolDetailsModal';
import { verificarPuedeEliminarRol } from '../api/rolesApi';

export function RolesPage() {
  const { data, isLoading, error } = useRoles();
  const eliminarRol = useEliminarRol();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRol, setSelectedRol] = useState<Rol | null>(null);
  const [rolToDelete, setRolToDelete] = useState<Rol | null>(null);
  const [rolToEdit, setRolToEdit] = useState<Rol | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteClick = async (rol: Rol) => {
    try {
      const verificacion = await verificarPuedeEliminarRol(rol.id);
      
      if (!verificacion.puede_eliminar) {
        setDeleteError(verificacion.motivo || 'No se puede eliminar este rol');
        setRolToDelete(rol);
      } else {
        setDeleteError(null);
        setRolToDelete(rol);
      }
    } catch (error) {
      console.error('Error al verificar eliminación:', error);
      setDeleteError('Error al verificar si se puede eliminar el rol');
      setRolToDelete(rol);
    }
  };

  const handleDelete = async () => {
    if (!rolToDelete) return;
    
    try {
      await eliminarRol.mutateAsync(rolToDelete.id);
      setRolToDelete(null);
      setDeleteError(null);
    } catch (error) {
      setRolToDelete(null);
      setDeleteError(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Cargando roles..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Error al cargar roles</p>
      </div>
    );
  }

  const roles = data?.roles || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-blue-200 to-blue-100 rounded-xl border-2 border-blue-400 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                <Shield className="w-10 h-10 text-blue-600" />
                Gestión de Roles
              </h1>
              <p className="text-slate-700 text-lg">
                Administra roles y permisos del sistema
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Crear Rol
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Roles</p>
                <p className="text-3xl font-bold text-gray-900">{roles.length}</p>
              </div>
              <Shield className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Roles del Sistema</p>
                <p className="text-3xl font-bold text-gray-900">
                  {roles.filter((r) => r.es_sistema).length}
                </p>
              </div>
              <Shield className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Roles Personalizados</p>
                <p className="text-3xl font-bold text-gray-900">
                  {roles.filter((r) => !r.es_sistema).length}
                </p>
              </div>
              <Users className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Lista de Roles */}
        {roles.length === 0 ? (
          <EmptyState
            icon={Shield}
            title="No hay roles registrados"
            description="Aún no se han creado roles en el sistema"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((rol) => (
              <div
                key={rol.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {rol.nombre}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {rol.descripcion || 'Sin descripción'}
                    </p>
                  </div>
                  {rol.es_sistema && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                      Sistema
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>
                      {(() => {
                        const modulos = [...new Set(rol.permisos.map(p => p.modulo))];
                        return `${modulos.length} ${modulos.length === 1 ? 'módulo' : 'módulos'}`;
                      })()}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        rol.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {rol.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedRol(rol)}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Ver Detalles
                  </button>
                  {!rol.es_sistema && (
                    <>
                      <button
                        onClick={() => setRolToEdit(rol)}
                        className="bg-gray-50 hover:bg-gray-100 text-gray-700 p-2 rounded-lg transition-colors"
                        title="Editar rol"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(rol)}
                        className="bg-red-50 hover:bg-red-100 text-red-700 p-2 rounded-lg transition-colors"
                        title="Eliminar rol"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <RolFormModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => setShowCreateModal(false)}
        />
      )}

      {rolToEdit && (
        <RolFormModal
          rol={rolToEdit}
          onClose={() => setRolToEdit(null)}
          onSuccess={() => setRolToEdit(null)}
        />
      )}

      {selectedRol && (
        <RolDetailsModal
          rol={selectedRol}
          onClose={() => setSelectedRol(null)}
          onEdit={(rol: Rol) => {
            setRolToEdit(rol);
            setSelectedRol(null);
          }}
        />
      )}

      {rolToDelete && (
        <>
          {deleteError ? (
            <ConfirmDialog
              isOpen={true}
              title="No se puede eliminar el rol"
              message={
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-700 mb-2">
                      El rol <strong>"{rolToDelete.nombre}"</strong> no puede ser eliminado.
                    </p>
                    <p className="text-gray-600">
                      {deleteError}
                    </p>
                  </div>
                </div>
              }
              confirmText={undefined}
              cancelText="Cerrar"
              onConfirm={undefined}
              onClose={() => {
                setRolToDelete(null);
                setDeleteError(null);
              }}
              variant="warning"
            />
          ) : (
            <ConfirmDialog
              isOpen={true}
              title="Eliminar Rol"
              message={`¿Estás seguro de eliminar el rol "${rolToDelete.nombre}"?\n\nEsta acción no se puede deshacer.`}
              confirmText="Eliminar"
              cancelText="Cancelar"
              onConfirm={handleDelete}
              onClose={() => setRolToDelete(null)}
              variant="danger"
            />
          )}
        </>
      )}
    </div>
  );
}
