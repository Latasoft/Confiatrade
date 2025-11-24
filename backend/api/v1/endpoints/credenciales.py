"""Endpoints para generación de credenciales"""

import hashlib
import zipfile
from datetime import datetime
from io import BytesIO
from typing import List, Optional

from api.dependencies.auth import get_current_user
from api.schemas.credencial import (
    CredencialesStatsResponse,
    CredencialHistorialItem,
    CredencialHistorialResponse,
    EntidadInfo,
)
from database import get_db
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from models.sqlalchemy.credencial_generada import CredencialGeneradaModel
from models.sqlalchemy.empresa import EmpresaModel
from models.sqlalchemy.participante import ParticipanteModel
from models.sqlalchemy.usuario_model import UsuarioModel
from services.pdf_generator import PDFCredencialGenerator
from services.qr_service import generate_unique_qr
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/empresa/{empresa_id}/pdf")
def generar_credencial_empresa(
    empresa_id: str,
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_user),
):
    """Generar credencial en PDF para una empresa"""

    # Buscar empresa
    empresa = db.query(EmpresaModel).filter(EmpresaModel.id == empresa_id).first()

    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    if not empresa.aprobada:
        raise HTTPException(
            status_code=400,
            detail="La empresa debe estar aprobada para generar credencial",
        )

    # Generar QR único para la empresa
    _, qr_data_json = generate_unique_qr(
        tipo="empresa",
        entity_id=str(empresa.id),
        evento_id=None,
        include_timestamp=True,
    )

    # Generar PDF profesional con QR
    pdf_generator = PDFCredencialGenerator()
    pdf_buffer = pdf_generator.generar_badge_empresa(
        empresa_nombre=empresa.nombre,
        empresa_email=empresa.email,
        empresa_pais=empresa.pais.nombre if empresa.pais else "N/A",
        empresa_sector=empresa.sector.nombre if empresa.sector else "N/A",
        qr_data_json=qr_data_json,
        formato="badge",
    )

    # Calcular hash del PDF para verificación
    pdf_content = pdf_buffer.getvalue()
    pdf_hash = hashlib.sha256(pdf_content).hexdigest()

    # Registrar credencial generada para tracking
    credencial = CredencialGeneradaModel(
        empresa_id=empresa.id,
        tipo="empresa",
        fecha_generacion=datetime.utcnow(),
        generada_por=current_user.id,
        pdf_hash=pdf_hash,
        formato="badge",
    )
    db.add(credencial)
    db.commit()

    # Resetear buffer para enviar
    pdf_buffer.seek(0)

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=credencial_{empresa.nombre.replace(' ', '_')}.pdf"
        },
    )


@router.get("/participante/{participante_id}/pdf")
def generar_credencial_participante(
    participante_id: str,
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_user),
):
    """Generar credencial en PDF para un participante"""

    participante = (
        db.query(ParticipanteModel)
        .filter(ParticipanteModel.id == participante_id)
        .first()
    )

    if not participante:
        raise HTTPException(status_code=404, detail="Participante no encontrado")

    # Generar QR único para el participante
    _, qr_data_json = generate_unique_qr(
        tipo="participante",
        entity_id=str(participante.id),
        evento_id=None,
        include_timestamp=True,
    )

    # Generar PDF profesional con QR
    pdf_generator = PDFCredencialGenerator()
    pdf_buffer = pdf_generator.generar_badge_participante(
        participante_nombre=participante.nombre,
        participante_cargo=participante.cargo or "Participante",
        participante_email=participante.email,
        empresa_nombre=participante.empresa.nombre if participante.empresa else "N/A",
        qr_data_json=qr_data_json,
        formato="badge",
    )

    # Calcular hash del PDF para verificación
    pdf_content = pdf_buffer.getvalue()
    pdf_hash = hashlib.sha256(pdf_content).hexdigest()

    # Registrar credencial generada para tracking
    credencial = CredencialGeneradaModel(
        participante_id=participante.id,
        tipo="participante",
        fecha_generacion=datetime.utcnow(),
        generada_por=current_user.id,
        pdf_hash=pdf_hash,
        formato="badge",
    )
    db.add(credencial)
    db.commit()

    # Resetear buffer para enviar
    pdf_buffer.seek(0)

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=credencial_{participante.nombre.replace(' ', '_')}.pdf"
        },
    )


@router.post("/batch/empresas")
def generar_credenciales_empresas_batch(
    empresa_ids: List[str],
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_user),
):
    """Generar credenciales en batch para múltiples empresas - retorna ZIP con PDFs"""

    empresas = (
        db.query(EmpresaModel)
        .filter(EmpresaModel.id.in_(empresa_ids), EmpresaModel.aprobada.is_(True))
        .all()
    )

    if not empresas:
        raise HTTPException(
            status_code=404,
            detail="No se encontraron empresas aprobadas con los IDs proporcionados",
        )

    # Crear ZIP con múltiples PDFs
    zip_buffer = BytesIO()
    pdf_generator = PDFCredencialGenerator()

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for empresa in empresas:
            # Generar QR único
            _, qr_data_json = generate_unique_qr(
                tipo="empresa",
                entity_id=str(empresa.id),
                evento_id=None,
                include_timestamp=True,
            )

            # Generar PDF
            pdf_buffer = pdf_generator.generar_badge_empresa(
                empresa_nombre=empresa.nombre,
                empresa_email=empresa.email,
                empresa_pais=empresa.pais.nombre if empresa.pais else "N/A",
                empresa_sector=empresa.sector.nombre if empresa.sector else "N/A",
                qr_data_json=qr_data_json,
                formato="badge",
            )

            # Calcular hash y registrar
            pdf_content = pdf_buffer.getvalue()
            pdf_hash = hashlib.sha256(pdf_content).hexdigest()

            credencial = CredencialGeneradaModel(
                empresa_id=empresa.id,
                tipo="empresa",
                fecha_generacion=datetime.utcnow(),
                generada_por=current_user.id,
                pdf_hash=pdf_hash,
                formato="badge",
            )
            db.add(credencial)

            # Agregar PDF al ZIP
            filename = (
                f"credencial_{empresa.nombre.replace(' ', '_')}_{empresa.id[:8]}.pdf"
            )
            zip_file.writestr(filename, pdf_content)

    db.commit()

    # Resetear buffer y enviar ZIP
    zip_buffer.seek(0)

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=credenciales_batch.zip"},
    )


@router.get("/stats", response_model=CredencialesStatsResponse)
def obtener_estadisticas_credenciales(db: Session = Depends(get_db)):
    """Obtener estadísticas de credenciales generadas con tracking real"""

    total_empresas = (
        db.query(EmpresaModel).filter(EmpresaModel.aprobada.is_(True)).count()
    )
    total_participantes = db.query(ParticipanteModel).count()

    # Contar credenciales generadas por tipo
    credenciales_empresas = (
        db.query(CredencialGeneradaModel)
        .filter(CredencialGeneradaModel.tipo == "empresa")
        .count()
    )
    credenciales_participantes = (
        db.query(CredencialGeneradaModel)
        .filter(CredencialGeneradaModel.tipo == "participante")
        .count()
    )

    total_generadas = credenciales_empresas + credenciales_participantes

    # Obtener fecha de última generación
    ultima_credencial = (
        db.query(CredencialGeneradaModel)
        .order_by(CredencialGeneradaModel.fecha_generacion.desc())
        .first()
    )

    return CredencialesStatsResponse(
        total_empresas_aprobadas=total_empresas,
        total_participantes=total_participantes,
        credenciales_generadas=total_generadas,
        credenciales_empresas=credenciales_empresas,
        credenciales_participantes=credenciales_participantes,
        pendientes=total_empresas - credenciales_empresas,
        ultima_generacion=ultima_credencial.fecha_generacion
        if ultima_credencial
        else None,
    )


@router.get("/historial", response_model=CredencialHistorialResponse)
def obtener_historial_credenciales(
    skip: int = 0,
    limit: int = 50,
    tipo: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Obtener historial paginado de credenciales generadas"""

    query = db.query(CredencialGeneradaModel)

    # Filtrar por tipo si se especifica
    if tipo and tipo in ["empresa", "participante"]:
        query = query.filter(CredencialGeneradaModel.tipo == tipo)

    # Ordenar por fecha descendente
    query = query.order_by(CredencialGeneradaModel.fecha_generacion.desc())

    # Paginación
    total = query.count()
    credenciales = query.offset(skip).limit(limit).all()

    # Construir respuesta con información relacionada
    items = []
    for cred in credenciales:
        entidad_info = None

        # Agregar información de la entidad
        if cred.tipo == "empresa" and cred.empresa:
            entidad_info = EntidadInfo(
                id=cred.empresa.id, nombre=cred.empresa.nombre, email=cred.empresa.email
            )
        elif cred.tipo == "participante" and cred.participante:
            entidad_info = EntidadInfo(
                id=cred.participante.id,
                nombre=cred.participante.nombre,
                email=cred.participante.email,
                empresa=cred.participante.empresa.nombre
                if cred.participante.empresa
                else None,
            )

        item = CredencialHistorialItem(
            id=cred.id,
            tipo=cred.tipo,
            fecha_generacion=cred.fecha_generacion,
            formato=cred.formato,
            pdf_hash=cred.pdf_hash[:16] + "...",
            entidad=entidad_info,
        )
        items.append(item)

    return CredencialHistorialResponse(total=total, skip=skip, limit=limit, items=items)
