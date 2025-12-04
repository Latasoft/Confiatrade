import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useValidarQR, useCheckInDesdeQR } from '../hooks/useQRValidation';
import { useNotificationStore } from '@/shared/store/notificationStore';
import { 
  QrCode, 
  Camera, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Clock,
  Scan,
  CameraOff
} from 'lucide-react';

export default function ValidarQRPage() {
  const [scanMode, setScanMode] = useState<'validar' | 'checkin'>('validar');
  const [manualInput, setManualInput] = useState('');
  const [lastScan, setLastScan] = useState<any>(null);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  
  const validarQR = useValidarQR();
  const checkInQR = useCheckInDesdeQR();
  const notify = useNotificationStore((state) => state.add);
  
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const qrReaderDivId = 'qr-reader';

  // Procesar código QR escaneado
  const onScanSuccess = async (decodedText: string) => {
    // Evitar procesar el mismo código múltiples veces
    if (decodedText === lastScannedCode) return;
    
    setLastScannedCode(decodedText);
    console.log('QR escaneado:', decodedText);

    try {
      if (scanMode === 'validar') {
        const result = await validarQR.mutateAsync(decodedText);
        setLastScan(result);
        
        if (result.valido) {
          notify({
            type: 'success',
            message: `QR válido: ${result.nombre || 'Credencial verificada'}`,
            title: '✓ Validación exitosa',
          });
        } else {
          notify({
            type: 'error',
            message: result.razon || 'Código QR no válido',
            title: '✗ Validación fallida',
          });
        }
      } else {
        const result = await checkInQR.mutateAsync({ qrJson: decodedText });
        setLastScan(result);
        
        if (result.success) {
          notify({
            type: 'success',
            message: `Check-in registrado: ${result.participante_nombre || 'Participante'}`,
            title: '✓ Check-in exitoso',
          });
        } else {
          notify({
            type: 'warning',
            message: result.message || 'No se pudo registrar el check-in',
            title: '⚠ Atención',
          });
        }
      }
      
      // Sonido de éxito (opcional)
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKzn77RgGwU7k9n0yXkpBSh+zPLaizsKGGS56+mjUBELTKXh8bllHAU2jdXzzn0vBSeFz/PajDwLGWe+8+ihUBILTKPi8bllHAU1jdT0z3wwBSaFz/PbjDsLGGa88OihUBIMS6Li8r') as any;
      audio?.play().catch(() => {});
      
    } catch (error: any) {
      console.error('Error al procesar QR:', error);
      const errorMsg = error?.response?.data?.detail || 'Error al procesar QR';
      
      setLastScan({
        valido: false,
        success: false,
        razon: errorMsg
      });
      
      notify({
        type: 'error',
        message: errorMsg,
        title: '✗ Error de procesamiento',
      });
    }
    
    // Resetear después de 2 segundos para permitir nuevos escaneos
    setTimeout(() => {
      setLastScannedCode('');
    }, 2000);
  };

  // Iniciar cámara
  const startCamera = async () => {
    try {
      setCameraError(null);
      setScanning(true); // Cambiar estado primero para renderizar el div
      
      // Esperar un momento para que el DOM se actualice
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verificar que el elemento existe
      const element = document.getElementById(qrReaderDivId);
      if (!element) {
        throw new Error('Elemento de lector QR no encontrado');
      }
      
      // Si ya existe una instancia, detenerla primero
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (e) {
          // Ignorar errores al detener
        }
      }
      
      // Crear nueva instancia
      html5QrCodeRef.current = new Html5Qrcode(qrReaderDivId);

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' }, // Cámara trasera en móviles
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        onScanSuccess,
        undefined // onScanError - ignoramos errores de escaneo
      );
      
    } catch (error: any) {
      console.error('Error al acceder a la cámara:', error);
      setCameraError(error?.message || 'No se pudo acceder a la cámara');
      setScanning(false);
    }
  };

  // Detener cámara
  const stopCamera = async () => {
    try {
      if (html5QrCodeRef.current && scanning) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      }
      setScanning(false);
      setLastScannedCode('');
    } catch (error) {
      console.error('Error al detener cámara:', error);
    }
  };

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop().catch(() => {});
        } catch (e) {
          // Ignorar errores al limpiar
        }
      }
    };
  }, []);

  // Detener cámara al cambiar modo de escaneo
  useEffect(() => {
    if (scanning) {
      stopCamera();
    }
  }, [scanMode]);

  const handleManualScan = async () => {
    if (!manualInput.trim()) return;

    try {
      if (scanMode === 'validar') {
        const result = await validarQR.mutateAsync(manualInput);
        setLastScan(result);
        
        if (result.valido) {
          notify({
            type: 'success',
            message: `QR válido: ${result.nombre || 'Credencial verificada'}`,
            title: '✓ Validación exitosa',
          });
        } else {
          notify({
            type: 'error',
            message: result.razon || 'Código QR no válido',
            title: '✗ Validación fallida',
          });
        }
      } else {
        const result = await checkInQR.mutateAsync({ qrJson: manualInput });
        setLastScan(result);
        
        if (result.success) {
          notify({
            type: 'success',
            message: `Check-in registrado: ${result.participante_nombre || 'Participante'}`,
            title: '✓ Check-in exitoso',
          });
        } else {
          notify({
            type: 'warning',
            message: result.message || 'No se pudo registrar el check-in',
            title: '⚠ Atención',
          });
        }
      }
      setManualInput('');
    } catch (error: any) {
      console.error('Error al procesar QR:', error);
      const errorMsg = error?.response?.data?.detail || 'Error al procesar QR';
      
      setLastScan({
        valido: false,
        success: false,
        razon: errorMsg
      });
      
      notify({
        type: 'error',
        message: errorMsg,
        title: '✗ Error de procesamiento',
      });
    }
  };

  const renderValidationResult = (result: any) => {
    if (!result) return null;

    // Resultado de check-in
    if ('success' in result) {
      return (
        <div className={`rounded-xl border-2 p-6 ${
          result.success 
            ? 'bg-green-50 border-green-300' 
            : 'bg-red-50 border-red-300'
        }`}>
          <div className="flex items-start gap-4">
            {result.success ? (
              <CheckCircle className="text-green-600 flex-shrink-0" size={48} />
            ) : (
              <XCircle className="text-red-600 flex-shrink-0" size={48} />
            )}
            
            <div className="flex-1">
              <h3 className={`text-xl font-bold mb-2 ${
                result.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {result.message}
              </h3>
              
              {result.participante_nombre && (
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <User size={18} />
                    <span className="font-medium">{result.participante_nombre}</span>
                  </div>
                  {result.empresa_nombre && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Building2 size={18} />
                      <span>{result.empresa_nombre}</span>
                    </div>
                  )}
                  {result.fecha_check_in && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Clock size={16} />
                      <span>
                        {new Date(result.fecha_check_in).toLocaleString('es', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </span>
                    </div>
                  )}
                  {result.ya_registrado && (
                    <div className="mt-3 px-3 py-2 bg-blue-100 border border-blue-300 rounded-lg text-sm text-blue-800">
                      Check-in previamente registrado
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Resultado de validación
    return (
      <div className={`rounded-xl border-2 p-6 ${
        result.valido 
          ? 'bg-green-50 border-green-300' 
          : 'bg-red-50 border-red-300'
      }`}>
        <div className="flex items-start gap-4">
          {result.valido ? (
            <CheckCircle className="text-green-600 flex-shrink-0" size={48} />
          ) : (
            <XCircle className="text-red-600 flex-shrink-0" size={48} />
          )}
          
          <div className="flex-1">
            <h3 className={`text-xl font-bold mb-2 ${
              result.valido ? 'text-green-900' : 'text-red-900'
            }`}>
              {result.valido ? 'QR Válido' : 'QR Inválido'}
            </h3>
            
            {result.razon && (
              <p className="text-red-800 mb-4">{result.razon}</p>
            )}
            
            {result.valido && result.nombre && (
              <div className="space-y-3 mt-4 border-t border-green-200 pt-4">
                <div className="flex items-center gap-3">
                  {result.tipo === 'empresa' ? (
                    <Building2 className="text-green-600" size={20} />
                  ) : (
                    <User className="text-green-600" size={20} />
                  )}
                  <div>
                    <p className="text-xs text-green-600 uppercase font-semibold">
                      {result.tipo}
                    </p>
                    <p className="text-lg font-bold text-gray-900">{result.nombre}</p>
                  </div>
                </div>
                
                {result.email && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail size={18} />
                    <span>{result.email}</span>
                  </div>
                )}
                
                {result.telefono && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone size={18} />
                    <span>{result.telefono}</span>
                  </div>
                )}
                
                {result.empresa_nombre && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Building2 size={18} />
                    <span>{result.empresa_nombre}</span>
                  </div>
                )}
                
                {result.pais_nombre && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin size={18} />
                    <span>{result.pais_nombre}</span>
                  </div>
                )}
                
                {result.sector_nombre && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Briefcase size={18} />
                    <span>{result.sector_nombre}</span>
                  </div>
                )}
                
                {result.aprobada !== undefined && (
                  <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    result.aprobada
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {result.aprobada ? 'Aprobada' : 'Pendiente de aprobación'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <QrCode className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Validador de QR</h1>
        </div>
        <p className="text-gray-600">
          Escanea o pega el código QR de credenciales para validar y registrar check-in
        </p>
      </div>

      {/* Selector de modo */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-4 mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Modo de escaneo:
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => setScanMode('validar')}
            className={`flex-1 px-4 py-3 rounded-lg border-2 transition font-medium ${
              scanMode === 'validar'
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
            }`}
          >
            <Scan className="inline mr-2" size={20} />
            Solo Validar
          </button>
          <button
            onClick={() => setScanMode('checkin')}
            className={`flex-1 px-4 py-3 rounded-lg border-2 transition font-medium ${
              scanMode === 'checkin'
                ? 'bg-green-50 border-green-500 text-green-700'
                : 'bg-white border-gray-300 text-gray-700 hover:border-green-300'
            }`}
          >
            <CheckCircle className="inline mr-2" size={20} />
            Check-in Automático
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          {scanMode === 'validar' 
            ? 'Solo verifica la validez del QR sin registrar asistencia'
            : 'Valida y registra el check-in automáticamente'}
        </p>
      </div>

      {/* Entrada manual (alternativa a cámara) */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Entrada Manual de QR
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Pega aquí el contenido JSON del código QR:
        </p>
        <textarea
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder='{"tipo":"participante","id":"...","hash":"..."}'
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm"
          rows={4}
        />
        <button
          onClick={handleManualScan}
          disabled={!manualInput.trim() || validarQR.isPending || checkInQR.isPending}
          className="mt-4 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
        >
          <QrCode size={20} />
          {validarQR.isPending || checkInQR.isPending 
            ? 'Procesando...' 
            : scanMode === 'validar' ? 'Validar QR' : 'Validar y Check-in'}
        </button>
      </div>

      {/* Escaneo con cámara */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Camera className="text-blue-600" size={24} />
          <h2 className="text-lg font-bold text-gray-900">Escaneo con Cámara</h2>
        </div>
        
        {!scanning ? (
          <div className="text-center py-8">
            <Camera className="mx-auto text-blue-400 mb-4" size={64} />
            <p className="text-gray-700 mb-4">
              Activa la cámara para escanear códigos QR automáticamente
            </p>
            
            {cameraError && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-300 rounded-lg text-sm text-red-800">
                <AlertCircle className="inline mr-2" size={16} />
                <strong>Error:</strong> {cameraError}
              </div>
            )}
            
            <button
              onClick={startCamera}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2 mx-auto"
            >
              <Camera size={20} />
              Activar Cámara
            </button>
            
            <p className="mt-4 text-xs text-gray-600">
              Se requiere permiso para acceder a la cámara
            </p>
          </div>
        ) : (
          <div>
            <div 
              id={qrReaderDivId} 
              className="w-full rounded-lg border-2 border-blue-300 mb-4 overflow-hidden"
              style={{ minHeight: '300px' }}
            />
            
            <button
              onClick={stopCamera}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium flex items-center justify-center gap-2"
            >
              <CameraOff size={20} />
              Detener Cámara
            </button>
            
            <div className="mt-3 px-4 py-3 bg-green-50 border border-green-300 rounded-lg text-sm text-green-800">
              <CheckCircle className="inline mr-2" size={16} />
              <strong>Listo:</strong> Apunta la cámara al código QR para escanearlo automáticamente
            </div>
          </div>
        )}
      </div>

      {/* Resultado del último escaneo */}
      {lastScan && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Resultado:</h2>
          {renderValidationResult(lastScan)}
        </div>
      )}

      {/* Instrucciones */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Scan size={24} className="text-blue-600" />
          Instrucciones de uso
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-blue-100">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700 font-bold">
              1
            </div>
            <div>
              <p className="font-semibold text-gray-900">Elige el modo</p>
              <p className="text-sm text-gray-600">Selecciona si solo quieres validar o registrar asistencia</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-blue-100">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700 font-bold">
              2
            </div>
            <div>
              <p className="font-semibold text-gray-900">Activa la cámara</p>
              <p className="text-sm text-gray-600">Presiona "Activar Cámara" y apunta al código QR de la credencial</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-blue-100">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700 font-bold">
              3
            </div>
            <div>
              <p className="font-semibold text-gray-900">Escanea automáticamente</p>
              <p className="text-sm text-gray-600">El sistema detectará y validará el QR al instante</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-800">
            <strong>Tip:</strong> En modo Check-in, la asistencia se registra automáticamente sin pasos adicionales.
          </p>
        </div>
      </div>
    </div>
  );
}
