"""Use case: Calcular Matches (Algoritmo de Matching)"""

import re
from typing import Optional, Set
from uuid import UUID

from core.exceptions import NotFoundException
from repositories.postgres.curaduria_repository import CuraduriaRepository


class CalcularMatchesUseCase:
    """
    Use case para calcular matches entre empresas usando algoritmo de scoring:
    - +2 puntos si tienen el mismo sector
    - +1 punto por cada keyword que A ofrece y B busca
    - +1 punto por cada keyword que A busca y B ofrece
    """

    def __init__(self, curaduria_repository: CuraduriaRepository):
        self.curaduria_repository = curaduria_repository

    def _parse_keywords(self, text: Optional[str]) -> Set[str]:
        """
        Parse texto en keywords:
        - Split por comas, saltos de línea
        - Normalizar: lowercase, strip whitespace
        - Remover vacíos y duplicados
        """
        if not text:
            return set()

        # Split por comas y saltos de línea
        keywords = re.split(r"[,\n]+", text)

        # Normalizar: lowercase, strip, remover vacíos
        normalized = {kw.strip().lower() for kw in keywords if kw.strip()}

        return normalized

    def execute(self, empresa_id: UUID, min_score: int = 0):
        """
        Calcular matches para empresa_id:
        1. Obtener curaduría de empresa target
        2. Obtener todas las demás curadurías
        3. Calcular score para cada match
        4. Filtrar por min_score y ordenar descendente
        """
        # 1. Validar que empresa target tiene curaduría
        curaduria_target = self.curaduria_repository.get_by_empresa_id(empresa_id)
        if not curaduria_target:
            # Si no tiene curaduría, retornar lista vacía (no es un error)
            return []

        # Parse keywords de empresa target
        target_ofrece = self._parse_keywords(curaduria_target.ofrece)
        target_busca = self._parse_keywords(curaduria_target.busca)

        # 2. Obtener todas las curadurías (filtraremos empresa target después)
        all_curaduria = self.curaduria_repository.get_all(skip=0, limit=1000)

        matches = []

        # 3. Calcular score para cada empresa (excepto target)
        for curaduria_b in all_curaduria:
            # Skip si es la misma empresa
            if curaduria_b.empresa_id == empresa_id:
                continue

            # Validar que tenga empresa cargada (joinedload)
            if not curaduria_b.empresa:
                continue

            score = 0
            detalles = {}

            # A. Sector match: +2 puntos
            sector_match = False
            if (
                curaduria_target.empresa
                and curaduria_b.empresa
                and curaduria_target.empresa.sector_id == curaduria_b.empresa.sector_id
            ):
                sector_match = True
                score += 2
                detalles["sector_bonus"] = 2

            # B. Parse keywords de empresa B
            b_ofrece = self._parse_keywords(curaduria_b.ofrece)
            b_busca = self._parse_keywords(curaduria_b.busca)

            # C. Keywords match: A ofrece lo que B busca
            keywords_ofrece_busca = target_ofrece & b_busca  # Intersección
            if keywords_ofrece_busca:
                score += len(keywords_ofrece_busca)
                detalles["keywords_ofrece_busca"] = list(keywords_ofrece_busca)

            # D. Keywords match: A busca lo que B ofrece
            keywords_busca_ofrece = target_busca & b_ofrece  # Intersección
            if keywords_busca_ofrece:
                score += len(keywords_busca_ofrece)
                detalles["keywords_busca_ofrece"] = list(keywords_busca_ofrece)

            # 4. Filtrar por min_score
            if score < min_score:
                continue

            # Construir match result
            match = {
                "empresa_a_id": str(empresa_id),
                "empresa_a_nombre": curaduria_target.empresa.nombre
                if curaduria_target.empresa
                else "",
                "empresa_b_id": str(curaduria_b.empresa_id),
                "empresa_b_nombre": curaduria_b.empresa.nombre,
                "score": score,
                "sector_match": sector_match,
                "keywords_ofrece_busca": list(keywords_ofrece_busca),
                "keywords_busca_ofrece": list(keywords_busca_ofrece),
                "detalles": detalles,
            }

            matches.append(match)

        # 5. Ordenar por score descendente
        matches.sort(key=lambda x: x["score"], reverse=True)

        return matches
