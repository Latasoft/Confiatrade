import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { usePerfil, useLogout } from '../../auth/hooks/useAuth';
import { useEmpresasAprobadas, useUploadPresentacion, useUpdateEmpresa } from '@/features/empresas/hooks/useEmpresas';
import { useMisInscripciones } from '@/features/eventos/hooks/useEventosEmpresa';
import { useGenerarCredencialEmpresa } from '@/features/credenciales/hooks/useCredenciales';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Building2, 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock,
  Mail,
  Phone,
  Globe,
  AlertCircle,
  FileText,
  LogOut,
  Upload,
  Download,
  Edit2,
  Save,
  X,
  Target,
  MapPin,
  QrCode
} from 'lucide-react';

export default function EmpresaDashboardPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const navigate = useNavigate();
  const { data: perfil, isLoading } = usePerfil();
  const { data: empresasData } = useEmpresasAprobadas();
  const { data: inscripciones = [] } = useMisInscripciones();
  const logout = useLogout();
  const uploadPresentacion = useUploadPresentacion();
  const updateEmpresa = useUpdateEmpresa();
  const generarCredencial = useGenerarCredencialEmpresa();
  
  const { register, handleSubmit, reset } = useForm();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const empresa = perfil?.empresa;
  const empresaCompleta = empresasData?.find(e => e.id === empresa?.id);
  
  // Usar datos del perfil o de empresaCompleta (el que tenga datos más recientes)
  const presentacionUrl = empresaCompleta?.presentacion_url || empresa?.presentacion_url;

  const handleDescargarCredencial = async () => {
    if (!empresa?.id) return;
    
    try {
      await generarCredencial.mutateAsync(empresa.id);
    } catch (error: any) {
      console.error('Error al generar credencial:', error);
      setUploadMessage(error?.response?.data?.detail || 'Error al generar credencial');
      setTimeout(() => setUploadMessage(null), 3000);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !empresa?.id) return;

    if (file.type !== 'application/pdf') {
      setUploadMessage('Solo se permiten archivos PDF');
      setTimeout(() => setUploadMessage(null), 3000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadMessage('El archivo no debe superar los 5MB');
      setTimeout(() => setUploadMessage(null), 3000);
      return;
    }

    try {
      await uploadPresentacion.mutateAsync({ id: empresa.id, file });
      setUploadMessage('Presentación subida exitosamente');
      setTimeout(() => setUploadMessage(null), 3000);
      // Limpiar el input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error al subir presentación:', error);
      const errorMsg = error?.response?.data?.detail || 'Error al subir la presentación';
      setUploadMessage(errorMsg);
      setTimeout(() => setUploadMessage(null), 3000);
    }
  };

  const onSubmitEdit = async (data: any) => {
    if (!empresa?.id) return;
    
    try {
      await updateEmpresa.mutateAsync({
        id: empresa.id,
        data: {
          nombre: data.nombre,
          descripcion: data.descripcion,
          email: data.email,
          telefono: data.telefono,
          sitio_web: data.sitio_web,
          direccion: data.direccion,
        }
      });
      setIsEditing(false);
      setUploadMessage('Información actualizada exitosamente');
      setTimeout(() => setUploadMessage(null), 3000);
    } catch (error) {
      console.error('Error al actualizar empresa:', error);
      setUploadMessage('Error al actualizar la información');
      setTimeout(() => setUploadMessage(null), 3000);
    }
  };

  const handleCancelEdit = () => {
    reset();
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-blue-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-100 to-white rounded-xl border-2 border-slate-300 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-900">Dashboard de Empresa</h1>
              <p className="text-slate-700 mt-2 text-lg">
                Bienvenido, {perfil?.nombre_completo}
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-bold rounded-lg border-2 border-slate-400 transition-colors flex items-center gap-2"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
              Cerrar Sesión
            </button>
            <div className="flex items-center gap-3">
              {empresa?.aprobada ? (
                <span className="px-4 py-2 bg-emerald-100 text-emerald-800 text-sm font-bold rounded-lg border-2 border-emerald-400 flex items-center gap-2">
                  <CheckCircle size={20} />
                  Empresa Aprobada
                </span>
              ) : (
                <span className="px-4 py-2 bg-amber-100 text-amber-800 text-sm font-bold rounded-lg border-2 border-amber-400 flex items-center gap-2">
                  <Clock size={20} />
                  Pendiente de Aprobación
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mensaje de feedback */}
        {uploadMessage && (
          <div className={`rounded-xl border-2 p-4 flex items-center gap-3 ${
            uploadMessage.includes('✓') 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
              : 'bg-red-50 border-red-300 text-red-800'
          }`}>
            <AlertCircle size={20} />
            <p className="font-medium">{uploadMessage}</p>
          </div>
        )}

        {/* Alerta si no está aprobada */}
        {!empresa?.aprobada && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 flex items-start gap-4">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="text-lg font-bold text-amber-900 mb-2">
                Tu empresa está en proceso de revisión
              </h3>
              <p className="text-amber-800">
                Un administrador revisará la información de tu empresa pronto. Una vez aprobada, 
                podrás acceder a todos los eventos disponibles y agendar reuniones.
              </p>
            </div>
          </div>
        )}

        {/* Presentación PDF */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileText className="text-blue-600" size={32} />
              <h2 className="text-2xl font-bold text-slate-900">Mi Presentación</h2>
            </div>
          </div>

          {presentacionUrl ? (
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border-2 border-blue-200">
              <div className="flex items-center gap-3">
                <FileText className="text-blue-600" size={24} />
                <div>
                  <p className="font-bold text-slate-900">Presentación actual</p>
                  <p className="text-sm text-slate-600">PDF disponible</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={presentacionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
                >
                  <Download size={18} />
                  Ver/Descargar
                </a>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadPresentacion.isPending}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Upload size={18} />
                  Reemplazar
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-blue-300">
              <FileText className="mx-auto text-blue-400 mb-4" size={48} />
              <p className="text-slate-700 mb-4">No has subido una presentación aún</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadPresentacion.isPending}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2 mx-auto disabled:opacity-50"
              >
                <Upload size={20} />
                {uploadPresentacion.isPending ? 'Subiendo...' : 'Subir Presentación (PDF)'}
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Mi Credencial */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-300 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <QrCode className="text-purple-600" size={32} />
              <h2 className="text-2xl font-bold text-slate-900">Mi Credencial</h2>
            </div>
          </div>

          {empresa?.aprobada ? (
            <div className="bg-white p-6 rounded-lg border-2 border-purple-200">
              <div className="flex items-start gap-4 mb-4">
                <QrCode className="text-purple-600 flex-shrink-0" size={48} />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Credencial Digital</h3>
                  <p className="text-slate-600 mb-1">
                    Descarga tu credencial oficial con código QR único para el evento.
                  </p>
                  <p className="text-sm text-slate-500">
                    La credencial incluye: nombre de empresa, datos de contacto y código QR verificable.
                  </p>
                </div>
              </div>
              <button
                onClick={handleDescargarCredencial}
                disabled={generarCredencial.isPending}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <Download size={20} />
                {generarCredencial.isPending ? 'Generando credencial...' : 'Descargar Credencial (PDF)'}
              </button>
            </div>
          ) : (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-amber-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="text-lg font-bold text-amber-900 mb-2">
                    Credencial no disponible
                  </h3>
                  <p className="text-amber-800">
                    Tu empresa debe estar aprobada para poder descargar la credencial oficial.
                    Un administrador revisará tu solicitud pronto.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Información de la Empresa */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-300 p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-slate-300">
            <div className="flex items-center gap-3">
              <Building2 className="text-blue-600" size={32} />
              <h2 className="text-2xl font-bold text-slate-900">Información de la Empresa</h2>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
              >
                <Edit2 size={18} />
                Editar
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nombre</label>
                  <input
                    {...register('nombre', { required: true })}
                    defaultValue={empresa?.nombre}
                    className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                  <input
                    {...register('email')}
                    defaultValue={empresa?.email}
                    type="email"
                    className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Teléfono</label>
                  <input
                    {...register('telefono')}
                    defaultValue={empresa?.telefono || ''}
                    className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Sitio Web</label>
                  <input
                    {...register('sitio_web')}
                    defaultValue={empresa?.sitio_web || ''}
                    className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Descripción</label>
                <textarea
                  {...register('descripcion')}
                  defaultValue={empresa?.descripcion || ''}
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Dirección</label>
                <textarea
                  {...register('direccion')}
                  defaultValue={empresa?.direccion || ''}
                  rows={2}
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={updateEmpresa.isPending}
                  className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={18} />
                  {updateEmpresa.isPending ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-2 bg-slate-300 text-slate-800 rounded-lg hover:bg-slate-400 transition flex items-center gap-2"
                >
                  <X size={18} />
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">{empresa?.nombre}</h3>
                
                <div className="space-y-3">
                  {empresa?.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="text-slate-500" size={20} />
                      <span className="text-slate-700">{empresa.email}</span>
                    </div>
                  )}
                  
                  {empresa?.telefono && (
                    <div className="flex items-center gap-3">
                      <Phone className="text-slate-500" size={20} />
                      <span className="text-slate-700">{empresa.telefono}</span>
                    </div>
                  )}
                  
                  {empresa?.sitio_web && (
                    <div className="flex items-center gap-3">
                      <Globe className="text-slate-500" size={20} />
                      <a 
                        href={empresa.sitio_web} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {empresa.sitio_web}
                      </a>
                    </div>
                  )}
                  
                  {empresa?.direccion && (
                    <div className="flex items-start gap-3">
                      <MapPin className="text-slate-500 mt-1" size={20} />
                      <span className="text-slate-700">{empresa.direccion}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h4 className="text-sm font-bold text-slate-700 mb-3">Detalles</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">País:</span>
                    <span className="font-semibold text-slate-800">{empresa?.pais_nombre || `País ID ${empresa?.pais_id}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Sector:</span>
                    <span className="font-semibold text-slate-800">{empresa?.sector_nombre || `Sector ID ${empresa?.sector_id}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Estado:</span>
                    <span className={`font-semibold ${empresa?.aprobada ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {empresa?.aprobada ? 'Aprobada' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {empresaCompleta?.descripcion && (
            <div className="mt-6 pt-6 border-t-2 border-slate-300">
              <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <FileText size={18} />
                Descripción
              </h4>
              <p className="text-slate-700">{empresaCompleta.descripcion}</p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-500 rounded-xl">
                <Calendar className="text-white" size={32} />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Eventos Disponibles
                </p>
                <p className="text-4xl font-bold text-blue-900 mt-1">
                  {empresa?.aprobada ? '0' : '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-300 p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-emerald-500 rounded-xl">
                <Users className="text-white" size={32} />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Reuniones Agendadas
                </p>
                <p className="text-4xl font-bold text-emerald-900 mt-1">
                  {empresa?.aprobada ? '0' : '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border-2 border-indigo-300 p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-indigo-500 rounded-xl">
                <CheckCircle className="text-white" size={32} />
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  Reuniones Completadas
                </p>
                <p className="text-4xl font-bold text-indigo-900 mt-1">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mis Inscripciones */}
        {empresa?.aprobada && inscripciones && inscripciones.length > 0 && (
          <div className="bg-white rounded-xl border-2 border-slate-300 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Target className="text-purple-600" size={32} />
              Mis Inscripciones a Eventos
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inscripciones.map((inscripcion) => {
                const fechaInicio = new Date(inscripcion.evento.fecha_inicio);
                const fechaFin = new Date(inscripcion.evento.fecha_fin);
                
                return (
                  <div key={inscripcion.id} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border-2 border-slate-300 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-slate-800 text-sm">
                        {inscripcion.evento.nombre}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        inscripcion.aprobada 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {inscripcion.aprobada ? 'Aprobado' : 'Pendiente'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-xs text-slate-600 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>
                          {format(fechaInicio, "d MMM yyyy", { locale: es })}
                          {fechaInicio.toDateString() !== fechaFin.toDateString() && 
                            ` - ${format(fechaFin, "d MMM yyyy", { locale: es })}`
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe size={14} />
                        <span>{inscripcion.evento.pais_sede}</span>
                      </div>
                    </div>
                    
                    {inscripcion.evento.descripcion && (
                      <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                        {inscripcion.evento.descripcion}
                      </p>
                    )}
                    
                    <div className="text-xs text-slate-500">
                      Inscrito: {format(new Date(inscripcion.fecha_inscripcion), "d MMM yyyy", { locale: es })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Acceso Rápido a Eventos */}
        {empresa?.aprobada && (
          <div className="bg-white rounded-xl border-2 border-slate-300 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Acceso Rápido</h2>
            <button
              onClick={() => navigate('/empresa/eventos')}
              className="w-full p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg border-2 border-purple-300 text-left transition-all hover:scale-105 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500 rounded-xl">
                  <Target className="text-white" size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-1">Eventos Disponibles</h3>
                  <p className="text-slate-600">
                    Explora eventos B2B y solicita participación
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
