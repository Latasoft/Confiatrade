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
from api.schemas.qr_validation import (
    QRCheckInRequest,
    QRCheckInResponse,
    QRDataRequest,
    QRValidacionResponse,
)
from database import get_db
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from models.sqlalchemy.credencial_generada import CredencialGeneradaModel
from models.sqlalchemy.empresa import EmpresaModel
from models.sqlalchemy.participante import ParticipanteModel
from models.sqlalchemy.usuario_model import UsuarioModel
from services.pdf_generator import PDFCredencialGenerator
from services.qr_service import generate_unique_qr, validate_qr_data
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

    # Validar acceso: admin puede todo, empresa solo sus participantes
    if current_user.rol == "empresa":
        if not current_user.empresa_id:
            raise HTTPException(
                status_code=403, detail="Usuario empresa sin empresa asociada"
            )
        if participante.empresa_id != current_user.empresa_id:
            raise HTTPException(
                status_code=403,
                detail="No tienes permiso para descargar credenciales de participantes de otras empresas",
            )

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
        participante_nombre=participante.nombre_completo,
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
            "Content-Disposition": f"attachment; filename=credencial_{participante.nombre_completo.replace(' ', '_')}.pdf"
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
            filename = f"credencial_{empresa.nombre.replace(' ', '_')}_{str(empresa.id)[:8]}.pdf"
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
        pendientes=max(0, total_empresas - credenciales_empresas),  # Nunca negativo
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
                nombre=cred.participante.nombre_completo,
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


@router.post("/validar", response_model=QRValidacionResponse)
def validar_qr(
    request: QRDataRequest,
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_user),
):
    """
    Validar un código QR escaneado.

    Verifica:
    - Hash del QR (autenticidad)
    - Existencia de empresa/participante
    - Estado de aprobación
    - Datos de la entidad
    """
    # Validar estructura y hash del QR
    qr_data = validate_qr_data(request.qr_json)

    if not qr_data:
        return QRValidacionResponse(
            valido=False, razon="QR inválido o corrupto. El hash no coincide."
        )

    tipo = qr_data.get("tipo")
    entity_id = qr_data.get("id")
    evento_id = qr_data.get("evento_id")
    timestamp = qr_data.get("timestamp")

    # Validar empresa
    if tipo == "empresa":
        empresa = db.query(EmpresaModel).filter(EmpresaModel.id == entity_id).first()

        if not empresa:
            return QRValidacionResponse(
                valido=False,
                razon=f"Empresa con ID {entity_id} no encontrada en el sistema.",
                tipo=tipo,
                entity_id=entity_id,
            )

        return QRValidacionResponse(
            valido=True,
            tipo=tipo,
            entity_id=empresa.id,
            evento_id=evento_id,
            timestamp=timestamp,
            nombre=empresa.nombre,
            email=empresa.email,
            aprobada=empresa.aprobada,
            telefono=empresa.telefono,
            pais_nombre=empresa.pais.nombre if empresa.pais else None,
            sector_nombre=empresa.sector.nombre if empresa.sector else None,
        )

    # Validar participante
    elif tipo == "participante":
        participante = (
            db.query(ParticipanteModel)
            .filter(ParticipanteModel.id == entity_id)
            .first()
        )

        if not participante:
            return QRValidacionResponse(
                valido=False,
                razon=f"Participante con ID {entity_id} no encontrado en el sistema.",
                tipo=tipo,
                entity_id=entity_id,
            )

        # Verificar que la empresa esté aprobada
        empresa_aprobada = participante.empresa and participante.empresa.aprobada

        return QRValidacionResponse(
            valido=True,
            tipo=tipo,
            entity_id=participante.id,
            evento_id=evento_id,
            timestamp=timestamp,
            nombre=participante.nombre_completo,
            email=participante.email,
            empresa_nombre=participante.empresa.nombre
            if participante.empresa
            else None,
            aprobada=empresa_aprobada,
            telefono=participante.telefono,
        )

    return QRValidacionResponse(valido=False, razon=f"Tipo de QR desconocido: {tipo}")


@router.post("/check-in", response_model=QRCheckInResponse)
def check_in_desde_qr(
    request: QRCheckInRequest,
    db: Session = Depends(get_db),
    current_user: UsuarioModel = Depends(get_current_user),
):
    """
    Registrar check-in escaneando QR de participante.

    Flujo:
    1. Validar QR
    2. Verificar que sea participante (no empresa)
    3. Verificar que empresa esté aprobada
    4. Registrar o actualizar check-in
    """
    # Validar QR primero
    qr_data = validate_qr_data(request.qr_json)

    if not qr_data:
        return QRCheckInResponse(success=False, message="QR inválido o corrupto")

    tipo = qr_data.get("tipo")
    entity_id = qr_data.get("id")

    # Solo se puede hacer check-in de participantes
    if tipo != "participante":
        return QRCheckInResponse(
            success=False,
            message=f"Este QR es de tipo '{tipo}'. Solo se puede hacer check-in de participantes.",
        )

    # Buscar participante
    participante = (
        db.query(ParticipanteModel).filter(ParticipanteModel.id == entity_id).first()
    )

    if not participante:
        return QRCheckInResponse(
            success=False, message=f"Participante no encontrado (ID: {entity_id})"
        )

    # Verificar empresa aprobada
    if not participante.empresa or not participante.empresa.aprobada:
        empresa_nombre = (
            participante.empresa.nombre if participante.empresa else "Sin empresa"
        )
        return QRCheckInResponse(
            success=False,
            message=f"La empresa '{empresa_nombre}' no está aprobada",
            participante_id=participante.id,
            participante_nombre=participante.nombre_completo,
            empresa_nombre=empresa_nombre,
        )

    # Verificar si ya tiene check-in
    ya_registrado = participante.check_in_realizado

    # Registrar check-in
    if not ya_registrado:
        participante.check_in_realizado = True
        participante.fecha_check_in = datetime.utcnow()
        db.commit()
        db.refresh(participante)

        return QRCheckInResponse(
            success=True,
            message=f"✅ Check-in exitoso para {participante.nombre_completo}",
            participante_id=participante.id,
            participante_nombre=participante.nombre_completo,
            empresa_nombre=participante.empresa.nombre,
            ya_registrado=False,
            fecha_check_in=participante.fecha_check_in,
        )
    else:
        # Ya tenía check-in, retornar info
        return QRCheckInResponse(
            success=True,
            message=f"{participante.nombre_completo} ya tiene check-in registrado",
            participante_id=participante.id,
            participante_nombre=participante.nombre_completo,
            empresa_nombre=participante.empresa.nombre,
            ya_registrado=True,
            fecha_check_in=participante.fecha_check_in,
        )
