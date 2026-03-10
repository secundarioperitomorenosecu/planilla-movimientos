// ============================================================
// app.js — Lógica principal de la webapp
// Planilla de Movimientos DIPREGEP
// ============================================================

// ---- ESTADO GLOBAL ----
let state = {
  step: 1,
  institucion: {},
  periodo: {},
  movimientos: [],
  modalTipoPrincipal: null,
  modalSubtipo: null,
  modalDatos: {},
  editandoIdx: null,
};

// ---- NAVEGACIÓN DE PASOS ----
function goToStep(n) {
  if (n > 1 && !validarStep(state.step)) return;

  // Guardar datos del step actual
  if (state.step === 1) guardarInstitucion();
  if (state.step === 2) guardarPeriodo();

  state.step = n;

  document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
  document.getElementById('step-' + n).classList.add('active');

  document.querySelectorAll('.step').forEach(el => {
    const s = parseInt(el.dataset.step);
    el.classList.remove('active', 'done');
    if (s === n) el.classList.add('active');
    else if (s < n) el.classList.add('done');
  });

  if (n === 4) renderResumen();

  const btnExp = document.getElementById('btn-exportar');
  if (btnExp) btnExp.disabled = state.movimientos.length === 0;
}

function validarStep(n) {
  if (n === 1) {
    const req = ['inst-nombre','inst-numero','inst-distrito','inst-nivel','inst-subvencion','inst-director'];
    for (const id of req) {
      const el = document.getElementById(id);
      if (!el || !el.value.trim()) {
        el && el.focus();
        alert('Por favor completá todos los campos obligatorios (*)');
        return false;
      }
    }
  }
  if (n === 2) {
    if (!document.getElementById('per-mes').value || !document.getElementById('per-anio').value) {
      alert('Completá el mes y año de la novedad.');
      return false;
    }
  }
  return true;
}

function guardarInstitucion() {
  state.institucion = {
    nombre:    v('inst-nombre'),
    numero:    v('inst-numero'),
    distrito:  v('inst-distrito'),
    distNro:   v('inst-distrito-num'),
    nivel:     v('inst-nivel'),
    subvencion:v('inst-subvencion'),
    director:  v('inst-director'),
    sello:     v('inst-sello'),
    area:      v('inst-area'),
  };
}

function guardarPeriodo() {
  state.periodo = {
    mes:       v('per-mes'),
    mesNombre: MESES[parseInt(v('per-mes')) || 0],
    anio:      v('per-anio'),
    fechaPres: v('per-fecha-pres'),
  };
  checkPlazo();
}

function v(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

// ---- ALERTA PLAZO ----
function checkPlazo() {
  const mes = parseInt(state.periodo.mes);
  const anio = parseInt(state.periodo.anio);
  const fechaPres = state.periodo.fechaPres;
  const el = document.getElementById('alerta-plazo');
  if (!mes || !anio || !fechaPres) { el.style.display = 'none'; return; }

  const mesSig = mes === 12 ? 1 : mes + 1;
  const anioSig = mes === 12 ? anio + 1 : anio;
  const pres = new Date(fechaPres);
  const limiteRef = new Date(anioSig, mesSig - 1, 5);

  if (pres > limiteRef) {
    el.style.display = 'flex';
    document.getElementById('alerta-plazo-texto').textContent =
      `Atención: la fecha de presentación (${fechaPres}) puede estar fuera del plazo. ` +
      `Las novedades de ${MESES[mes]} ${anio} deben ingresar hasta el 5° día hábil de ${MESES[mesSig]} ${anioSig}.`;
  } else {
    el.style.display = 'none';
  }
}

// ---- MODAL: FLUJO DE 3 PASOS ----
// Paso A: elegir tipo principal
// Paso B: elegir subtipo
// Paso C: completar datos del movimiento

function abrirModal(editIdx = null) {
  state.modalTipoPrincipal = null;
  state.modalSubtipo = null;
  state.modalDatos = {};
  state.editandoIdx = editIdx;

  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('open');

  if (editIdx !== null) {
    const mov = state.movimientos[editIdx];
    state.modalTipoPrincipal = mov.tipoPrincipal;
    state.modalSubtipo = SUBTIPOS[mov.tipoPrincipal].find(s => s.id === mov.subtipoId);
    state.modalDatos = { ...mov.datos };
    document.getElementById('modal-titulo').textContent = 'Editar Movimiento';
    renderModalCampos();
  } else {
    document.getElementById('modal-titulo').textContent = 'Nuevo Movimiento';
    renderModalTipos();
  }
}

function cerrarModal(e) {
  if (e.target.id === 'modal-overlay') cerrarModalDirecto();
}
function cerrarModalDirecto() {
  document.getElementById('modal-overlay').classList.remove('open');
}

// --- PASO A: Elegir tipo principal ---
function renderModalTipos() {
  const body = document.getElementById('modal-body');
  body.innerHTML = `
    <p style="font-size:0.85rem;color:#718096;margin-bottom:1rem;">
      Seleccioná el tipo de movimiento que querés informar:
    </p>
    <div class="tipo-grid">
      ${TIPOS_PRINCIPALES.map(t => `
        <div class="tipo-card" onclick="seleccionarTipoPrincipal('${t.id}')">
          <span class="tipo-card-icon">${t.icon}</span>
          <div class="tipo-card-titulo">${t.titulo}</div>
          <div class="tipo-card-desc">${t.desc}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function seleccionarTipoPrincipal(id) {
  state.modalTipoPrincipal = id;
  renderModalSubtipos();
}

// --- PASO B: Elegir subtipo ---
function renderModalSubtipos() {
  const tipo = TIPOS_PRINCIPALES.find(t => t.id === state.modalTipoPrincipal);
  const lista = SUBTIPOS[state.modalTipoPrincipal];
  const body = document.getElementById('modal-body');

  body.innerHTML = `
    <div style="margin-bottom:0.8rem;display:flex;align-items:center;gap:0.5rem;">
      <button class="btn-ghost" onclick="renderModalTipos()" style="padding:0.3rem 0.7rem;font-size:0.8rem;">← Volver</button>
      <span style="font-size:0.88rem;font-weight:600;color:var(--azul);">${tipo.icon} ${tipo.titulo}</span>
    </div>
    <p style="font-size:0.82rem;color:#718096;margin-bottom:0.8rem;">Seleccioná el caso que corresponde:</p>
    <div class="subtipo-list">
      ${lista.map(s => `
        <div class="subtipo-item" onclick="seleccionarSubtipo('${s.id}')">
          <span class="subtipo-num">Caso ${s.num}</span>
          <span class="subtipo-titulo">${s.titulo}</span>
          <span class="subtipo-area">Área: ${s.area}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function seleccionarSubtipo(id) {
  const lista = SUBTIPOS[state.modalTipoPrincipal];
  state.modalSubtipo = lista.find(s => s.id === id);
  renderModalCampos();
}

// --- PASO C: Completar campos ---
function renderModalCampos() {
  const sub = state.modalSubtipo;
  const body = document.getElementById('modal-body');
  const tipo = TIPOS_PRINCIPALES.find(t => t.id === state.modalTipoPrincipal);

  // Los campos del subtipo + siempre curso/sección y obs_extra al final
  const campos = [...(sub.campos || []), 'curso_seccion', 'observaciones_extra'];

  body.innerHTML = `
    <div style="margin-bottom:0.8rem;display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
      <button class="btn-ghost" onclick="renderModalSubtipos()" style="padding:0.3rem 0.7rem;font-size:0.8rem;">← Volver</button>
      <span style="font-size:0.88rem;font-weight:600;color:var(--azul);">${tipo.icon} ${sub.titulo}</span>
      <span class="mov-area-badge ${areaClass(sub.area)}">${sub.area}</span>
    </div>

    ${sub.nota ? `<div class="info-box"><strong>Nota:</strong> ${sub.nota}</div>` : ''}

    <div class="modal-section">
      <div class="modal-section-title">Datos del movimiento</div>
      <div class="form-grid">
        ${campos.map(campo => renderCampo(campo)).join('')}
      </div>
    </div>

    <div class="modal-section" id="obs-preview-section">
      <span class="obs-preview-label">Vista previa — Texto de Observaciones (col. 14)</span>
      <div class="obs-preview" id="obs-preview-text">Completá los campos para ver la observación generada.</div>
    </div>

    <div class="modal-nav">
      <button class="btn-ghost" onclick="cerrarModalDirecto()">Cancelar</button>
      <button class="btn-primary" onclick="guardarMovimiento()">
        ${state.editandoIdx !== null ? '✓ Guardar cambios' : '+ Agregar movimiento'}
      </button>
    </div>
  `;

  // Pre-cargar valores si es edición
  if (state.editandoIdx !== null) {
    campos.forEach(c => {
      const el = document.getElementById('campo-' + c);
      if (el && state.modalDatos[c] !== undefined) el.value = state.modalDatos[c];
    });
  }

  // Listener para actualizar preview
  campos.forEach(c => {
    const el = document.getElementById('campo-' + c);
    if (el) el.addEventListener('input', actualizarObsPreview);
    if (el) el.addEventListener('change', actualizarObsPreview);
  });

  actualizarObsPreview();
}

function renderCampo(campo) {
  const cfg = CAMPOS_CONFIG[campo];
  if (!cfg) return '';
  const id = 'campo-' + campo;
  const req = cfg.req ? '<span class="req">*</span>' : '';

  if (cfg.tipo === 'text' || cfg.tipo === 'date' || cfg.tipo === 'number') {
    return `
      <div class="field-group ${campo === 'docente' || campo === 'observaciones_extra' || campo === 'documentacion' ? 'span-2' : ''}">
        <label for="${id}">${cfg.label} ${req}</label>
        <input type="${cfg.tipo}" id="${id}" placeholder="${cfg.placeholder || ''}" />
      </div>`;
  }
  if (cfg.tipo === 'select') {
    return `
      <div class="field-group">
        <label for="${id}">${cfg.label} ${req}</label>
        <select id="${id}">
          <option value="">— Seleccionar —</option>
          ${cfg.opciones.map(o => `<option value="${o.val}">${o.label}</option>`).join('')}
        </select>
      </div>`;
  }
  if (cfg.tipo === 'textarea') {
    return `
      <div class="field-group span-2">
        <label for="${id}">${cfg.label} ${req}</label>
        <textarea id="${id}" placeholder="${cfg.placeholder || ''}"></textarea>
      </div>`;
  }
  return '';
}

function actualizarObsPreview() {
  const sub = state.modalSubtipo;
  if (!sub) return;

  // Leer todos los campos del DOM
  const datos = {};
  (sub.campos || []).forEach(c => {
    const el = document.getElementById('campo-' + c);
    datos[c] = el ? el.value.trim() : '';
  });

  // Formatear fecha legible
  if (datos.fecha) datos.fecha = formatDate(datos.fecha);
  if (datos.fecha_hasta) datos.fecha_hasta = formatDate(datos.fecha_hasta);

  const texto = sub.plantillaObs(datos);
  const el = document.getElementById('obs-preview-text');
  if (el) {
    const curso = document.getElementById('campo-curso_seccion');
    const obsExtra = document.getElementById('campo-observaciones_extra');
    let full = texto;
    if (curso && curso.value.trim()) full += ` Curso/Sección: ${curso.value.trim()}.`;
    if (obsExtra && obsExtra.value.trim()) full += ` ${obsExtra.value.trim()}`;
    el.textContent = full;
  }
}

function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// ---- GUARDAR MOVIMIENTO ----
function guardarMovimiento() {
  const sub = state.modalSubtipo;
  const datos = {};
  const campos = [...(sub.campos || []), 'curso_seccion', 'observaciones_extra'];

  campos.forEach(c => {
    const el = document.getElementById('campo-' + c);
    datos[c] = el ? el.value.trim() : '';
  });

  // Validar campos requeridos
  const faltantes = sub.campos.filter(c => {
    const cfg = CAMPOS_CONFIG[c];
    return cfg && cfg.req && !datos[c];
  });
  if (faltantes.length > 0) {
    alert('Completá los campos obligatorios: ' + faltantes.map(f => CAMPOS_CONFIG[f]?.label).join(', '));
    return;
  }

  // Generar observación final
  const datosFecha = { ...datos };
  if (datosFecha.fecha) datosFecha.fecha = formatDate(datosFecha.fecha);
  if (datosFecha.fecha_hasta) datosFecha.fecha_hasta = formatDate(datosFecha.fecha_hasta);
  let obs = sub.plantillaObs(datosFecha);
  if (datos.curso_seccion) obs += ` Curso/Sección: ${datos.curso_seccion}.`;
  if (datos.observaciones_extra) obs += ` ${datos.observaciones_extra}`;

  const movimiento = {
    tipoPrincipal: state.modalTipoPrincipal,
    subtipoId: sub.id,
    subtipoNum: sub.num,
    subtipoTitulo: sub.titulo,
    area: sub.area,
    datos,
    observacion: obs,
  };

  if (state.editandoIdx !== null) {
    state.movimientos[state.editandoIdx] = movimiento;
  } else {
    state.movimientos.push(movimiento);
  }

  cerrarModalDirecto();
  renderMovimientosLista();
}

// ---- RENDERIZAR LISTA DE MOVIMIENTOS ----
function renderMovimientosLista() {
  const lista = document.getElementById('movimientos-lista');
  const vacioMsg = document.getElementById('lista-vacia-msg');
  const btn4 = document.getElementById('btn-paso4');
  const btnExp = document.getElementById('btn-exportar');

  if (state.movimientos.length === 0) {
    lista.innerHTML = '';
    lista.appendChild(vacioMsg || crearVacioMsg());
    if (btn4) btn4.disabled = true;
    if (btnExp) btnExp.disabled = true;
    return;
  }

  if (btn4) btn4.disabled = false;
  if (btnExp) btnExp.disabled = false;

  lista.innerHTML = state.movimientos.map((m, i) => `
    <div class="movimiento-card">
      <div class="mov-card-left">
        <div class="mov-card-top">
          <span class="mov-numero">#${String(i+1).padStart(2,'0')}</span>
          <span class="mov-tipo-badge badge-${m.tipoPrincipal}">${m.tipoPrincipal.charAt(0).toUpperCase() + m.tipoPrincipal.slice(1)}</span>
          <span class="mov-area-badge ${areaClass(m.area)}">${m.area}</span>
          ${m.datos.situacion ? `<span style="font-size:0.72rem;color:#718096">Rev. ${m.datos.situacion}</span>` : ''}
        </div>
        <div class="mov-docente">${m.datos.docente || '—'}</div>
        <div class="mov-detalle">
          ${m.datos.dni ? `DNI ${m.datos.dni}` : ''}${m.datos.secuencia ? ` · Sec. ${m.datos.secuencia}` : ''}
          ${m.datos.categoria ? ` · Cat. ${m.datos.categoria}` : ''}
          ${m.datos.horas ? ` · ${m.datos.horas} hs/móds.` : ''}
        </div>
        <div class="mov-obs">${m.observacion}</div>
      </div>
      <div class="mov-card-actions">
        <button class="btn-edit-sm" onclick="abrirModal(${i})">Editar</button>
        <button class="btn-danger" onclick="eliminarMovimiento(${i})">Eliminar</button>
      </div>
    </div>
  `).join('');
}

function crearVacioMsg() {
  const d = document.createElement('div');
  d.id = 'lista-vacia-msg';
  d.className = 'lista-vacia';
  d.innerHTML = '<span class="lista-vacia-icon">📋</span><p>Aún no cargaste ningún movimiento.<br>Usá el botón para agregar.</p>';
  return d;
}

function eliminarMovimiento(idx) {
  if (!confirm('¿Eliminás este movimiento?')) return;
  state.movimientos.splice(idx, 1);
  renderMovimientosLista();
}

function areaClass(area) {
  if (area === AREAS.LIQUIDACIONES) return 'area-liquidaciones';
  if (area === AREAS.ENFERMEDADES)  return 'area-enfermedades';
  if (area === AREAS.ASIGNACIONES)  return 'area-asignaciones';
  return 'area-coordinacion';
}

// ---- RESUMEN (STEP 4) ----
function renderResumen() {
  const c = document.getElementById('resumen-container');
  const inst = state.institucion;
  const per = state.periodo;

  c.innerHTML = `
    <div class="resumen-card">
      <div class="resumen-card-header">Datos de la Institución</div>
      <div class="resumen-card-body">
        ${resRow('Establecimiento', inst.nombre)}
        ${resRow('N° Estab.', inst.numero)}
        ${resRow('Distrito', `${inst.distrito}${inst.distNro ? ' (N° ' + inst.distNro + ')' : ''}`)}
        ${resRow('Nivel / Modalidad', inst.nivel)}
        ${resRow('% Subvención', inst.subvencion + '%')}
        ${resRow('Director/a', inst.director)}
        ${resRow('Área de destino', inst.area || 'Según tipo de movimiento')}
      </div>
    </div>

    <div class="resumen-card">
      <div class="resumen-card-header">Período</div>
      <div class="resumen-card-body">
        ${resRow('Mes/Año de la novedad', `${per.mesNombre} ${per.anio}`)}
        ${resRow('Fecha de presentación', per.fechaPres || '—')}
      </div>
    </div>

    <div class="resumen-card">
      <div class="resumen-card-header">Movimientos (${state.movimientos.length})</div>
      <div style="overflow-x:auto;">
        <table class="resumen-movimientos-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Tipo</th>
              <th>Docente</th>
              <th>DNI</th>
              <th>Cat.</th>
              <th>Hs</th>
              <th>Rev.</th>
              <th>Área</th>
              <th>Observación</th>
            </tr>
          </thead>
          <tbody>
            ${state.movimientos.map((m, i) => `
              <tr>
                <td><span class="mov-numero">${i+1}</span></td>
                <td><span class="mov-tipo-badge badge-${m.tipoPrincipal}" style="font-size:0.68rem">${m.tipoPrincipal}</span></td>
                <td>${m.datos.docente || '—'}</td>
                <td>${m.datos.dni || '—'}</td>
                <td>${m.datos.categoria || '—'}</td>
                <td>${m.datos.horas || '—'}</td>
                <td>${m.datos.situacion || '—'}</td>
                <td><span class="mov-area-badge ${areaClass(m.area)}" style="font-size:0.68rem">${m.area}</span></td>
                <td style="font-size:0.78rem;max-width:220px">${m.observacion}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function resRow(label, val) {
  return `<div class="resumen-row"><span class="resumen-label">${label}</span><span class="resumen-val">${val || '—'}</span></div>`;
}

// ---- EXPORTAR XLS ----
function exportarXLS() {
  const inst = state.institucion;
  const per = state.periodo;
  const movs = state.movimientos;

  const wb = XLSX.utils.book_new();
  const wsData = [];

  // ---- FILA 1: Título ----
  wsData.push([
    'PROVINCIA DE BUENOS AIRES',
    '', '', '', '',
    'DIRECCIÓN GENERAL DE CULTURA Y EDUCACIÓN',
    '', '', '', '',
    'DIRECCIÓN PROVINCIAL DE EDUCACIÓN DE GESTIÓN PRIVADA',
    '', '', ''
  ]);

  // ---- FILA 2: Encabezado planilla ----
  wsData.push(['PLANILLA DE MOVIMIENTOS', '', '', '', '', '', '', '', '', '', '', '', '', '']);

  // ---- FILA 3: Datos institución ----
  wsData.push([
    'ESTABLECIMIENTO:', inst.nombre,
    '', 'N°:', inst.numero,
    'DISTRITO:', inst.distrito,
    'N° DISTRITO:', inst.distNro || '',
    'NIVEL:', inst.nivel,
    '% SUBV.:', inst.subvencion + '%', ''
  ]);

  // ---- FILA 4: Período y área ----
  const areaDestino = inst.area || 'Según tipo de movimiento';
  wsData.push([
    'PERÍODO:', `${per.mesNombre || ''} ${per.anio || ''}`,
    '', 'ÁREA DE DESTINO:', areaDestino,
    '', '', '', '',
    'FECHA PRESENTACIÓN:', per.fechaPres || '',
    '', '', ''
  ]);

  // ---- FILA 5: Vacía separadora ----
  wsData.push([]);

  // ---- FILA 6: CABECERAS DE COLUMNAS (según planilla oficial) ----
  wsData.push([
    'Col. 1\nAPELLIDO Y NOMBRE',       // 1
    'Col. 2\nDNI',                       // 2
    'Col. 3\nSECUENCIA',                // 3
    'Col. 4\nSIT. REVISTA',             // 4
    'Col. 5\nTIPO MOV.',                // 5
    'Col. 6\nFECHA DESDE',              // 6
    'Col. 7\nFECHA HASTA',              // 7
    'Col. 8\nCATEGORÍA',               // 8
    'Col. 9\nCURSO / TURNO',            // 9
    'Col. 10\nJOR\nNADA',              // 10
    'Col. 11\nCANT. HS\nO MÓDULOS',    // 11
    'Col. 12\nANTIG.\nAÑOS',           // 12
    'Col. 13\nANTIG.\nMESES',          // 13
    'Col. 14\nOBSERVACIONES',           // 14
  ]);

  // ---- FILAS DE DATOS ----
  movs.forEach((m, i) => {
    const d = m.datos;

    // Antigüedad: convertir años decimales a años/meses
    let antigAnios = '';
    let antigMeses = '';
    if (d.antiguedad) {
      const total = parseFloat(d.antiguedad);
      antigAnios = Math.floor(total);
      antigMeses = Math.round((total - antigAnios) * 12);
    }

    // Tipo de movimiento para col. 5
    const tipoMov = {
      alta: 'A',
      baja: 'B',
      modificacion: 'M',
      asignacion: 'AF',
    }[m.tipoPrincipal] || 'M';

    wsData.push([
      d.docente || '',                          // 1
      d.dni || '',                               // 2
      d.secuencia || d.secuencia_ant || '',      // 3
      d.situacion || '',                         // 4
      tipoMov,                                   // 5
      d.fecha ? formatXLSDate(d.fecha) : '',    // 6
      d.fecha_hasta ? formatXLSDate(d.fecha_hasta) : '', // 7
      d.categoria || '',                         // 8
      d.curso_seccion || '',                     // 9
      '',                                        // 10 (jornada)
      d.horas || '',                             // 11
      antigAnios,                                // 12
      antigMeses || '',                          // 13
      m.observacion || '',                       // 14
    ]);
  });

  // ---- FILAS VACÍAS ADICIONALES (para completar a mano si hace falta) ----
  for (let i = 0; i < 5; i++) {
    wsData.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '']);
  }

  // ---- FILA FINAL: Firma ----
  wsData.push([]);
  wsData.push([
    'FIRMA Y SELLO DIRECTOR/A:', inst.director,
    '', '', '', '', '',
    'FIRMA Y SELLO INSPECTOR/A:', '',
    '', '', '', '', ''
  ]);

  // ---- CREAR WORKSHEET ----
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // ---- ANCHOS DE COLUMNA ----
  ws['!cols'] = [
    { wch: 28 }, // A - Apellido y Nombre
    { wch: 14 }, // B - DNI
    { wch: 10 }, // C - Secuencia
    { wch: 10 }, // D - Sit. Revista
    { wch: 7  }, // E - Tipo Mov
    { wch: 12 }, // F - Fecha desde
    { wch: 12 }, // G - Fecha hasta
    { wch: 10 }, // H - Categoría
    { wch: 10 }, // I - Curso
    { wch: 6  }, // J - Jornada
    { wch: 8  }, // K - Hs/Módulos
    { wch: 8  }, // L - Antig. Años
    { wch: 8  }, // M - Antig. Meses
    { wch: 55 }, // N - Observaciones
  ];

  // ---- ESTILOS via SheetJS (ce) ----
  applyStyles(ws, wsData.length, movs.length);

  // ---- AGREGAR HOJA ----
  XLSX.utils.book_append_sheet(wb, ws, 'Planilla de Movimientos');

  // ---- NOMBRE DEL ARCHIVO ----
  const nombreArch = `PlanillaMovimientos_${inst.numero || 'INST'}_${per.anio || ''}${String(per.mes || '').padStart(2,'0')}.xlsx`;

  // ---- DESCARGAR ----
  XLSX.writeFile(wb, nombreArch);
}

function formatXLSDate(isoOrSlash) {
  // Acepta dd/mm/yyyy o yyyy-mm-dd
  if (!isoOrSlash) return '';
  if (isoOrSlash.includes('/')) return isoOrSlash;
  const [y, m, d] = isoOrSlash.split('-');
  return `${d}/${m}/${y}`;
}

function applyStyles(ws, totalRows, numMovs) {
  // SheetJS CE no soporta estilos nativos, pero podemos usar
  // el truco de definir !merges para las filas de encabezado

  ws['!merges'] = [
    // Fila 1: título principal (merge A1:N1)
    { s: { r: 0, c: 0 }, e: { r: 0, c: 13 } },
    // Fila 2: subtítulo
    { s: { r: 1, c: 0 }, e: { r: 1, c: 13 } },
    // Fila 3: datos institución — algunos merges
    { s: { r: 2, c: 1 }, e: { r: 2, c: 3 } },  // nombre institución
    // Fila 4: período
    { s: { r: 3, c: 1 }, e: { r: 3, c: 2 } },  // período
    { s: { r: 3, c: 5 }, e: { r: 3, c: 8 } },  // área
    // Observaciones — merge para col 14 en cada fila de datos
    ...Array.from({ length: numMovs }, (_, i) => ({
      s: { r: 7 + i, c: 13 }, e: { r: 7 + i, c: 13 }
    })),
  ];

  // Altura de fila para cabecera de columnas
  ws['!rows'] = [
    { hpt: 20 }, // fila 1
    { hpt: 18 }, // fila 2
    { hpt: 16 }, // fila 3
    { hpt: 14 }, // fila 4
    { hpt: 6  }, // fila 5 (separador)
    { hpt: 36 }, // fila 6 (cabeceras — doble línea)
    { hpt: 5  }, // fila 7 (vacía antes de datos)
    ...Array.from({ length: numMovs + 5 }, () => ({ hpt: 18 })),
  ];
}

// ---- RESET ----
function resetApp() {
  if (!confirm('¿Empezar una nueva planilla? Se perderán los datos actuales.')) return;
  state = { step: 1, institucion: {}, periodo: {}, movimientos: [], modalTipoPrincipal: null, modalSubtipo: null, modalDatos: {}, editandoIdx: null };
  // Reset campos
  ['inst-nombre','inst-numero','inst-distrito','inst-distrito-num','inst-nivel',
   'inst-subvencion','inst-director','inst-sello','inst-area',
   'per-mes','per-anio','per-fecha-pres'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  renderMovimientosLista();
  goToStep(1);
  const btn = document.getElementById('btn-exportar');
  if (btn) btn.disabled = true;
}

// ---- BOTONES HEADER ----
document.getElementById('btn-nuevo').addEventListener('click', resetApp);
document.getElementById('btn-exportar').addEventListener('click', exportarXLS);

// ---- INIT ----
renderMovimientosLista();async function exportXLS() {
  const movs = st.movs.length ? st.movs : [getData()];
  const base = movs[0];

  // ── ExcelJS: crear workbook con estilos completos ────────────────────────
  const ExcelJS = window.ExcelJS;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'DIPREGEP Planilla de Movimientos';
  const ws = wb.addWorksheet('Planilla de Movimientos', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 }
  });

  const areaLabel = {
    L:'LIQUIDACIONES', E:'LICENCIAS POR ENFERMEDAD',
    A:'ASIGNACIONES FAMILIARES', C:'COORDINACIÓN ADMINISTRATIVA'
  };

  // ── Helpers de estilo ────────────────────────────────────────────────────
  const thinBorder = { style: 'thin', color: { argb: 'FF000000' } };
  const allBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

  function setRow(rowNum, values) {
    const row = ws.getRow(rowNum);
    values.forEach((v, i) => { if (v !== undefined) row.getCell(i + 1).value = v; });
    row.commit();
    return row;
  }

  function styleCell(col, row, opts = {}) {
    const cell = ws.getCell(row, col);
    if (opts.value !== undefined) cell.value = opts.value;
    cell.font = { name: 'Arial', size: opts.size || 10, bold: !!opts.bold, color: { argb: opts.color || 'FF000000' } };
    cell.alignment = { horizontal: opts.h || 'center', vertical: opts.v || 'center', wrapText: !!opts.wrap };
    if (opts.fill) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: opts.fill } };
    if (opts.borders) cell.border = opts.borders;
    else if (opts.allB) cell.border = allBorders;
  }

  function mergeStyle(col1, row1, col2, row2, opts = {}) {
    ws.mergeCells(row1, col1, row2, col2);
    styleCell(col1, row1, opts);
  }

  // ── Anchos de columna ────────────────────────────────────────────────────
  // Columnas: A=idx, B=col1DNI, C=col2Sec, D=col3Nombre, E=col4Rev,
  //           F=col5docTipo, G=col5docNum, H=col6Funcion, I=col7Rural,
  //           J=col8Turno, K=col9Cat, L=col10Imp, M=col11Hs,
  //           N=col12AnioA, O=col13AnioM, P=col14Obs, Q=col14ObsCont, R=firma
  ws.columns = [
    { key:'A', width: 4.14  },
    { key:'B', width: 17.14 },
    { key:'C', width: 3.85  },
    { key:'D', width: 20.13 },
    { key:'E', width: 3.56  },
    { key:'F', width: 6.0   },
    { key:'G', width: 14.85 },
    { key:'H', width: 3.56  },
    { key:'I', width: 4.5   },
    { key:'J', width: 5.0   },
    { key:'K', width: 4.85  },
    { key:'L', width: 13.28 },
    { key:'M', width: 3.85  },
    { key:'N', width: 3.42  },
    { key:'O', width: 3.99  },
    { key:'P', width: 16.99 },
    { key:'Q', width: 19.14 },
    { key:'R', width: 3.85  },
    { key:'S', width: 6.13  },
  ];

  // ── Alturas de fila ──────────────────────────────────────────────────────
  ws.getRow(4).height  = 15.75;
  ws.getRow(5).height  = 12.75;
  ws.getRow(6).height  = 12.75;
  ws.getRow(7).height  = 12.75;
  ws.getRow(8).height  = 16.5;
  ws.getRow(9).height  = 21.75;
  ws.getRow(10).height = 16.5;
  ws.getRow(11).height = 30.0;
  for (let r = 12; r <= 17; r++) ws.getRow(r).height = r <= 13 ? 14.25 : 16.5;

  // ── FILA 4: Título ────────────────────────────────────────────────────────
  mergeStyle(1,4, 17,4, { value:'PLANILLA DE MOVIMIENTO.', bold:true, size:11, h:'center', v:'bottom' });
  styleCell(19,4, { value:'ANEXO II (a).', bold:true, size:14, h:'center', v:'center' });

  // ── FILA 5: Indicación ALTAS|BAJAS|MODIFICACIONES ────────────────────────
  mergeStyle(4,5, 12,5, {
    value:'…………………………...……...…………..ALTAS   |   BAJAS   |   MODIFICACIONES   |   ADICIONALES',
    size:8, h:'center', v:'bottom', color:'FFFFFFFF'
  });

  // ── FILA 6: Tachar lo que no corresponda ─────────────────────────────────
  mergeStyle(6,6, 12,6, {
    value:'………....(TACHAR LO QUE NO CORRESPONDA).',
    size:6, h:'center', v:'top', color:'FFFFFFFF'
  });

  // ── FILA 7: Mes/año ───────────────────────────────────────────────────────
  styleCell(13,7, { value:'Mes/año:', size:8, h:'right', v:'bottom' });
  mergeStyle(16,7, 17,7, {
    value: base.eMes || '',
    size:10, h:'left', v:'bottom',
    borders:{ bottom: thinBorder }
  });

  // ── FILA 8: Distrito / N° ─────────────────────────────────────────────────
  styleCell(2,8, { value:'Distrito: ', size:10, h:'left', v:'bottom' });
  mergeStyle(3,8, 5,8, { value: base.eDist || '', size:10, h:'left', v:'bottom', borders:{ bottom:thinBorder } });
  styleCell(6,8, { value:'N°', size:10, h:'general', v:'bottom' });
  styleCell(7,8, { value:'', size:10, borders:{ bottom:thinBorder } });
  styleCell(9,8, { value:'Región Nº', bold:true, size:13, h:'general', v:'bottom' });
  styleCell(12,8, { value:'', borders:{ bottom:thinBorder } });

  // ── FILA 9: Establecimiento ───────────────────────────────────────────────
  styleCell(2,9, { value:'     Establecimiento:', size:10, h:'right', v:'bottom', borders:{ bottom:thinBorder } });
  mergeStyle(3,9, 11,9, { value: base.eNom || '', size:10, h:'left', v:'bottom', borders:{ bottom:thinBorder } });
  styleCell(12,9, { value:'N°', size:10, h:'right', v:'bottom' });
  mergeStyle(13,9, 14,9, { value: base.eNum || '', size:10, h:'left', v:'bottom', borders:{ bottom:thinBorder } });
  styleCell(16,9, { value:'Porcentaje:', size:10, h:'right', v:'bottom' });
  styleCell(17,9, { value:'', size:10, h:'left', v:'bottom', borders:{ bottom:thinBorder } });

  // ── FILAS 10-11: Encabezado tipo movimiento ───────────────────────────────
  mergeStyle(2,10, 3,11, { value:'BAJAS y MODIFICACIONES.', bold:true, size:10, h:'center', v:'bottom', wrap:true, allB:true });
  mergeStyle(4,10, 4,11, { value:'ALTAS,  BAJAS,  MODIFICACIONES y ADICIONALES.', bold:true, size:10, h:'center', v:'bottom', wrap:true, allB:true });
  mergeStyle(5,10, 7,11, { value:'ALTAS y ADICIONALES.', bold:true, size:10, h:'center', v:'center', wrap:true, allB:true });
  mergeStyle(8,10, 15,11,{ value:'ALTAS, MODIFICACIONES y ADICIONALES.', bold:true, size:10, h:'center', v:'center', wrap:true, allB:true });
  mergeStyle(16,10,17,11,{ value:'ALTAS, BAJAS, MODIFICACIONES y ADICIONALES.', bold:true, size:10, h:'center', v:'bottom', wrap:true, allB:true });

  // ── FILAS 12-16: Cabeceras de columnas ───────────────────────────────────
  // B12:C13 — "Según anterior planilla de haberes"
  mergeStyle(2,12, 3,13, { value:'Según anterior planilla de haberes.', size:8, h:'center', v:'center', wrap:true, allB:true });
  // B14:C16 — ref DNI/sec
  mergeStyle(2,14, 3,16, { value:'…………… Documento de Identidad. …………………………..……', size:7, h:'center', v:'center', wrap:true, allB:true });
  // D12:D16
  mergeStyle(4,12, 4,16, { value:'Apellido y Nombres.', size:10, h:'center', v:'center', wrap:true, allB:true });
  // E12:E16
  mergeStyle(5,12, 5,16, { value:'Sit. Revista', size:9, h:'center', v:'center', wrap:true, allB:true });
  // F12:G12
  mergeStyle(6,12, 7,12, { value:'DOCUMENTO', size:9, h:'center', v:'center', borders:{left:thinBorder,right:thinBorder} });
  // Opciones documento
  [{r:13,n:'1',d:'Lib. Enrolamiento'},{r:14,n:'2',d:'Lib. Cívica.'},{r:15,n:'3',d:'Céd. Identidad.'},{r:16,n:'4',d:'D.N.I.'}].forEach(({r,n,d})=>{
    styleCell(6,r, { value:n, size:8, h:'center', borders:{left:thinBorder, bottom:r===16?thinBorder:undefined} });
    styleCell(7,r, { value:d, size:8, h:'left',   borders:{right:thinBorder, bottom:r===16?thinBorder:undefined} });
  });
  // H-O col headers
  mergeStyle(8, 12, 8, 16, { value:'FUNCION',   size:9, h:'center', v:'center', wrap:true, allB:true });
  mergeStyle(9, 12, 9, 16, { value:'RURAL',     size:9, h:'center', v:'center', wrap:true, allB:true });
  mergeStyle(10,12,10,16, { value:'TURNO',     size:9, h:'center', v:'center', wrap:true, allB:true });
  mergeStyle(11,12,11,16, { value:'CATEGORIA', size:9, h:'center', v:'center', wrap:true, allB:true });
  mergeStyle(12,12,12,16, { value:'IMPORTE.',  size:9, h:'center', v:'center', wrap:true, allB:true });
  mergeStyle(13,12,13,16, { value:'N° HORAS',  size:9, h:'center', v:'center', wrap:true, allB:true });
  mergeStyle(14,12,15,12, { value:'Antigüedad',size:9, h:'center', v:'center', allB:true });
  mergeStyle(14,13,14,16, { value:'AÑOS',      size:8, h:'center', v:'center', allB:true });
  mergeStyle(15,13,15,16, { value:'MESES',     size:8, h:'center', v:'center', allB:true });
  mergeStyle(16,12,17,16, { value:'OBSERVACIONES.', size:10, h:'center', v:'center', wrap:true, allB:true });

  // ── FILA 17: Numeración ───────────────────────────────────────────────────
  ws.getRow(17).height = 12.75;
  [[2,1],[3,2],[4,3],[5,4],[6,5],[7,''],[8,6],[9,7],[10,8],[11,9],[12,10],[13,11],[14,12],[15,13]].forEach(([c,v])=>{
    styleCell(c,17, { value:v, size:9, h:'center', v:'center', allB:true });
  });
  styleCell(16,17, { value:14, size:9, h:'center', v:'center', borders:{left:thinBorder,top:thinBorder,bottom:thinBorder} });
  styleCell(17,17, { value:'',  borders:{right:thinBorder,top:thinBorder,bottom:thinBorder} });

  // ── FILAS DE DATOS ────────────────────────────────────────────────────────
  const DATA_START = 18;
  const MIN_ROWS = 9;
  const totalMovs = Math.max(movs.length, MIN_ROWS);

  for (let i = 0; i < totalMovs; i++) {
    const r1 = DATA_START + i * 2;
    const r2 = r1 + 1;
    ws.getRow(r1).height = 12.75;
    ws.getRow(r2).height = 12.75;

    const m = i < movs.length ? movs[i] : {};
    const fmtFecha = (iso) => {
      if (!iso) return '';
      const [y,mo,d] = iso.split('-');
      return d && mo && y ? `${d}/${mo}/${y}` : iso;
    };
    const fechaObs = m.mvDe ? fmtFecha(m.mvDe) + (m.mvHs ? ` al ${fmtFecha(m.mvHs)}` : '') : '';

    // Col B (1): DNI
    mergeStyle(2,r1,2,r2, { value:m.dcDni||'', size:9, h:'center', v:'center', allB:true });
    // Col C (2): Secuencia
    mergeStyle(3,r1,3,r2, { value:m.dcSec||'', size:9, h:'center', v:'center', allB:true });
    // Col D (3): Apellido y Nombres
    mergeStyle(4,r1,4,r2, { value:m.dcNom||'', size:9, h:'left', v:'center', wrap:true, allB:true });
    // Col E (4): Situación de Revista
    mergeStyle(5,r1,5,r2, { value:m.dcRev||'', size:9, h:'center', v:'center', allB:true });
    // Col F (5): tipo doc (siempre 4=DNI)
    mergeStyle(6,r1,6,r2, { value:'4', size:9, h:'center', v:'center', allB:true });
    // Col G: N° doc
    mergeStyle(7,r1,7,r2, { value:m.dcDni||'', size:9, h:'center', v:'center', allB:true });
    // Col H (6): Función
    mergeStyle(8,r1,8,r2, { value:'', size:9, h:'center', v:'center', allB:true });
    // Col I (7): Rural
    mergeStyle(9,r1,9,r2, { value:'', size:9, h:'center', v:'center', allB:true });
    // Col J (8): Turno
    mergeStyle(10,r1,10,r2, { value:m.dcTur||'', size:9, h:'center', v:'center', allB:true });
    // Col K (9): Categoría
    mergeStyle(11,r1,11,r2, { value:m.dcCat||'', size:9, h:'center', v:'center', allB:true });
    // Col L (10): Importe (vacío)
    mergeStyle(12,r1,12,r2, { value:'', size:9, h:'center', v:'center', allB:true });
    // Col M (11): N° Horas
    mergeStyle(13,r1,13,r2, { value:m.dcHst||m.dcHs||'', size:9, h:'center', v:'center', allB:true });
    // Col N (12): Antigüedad Años
    mergeStyle(14,r1,14,r2, { value:m.dcAa||'', size:9, h:'center', v:'center', allB:true });
    // Col O (13): Antigüedad Meses
    mergeStyle(15,r1,15,r2, { value:m.dcAm||'', size:9, h:'center', v:'center', allB:true });
    // Col P:Q (14): Observaciones
    mergeStyle(16,r1,17,r2, { value:m.obs||'', size:8, h:'left', v:'center', wrap:true, allB:true });
  }

  // ── Lugar y fecha ─────────────────────────────────────────────────────────
  const lastRow = DATA_START + totalMovs * 2;
  ws.getRow(lastRow + 2).height = 12.75;
  styleCell(2, lastRow+2, { value:'Lugar y fecha:', size:10, h:'left', v:'bottom' });

  // ── Firmas ────────────────────────────────────────────────────────────────
  const fL = lastRow + 6;  // línea firma
  const fT = lastRow + 7;  // texto firma
  ws.getRow(fL).height = 12.75;
  ws.getRow(fT).height = 12.75;

  // Líneas de firma
  mergeStyle(2,fL,3,fL,   { value:'', borders:{bottom:thinBorder} });
  mergeStyle(5,fL,7,fL,   { value:'', borders:{bottom:thinBorder} });
  mergeStyle(10,fL,12,fL, { value:'', borders:{bottom:thinBorder} });
  mergeStyle(16,fL,17,fL, { value:'', borders:{bottom:thinBorder} });

  // Labels
  styleCell(2,fT,  { value:'Director/a.', size:9, h:'center', v:'top' });
  mergeStyle(5,fT,7,fT,   { value:'Representante Legal.', size:9, h:'center', v:'top', borders:{top:thinBorder} });
  mergeStyle(10,fT,12,fT, { value:'Inspector/a.', size:9, h:'center', v:'top', borders:{top:thinBorder} });
  mergeStyle(16,fT,17,fT, { value:'Director/a Administrativo/a.', size:9, h:'center', v:'top', borders:{top:thinBorder} });

  // ── Generar y descargar ───────────────────────────────────────────────────
  const ts = new Date();
  const fname = `PlanillaMovimientos_${base.eNum||'EST'}_${ts.getFullYear()}${String(ts.getMonth()+1).padStart(2,'0')}.xlsx`;
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = fname; a.click();
  URL.revokeObjectURL(url);
};

// ---- NAVEGACIÓN DE PASOS ----
function goToStep(n) {
  if (n > 1 && !validarStep(state.step)) return;

  // Guardar datos del step actual
  if (state.step === 1) guardarInstitucion();
  if (state.step === 2) guardarPeriodo();

  state.step = n;

  document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
  document.getElementById('step-' + n).classList.add('active');

  document.querySelectorAll('.step').forEach(el => {
    const s = parseInt(el.dataset.step);
    el.classList.remove('active', 'done');
    if (s === n) el.classList.add('active');
    else if (s < n) el.classList.add('done');
  });

  if (n === 4) renderResumen();

  const btnExp = document.getElementById('btn-exportar');
  if (btnExp) btnExp.disabled = state.movimientos.length === 0;
}

function validarStep(n) {
  if (n === 1) {
    const req = ['inst-nombre','inst-numero','inst-distrito','inst-nivel','inst-subvencion','inst-director'];
    for (const id of req) {
      const el = document.getElementById(id);
      if (!el || !el.value.trim()) {
        el && el.focus();
        alert('Por favor completá todos los campos obligatorios (*)');
        return false;
      }
    }
  }
  if (n === 2) {
    if (!document.getElementById('per-mes').value || !document.getElementById('per-anio').value) {
      alert('Completá el mes y año de la novedad.');
      return false;
    }
  }
  return true;
}

function guardarInstitucion() {
  state.institucion = {
    nombre:    v('inst-nombre'),
    numero:    v('inst-numero'),
    distrito:  v('inst-distrito'),
    distNro:   v('inst-distrito-num'),
    nivel:     v('inst-nivel'),
    subvencion:v('inst-subvencion'),
    director:  v('inst-director'),
    sello:     v('inst-sello'),
    area:      v('inst-area'),
  };
}

function guardarPeriodo() {
  state.periodo = {
    mes:       v('per-mes'),
    mesNombre: MESES[parseInt(v('per-mes')) || 0],
    anio:      v('per-anio'),
    fechaPres: v('per-fecha-pres'),
  };
  checkPlazo();
}

function v(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

// ---- ALERTA PLAZO ----
function checkPlazo() {
  const mes = parseInt(state.periodo.mes);
  const anio = parseInt(state.periodo.anio);
  const fechaPres = state.periodo.fechaPres;
  const el = document.getElementById('alerta-plazo');
  if (!mes || !anio || !fechaPres) { el.style.display = 'none'; return; }

  const mesSig = mes === 12 ? 1 : mes + 1;
  const anioSig = mes === 12 ? anio + 1 : anio;
  const pres = new Date(fechaPres);
  const limiteRef = new Date(anioSig, mesSig - 1, 5);

  if (pres > limiteRef) {
    el.style.display = 'flex';
    document.getElementById('alerta-plazo-texto').textContent =
      `Atención: la fecha de presentación (${fechaPres}) puede estar fuera del plazo. ` +
      `Las novedades de ${MESES[mes]} ${anio} deben ingresar hasta el 5° día hábil de ${MESES[mesSig]} ${anioSig}.`;
  } else {
    el.style.display = 'none';
  }
}

// ---- MODAL: FLUJO DE 3 PASOS ----
// Paso A: elegir tipo principal
// Paso B: elegir subtipo
// Paso C: completar datos del movimiento

function abrirModal(editIdx = null) {
  state.modalTipoPrincipal = null;
  state.modalSubtipo = null;
  state.modalDatos = {};
  state.editandoIdx = editIdx;

  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('open');

  if (editIdx !== null) {
    const mov = state.movimientos[editIdx];
    state.modalTipoPrincipal = mov.tipoPrincipal;
    state.modalSubtipo = SUBTIPOS[mov.tipoPrincipal].find(s => s.id === mov.subtipoId);
    state.modalDatos = { ...mov.datos };
    document.getElementById('modal-titulo').textContent = 'Editar Movimiento';
    renderModalCampos();
  } else {
    document.getElementById('modal-titulo').textContent = 'Nuevo Movimiento';
    renderModalTipos();
  }
}

function cerrarModal(e) {
  if (e.target.id === 'modal-overlay') cerrarModalDirecto();
}
function cerrarModalDirecto() {
  document.getElementById('modal-overlay').classList.remove('open');
}

// --- PASO A: Elegir tipo principal ---
function renderModalTipos() {
  const body = document.getElementById('modal-body');
  body.innerHTML = `
    <p style="font-size:0.85rem;color:#718096;margin-bottom:1rem;">
      Seleccioná el tipo de movimiento que querés informar:
    </p>
    <div class="tipo-grid">
      ${TIPOS_PRINCIPALES.map(t => `
        <div class="tipo-card" onclick="seleccionarTipoPrincipal('${t.id}')">
          <span class="tipo-card-icon">${t.icon}</span>
          <div class="tipo-card-titulo">${t.titulo}</div>
          <div class="tipo-card-desc">${t.desc}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function seleccionarTipoPrincipal(id) {
  state.modalTipoPrincipal = id;
  renderModalSubtipos();
}

// --- PASO B: Elegir subtipo ---
function renderModalSubtipos() {
  const tipo = TIPOS_PRINCIPALES.find(t => t.id === state.modalTipoPrincipal);
  const lista = SUBTIPOS[state.modalTipoPrincipal];
  const body = document.getElementById('modal-body');

  body.innerHTML = `
    <div style="margin-bottom:0.8rem;display:flex;align-items:center;gap:0.5rem;">
      <button class="btn-ghost" onclick="renderModalTipos()" style="padding:0.3rem 0.7rem;font-size:0.8rem;">← Volver</button>
      <span style="font-size:0.88rem;font-weight:600;color:var(--azul);">${tipo.icon} ${tipo.titulo}</span>
    </div>
    <p style="font-size:0.82rem;color:#718096;margin-bottom:0.8rem;">Seleccioná el caso que corresponde:</p>
    <div class="subtipo-list">
      ${lista.map(s => `
        <div class="subtipo-item" onclick="seleccionarSubtipo('${s.id}')">
          <span class="subtipo-num">Caso ${s.num}</span>
          <span class="subtipo-titulo">${s.titulo}</span>
          <span class="subtipo-area">Área: ${s.area}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function seleccionarSubtipo(id) {
  const lista = SUBTIPOS[state.modalTipoPrincipal];
  state.modalSubtipo = lista.find(s => s.id === id);
  renderModalCampos();
}

// --- PASO C: Completar campos ---
function renderModalCampos() {
  const sub = state.modalSubtipo;
  const body = document.getElementById('modal-body');
  const tipo = TIPOS_PRINCIPALES.find(t => t.id === state.modalTipoPrincipal);

  // Los campos del subtipo + siempre curso/sección y obs_extra al final
  const campos = [...(sub.campos || []), 'curso_seccion', 'observaciones_extra'];

  body.innerHTML = `
    <div style="margin-bottom:0.8rem;display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
      <button class="btn-ghost" onclick="renderModalSubtipos()" style="padding:0.3rem 0.7rem;font-size:0.8rem;">← Volver</button>
      <span style="font-size:0.88rem;font-weight:600;color:var(--azul);">${tipo.icon} ${sub.titulo}</span>
      <span class="mov-area-badge ${areaClass(sub.area)}">${sub.area}</span>
    </div>

    ${sub.nota ? `<div class="info-box"><strong>Nota:</strong> ${sub.nota}</div>` : ''}

    <div class="modal-section">
      <div class="modal-section-title">Datos del movimiento</div>
      <div class="form-grid">
        ${campos.map(campo => renderCampo(campo)).join('')}
      </div>
    </div>

    <div class="modal-section" id="obs-preview-section">
      <span class="obs-preview-label">Vista previa — Texto de Observaciones (col. 14)</span>
      <div class="obs-preview" id="obs-preview-text">Completá los campos para ver la observación generada.</div>
    </div>

    <div class="modal-nav">
      <button class="btn-ghost" onclick="cerrarModalDirecto()">Cancelar</button>
      <button class="btn-primary" onclick="guardarMovimiento()">
        ${state.editandoIdx !== null ? '✓ Guardar cambios' : '+ Agregar movimiento'}
      </button>
    </div>
  `;

  // Pre-cargar valores si es edición
  if (state.editandoIdx !== null) {
    campos.forEach(c => {
      const el = document.getElementById('campo-' + c);
      if (el && state.modalDatos[c] !== undefined) el.value = state.modalDatos[c];
    });
  }

  // Listener para actualizar preview
  campos.forEach(c => {
    const el = document.getElementById('campo-' + c);
    if (el) el.addEventListener('input', actualizarObsPreview);
    if (el) el.addEventListener('change', actualizarObsPreview);
  });

  actualizarObsPreview();
}

function renderCampo(campo) {
  const cfg = CAMPOS_CONFIG[campo];
  if (!cfg) return '';
  const id = 'campo-' + campo;
  const req = cfg.req ? '<span class="req">*</span>' : '';

  if (cfg.tipo === 'text' || cfg.tipo === 'date' || cfg.tipo === 'number') {
    return `
      <div class="field-group ${campo === 'docente' || campo === 'observaciones_extra' || campo === 'documentacion' ? 'span-2' : ''}">
        <label for="${id}">${cfg.label} ${req}</label>
        <input type="${cfg.tipo}" id="${id}" placeholder="${cfg.placeholder || ''}" />
      </div>`;
  }
  if (cfg.tipo === 'select') {
    return `
      <div class="field-group">
        <label for="${id}">${cfg.label} ${req}</label>
        <select id="${id}">
          <option value="">— Seleccionar —</option>
          ${cfg.opciones.map(o => `<option value="${o.val}">${o.label}</option>`).join('')}
        </select>
      </div>`;
  }
  if (cfg.tipo === 'textarea') {
    return `
      <div class="field-group span-2">
        <label for="${id}">${cfg.label} ${req}</label>
        <textarea id="${id}" placeholder="${cfg.placeholder || ''}"></textarea>
      </div>`;
  }
  return '';
}

function actualizarObsPreview() {
  const sub = state.modalSubtipo;
  if (!sub) return;

  // Leer todos los campos del DOM
  const datos = {};
  (sub.campos || []).forEach(c => {
    const el = document.getElementById('campo-' + c);
    datos[c] = el ? el.value.trim() : '';
  });

  // Formatear fecha legible
  if (datos.fecha) datos.fecha = formatDate(datos.fecha);
  if (datos.fecha_hasta) datos.fecha_hasta = formatDate(datos.fecha_hasta);

  const texto = sub.plantillaObs(datos);
  const el = document.getElementById('obs-preview-text');
  if (el) {
    const curso = document.getElementById('campo-curso_seccion');
    const obsExtra = document.getElementById('campo-observaciones_extra');
    let full = texto;
    if (curso && curso.value.trim()) full += ` Curso/Sección: ${curso.value.trim()}.`;
    if (obsExtra && obsExtra.value.trim()) full += ` ${obsExtra.value.trim()}`;
    el.textContent = full;
  }
}

function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// ---- GUARDAR MOVIMIENTO ----
function guardarMovimiento() {
  const sub = state.modalSubtipo;
  const datos = {};
  const campos = [...(sub.campos || []), 'curso_seccion', 'observaciones_extra'];

  campos.forEach(c => {
    const el = document.getElementById('campo-' + c);
    datos[c] = el ? el.value.trim() : '';
  });

  // Validar campos requeridos
  const faltantes = sub.campos.filter(c => {
    const cfg = CAMPOS_CONFIG[c];
    return cfg && cfg.req && !datos[c];
  });
  if (faltantes.length > 0) {
    alert('Completá los campos obligatorios: ' + faltantes.map(f => CAMPOS_CONFIG[f]?.label).join(', '));
    return;
  }

  // Generar observación final
  const datosFecha = { ...datos };
  if (datosFecha.fecha) datosFecha.fecha = formatDate(datosFecha.fecha);
  if (datosFecha.fecha_hasta) datosFecha.fecha_hasta = formatDate(datosFecha.fecha_hasta);
  let obs = sub.plantillaObs(datosFecha);
  if (datos.curso_seccion) obs += ` Curso/Sección: ${datos.curso_seccion}.`;
  if (datos.observaciones_extra) obs += ` ${datos.observaciones_extra}`;

  const movimiento = {
    tipoPrincipal: state.modalTipoPrincipal,
    subtipoId: sub.id,
    subtipoNum: sub.num,
    subtipoTitulo: sub.titulo,
    area: sub.area,
    datos,
    observacion: obs,
  };

  if (state.editandoIdx !== null) {
    state.movimientos[state.editandoIdx] = movimiento;
  } else {
    state.movimientos.push(movimiento);
  }

  cerrarModalDirecto();
  renderMovimientosLista();
}

// ---- RENDERIZAR LISTA DE MOVIMIENTOS ----
function renderMovimientosLista() {
  const lista = document.getElementById('movimientos-lista');
  const vacioMsg = document.getElementById('lista-vacia-msg');
  const btn4 = document.getElementById('btn-paso4');
  const btnExp = document.getElementById('btn-exportar');

  if (state.movimientos.length === 0) {
    lista.innerHTML = '';
    lista.appendChild(vacioMsg || crearVacioMsg());
    if (btn4) btn4.disabled = true;
    if (btnExp) btnExp.disabled = true;
    return;
  }

  if (btn4) btn4.disabled = false;
  if (btnExp) btnExp.disabled = false;

  lista.innerHTML = state.movimientos.map((m, i) => `
    <div class="movimiento-card">
      <div class="mov-card-left">
        <div class="mov-card-top">
          <span class="mov-numero">#${String(i+1).padStart(2,'0')}</span>
          <span class="mov-tipo-badge badge-${m.tipoPrincipal}">${m.tipoPrincipal.charAt(0).toUpperCase() + m.tipoPrincipal.slice(1)}</span>
          <span class="mov-area-badge ${areaClass(m.area)}">${m.area}</span>
          ${m.datos.situacion ? `<span style="font-size:0.72rem;color:#718096">Rev. ${m.datos.situacion}</span>` : ''}
        </div>
        <div class="mov-docente">${m.datos.docente || '—'}</div>
        <div class="mov-detalle">
          ${m.datos.dni ? `DNI ${m.datos.dni}` : ''}${m.datos.secuencia ? ` · Sec. ${m.datos.secuencia}` : ''}
          ${m.datos.categoria ? ` · Cat. ${m.datos.categoria}` : ''}
          ${m.datos.horas ? ` · ${m.datos.horas} hs/móds.` : ''}
        </div>
        <div class="mov-obs">${m.observacion}</div>
      </div>
      <div class="mov-card-actions">
        <button class="btn-edit-sm" onclick="abrirModal(${i})">Editar</button>
        <button class="btn-danger" onclick="eliminarMovimiento(${i})">Eliminar</button>
      </div>
    </div>
  `).join('');
}

function crearVacioMsg() {
  const d = document.createElement('div');
  d.id = 'lista-vacia-msg';
  d.className = 'lista-vacia';
  d.innerHTML = '<span class="lista-vacia-icon">📋</span><p>Aún no cargaste ningún movimiento.<br>Usá el botón para agregar.</p>';
  return d;
}

function eliminarMovimiento(idx) {
  if (!confirm('¿Eliminás este movimiento?')) return;
  state.movimientos.splice(idx, 1);
  renderMovimientosLista();
}

function areaClass(area) {
  if (area === AREAS.LIQUIDACIONES) return 'area-liquidaciones';
  if (area === AREAS.ENFERMEDADES)  return 'area-enfermedades';
  if (area === AREAS.ASIGNACIONES)  return 'area-asignaciones';
  return 'area-coordinacion';
}

// ---- RESUMEN (STEP 4) ----
function renderResumen() {
  const c = document.getElementById('resumen-container');
  const inst = state.institucion;
  const per = state.periodo;

  c.innerHTML = `
    <div class="resumen-card">
      <div class="resumen-card-header">Datos de la Institución</div>
      <div class="resumen-card-body">
        ${resRow('Establecimiento', inst.nombre)}
        ${resRow('N° Estab.', inst.numero)}
        ${resRow('Distrito', `${inst.distrito}${inst.distNro ? ' (N° ' + inst.distNro + ')' : ''}`)}
        ${resRow('Nivel / Modalidad', inst.nivel)}
        ${resRow('% Subvención', inst.subvencion + '%')}
        ${resRow('Director/a', inst.director)}
        ${resRow('Área de destino', inst.area || 'Según tipo de movimiento')}
      </div>
    </div>

    <div class="resumen-card">
      <div class="resumen-card-header">Período</div>
      <div class="resumen-card-body">
        ${resRow('Mes/Año de la novedad', `${per.mesNombre} ${per.anio}`)}
        ${resRow('Fecha de presentación', per.fechaPres || '—')}
      </div>
    </div>

    <div class="resumen-card">
      <div class="resumen-card-header">Movimientos (${state.movimientos.length})</div>
      <div style="overflow-x:auto;">
        <table class="resumen-movimientos-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Tipo</th>
              <th>Docente</th>
              <th>DNI</th>
              <th>Cat.</th>
              <th>Hs</th>
              <th>Rev.</th>
              <th>Área</th>
              <th>Observación</th>
            </tr>
          </thead>
          <tbody>
            ${state.movimientos.map((m, i) => `
              <tr>
                <td><span class="mov-numero">${i+1}</span></td>
                <td><span class="mov-tipo-badge badge-${m.tipoPrincipal}" style="font-size:0.68rem">${m.tipoPrincipal}</span></td>
                <td>${m.datos.docente || '—'}</td>
                <td>${m.datos.dni || '—'}</td>
                <td>${m.datos.categoria || '—'}</td>
                <td>${m.datos.horas || '—'}</td>
                <td>${m.datos.situacion || '—'}</td>
                <td><span class="mov-area-badge ${areaClass(m.area)}" style="font-size:0.68rem">${m.area}</span></td>
                <td style="font-size:0.78rem;max-width:220px">${m.observacion}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function resRow(label, val) {
  return `<div class="resumen-row"><span class="resumen-label">${label}</span><span class="resumen-val">${val || '—'}</span></div>`;
}

// ---- EXPORTAR XLS ----
function exportarXLS() {
  const inst = state.institucion;
  const per = state.periodo;
  const movs = state.movimientos;

  const wb = XLSX.utils.book_new();
  const wsData = [];

  // ---- FILA 1: Título ----
  wsData.push([
    'PROVINCIA DE BUENOS AIRES',
    '', '', '', '',
    'DIRECCIÓN GENERAL DE CULTURA Y EDUCACIÓN',
    '', '', '', '',
    'DIRECCIÓN PROVINCIAL DE EDUCACIÓN DE GESTIÓN PRIVADA',
    '', '', ''
  ]);

  // ---- FILA 2: Encabezado planilla ----
  wsData.push(['PLANILLA DE MOVIMIENTOS', '', '', '', '', '', '', '', '', '', '', '', '', '']);

  // ---- FILA 3: Datos institución ----
  wsData.push([
    'ESTABLECIMIENTO:', inst.nombre,
    '', 'N°:', inst.numero,
    'DISTRITO:', inst.distrito,
    'N° DISTRITO:', inst.distNro || '',
    'NIVEL:', inst.nivel,
    '% SUBV.:', inst.subvencion + '%', ''
  ]);

  // ---- FILA 4: Período y área ----
  const areaDestino = inst.area || 'Según tipo de movimiento';
  wsData.push([
    'PERÍODO:', `${per.mesNombre || ''} ${per.anio || ''}`,
    '', 'ÁREA DE DESTINO:', areaDestino,
    '', '', '', '',
    'FECHA PRESENTACIÓN:', per.fechaPres || '',
    '', '', ''
  ]);

  // ---- FILA 5: Vacía separadora ----
  wsData.push([]);

  // ---- FILA 6: CABECERAS DE COLUMNAS (según planilla oficial) ----
  wsData.push([
    'Col. 1\nAPELLIDO Y NOMBRE',       // 1
    'Col. 2\nDNI',                       // 2
    'Col. 3\nSECUENCIA',                // 3
    'Col. 4\nSIT. REVISTA',             // 4
    'Col. 5\nTIPO MOV.',                // 5
    'Col. 6\nFECHA DESDE',              // 6
    'Col. 7\nFECHA HASTA',              // 7
    'Col. 8\nCATEGORÍA',               // 8
    'Col. 9\nCURSO / TURNO',            // 9
    'Col. 10\nJOR\nNADA',              // 10
    'Col. 11\nCANT. HS\nO MÓDULOS',    // 11
    'Col. 12\nANTIG.\nAÑOS',           // 12
    'Col. 13\nANTIG.\nMESES',          // 13
    'Col. 14\nOBSERVACIONES',           // 14
  ]);

  // ---- FILAS DE DATOS ----
  movs.forEach((m, i) => {
    const d = m.datos;

    // Antigüedad: convertir años decimales a años/meses
    let antigAnios = '';
    let antigMeses = '';
    if (d.antiguedad) {
      const total = parseFloat(d.antiguedad);
      antigAnios = Math.floor(total);
      antigMeses = Math.round((total - antigAnios) * 12);
    }

    // Tipo de movimiento para col. 5
    const tipoMov = {
      alta: 'A',
      baja: 'B',
      modificacion: 'M',
      asignacion: 'AF',
    }[m.tipoPrincipal] || 'M';

    wsData.push([
      d.docente || '',                          // 1
      d.dni || '',                               // 2
      d.secuencia || d.secuencia_ant || '',      // 3
      d.situacion || '',                         // 4
      tipoMov,                                   // 5
      d.fecha ? formatXLSDate(d.fecha) : '',    // 6
      d.fecha_hasta ? formatXLSDate(d.fecha_hasta) : '', // 7
      d.categoria || '',                         // 8
      d.curso_seccion || '',                     // 9
      '',                                        // 10 (jornada)
      d.horas || '',                             // 11
      antigAnios,                                // 12
      antigMeses || '',                          // 13
      m.observacion || '',                       // 14
    ]);
  });

  // ---- FILAS VACÍAS ADICIONALES (para completar a mano si hace falta) ----
  for (let i = 0; i < 5; i++) {
    wsData.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '']);
  }

  // ---- FILA FINAL: Firma ----
  wsData.push([]);
  wsData.push([
    'FIRMA Y SELLO DIRECTOR/A:', inst.director,
    '', '', '', '', '',
    'FIRMA Y SELLO INSPECTOR/A:', '',
    '', '', '', '', ''
  ]);

  // ---- CREAR WORKSHEET ----
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // ---- ANCHOS DE COLUMNA ----
  ws['!cols'] = [
    { wch: 28 }, // A - Apellido y Nombre
    { wch: 14 }, // B - DNI
    { wch: 10 }, // C - Secuencia
    { wch: 10 }, // D - Sit. Revista
    { wch: 7  }, // E - Tipo Mov
    { wch: 12 }, // F - Fecha desde
    { wch: 12 }, // G - Fecha hasta
    { wch: 10 }, // H - Categoría
    { wch: 10 }, // I - Curso
    { wch: 6  }, // J - Jornada
    { wch: 8  }, // K - Hs/Módulos
    { wch: 8  }, // L - Antig. Años
    { wch: 8  }, // M - Antig. Meses
    { wch: 55 }, // N - Observaciones
  ];

  // ---- ESTILOS via SheetJS (ce) ----
  applyStyles(ws, wsData.length, movs.length);

  // ---- AGREGAR HOJA ----
  XLSX.utils.book_append_sheet(wb, ws, 'Planilla de Movimientos');

  // ---- NOMBRE DEL ARCHIVO ----
  const nombreArch = `PlanillaMovimientos_${inst.numero || 'INST'}_${per.anio || ''}${String(per.mes || '').padStart(2,'0')}.xlsx`;

  // ---- DESCARGAR ----
  XLSX.writeFile(wb, nombreArch);
}

function formatXLSDate(isoOrSlash) {
  // Acepta dd/mm/yyyy o yyyy-mm-dd
  if (!isoOrSlash) return '';
  if (isoOrSlash.includes('/')) return isoOrSlash;
  const [y, m, d] = isoOrSlash.split('-');
  return `${d}/${m}/${y}`;
}

function applyStyles(ws, totalRows, numMovs) {
  // SheetJS CE no soporta estilos nativos, pero podemos usar
  // el truco de definir !merges para las filas de encabezado

  ws['!merges'] = [
    // Fila 1: título principal (merge A1:N1)
    { s: { r: 0, c: 0 }, e: { r: 0, c: 13 } },
    // Fila 2: subtítulo
    { s: { r: 1, c: 0 }, e: { r: 1, c: 13 } },
    // Fila 3: datos institución — algunos merges
    { s: { r: 2, c: 1 }, e: { r: 2, c: 3 } },  // nombre institución
    // Fila 4: período
    { s: { r: 3, c: 1 }, e: { r: 3, c: 2 } },  // período
    { s: { r: 3, c: 5 }, e: { r: 3, c: 8 } },  // área
    // Observaciones — merge para col 14 en cada fila de datos
    ...Array.from({ length: numMovs }, (_, i) => ({
      s: { r: 7 + i, c: 13 }, e: { r: 7 + i, c: 13 }
    })),
  ];

  // Altura de fila para cabecera de columnas
  ws['!rows'] = [
    { hpt: 20 }, // fila 1
    { hpt: 18 }, // fila 2
    { hpt: 16 }, // fila 3
    { hpt: 14 }, // fila 4
    { hpt: 6  }, // fila 5 (separador)
    { hpt: 36 }, // fila 6 (cabeceras — doble línea)
    { hpt: 5  }, // fila 7 (vacía antes de datos)
    ...Array.from({ length: numMovs + 5 }, () => ({ hpt: 18 })),
  ];
}

// ---- RESET ----
function resetApp() {
  if (!confirm('¿Empezar una nueva planilla? Se perderán los datos actuales.')) return;
  state = { step: 1, institucion: {}, periodo: {}, movimientos: [], modalTipoPrincipal: null, modalSubtipo: null, modalDatos: {}, editandoIdx: null };
  // Reset campos
  ['inst-nombre','inst-numero','inst-distrito','inst-distrito-num','inst-nivel',
   'inst-subvencion','inst-director','inst-sello','inst-area',
   'per-mes','per-anio','per-fecha-pres'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  renderMovimientosLista();
  goToStep(1);
  const btn = document.getElementById('btn-exportar');
  if (btn) btn.disabled = true;
}

// ---- BOTONES HEADER ----
document.getElementById('btn-nuevo').addEventListener('click', resetApp);
document.getElementById('btn-exportar').addEventListener('click', exportarXLS);

// ---- INIT ----
renderMovimientosLista();
