# Planilla de Movimientos — DIPREGEP
**Provincia de Buenos Aires · DGCyE · Gestión Privada**

Webapp para confeccionar la Planilla de Movimientos según la Disposición 1000/DIPREGEP (Anexo I).

## Funcionalidades
- Formulario guiado en 6 pasos con validaciones contextuales
- Textos de observaciones estandarizados (31 casos del Anexo I) generados automáticamente
- Determinación del área de destino según tipo de novedad
- Alertas de firma para movimientos que requieren Inspector o Inspector Jefe
- Exportación a XLS con estructura oficial
- Múltiples movimientos en una misma planilla
- 100% cliente: no requiere servidor, no envía datos

## Publicar en GitHub Pages

1. Creá repo en github.com/new (privado recomendado)
2. Subí el archivo `index.html`
3. Settings → Pages → Deploy from branch → main / (root)
4. Tu webapp queda en: `https://TU-USUARIO.github.io/planilla-movimientos/`

## Compartir
Compartís la URL. Funciona en celular, tablet y PC. Sin instalación.

## Actualizar
```bash
git add index.html
git commit -m "Update: descripción"
git push
```

## Notas
- El XLS generado tiene estructura oficial pero sin el logo CorelDRAW del original
- Los datos no se guardan entre sesiones (sin backend)
- Librerías: SheetJS (Apache 2.0) + IBM Plex Sans (Google Fonts)

*Basado en Disposición 1000/DIPREGEP — Anexo I*
