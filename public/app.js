const API = '';

let pacientes = [];
let medicos = [];
let horarios = [];
let especialidades = [];
let citas = [];

async function obtenerDatos(ruta) {
  const res = await fetch(`${API}${ruta}`);
  return await res.json();
}

async function enviarDatos(ruta, datos) {
  const res = await fetch(`${API}${ruta}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  });

  const respuesta = await res.json();

  if (!res.ok) {
    throw new Error(respuesta.error || 'Error al guardar');
  }

  return respuesta;
}

function mostrarMensaje(texto, tipo = 'ok') {
  const mensaje = document.getElementById('mensaje');
  mensaje.textContent = texto;
  mensaje.className = tipo;
}

async function cargarDatos() {
  try {
    pacientes = await obtenerDatos('/api/pacientes');
    medicos = await obtenerDatos('/api/medicos');
    horarios = await obtenerDatos('/api/horarios');
    especialidades = await obtenerDatos('/api/especialidades');
    citas = await obtenerDatos('/api/citas');

    cargarSelects();
    cargarTablaCitas();

  } catch (error) {
    mostrarMensaje('Error al cargar datos: ' + error.message, 'error');
  }
}

function cargarSelects() {
  const medicoEspecialidad = document.getElementById('medicoEspecialidad');
  medicoEspecialidad.innerHTML = '<option value="">Seleccione especialidad</option>';

  especialidades.forEach(e => {
    medicoEspecialidad.innerHTML += `
      <option value="${e.id_especialidad}">${e.nombre_especialidad}</option>
    `;
  });

  const horarioMedico = document.getElementById('horarioMedico');
  const citaMedico = document.getElementById('citaMedico');

  horarioMedico.innerHTML = '<option value="">Seleccione médico</option>';
  citaMedico.innerHTML = '<option value="">Seleccione médico</option>';

  medicos.forEach(m => {
    const nombre = `${m.nombres} ${m.apellidos}`;
    horarioMedico.innerHTML += `<option value="${m.id_medico}">${nombre}</option>`;
    citaMedico.innerHTML += `<option value="${m.id_medico}">${nombre}</option>`;
  });

  const citaPaciente = document.getElementById('citaPaciente');
  citaPaciente.innerHTML = '<option value="">Seleccione paciente</option>';

  pacientes.forEach(p => {
    citaPaciente.innerHTML += `
      <option value="${p.id_paciente}">${p.nombres} ${p.apellidos} - DNI: ${p.dni}</option>
    `;
  });

  const citaHorario = document.getElementById('citaHorario');
  citaHorario.innerHTML = '<option value="">Seleccione horario</option>';

  horarios.forEach(h => {
    const medico = medicos.find(m => m.id_medico === h.id_medico);
    const nombreMedico = medico ? `${medico.nombres} ${medico.apellidos}` : 'Médico no encontrado';

    citaHorario.innerHTML += `
      <option 
        value="${h.id_horario}" 
        data-medico="${h.id_medico}"
        data-fecha="${h.fecha}"
        data-hora="${h.hora_inicio}">
        ${nombreMedico} | ${h.fecha} | ${h.hora_inicio} - ${h.hora_fin}
      </option>
    `;
  });
}

function cargarTablaCitas() {
  const tabla = document.getElementById('tablaCitas');
  tabla.innerHTML = '';

  citas.forEach(c => {
    const paciente = pacientes.find(p => p.id_paciente === c.id_paciente);
    const medico = medicos.find(m => m.id_medico === c.id_medico);

    const nombrePaciente = paciente ? `${paciente.nombres} ${paciente.apellidos}` : 'Paciente no encontrado';
    const nombreMedico = medico ? `${medico.nombres} ${medico.apellidos}` : 'Médico no encontrado';

    tabla.innerHTML += `
      <tr>
        <td>${c.id_cita}</td>
        <td>${nombrePaciente}</td>
        <td>${nombreMedico}</td>
        <td>${c.fecha_cita}</td>
        <td>${c.hora_cita}</td>
        <td>${c.estado}</td>
      </tr>
    `;
  });
}

document.getElementById('formPaciente').addEventListener('submit', async (e) => {
  e.preventDefault();

  try {
    const datos = {
      nombres: document.getElementById('pacienteNombres').value,
      apellidos: document.getElementById('pacienteApellidos').value,
      dni: document.getElementById('pacienteDni').value,
      edad: Number(document.getElementById('pacienteEdad').value),
      telefono: document.getElementById('pacienteTelefono').value,
      direccion: document.getElementById('pacienteDireccion').value
    };

    await enviarDatos('/api/pacientes', datos);
    e.target.reset();
    mostrarMensaje('Paciente registrado correctamente');
    await cargarDatos();

  } catch (error) {
    mostrarMensaje('Error al registrar paciente: ' + error.message, 'error');
  }
});

document.getElementById('formMedico').addEventListener('submit', async (e) => {
  e.preventDefault();

  try {
    const datos = {
      nombres: document.getElementById('medicoNombres').value,
      apellidos: document.getElementById('medicoApellidos').value,
      id_especialidad: Number(document.getElementById('medicoEspecialidad').value),
      cmp: document.getElementById('medicoCmp').value,
      telefono: document.getElementById('medicoTelefono').value
    };

    await enviarDatos('/api/medicos', datos);
    e.target.reset();
    mostrarMensaje('Médico registrado correctamente');
    await cargarDatos();

  } catch (error) {
    mostrarMensaje('Error al registrar médico: ' + error.message, 'error');
  }
});

document.getElementById('formHorario').addEventListener('submit', async (e) => {
  e.preventDefault();

  try {
    const datos = {
      id_medico: Number(document.getElementById('horarioMedico').value),
      fecha: document.getElementById('horarioFecha').value,
      hora_inicio: document.getElementById('horaInicio').value,
      hora_fin: document.getElementById('horaFin').value,
      estado: 'Disponible'
    };

    await enviarDatos('/api/horarios', datos);
    e.target.reset();
    mostrarMensaje('Horario registrado correctamente');
    await cargarDatos();

  } catch (error) {
    mostrarMensaje('Error al registrar horario: ' + error.message, 'error');
  }
});

document.getElementById('citaHorario').addEventListener('change', () => {
  const opcion = document.getElementById('citaHorario').selectedOptions[0];

  if (opcion && opcion.value) {
    document.getElementById('citaMedico').value = opcion.dataset.medico;
    document.getElementById('citaFecha').value = opcion.dataset.fecha;
    document.getElementById('citaHora').value = opcion.dataset.hora;
  }
});

document.getElementById('formCita').addEventListener('submit', async (e) => {
  e.preventDefault();

  try {
    const datos = {
      id_paciente: Number(document.getElementById('citaPaciente').value),
      id_medico: Number(document.getElementById('citaMedico').value),
      id_horario: Number(document.getElementById('citaHorario').value),
      id_usuario: 1,
      fecha_cita: document.getElementById('citaFecha').value,
      hora_cita: document.getElementById('citaHora').value,
      estado: document.getElementById('citaEstado').value
    };

    await enviarDatos('/api/citas', datos);
    e.target.reset();
    mostrarMensaje('Cita registrada correctamente');
    await cargarDatos();

  } catch (error) {
    mostrarMensaje('Error al registrar cita: ' + error.message, 'error');
  }
});

cargarDatos();