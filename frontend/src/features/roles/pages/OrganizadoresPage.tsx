import { useState } from 'react';
import { useOrganizadores, useEliminarOrganizador, useCambiarEstadoOrganizador } from '../hooks/useOrganizadores';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/EmptyState';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { UserCog, Plus, Edit, Trash2, CheckCircle, XCircle, Filter } from 'lucide-react';
import { UsuarioOrganizador } from '@/shared/types/roles';
import { OrganizadorFormModal } from '../components/OrganizadorFormModal';

type FiltroEstado = 'todos' | 'activos' | 'inactivos';

export function OrganizadoresPage() {
  const { data, isLoading, error } = useOrganizadores();
  const eliminarOrganizador = useEliminarOrganizador();
  const cambiarEstado = useCambiarEstadoOrganizador();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [organizadorToEdit, setOrganizadorToEdit] = useState<UsuarioOrganizador | null>(null);
  const [organizadorToDelete, setOrganizadorToDelete] = useState<UsuarioOrganizador | null>(null);
  const [organizadorToToggle, setOrganizadorToToggle] = useState<UsuarioOrganizador | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('activos');

  const handleDelete = async () => {
    if (!organizadorToDelete) return;
    await eliminarOrganizador.mutateAsync(organizadorToDelete.id);
    setOrganizadorToDelete(null);
  };

  const handleToggleEstado = async () => {
    if (!organizadorToToggle) return;
    await cambiarEstado.mutateAsync({
      id: organizadorToToggle.id,
      activo: !organizadorToToggle.activo,
    });
    setOrganizadorToToggle(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Cargando organizadores..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Error al cargar organizadores</p>
      </div>
    );
  }

  const todosOrganizadores = data || [];
  const activos = todosOrganizadores.filter((o) => o.activo).length;
  const inactivos = todosOrganizadores.length - activos;

  // Aplicar filtro
  const organizadores = todosOrganizadores.filter((o) => {
    if (filtroEstado === 'activos') return o.activo;
    if (filtroEstado === 'inactivos') return !o.activo;
    return true; // 'todos'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-purple-200 to-purple-100 rounded-xl border-2 border-purple-400 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                <UserCog className="w-10 h-10 text-purple-600" />
                Gestión de Organizadores
              </h1>
              <p className="text-slate-700 text-lg">
                Administra usuarios organizadores y sus permisos
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Crear Organizador
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Organizadores</p>
                <p className="text-3xl font-bold text-gray-900">{todosOrganizadores.length}</p>
              </div>
              <UserCog className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Activos</p>
                <p className="text-3xl font-bold text-green-600">{activos}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Inactivos</p>
                <p className="text-3xl font-bold text-red-600">{inactivos}</p>
              </div>
              <XCircle className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Mostrar:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setFiltroEstado('activos')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  filtroEstado === 'activos'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Activos ({activos})
              </button>
              <button
                onClick={() => setFiltroEstado('inactivos')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  filtroEstado === 'inactivos'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Inactivos ({inactivos})
              </button>
              <button
                onClick={() => setFiltroEstado('todos')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  filtroEstado === 'todos'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos ({todosOrganizadores.length})
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Organizadores */}
        {organizadores.length === 0 ? (
          <EmptyState
            icon={UserCog}
            title="No hay organizadores registrados"
            description="Aún no se han creado usuarios organizadores"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizadores.map((organizador) => (
              <div
                key={organizador.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {organizador.nombre_completo || organizador.email}
                    </h3>
                    {organizador.nombre_completo && (
                      <p className="text-sm text-gray-600">{organizador.email}</p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      organizador.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {organizador.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Rol:</span>
                    <span className="font-semibold text-gray-900">
                      {organizador.rol?.nombre || 'Sin rol'}
                    </span>
                  </div>
                  {organizador.rol?.descripcion && (
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {organizador.rol.descripcion}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {organizador.rol && organizador.rol.permisos && organizador.rol.permisos.length > 0 ? (
                    (() => {
                      const modulos = [...new Set(organizador.rol.permisos.map(p => p.modulo))];
                      return (
                        <>
                          {modulos.slice(0, 3).map((modulo) => (
                            <span
                              key={modulo}
                              className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full capitalize"
                            >
                              {modulo}
                            </span>
                          ))}
                          {modulos.length > 3 && (
                            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                              +{modulos.length - 3} más
                            </span>
                          )}
                        </>
                      );
                    })()
                  ) : (
                    <span className="text-xs text-gray-500">Sin módulos asignados</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setOrganizadorToEdit(organizador)}
                    className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => setOrganizadorToToggle(organizador)}
                    className={`p-2 rounded-lg transition-colors ${
                      organizador.activo
                        ? 'bg-red-50 hover:bg-red-100 text-red-700'
                        : 'bg-green-50 hover:bg-green-100 text-green-700'
                    }`}
                    title={organizador.activo ? 'Desactivar' : 'Activar'}
                  >
                    {organizador.activo ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => setOrganizadorToDelete(organizador)}
                    className="bg-gray-50 hover:bg-gray-100 text-gray-700 p-2 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <OrganizadorFormModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => setShowCreateModal(false)}
        />
      )}

      {organizadorToEdit && (
        <OrganizadorFormModal
          organizador={organizadorToEdit}
          onClose={() => setOrganizadorToEdit(null)}
          onSuccess={() => setOrganizadorToEdit(null)}
        />
      )}

      {organizadorToDelete && (
        <ConfirmDialog
          isOpen={true}
          title="Eliminar Organizador"
          message={`¿Estás seguro de eliminar al organizador "${organizadorToDelete.email}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={handleDelete}
          onClose={() => setOrganizadorToDelete(null)}
          variant="danger"
        />
      )}

      {organizadorToToggle && (
        <ConfirmDialog
          isOpen={true}
          title={organizadorToToggle.activo ? 'Desactivar Organizador' : 'Activar Organizador'}
          message={`¿Estás seguro de ${
            organizadorToToggle.activo ? 'desactivar' : 'activar'
          } al organizador "${organizadorToToggle.email}"?`}
          confirmText={organizadorToToggle.activo ? 'Desactivar' : 'Activar'}
          cancelText="Cancelar"
          onConfirm={handleToggleEstado}
          onClose={() => setOrganizadorToToggle(null)}
          variant={organizadorToToggle.activo ? 'danger' : 'warning'}
        />
      )}
    </div>
  );
}
