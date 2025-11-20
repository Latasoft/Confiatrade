"""Servicio de generación de PDFs profesionales para credenciales"""

from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas
from services.qr_service import generate_qr_image_for_pdf


class PDFCredencialGenerator:
    """Generador de credenciales en PDF con diseño profesional"""

    # Colores corporativos ConfiaGlobal
    COLOR_PRIMARY = colors.HexColor("#2563eb")  # Blue-600
    COLOR_SECONDARY = colors.HexColor("#60a5fa")  # Blue-400
    COLOR_TEXT = colors.HexColor("#1e293b")  # Slate-800
    COLOR_TEXT_LIGHT = colors.HexColor("#64748b")  # Slate-500
    COLOR_BG_LIGHT = colors.HexColor("#f8fafc")  # Slate-50

    # Tamaños de página
    SIZE_BADGE = (10 * cm, 15 * cm)  # Badge estándar
    SIZE_LANYARD = (9 * cm, 14 * cm)  # Lanyard ID card

    def __init__(self):
        self.buffer = BytesIO()

    def generar_badge_empresa(
        self,
        empresa_nombre: str,
        empresa_email: str | None,
        empresa_pais: str | None,
        empresa_sector: str | None,
        qr_data_json: str,
        formato: str = "badge",
    ) -> BytesIO:
        """
        Genera credencial tipo badge para empresa.

        Args:
            empresa_nombre: Nombre de la empresa
            empresa_email: Email de contacto
            empresa_pais: País de origen
            empresa_sector: Sector industrial
            qr_data_json: Datos del QR en JSON
            formato: 'badge' o 'lanyard'

        Returns:
            Buffer con el PDF generado
        """
        # Determinar tamaño de página
        page_size = self.SIZE_BADGE if formato == "badge" else self.SIZE_LANYARD

        # Crear canvas
        c = canvas.Canvas(self.buffer, pagesize=page_size)
        width, height = page_size

        # Fondo con gradiente (simulado con rectángulos superpuestos)
        self._draw_background(c, width, height)

        # Header con logo/título
        self._draw_header(c, width, "EMPRESA")

        # QR Code centrado y grande
        qr_size = 4 * cm
        qr_x = (width - qr_size) / 2
        qr_y = height - 9 * cm
        self._draw_qr_code(c, qr_data_json, qr_x, qr_y, qr_size)

        # Nombre de empresa (destacado)
        c.setFont("Helvetica-Bold", 16)
        c.setFillColor(self.COLOR_TEXT)

        # Centrar texto del nombre
        nombre_width = c.stringWidth(empresa_nombre, "Helvetica-Bold", 16)
        max_width = width - 2 * cm

        if nombre_width > max_width:
            # Si es muy largo, reducir font
            c.setFont("Helvetica-Bold", 14)
            nombre_width = c.stringWidth(empresa_nombre, "Helvetica-Bold", 14)

        text_x = (width - nombre_width) / 2 if nombre_width <= max_width else 1 * cm
        c.drawString(text_x, height - 10 * cm, empresa_nombre)

        # Información adicional
        y_pos = height - 11.5 * cm
        c.setFont("Helvetica", 10)
        c.setFillColor(self.COLOR_TEXT_LIGHT)

        if empresa_email:
            self._draw_centered_text(c, empresa_email, y_pos, width)
            y_pos -= 0.6 * cm

        if empresa_pais:
            self._draw_centered_text(c, f"📍 {empresa_pais}", y_pos, width)
            y_pos -= 0.6 * cm

        if empresa_sector:
            self._draw_centered_text(c, f"🏢 {empresa_sector}", y_pos, width)

        # Footer
        self._draw_footer(c, width, height)

        # Finalizar
        c.save()
        self.buffer.seek(0)
        return self.buffer

    def generar_badge_participante(
        self,
        participante_nombre: str,
        participante_cargo: str | None,
        participante_email: str,
        empresa_nombre: str,
        qr_data_json: str,
        formato: str = "badge",
    ) -> BytesIO:
        """
        Genera credencial tipo badge para participante.

        Args:
            participante_nombre: Nombre completo del participante
            participante_cargo: Cargo en la empresa
            participante_email: Email del participante
            empresa_nombre: Nombre de la empresa
            qr_data_json: Datos del QR en JSON
            formato: 'badge' o 'lanyard'

        Returns:
            Buffer con el PDF generado
        """
        page_size = self.SIZE_BADGE if formato == "badge" else self.SIZE_LANYARD

        c = canvas.Canvas(self.buffer, pagesize=page_size)
        width, height = page_size

        # Fondo
        self._draw_background(c, width, height)

        # Header
        self._draw_header(c, width, "PARTICIPANTE")

        # QR Code
        qr_size = 4 * cm
        qr_x = (width - qr_size) / 2
        qr_y = height - 8.5 * cm
        self._draw_qr_code(c, qr_data_json, qr_x, qr_y, qr_size)

        # Nombre del participante (grande y destacado)
        c.setFont("Helvetica-Bold", 14)
        c.setFillColor(self.COLOR_TEXT)

        nombre_width = c.stringWidth(participante_nombre, "Helvetica-Bold", 14)
        max_width = width - 2 * cm

        if nombre_width > max_width:
            c.setFont("Helvetica-Bold", 12)
            nombre_width = c.stringWidth(participante_nombre, "Helvetica-Bold", 12)

        text_x = (width - nombre_width) / 2 if nombre_width <= max_width else 1 * cm
        c.drawString(text_x, height - 9.8 * cm, participante_nombre)

        # Cargo
        y_pos = height - 10.8 * cm
        if participante_cargo:
            c.setFont("Helvetica-Bold", 10)
            c.setFillColor(self.COLOR_PRIMARY)
            self._draw_centered_text(c, participante_cargo, y_pos, width)
            y_pos -= 0.7 * cm

        # Empresa
        c.setFont("Helvetica", 10)
        c.setFillColor(self.COLOR_TEXT_LIGHT)
        self._draw_centered_text(c, empresa_nombre, y_pos, width)
        y_pos -= 0.6 * cm

        # Email
        c.setFont("Helvetica", 9)
        self._draw_centered_text(c, participante_email, y_pos, width)

        # Footer
        self._draw_footer(c, width, height)

        c.save()
        self.buffer.seek(0)
        return self.buffer

    def _draw_background(self, c: canvas.Canvas, width: float, height: float):
        """Dibuja fondo con efecto de gradiente"""
        # Fondo blanco base
        c.setFillColor(colors.white)
        c.rect(0, 0, width, height, fill=True, stroke=False)

        # Banda superior con color corporativo
        c.setFillColor(self.COLOR_PRIMARY)
        c.rect(0, height - 2 * cm, width, 2 * cm, fill=True, stroke=False)

        # Banda inferior sutil
        c.setFillColor(self.COLOR_BG_LIGHT)
        c.rect(0, 0, width, 2 * cm, fill=True, stroke=False)

    def _draw_header(self, c: canvas.Canvas, width: float, tipo: str):
        """Dibuja header con logo y título"""
        # Logo/Iniciales en círculo
        circle_x = width / 2
        circle_y = c._pagesize[1] - 1 * cm

        c.setFillColor(colors.white)
        c.circle(circle_x, circle_y, 0.4 * cm, fill=True, stroke=False)

        c.setFont("Helvetica-Bold", 12)
        c.setFillColor(self.COLOR_PRIMARY)
        c.drawCentredString(circle_x, circle_y - 0.15 * cm, "CG")

        # Título del tipo de credencial
        c.setFont("Helvetica", 8)
        c.setFillColor(colors.white)
        c.drawCentredString(width / 2, c._pagesize[1] - 1.8 * cm, tipo)

    def _draw_qr_code(
        self,
        c: canvas.Canvas,
        qr_data_json: str,
        x: float,
        y: float,
        size: float,
    ):
        """Dibuja código QR en el PDF"""
        # Generar QR
        qr_buffer = generate_qr_image_for_pdf(qr_data_json, size=int(size * 10))

        # Crear imagen de ReportLab
        from reportlab.lib.units import mm
        from reportlab.platypus import Image as RLImage

        qr_image = RLImage(qr_buffer, width=size, height=size)

        # Dibujar en canvas
        qr_image.drawOn(c, x, y)

        # Borde decorativo alrededor del QR
        c.setStrokeColor(self.COLOR_SECONDARY)
        c.setLineWidth(2)
        c.rect(
            x - 2 * mm,
            y - 2 * mm,
            size + 4 * mm,
            size + 4 * mm,
            fill=False,
            stroke=True,
        )

    def _draw_footer(self, c: canvas.Canvas, width: float, height: float):
        """Dibuja footer con información del evento"""
        c.setFont("Helvetica", 7)
        c.setFillColor(self.COLOR_TEXT_LIGHT)

        footer_text = "ConfiaGlobal • Conecta Empresas LATAM"
        c.drawCentredString(width / 2, 1 * cm, footer_text)

        # Línea decorativa
        c.setStrokeColor(self.COLOR_SECONDARY)
        c.setLineWidth(0.5)
        c.line(1.5 * cm, 0.6 * cm, width - 1.5 * cm, 0.6 * cm)

    def _draw_centered_text(
        self,
        c: canvas.Canvas,
        text: str,
        y: float,
        width: float,
    ):
        """Dibuja texto centrado"""
        text_width = c.stringWidth(text, c._fontname, c._fontsize)
        max_width = width - 2 * cm

        if text_width > max_width:
            # Truncar texto si es muy largo
            while text_width > max_width and len(text) > 0:
                text = text[:-4] + "..."
                text_width = c.stringWidth(text, c._fontname, c._fontsize)

        x = (width - text_width) / 2
        c.drawString(x, y, text)
