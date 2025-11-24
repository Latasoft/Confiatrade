import { useState } from 'react';
import { Calendar, TrendingUp, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { MatchScore } from '../api/curaduriaApi';
import { ReunionModal } from '@/features/agenda/components/ReunionModal';

interface MatchCardProps {
  match: MatchScore;
}

export function MatchCard({ match }: MatchCardProps) {
  const navigate = useNavigate();
  const [showReunionModal, setShowReunionModal] = useState(false);
  
  const totalKeywords =
    match.keywords_ofrece_busca.length + match.keywords_busca_ofrece.length;

  const handleAgendarReunion = () => {
    setShowReunionModal(true);
  };

  const handleVerPerfil = () => {
    navigate(`/empresas?empresa_id=${match.empresa_b_id}`);
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-300 transition p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {match.empresa_b_nombre}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {match.sector_match && (
              <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full">
                <TrendingUp size={14} />
                Mismo Sector
              </span>
            )}
            <span>{totalKeywords} keywords coincidentes</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div
            className={`
            text-3xl font-bold
            ${match.score >= 5 ? 'text-green-600' : match.score >= 3 ? 'text-blue-600' : 'text-gray-600'}
          `}
          >
            {match.score}
          </div>
          <span className="text-xs text-gray-500">score</span>
        </div>
      </div>

      {/* Keywords Matches */}
      {(match.keywords_ofrece_busca.length > 0 ||
        match.keywords_busca_ofrece.length > 0) && (
        <div className="space-y-3">
          {match.keywords_ofrece_busca.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Lo que ofreces y ellos buscan:
              </p>
              <div className="flex flex-wrap gap-2">
                {match.keywords_ofrece_busca.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {match.keywords_busca_ofrece.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Lo que buscas y ellos ofrecen:
              </p>
              <div className="flex flex-wrap gap-2">
                {match.keywords_busca_ofrece.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 pt-4 border-t flex gap-3">
        <button 
          onClick={handleAgendarReunion}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Calendar size={16} />
          Agendar Reunión
        </button>
        <button 
          onClick={handleVerPerfil}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
        >
          <User size={16} />
          Ver Perfil
        </button>
      </div>

      {/* Modal de reunión */}
      <ReunionModal
        isOpen={showReunionModal}
        onClose={() => setShowReunionModal(false)}
        preselectedEmpresas={{
          empresa_a_id: match.empresa_a_id,
          empresa_b_id: match.empresa_b_id,
        }}
      />
    </div>
  );
}
