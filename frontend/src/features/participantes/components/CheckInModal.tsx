import { useState } from 'react';
import { X, CheckCircle, UserCheck, AlertCircle } from 'lucide-react';
import { useCheckInParticipante } from '../hooks/useParticipantes';
import type { Participante } from '../api/participantesApi';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  participante: Participante | null;
}

export function CheckInModal({ isOpen, onClose, participante }: CheckInModalProps) {
  const [qrInput, setQrInput] = useState('');
  const [forceCheckIn, setForceCheckIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const checkInMutation = useCheckInParticipante();

  if (!isOpen || !participante) return null;

  const handleCheckIn = async () => {
    if (!participante) return;

    // Validación: si ya tiene check-in y no está marcado force, bloquear
    if (participante.check_in_realizado && !forceCheckIn) {
      setErrorMessage('El participante ya tiene check-in realizado. Activa "Forzar nuevo check-in" para continuar.');
      return;
    }

    setErrorMessage(''); // Limpiar error previo

    try {
      await checkInMutation.mutateAsync({
        id: participante.id,
        qrData: qrInput || undefined,
        force: forceCheckIn,
      });
      handleClose();
    } catch (error: any) {
      // Mostrar error en el modal también
      const msg = error?.response?.data?.message || 'Error al realizar check-in';
      setErrorMessage(msg);
    }
  };

  const handleClose = () => {
    setQrInput('');
    setForceCheckIn(false);
    setErrorMessage('');
    onClose();
  };

  const isAlreadyCheckedIn = participante.check_in_realizado;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-md w-full mx-4 overflow-hidden border-2 border-gray-300">
        {/* Header */}
        <div className="p-6 border-b-2 border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <UserCheck className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Check-In Participante</h3>
                <p className="text-sm text-slate-600 mt-0.5">
                  {participante.nombre_completo}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Estado actual */}
          {isAlreadyCheckedIn && (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold text-emerald-900">Ya tiene check-in realizado</p>
                  <p className="text-sm text-emerald-700 mt-1">
                    Fecha: {participante.fecha_check_in ? new Date(participante.fecha_check_in).toLocaleString('es-CL') : 'N/A'}
                  </p>
                  <p className="text-xs text-emerald-600 mt-2">
                    Puedes forzar un nuevo check-in si es necesario
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info del participante */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-slate-600">Empresa:</span>
              <span className="text-sm font-bold text-slate-900">
                {participante.empresa_nombre || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-slate-600">Email:</span>
              <span className="text-sm text-slate-900">{participante.email}</span>
            </div>
            {participante.cargo && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-slate-600">Cargo:</span>
                <span className="text-sm text-slate-900">{participante.cargo}</span>
              </div>
            )}
          </div>

          {/* Input QR (opcional) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Código QR (opcional)
            </label>
            <textarea
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="Pega aquí el contenido del código QR escaneado..."
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              disabled={checkInMutation.isPending}
            />
            <p className="text-xs text-slate-500 mt-1">
              Si no ingresas un QR, se realizará check-in manual forzado
            </p>
          </div>

          {/* Force check-in checkbox */}
          {isAlreadyCheckedIn && (
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="force-checkin"
                checked={forceCheckIn}
                onChange={(e) => setForceCheckIn(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={checkInMutation.isPending}
              />
              <label htmlFor="force-checkin" className="text-sm text-slate-700 cursor-pointer">
                Forzar nuevo check-in (sobrescribir el anterior)
              </label>
            </div>
          )}

          {/* Warning si no hay QR */}
          {!qrInput && !isAlreadyCheckedIn && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-amber-600 flex-shrink-0" size={18} />
                <p className="text-sm text-amber-800">
                  Sin código QR se realizará check-in manual sin validación
                </p>
              </div>
            </div>
          )}

          {/* Error message */}
          {errorMessage && (
            <div className="bg-red-50 border-2 border-red-400 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
                <p className="text-sm text-red-800 font-semibold">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t-2 border-gray-200 bg-gray-50 flex gap-3">
          <button
            onClick={handleClose}
            disabled={checkInMutation.isPending}
            className="flex-1 px-4 py-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-semibold transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleCheckIn}
            disabled={checkInMutation.isPending || (isAlreadyCheckedIn && !forceCheckIn)}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400 flex items-center justify-center gap-2"
            title={
              isAlreadyCheckedIn && !forceCheckIn
                ? 'Debes activar "Forzar nuevo check-in" para continuar'
                : ''
            }
          >
            {checkInMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                {isAlreadyCheckedIn ? 'Forzar Check-In' : 'Realizar Check-In'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
