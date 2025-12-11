import { useState } from 'react';
import { X } from 'lucide-react';
import { Rol } from '@/shared/types/roles';
import { useCrearRol, useActualizarRol } from '../hooks/useRoles';
import { usePermisos } from '../hooks/useRoles';

interface RolFormModalProps {
  rol?: Rol;
  onClose: () => void;
  onSuccess: () => void;
}

export function RolFormModal({ rol, onClose, onSuccess }: RolFormModalProps) {
  const isEditing = !!rol;
  const crearRol = useCrearRol();
  const actualizarRol = useActualizarRol();
  const { data: permisosData } = usePermisos();

  const [formData, setFormData] = useState({
    nombre: rol?.nombre || '',
    descripcion: rol?.descripcion || '',
    activo: rol?.activo ?? true,
    permisos: rol?.permisos.map((p) => p.id) || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (formData.permisos.length === 0) {
      newErrors.permisos = 'Debe seleccionar al menos un permiso';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      if (isEditing && rol) {
        await actualizarRol.mutateAsync({
          rolId: rol.id,
          data: {
            nombre: formData.nombre,
            descripcion: formData.descripcion || undefined,
            activo: formData.activo,
            permisos_ids: formData.permisos,
          },
        });
      } else {
        await crearRol.mutateAsync({
          nombre: formData.nombre,
          descripcion: formData.descripcion || null,
          activo: formData.activo,
          permisos_ids: formData.permisos,
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Error al guardar rol:', error);
    }
  };

  const togglePermiso = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      permisos: prev.permisos.includes(id)
        ? prev.permisos.filter((p) => p !== id)
        : [...prev.permisos, id],
    }));
  };

  const toggleModulo = (modulo: string) => {
    const permisosModulo =
      permisosData?.permisos.filter((p) => p.modulo === modulo).map((p) => p.id) || [];
    const todosSeleccionados = permisosModulo.every((id) =>
      formData.permisos.includes(id)
    );

    if (todosSeleccionados) {
      setFormData((prev) => ({
        ...prev,
        permisos: prev.permisos.filter((p) => !permisosModulo.includes(p)),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        permisos: [...new Set([...prev.permisos, ...permisosModulo])],
      }));
    }
  };

  // Agrupar permisos por módulo
  const permisosPorModulo =
    permisosData?.permisos.reduce((acc, permiso) => {
      if (!acc[permiso.modulo]) {
        acc[permiso.modulo] = [];
      }
      acc[permiso.modulo].push(permiso);
      return acc;
    }, {} as Record<string, typeof permisosData.permisos>) || {};

  // Función mejorada para toggle de módulo que incluye todos los permisos
  const toggleModuloCompleto = (modulo: string) => {
    const permisosModulo =
      permisosData?.permisos.filter((p) => p.modulo === modulo).map((p) => p.id) || [];
    const todosSeleccionados = permisosModulo.every((id) =>
      formData.permisos.includes(id)
    );

    if (todosSeleccionados) {
      // Deseleccionar todos los permisos del módulo
      setFormData((prev) => ({
        ...prev,
        permisos: prev.permisos.filter((p) => !permisosModulo.includes(p)),
      }));
    } else {
      // Seleccionar TODOS los permisos del módulo (no solo ver)
      setFormData((prev) => ({
        ...prev,
        permisos: [...new Set([...prev.permisos, ...permisosModulo])],
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {isEditing ? 'Editar Rol' : 'Crear Nuevo Rol'}
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre del Rol *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Coordinador de Eventos"
              />
              {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Describe las responsabilidades de este rol"
              />
            </div>

            {/* Activo */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="activo"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="activo" className="text-sm font-semibold text-gray-700">
                Rol activo
              </label>
            </div>

            {/* Permisos */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Permisos *
              </label>
              {errors.permisos && <p className="text-red-500 text-sm mb-2">{errors.permisos}</p>}

              <div className="space-y-3 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                {Object.entries(permisosPorModulo).map(([modulo, permisos]) => {
                  const permisosModuloIds = permisos.map((p) => p.id);
                  const todosSeleccionados = permisosModuloIds.every((id) =>
                    formData.permisos.includes(id)
                  );
                  const algunoSeleccionado = permisosModuloIds.some((id) =>
                    formData.permisos.includes(id)
                  );

                  return (
                    <div key={modulo} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={`modulo-${modulo}`}
                          checked={todosSeleccionados}
                          onChange={() => toggleModuloCompleto(modulo)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          style={{
                            opacity: algunoSeleccionado && !todosSeleccionados ? 0.5 : 1,
                          }}
                        />
                        <label
                          htmlFor={`modulo-${modulo}`}
                          className="flex-1 cursor-pointer font-bold text-gray-900 capitalize"
                        >
                          {modulo}
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-sm text-gray-600 mt-2">
                {formData.permisos.length} permiso(s) seleccionado(s)
              </p>
            </div>
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
            disabled={crearRol.isPending || actualizarRol.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {crearRol.isPending || actualizarRol.isPending
              ? 'Guardando...'
              : isEditing
              ? 'Actualizar'
              : 'Crear Rol'}
          </button>
        </div>
      </div>
    </div>
  );
}
