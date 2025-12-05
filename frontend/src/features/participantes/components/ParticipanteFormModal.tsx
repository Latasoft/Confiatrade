import { useState, useEffect } from 'react';
import { X, QrCode } from 'lucide-react';
// import { Upload } from 'lucide-react'; // Comentado: funcionalidad de foto deshabilitada
import { useForm } from 'react-hook-form';
import { useCreateParticipante, useUpdateParticipante } from '../hooks/useParticipantes';
import { useEmpresasAprobadas } from '@/features/empresas/hooks/useEmpresas';
import type { Participante, CreateParticipanteData } from '../api/participantesApi';

interface ParticipanteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  participante?: Participante;
}

export function ParticipanteFormModal({
  isOpen,
  onClose,
  participante,
}: ParticipanteFormModalProps) {
  // const [photoPreview, setPhotoPreview] = useState<string | undefined>(
  //   participante?.foto_url
  // ); // Comentado: funcionalidad de foto deshabilitada

  const { data: empresasData } = useEmpresasAprobadas();
  const createMutation = useCreateParticipante();
  const updateMutation = useUpdateParticipante();
  
  const empresas = empresasData || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateParticipanteData>({
    defaultValues: participante
      ? {
          empresa_id: participante.empresa_id,
          nombre_completo: participante.nombre_completo,
          email: participante.email,
          telefono: participante.telefono || '',
          cargo: participante.cargo || '',
          // foto_url: participante.foto_url || '', // Comentado: funcionalidad de foto deshabilitada
          idioma: participante.idioma,
        }
      : {
          idioma: 'ES',
          empresa_id: empresas[0]?.id || '',
        },
  });

  useEffect(() => {
    if (participante) {
      reset({
        empresa_id: participante.empresa_id,
        nombre_completo: participante.nombre_completo,
        email: participante.email,
        telefono: participante.telefono || '',
        cargo: participante.cargo || '',
        // foto_url: participante.foto_url || '', // Comentado: funcionalidad de foto deshabilitada
        idioma: participante.idioma,
      });
      // setPhotoPreview(participante.foto_url); // Comentado: funcionalidad de foto deshabilitada
    } else {
      reset({ 
        idioma: 'ES',
        empresa_id: empresas[0]?.id || '',
      });
      // setPhotoPreview(undefined); // Comentado: funcionalidad de foto deshabilitada
    }
  }, [participante, reset, empresas]);

  // const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setPhotoPreview(reader.result as string);
  //     };
  //     reader.readAsDataURL(file);
  //     // En producción, aquí subirías la imagen a un servicio como S3 o Cloudinary
  //   }
  // }; // Comentado: funcionalidad de foto deshabilitada

  const onSubmit = async (data: CreateParticipanteData) => {
    try {
      // if (photoPreview && photoPreview !== participante?.foto_url) {
      //   data.foto_url = photoPreview;
      // } // Comentado: funcionalidad de foto deshabilitada

      if (participante) {
        await updateMutation.mutateAsync({
          id: participante.id,
          data: {
            nombre_completo: data.nombre_completo,
            email: data.email,
            telefono: data.telefono,
            cargo: data.cargo,
            // foto_url: data.foto_url, // Comentado: funcionalidad de foto deshabilitada
            idioma: data.idioma,
          },
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      handleClose();
    } catch (error) {
      console.error('Error al guardar participante:', error);
    }
  };

  const handleClose = () => {
    reset();
    // setPhotoPreview(undefined); // Comentado: funcionalidad de foto deshabilitada
    onClose();
  };

  if (!isOpen) return null;

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg border-2 border-gray-300 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {participante ? 'Editar Participante' : 'Nuevo Participante'}
            </h2>
            {!participante && (
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                <QrCode size={16} />
                El código QR se generará automáticamente
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Photo Upload - Comentado: funcionalidad de foto deshabilitada */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto del Participante
            </label>
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <Upload size={32} className="text-gray-400" />
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition cursor-pointer inline-block"
                >
                  Seleccionar Foto
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG o GIF (máx. 2MB)
                </p>
              </div>
            </div>
          </div> */}

          {/* Empresa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empresa <span className="text-red-500">*</span>
            </label>
            <select
              {...register('empresa_id', { required: 'Empresa requerida' })}
              disabled={!!participante || empresas.length === 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">
                {empresas.length === 0 ? 'No hay empresas aprobadas' : 'Selecciona una empresa'}
              </option>
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nombre}
                </option>
              ))}
            </select>
            {errors.empresa_id && (
              <p className="text-sm text-red-600 mt-1">{errors.empresa_id.message}</p>
            )}
            {empresas.length === 0 && (
              <p className="text-sm text-amber-600 mt-1">
                No hay empresas aprobadas. Aprueba empresas primero desde el módulo de Empresas.
              </p>
            )}
          </div>

          {/* Nombre y Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('nombre_completo', { required: 'Nombre requerido' })}
                placeholder="Juan Pérez"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.nombre_completo && (
                <p className="text-sm text-red-600 mt-1">{errors.nombre_completo.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido',
                  },
                })}
                placeholder="juan@empresa.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Teléfono y Cargo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                {...register('telefono')}
                placeholder="+56 9 1234 5678"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cargo
              </label>
              <input
                type="text"
                {...register('cargo')}
                placeholder="Gerente Comercial"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Idioma */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Idioma Preferido
            </label>
            <select
              {...register('idioma')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ES">Español</option>
              <option value="EN">English</option>
              <option value="PT">Português</option>
              <option value="FR">Français</option>
            </select>
          </div>

          {/* Mostrar QR si es edición */}
          {participante && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <QrCode className="text-blue-600 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Código QR generado
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    QR: {participante.qr_data?.substring(0, 20) || 'N/A'}...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading
                ? 'Guardando...'
                : participante
                ? 'Actualizar'
                : 'Crear Participante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
