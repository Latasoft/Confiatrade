import { X, Shield, Edit } from 'lucide-react';
import { Rol } from '@/shared/types/roles';

interface RolDetailsModalProps {
  rol: Rol;
  onClose: () => void;
  onEdit?: (rol: Rol) => void;
}

export function RolDetailsModal({ rol, onClose, onEdit }: RolDetailsModalProps) {
  // Agrupar permisos por módulo
  const permisosPorModulo = rol.permisos.reduce((acc, permiso) => {
    if (!acc[permiso.modulo]) {
      acc[permiso.modulo] = [];
    }
    acc[permiso.modulo].push(permiso);
    return acc;
  }, {} as Record<string, typeof rol.permisos>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">{rol.nombre}</h2>
              {rol.descripcion && (
                <p className="text-blue-100 text-sm">{rol.descripcion}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Información del rol */}
          <div className="mb-6 flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado del rol</p>
              <p className="text-lg font-semibold text-gray-900">
                {rol.activo ? (
                  <span className="text-green-600">Activo</span>
                ) : (
                  <span className="text-red-600">Inactivo</span>
                )}
              </p>
            </div>
            {rol.es_sistema && (
              <div className="ml-auto">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  Rol del Sistema
                </span>
              </div>
            )}
          </div>

          {/* Permisos */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Módulos con Acceso ({Object.keys(permisosPorModulo).length})
            </h3>

            {rol.permisos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No hay permisos asignados a este rol</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(permisosPorModulo).map(([modulo]) => (
                  <div
                    key={modulo}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center"
                  >
                    <span className="font-bold text-gray-900 capitalize">
                      {modulo}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
          >
            Cerrar
          </button>
          {onEdit && !rol.es_sistema && (
            <button
              onClick={() => {
                onEdit(rol);
                onClose();
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Editar Rol
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
