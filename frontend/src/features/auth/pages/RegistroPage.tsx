import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useRegistroEmpresa } from '../hooks/useAuth';
import { usePaises, useSectores } from '@/shared/hooks/useCatalogos';
import { empresasApi } from '@/features/empresas/api/empresasApi';
import {
  Building2,
  Mail,
  Lock,
  User,
  Globe,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle,
  Upload,
  X,
} from 'lucide-react';
import type { RegistroEmpresaData } from '../api/authApi';

export default function RegistroPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [presentacionFile, setPresentacionFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegistroEmpresaData>();
  const registroMutation = useRegistroEmpresa();
  const { data: paises = [], isLoading: loadingPaises } = usePaises();
  const { data: sectores = [], isLoading: loadingSectores } = useSectores();

  const onSubmit = async (data: RegistroEmpresaData) => {
    try {
      const response = await registroMutation.mutateAsync(data);
      
      // Si hay un PDF, subirlo después del registro exitoso
      if (presentacionFile && response.user.empresa_id) {
        try {
          await empresasApi.uploadPresentacion(response.user.empresa_id, presentacionFile);
        } catch (error) {
          console.error('Error al subir presentación:', error);
          // No bloqueamos el registro si falla la subida del PDF
        }
      }
    } catch (error) {
      console.error('Error en registro:', error);
    }
  };

  const Step1 = () => (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Nombre Completo *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              {...register('nombre_completo', {
                required: 'El nombre es requerido',
                minLength: { value: 2, message: 'Mínimo 2 caracteres' }
              })}
              className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
              placeholder="Juan Pérez"
            />
          </div>
          {errors.nombre_completo && (
            <p className="mt-1 text-sm text-red-600">{errors.nombre_completo.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              {...register('email', {
                required: 'El email es requerido',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido'
                }
              })}
              type="email"
              className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
              placeholder="correo@empresa.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Contraseña *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            {...register('password', {
              required: 'La contraseña es requerida',
              minLength: { value: 8, message: 'Mínimo 8 caracteres' }
            })}
            type={showPassword ? 'text' : 'password'}
            className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 text-sm font-medium"
          >
            {showPassword ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
        <p className="mt-1 text-xs text-slate-500">Mínimo 8 caracteres</p>
      </div>

      <button
        type="button"
        onClick={() => {
          const nombre = watch('nombre_completo');
          const email = watch('email');
          const password = watch('password');
          if (nombre && email && password) {
            setStep(2);
          }
        }}
        className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
      >
        Siguiente: Datos de Empresa
      </button>
    </div>
  );

  const Step2 = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Nombre de la Empresa *
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            {...register('nombre_empresa', {
              required: 'El nombre de empresa es requerido',
              minLength: { value: 2, message: 'Mínimo 2 caracteres' }
            })}
            className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
            placeholder="Mi Empresa S.A."
          />
        </div>
        {errors.nombre_empresa && (
          <p className="mt-1 text-sm text-red-600">{errors.nombre_empresa.message}</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            País *
          </label>
          <select
            {...register('pais_id', {
              required: 'El país es requerido',
              valueAsNumber: true
            })}
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
            disabled={loadingPaises}
          >
            <option value="">Selecciona un país</option>
            {paises.map((pais) => (
              <option key={pais.id} value={pais.id}>
                {pais.nombre}
              </option>
            ))}
          </select>
          {errors.pais_id && (
            <p className="mt-1 text-sm text-red-600">{errors.pais_id.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Sector *
          </label>
          <select
            {...register('sector_id', {
              required: 'El sector es requerido',
              valueAsNumber: true
            })}
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
            disabled={loadingSectores}
          >
            <option value="">Selecciona un sector</option>
            {sectores.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.nombre}
              </option>
            ))}
          </select>
          {errors.sector_id && (
            <p className="mt-1 text-sm text-red-600">{errors.sector_id.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Descripción
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 text-slate-400" size={20} />
          <textarea
            {...register('descripcion')}
            rows={3}
            className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
            placeholder="Describe tu empresa..."
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Sitio Web
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              {...register('sitio_web')}
              type="url"
              className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
              placeholder="https://www.empresa.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Teléfono
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              {...register('telefono')}
              type="tel"
              className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
              placeholder="+1 234 567 8900"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Dirección
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 text-slate-400" size={20} />
          <textarea
            {...register('direccion')}
            rows={2}
            className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
            placeholder="Dirección completa"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Presentación de la Empresa (PDF) <span className="text-slate-500 font-normal">(Opcional)</span>
        </label>
        <div className="space-y-3">
          {presentacionFile ? (
            <div className="flex items-center justify-between p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="text-blue-600" size={24} />
                <div>
                  <p className="font-medium text-slate-700">{presentacionFile.name}</p>
                  <p className="text-sm text-slate-500">
                    {(presentacionFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPresentacionFile(null)}
                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
              >
                <X className="text-red-600" size={20} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Upload className="text-slate-400" size={20} />
              <span className="text-slate-600 font-medium">Subir presentación PDF</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.type !== 'application/pdf') {
                  alert('Solo se permiten archivos PDF');
                  return;
                }
                if (file.size > 5 * 1024 * 1024) {
                  alert('El archivo no debe superar los 5MB');
                  return;
                }
                setPresentacionFile(file);
              }
            }}
          />
          <p className="text-xs text-slate-500">
            Puedes subir un PDF con información sobre tu empresa (máximo 5MB)
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all font-semibold"
        >
          Atrás
        </button>
        <button
          type="submit"
          disabled={registroMutation.isPending}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          {registroMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Registrando...</span>
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              <span>Registrar Empresa</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Registrar Empresa</h1>
          <p className="text-slate-600">Completa los datos para participar en eventos B2B</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-6 flex items-center justify-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step === 1 ? 'bg-blue-500 text-white' : 'bg-white text-slate-600'}`}>
            <span className="font-semibold">1</span>
            <span className="text-sm">Usuario</span>
          </div>
          <div className="h-0.5 w-12 bg-slate-300"></div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step === 2 ? 'bg-blue-500 text-white' : 'bg-white text-slate-600'}`}>
            <span className="font-semibold">2</span>
            <span className="text-sm">Empresa</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl border-2 border-slate-300 shadow-lg p-8">
          {registroMutation.isError && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg flex items-start gap-2">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-semibold text-red-800">Error al registrar empresa</p>
                <p className="text-sm text-red-700">Verifica los datos e intenta nuevamente</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 ? <Step1 /> : <Step2 />}
          </form>

          <div className="mt-6 pt-6 border-t-2 border-slate-200 text-center">
            <p className="text-slate-600">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 text-center">
            <strong>Nota:</strong> Tu empresa será revisada por un administrador antes de poder acceder a todos los eventos.
          </p>
        </div>
      </div>
    </div>
  );
}
