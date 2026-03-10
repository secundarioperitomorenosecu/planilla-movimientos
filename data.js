// ============================================================
// data.js — Datos normativos extraídos del Anexo I Disp. 1000
// Planilla de Movimientos DIPREGEP – Provincia de Buenos Aires
// ============================================================

const MESES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const SITUACION_REVISTA = [
  { codigo: '11', label: 'Titular (11)' },
  { codigo: 'P',  label: 'Provisorio (P)' },
  { codigo: '21', label: 'Suplente (21)' },
  { codigo: '31', label: 'Suplente de titular en licencia por maternidad (31)' },
];

const CATEGORIAS = [
  'PR', 'MG', 'MS', 'MK', 'EF', 'B1', 'B2', 'BM',
  'DS', 'PH', 'PT', 'PF', 'GJ', 'DIR', 'VIC', 'SEC', 'Preceptor/a', 'Otro'
];

const AREAS = {
  LIQUIDACIONES: 'Liquidaciones',
  ENFERMEDADES: 'Licencias por Enfermedad',
  ASIGNACIONES: 'Asignaciones Familiares',
  COORDINACION: 'Coordinación Administrativa',
};

// ---- TIPOS DE MOVIMIENTO con leyendas según Anexo I ----
// Cada subtipo tiene: id, num (de la lista oficial), tipo, titulo, area, plantillaObs, campos[]

const TIPOS_PRINCIPALES = [
  { id: 'alta',          icon: '📗', titulo: 'Alta',          desc: 'Incorporación de docente nuevo o asunción de cargo/horas nuevas.' },
  { id: 'baja',          icon: '📕', titulo: 'Baja',          desc: 'Cese en un cargo o en la totalidad de módulos/horas de un registro.' },
  { id: 'modificacion',  icon: '📘', titulo: 'Modificación',  desc: 'Cambio en situación, horas, antigüedad, inactivación, etc.' },
  { id: 'asignacion',    icon: '📙', titulo: 'Asignación Familiar', desc: 'Alta, baja o modificación de asignaciones familiares del docente.' },
];

const SUBTIPOS = {
  alta: [
    {
      id: 'alta-1',
      num: 1,
      titulo: 'Nuevo aporte estatal',
      area: AREAS.COORDINACION,
      plantillaObs: (d) => `Alta a partir del ${d.fecha} por nuevo aporte estatal.`,
      campos: ['fecha', 'docente', 'dni', 'secuencia_nueva', 'situacion', 'categoria', 'horas', 'antiguedad'],
    },
    {
      id: 'alta-2',
      num: 2,
      titulo: 'Crecimiento vegetativo',
      area: AREAS.LIQUIDACIONES,
      plantillaObs: (d) => `Alta a partir del ${d.fecha} por crecimiento vegetativo.`,
      campos: ['fecha', 'docente', 'dni', 'situacion', 'categoria', 'horas', 'antiguedad'],
    },
    {
      id: 'alta-3',
      num: 3,
      titulo: 'Continúa igual cargo/horas que año anterior (revisaba P)',
      area: AREAS.LIQUIDACIONES,
      plantillaObs: (d) => `Alta a partir del ${d.fecha}. Continúa en igual cargo/horas que el año anterior. Secuencia ${d.secuencia_ant}. Revistaba como código P el año anterior.`,
      campos: ['fecha', 'docente', 'dni', 'secuencia_ant', 'situacion', 'categoria', 'horas', 'antiguedad'],
    },
    {
      id: 'alta-4',
      num: 4,
      titulo: 'Reemplaza a docente por renuncia',
      area: AREAS.LIQUIDACIONES,
      plantillaObs: (d) => `Alta a partir del ${d.fecha}. Reemplaza a ${d.reemplazado}, DNI ${d.dni_reemplazado}. Sec. ${d.sec_reemplazado} por renuncia. Telegrama N° ${d.telegrama}.`,
      campos: ['fecha', 'docente', 'dni', 'reemplazado', 'dni_reemplazado', 'sec_reemplazado', 'telegrama', 'situacion', 'categoria', 'horas', 'antiguedad'],
    },
    {
      id: 'alta-5',
      num: 5,
      titulo: 'Reemplaza a docente por despido',
      area: AREAS.LIQUIDACIONES,
      plantillaObs: (d) => `Alta a partir del ${d.fecha}. Reemplaza a ${d.reemplazado}, DNI ${d.dni_reemplazado}. Sec. ${d.sec_reemplazado} por despido. Telegrama N° ${d.telegrama}.`,
      campos: ['fecha', 'docente', 'dni', 'reemplazado', 'dni_reemplazado', 'sec_reemplazado', 'telegrama', 'situacion', 'categoria', 'horas', 'antiguedad'],
    },
    {
      id: 'alta-6',
      num: 6,
      titulo: 'Reemplaza a docente por abandono de cargo',
      area: AREAS.LIQUIDACIONES,
      plantillaObs: (d) => `Alta a partir del ${d.fecha}. Reemplaza a ${d.reemplazado}, DNI ${d.dni_reemplazado}. Sec. ${d.sec_reemplazado} por abandono de Cargo. Telegrama N° ${d.telegrama}.`,
      campos: ['fecha', 'docente', 'dni', 'reemplazado', 'dni_reemplazado', 'sec_reemplazado', 'telegrama', 'situacion', 'categoria', 'horas', 'antiguedad'],
    },
    {
      id: 'alta-7',
      num: 7,
      titulo: 'Reemplaza a docente por fallecimiento',
      area: AREAS.LIQUIDACIONES,
      plantillaObs: (d) => `Alta a partir del ${d.fecha}. Reemplaza a ${d.reemplazado}, DNI ${d.dni_reemplazado}. Sec. ${d.sec_reemplazado} por fallecimiento.`,
      campos: ['fecha', 'docente', 'dni', 'reemplazado', 'dni_reemplazado', 'sec_reemplazado', 'situacion', 'categoria', 'horas', 'antiguedad'],
    },
    {
      id: 'alta-8',
      num: 8,
      titulo: 'Reemplaza a docente por pase a DIPREGEP 20',
      area: AREAS.LIQUIDACIONES,
      plantillaObs: (d) => `Alta a partir del ${d.fecha}. Reemplaza a ${d.reemplazado}, DNI ${d.dni_reemplazado}. Sec. ${d.sec_reemplazado} por pase a DIPREGEP 20.`,
      campos: ['fecha', 'docente', 'dni', 'reemplazado', 'dni_reemplazado', 'sec_reemplazado', 'situacion', 'categoria', 'horas', 'antiguedad'],
    },
    {
      id: 'alta-suplente',
      num: 28,
      titulo: 'Alta de suplente (por licencia)',
      area: AREAS.LIQUIDACIONES,
      plantillaObs: (d) => `Alta desde ${d.fecha} hasta ${d.fecha_hasta}. Reemplaza a ${d.reemplazado}, DNI ${d.dni_reemplazado}. Sec. ${d.sec_reemplazado} con licencia art. ${d.articulo_licencia}. Se adjunta: ${d.documentacion}.`,
      campos: ['fecha', 'fecha_hasta', 'docente', 'dni', 'reemplazado', 'dni_reemplazado', 'sec_reemplazado', 'articulo_licencia', 'documentacion', 'situacion', 'categoria', 'horas', 'antiguedad'],
    },
  ],

  baja: [
    {
      id: 'baja-23',
      num: 23,
      titulo: 'Baja por renuncia, despido, cierre de curso u otros motivos',
      area: AREAS.LIQUIDACIONES,
      plantillaObs: (d) => `Baja a partir del ${d.fecha} por ${d.motivo_baja}${d.telegrama ? '. Telegrama N° ' + d.telegrama : ''}.`,
      campos: ['fecha', 'docente', 'dni', 'secuencia', 'situacion', 'categoria', 'horas', 'motivo_baja', 'telegrama'],
    },
    {
      id: 'baja-24',
      num: 24,
      titulo: 'Baja — Revistaba como Provisorio el año anterior',
      area: AREAS.LIQUIDACIONES,
      plantillaObs: (d) => `Baja a partir del ${d.fecha}. Revistaba como Provisorio el año anterior.`,
      campos: ['fecha', 'docente', 'dni', 'secuencia', 'situacion', 'categoria', 'horas'],
    },
    {
      id: 'baja-suplente',
      num: 30,
      titulo: 'Baja anticipada de suplente',
      area: AREAS.LIQUIDACIONES,
      plantillaObs: (d) => `Baja a partir del ${d.fecha} por finalización anticipada de suplencia.`,
      campos: ['fecha', 'docente', 'dni', 'secuencia', 'situacion', 'categoria', 'horas'],
    },
  ],

  modificacion: [
    {
      id: 'mod-9',
      num: 9,
      titulo: 'Incremento de horas/módulos — nuevo aporte estatal',
      area: AREAS.COORDINACION,
      plantillaObs: (d) => `Modifica a partir del ${d.fecha}. Incrementa ${d.horas_incremento} horas/módulos por nuevo aporte estatal.`,
      campos: ['fecha', 'docente', 'dni', 'secuencia', 'situacion', 'categoria', 'horas', 'horas_incremento'],
      nota: 'En columna 11 debe figurar el total de horas que el docente pasa a poseer en esta secuencia.',
    },
    {
      id: 'mod-10',
      num: 10,
      titulo: 'Incremento de horas/módulos — crecimiento vegetativo',
      area: AREAS.LIQUIDACIONES,
      plantillaObs: (d) => `Modifica a partir del ${d.fecha}. Incrementa ${d.horas_incremento} horas/módulos por crecimiento vegetativo.`,
      campos: ['fecha', 'docente', 'dni', 'secuencia', 'situacion', 'categoria', 'horas', 'horas_incremento'],
    },
    {
      id: 'mod-11',
      num: 11,
      titulo: 'Incremento de horas/módulos — reemplaza por renuncia',
      area: AREAS.LIQUIDACIONES,
      plantillaObs: (d) => `Modifica a partir del ${d.fecha}. Incrementa ${d.horas_incremento} horas/módulos. Reemplaza a ${d.reemplazado} DNI ${d.dni_reemplazado} Sec. ${d.sec_reemplazado} por renuncia. Telegrama N° ${d.telegrama}.`,
      campos: ['fecha', 'docente', 'dni', 'secuencia', 'situacion', 'categoria', 'horas', 'horas_incremento', 'reemplazado', 'dni_reemplazado', 'sec_reemplazado', 'telegrama'],
    },
    {
      id: 'mod-16',
      num: 16,
      titulo: 'Inactiva secuencia — licencia sin aporte',
      area: AREAS.LIQUIDACIONES,
      plantillaObs: (d) => `Inactiva secuencia por licencia sin aporte a partir del ${d.fecha}. Artículo ${d.articulo_licencia}.`,
      campos: ['fecha', 'docente', 'dni', 'secuencia', 'situacion', 'categoria', 'articulo_licencia'],
    },
    {
      id: 'mod-17',
      num: 17,
      titulo: 'Mantiene secuencia inactiva — prórroga de licencia',
      area: AREAS.LIQUIDACIONES,
      plantillaObs: (d) => `Modifica fecha hasta ${d.fecha_hasta}. Mantiene secuencia inactiva por licencia sin aporte. Artículo ${d.articulo_licencia}.`,
      campos: ['fecha', 'fecha_hasta', 'docente', 'dni', 'secuencia', 'situacion', 'categoria', 'articulo_licencia'],
    },
    {
      id: 'mod-18',
      num: 18,
      titulo: 'Activa secuencia — fin de licencia sin aporte',
      area: AREAS.LIQUIDACIONES,
      plantillaObs: (d) => `Modifica a partir del ${d.fecha}. Activa secuencia por fin de licencia sin aporte. Artículo ${d.articulo_licencia}.`,
      campos: ['fecha', 'docente', 'dni', 'secuencia', 'situacion', 'categoria', 'articulo_licencia'],
    },
    {
      id: 'mod-19',
      num: 19,
      titulo: 'Modifica antigüedad',
      area: AREAS.LIQUIDACIONES,
      plantillaObs: (d) => `Modifica antigüedad a partir del ${d.fecha}.`,
      campos: ['fecha', 'docente', 'dni', 'secuencia', 'situacion', 'antiguedad'],
    },
    {
      id: 'mod-20',
      num: 20,
      titulo: 'Modifica datos personales (DNI o nombre)',
      area: AREAS.LIQUIDACIONES,
      plantillaObs: (d) => `Modifica datos personales (DNI o Apellido y Nombres correctos): ${d.datos_correctos}, DNI ${d.dni_correcto}.`,
      campos: ['docente', 'dni', 'datos_correctos', 'dni_correcto'],
      nota: 'En columnas 1, 2 y 3 deben consignarse los datos TAL COMO FIGURAN EN LA ÚLTIMA PLANILLA DE HABERES.',
    },
    {
      id: 'mod-21',
      num: 21,
      titulo: 'Modifica Categoría',
      area: AREAS.LIQUIDACIONES,
      plantillaObs: (d) => `Modifica Categoría a partir del ${d.fecha} por ${d.motivo_mod_cat}.`,
      campos: ['fecha', 'docente', 'dni', 'secuencia', 'situacion', 'categoria', 'horas', 'motivo_mod_cat'],
    },
    {
      id: 'mod-22',
      num: 22,
      titulo: 'Modifica Situación de Revista',
      area: AREAS.LIQUIDACIONES,
      plantillaObs: (d) => `Modifica Situación de revista a partir del ${d.fecha}. Pasa a revistar con carácter de ${d.nueva_situacion}. ${d.motivo_sit || ''}`,
      campos: ['fecha', 'docente', 'dni', 'secuencia', 'situacion', 'nueva_situacion', 'categoria', 'motivo_sit'],
    },
    {
      id: 'mod-25',
      num: 25,
      titulo: 'Decrece horas/módulos — renuncia parcial',
      area: AREAS.LIQUIDACIONES,
      plantillaObs: (d) => `Modifica a partir del ${d.fecha}. Decrece en ${d.horas_incremento} horas/módulos por renuncia parcial. Telegrama N° ${d.telegrama}.`,
      campos: ['fecha', 'docente', 'dni', 'secuencia', 'situacion', 'categoria', 'horas', 'horas_incremento', 'telegrama'],
    },
    {
      id: 'mod-26',
      num: 26,
      titulo: 'Decrece horas/módulos — pase parcial a DIPREGEP 20',
      area: AREAS.LIQUIDACIONES,
      plantillaObs: (d) => `Modifica a partir del ${d.fecha}. Decrece ${d.horas_incremento} horas/módulos por pase parcial a DIPREGEP 20.`,
      campos: ['fecha', 'docente', 'dni', 'secuencia', 'situacion', 'categoria', 'horas', 'horas_incremento'],
    },
    {
      id: 'mod-29',
      num: 29,
      titulo: 'Modifica fecha hasta de suplencia',
      area: AREAS.LIQUIDACIONES,
      plantillaObs: (d) => `Modifica fecha hasta ${d.fecha_hasta}. Reemplaza a ${d.reemplazado}, DNI ${d.dni_reemplazado}. Sec. ${d.sec_reemplazado} con licencia art. ${d.articulo_licencia}.`,
      campos: ['fecha_hasta', 'docente', 'dni', 'secuencia', 'reemplazado', 'dni_reemplazado', 'sec_reemplazado', 'articulo_licencia', 'documentacion'],
    },
  ],

  asignacion: [
    {
      id: 'asig-31',
      num: 31,
      titulo: 'Solicita Asignación Familiar',
      area: AREAS.ASIGNACIONES,
      plantillaObs: (d) => `Solicita Asignación Familiar. Se adjunta: ${d.documentacion}.`,
      campos: ['docente', 'dni', 'tipo_asignacion', 'documentacion'],
    },
  ],
};

// Campos descriptivos para el formulario del modal
const CAMPOS_CONFIG = {
  fecha:            { label: 'Fecha desde',            tipo: 'date', req: true },
  fecha_hasta:      { label: 'Fecha hasta',             tipo: 'date', req: true },
  docente:          { label: 'Apellido y Nombre del docente', tipo: 'text', req: true, placeholder: 'Ej: García, María Laura' },
  dni:              { label: 'DNI del docente',          tipo: 'text', req: true, placeholder: 'Ej: 25.123.456' },
  secuencia:        { label: 'N° Secuencia / Cargo',     tipo: 'text', req: false, placeholder: 'Ej: 001' },
  secuencia_nueva:  { label: 'N° Secuencia (nueva)',     tipo: 'text', req: false, placeholder: 'Sistema lo asigna automáticamente' },
  secuencia_ant:    { label: 'N° Secuencia año anterior',tipo: 'text', req: true, placeholder: 'Ej: 003' },
  situacion:        { label: 'Situación de Revista',     tipo: 'select', req: true, opciones: SITUACION_REVISTA.map(s => ({ val: s.codigo, label: s.label })) },
  nueva_situacion:  { label: 'Nueva Situación de Revista', tipo: 'select', req: true, opciones: SITUACION_REVISTA.map(s => ({ val: s.codigo, label: s.label })) },
  categoria:        { label: 'Categoría',               tipo: 'select', req: true, opciones: CATEGORIAS.map(c => ({ val: c, label: c })) },
  horas:            { label: 'Total hs/módulos (col. 11)', tipo: 'number', req: false, placeholder: 'Cantidad total en esta secuencia' },
  horas_incremento: { label: 'Incremento / Decremento hs', tipo: 'number', req: false, placeholder: 'Cantidad a modificar' },
  antiguedad:       { label: 'Antigüedad al 30 del mes (años)', tipo: 'number', req: false, placeholder: 'Ej: 5' },
  reemplazado:      { label: 'Apellido y Nombre del reemplazado', tipo: 'text', req: true, placeholder: 'Ej: Pérez, Juan' },
  dni_reemplazado:  { label: 'DNI del reemplazado',      tipo: 'text', req: true, placeholder: 'Ej: 20.456.789' },
  sec_reemplazado:  { label: 'Secuencia del reemplazado', tipo: 'text', req: true, placeholder: 'Ej: 002' },
  telegrama:        { label: 'N° de Telegrama',          tipo: 'text', req: false, placeholder: 'Ej: 00123456' },
  articulo_licencia:{ label: 'Artículo de la licencia',  tipo: 'text', req: true, placeholder: 'Ej: 114° a.1' },
  motivo_baja:      { label: 'Motivo de baja',           tipo: 'select', req: true, opciones: [
    { val: 'renuncia', label: 'Renuncia' },
    { val: 'despido', label: 'Despido' },
    { val: 'cierre de curso', label: 'Cierre de curso' },
    { val: 'abandono de cargo', label: 'Abandono de cargo' },
    { val: 'fallecimiento', label: 'Fallecimiento' },
    { val: 'jubilación', label: 'Jubilación' },
    { val: 'otros motivos', label: 'Otros motivos' },
  ]},
  motivo_mod_cat:   { label: 'Motivo de modificación',   tipo: 'text', req: true, placeholder: 'Explicar causa' },
  motivo_sit:       { label: 'Motivo (opcional)',         tipo: 'text', req: false, placeholder: 'Ej: Asume titularidad por concurso' },
  datos_correctos:  { label: 'Apellido y Nombre correctos', tipo: 'text', req: true },
  dni_correcto:     { label: 'DNI correcto',              tipo: 'text', req: true },
  documentacion:    { label: 'Documentación adjunta',     tipo: 'textarea', req: true, placeholder: 'Nómina de documentación que se adjunta' },
  tipo_asignacion:  { label: 'Tipo de asignación',        tipo: 'select', req: true, opciones: [
    { val: 'Por hijo', label: 'Por hijo' },
    { val: 'Por cónyuge', label: 'Por cónyuge' },
    { val: 'Ayuda escolar', label: 'Ayuda escolar' },
    { val: 'Por matrimonio', label: 'Por matrimonio' },
    { val: 'Por maternidad', label: 'Por maternidad' },
    { val: 'Por nacimiento', label: 'Por nacimiento' },
    { val: 'Por discapacidad', label: 'Por discapacidad' },
  ]},
  curso_seccion:    { label: 'Curso / Sección',           tipo: 'text', req: false, placeholder: 'Ej: 3° A' },
  observaciones_extra: { label: 'Observaciones adicionales', tipo: 'textarea', req: false, placeholder: 'Información complementaria' },
};
