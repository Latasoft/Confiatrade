"""
Script para verificar y crear bloques horarios para eventos

Este script:
1. Lista todos los eventos activos
2. Verifica si tienen bloques horarios
3. Permite generar bloques automáticamente para eventos sin bloques
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database import SessionLocal
from models.sqlalchemy.bloque_horario_model import BloqueHorarioModel
from models.sqlalchemy.evento_model import EventoModel


def verificar_bloques_horarios():
    """Verifica y muestra bloques horarios de eventos"""

    db = SessionLocal()

    try:
        print("\n" + "=" * 80)
        print("VERIFICACIÓN DE BLOQUES HORARIOS")
        print("=" * 80 + "\n")

        # 1. Obtener eventos activos
        eventos = db.query(EventoModel).filter(EventoModel.activo == True).all()

        if not eventos:
            print("⚠️  No hay eventos activos en la base de datos\n")
            print("   Crea un evento primero desde el panel de administración")
            return False

        print(f"📅 Eventos activos encontrados: {len(eventos)}\n")

        for evento in eventos:
            print(f"\n{'=' * 80}")
            print(f"Evento: {evento.nombre}")
            print(f"ID: {evento.id}")
            print(f"Fecha inicio: {evento.fecha_inicio}")
            print(f"Fecha fin: {evento.fecha_fin}")
            print(f"Ubicación: {evento.ubicacion or 'No especificada'}")
            print(f"{'=' * 80}")

            # Buscar bloques horarios del evento
            bloques = (
                db.query(BloqueHorarioModel)
                .filter(BloqueHorarioModel.evento_id == evento.id)
                .order_by(BloqueHorarioModel.fecha, BloqueHorarioModel.hora_inicio)
                .all()
            )

            if not bloques:
                print("\n❌ NO HAY BLOQUES HORARIOS PARA ESTE EVENTO")
                print("\n💡 Solución:")
                print("   1. Ir al backend en Postman o usar curl:")
                print("   POST http://localhost:8000/api/v1/bloques-horarios/generar")
                print("   ")
                print("   Body JSON:")
                print("   {")
                print(f'     "evento_id": "{evento.id}",')
                print(f'     "fecha_inicio": "{evento.fecha_inicio}",')
                print(f'     "fecha_fin": "{evento.fecha_fin}",')
                print('     "hora_inicio": "09:00:00",')
                print('     "hora_fin": "18:00:00",')
                print('     "duracion_minutos": 60,')
                print('     "label_prefijo": "Bloque"')
                print("   }\n")
                print("   2. O ejecutar desde Python:")
                print(
                    "   >>> from core.use_cases.bloques_horarios.generar_bloques_horarios import GenerarBloquesHorariosUseCase"
                )
                print(f"   >>> use_case.execute(evento_id='{evento.id}', ...)\n")
            else:
                print(f"\n✅ Bloques horarios: {len(bloques)} encontrados\n")

                # Agrupar por fecha
                bloques_por_fecha = {}
                for bloque in bloques:
                    fecha_str = bloque.fecha.strftime("%Y-%m-%d")
                    if fecha_str not in bloques_por_fecha:
                        bloques_por_fecha[fecha_str] = []
                    bloques_por_fecha[fecha_str].append(bloque)

                for fecha, bloques_dia in sorted(bloques_por_fecha.items()):
                    print(f"   📆 {fecha}: {len(bloques_dia)} bloques")
                    for bloque in bloques_dia[:5]:  # Mostrar solo los primeros 5
                        estado = "✓ Activo" if bloque.activo else "✗ Inactivo"
                        print(
                            f"      • {bloque.label}: {bloque.hora_inicio} - {bloque.hora_fin} ({estado})"
                        )

                    if len(bloques_dia) > 5:
                        print(f"      ... y {len(bloques_dia) - 5} bloques más")

        print("\n" + "=" * 80)
        print("RESUMEN")
        print("=" * 80)

        total_bloques = db.query(BloqueHorarioModel).count()
        bloques_activos = (
            db.query(BloqueHorarioModel)
            .filter(BloqueHorarioModel.activo == True)
            .count()
        )

        print(f"\n✅ Total bloques en sistema: {total_bloques}")
        print(f"✅ Bloques activos: {bloques_activos}")
        print(f"⏸️  Bloques inactivos: {total_bloques - bloques_activos}\n")

        return True

    except Exception as e:
        print(f"\n❌ Error al verificar bloques: {e}")
        import traceback

        traceback.print_exc()
        return False

    finally:
        db.close()


if __name__ == "__main__":
    success = verificar_bloques_horarios()
    sys.exit(0 if success else 1)
