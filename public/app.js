const API = '';

let pacientes = [];
let medicos = [];
let horarios = [];
let especialidades = [];
let citas = [];


/* =====================================================
   INICIO DE SESIÓN
===================================================== */

function obtenerUsuarioSesion() {
  const usuarioGuardado = localStorage.getItem('usuarioSesion');

  if (!usuarioGuardado) {
    return null;
  }

  try {
    return JSON.parse(usuarioGuardado);
  } catch (error) {
    localStorage.removeItem('usuarioSesion');
    return null;
  }
}


function guardarUsuarioSesion(usuario) {
  localStorage.setItem(
    'usuarioSesion',
    JSON.stringify(usuario)
  );
}


function mostrarUsuarioActivo(usuario) {
  const menu = document.querySelector('nav');

  if (!menu || !usuario) {
    return;
  }

  const informacion = document.createElement('span');

  informacion.className = 'usuario-activo';

  informacion.textContent =
    `${usuario.nombre_usuario} | ${usuario.rol}`;

  const botonCerrar =
    menu.querySelector('.btn-cerrar-sesion');

  if (botonCerrar) {
    menu.insertBefore(informacion, botonCerrar);
  } else {
    menu.appendChild(informacion);
  }
}

function cerrarSesion() {
  localStorage.removeItem('usuarioSesion');
  window.location.href = 'login.html';
}


async function iniciarLogin() {
  const formulario = document.getElementById('formLogin');

  if (!formulario) {
    return;
  }

  formulario.addEventListener('submit', async evento => {
    evento.preventDefault();
    limpiarMensaje();

    try {
      const datos = {
        nombre_usuario:
          document.getElementById('loginUsuario')
            .value.trim(),

        clave:
          document.getElementById('loginClave')
            .value
      };

      const respuesta = await enviarDatos(
        '/api/login',
        datos
      );

      guardarUsuarioSesion(respuesta.usuario);

      mostrarMensaje(
        `Bienvenido, ${respuesta.usuario.nombre_usuario}.`,
        'ok'
      );

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 700);

    } catch (error) {
      mostrarMensaje(
        error.message,
        'error'
      );
    }
  });
}

async function obtenerDatos(ruta) {
  const respuesta = await fetch(`${API}${ruta}`);

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    throw new Error(
      datos?.error || 'No se pudieron cargar los datos'
    );
  }

  return datos;
}


async function enviarDatos(ruta, datos) {
  const respuesta = await fetch(`${API}${ruta}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  });

  const resultado = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    throw new Error(
      resultado?.error || 'Error al guardar los datos'
    );
  }

  return resultado;
}


function mostrarMensaje(texto, tipo = 'ok') {
  const mensaje = document.getElementById('mensaje');

  if (!mensaje) {
    return;
  }

  mensaje.textContent = texto;
  mensaje.className = `mensaje visible ${tipo}`;

  mensaje.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
}


function limpiarMensaje() {
  const mensaje = document.getElementById('mensaje');

  if (!mensaje) {
    return;
  }

  mensaje.textContent = '';
  mensaje.className = 'mensaje';
}


function formatearHora(hora) {
  if (!hora) {
    return '';
  }

  return String(hora).slice(0, 5);
}


function nombrePaciente(idPaciente) {
  const paciente = pacientes.find(
    p => Number(p.id_paciente) === Number(idPaciente)
  );

  if (!paciente) {
    return 'Paciente no encontrado';
  }

  return `${paciente.nombres} ${paciente.apellidos}`;
}


function nombreMedico(idMedico) {
  const medico = medicos.find(
    m => Number(m.id_medico) === Number(idMedico)
  );

  if (!medico) {
    return 'Médico no encontrado';
  }

  return `${medico.nombres} ${medico.apellidos}`;
}


function nombreEspecialidad(idEspecialidad) {
  const especialidad = especialidades.find(
    e =>
      Number(e.id_especialidad) ===
      Number(idEspecialidad)
  );

  if (!especialidad) {
    return 'Sin especialidad';
  }

  return especialidad.nombre_especialidad;
}


function filaVacia(columnas, texto = 'No hay registros disponibles') {
  return `
    <tr>
      <td colspan="${columnas}" class="vacio">
        ${texto}
      </td>
    </tr>
  `;
}




async function iniciarPanel() {
  const mensajeAcceso =
    sessionStorage.getItem('mensajeAcceso');

  if (mensajeAcceso) {
    mostrarMensaje(mensajeAcceso, 'error');
    sessionStorage.removeItem('mensajeAcceso');
  }

  try {
    const resultados = await Promise.all([
      obtenerDatos('/api/pacientes'),
      obtenerDatos('/api/medicos'),
      obtenerDatos('/api/horarios'),
      obtenerDatos('/api/citas')
    ]);

    pacientes = resultados[0];
    medicos = resultados[1];
    horarios = resultados[2];
    citas = resultados[3];

    document.getElementById('totalPacientes').textContent =
      pacientes.length;

    document.getElementById('totalMedicos').textContent =
      medicos.length;

    document.getElementById('totalHorarios').textContent =
      horarios.length;

    document.getElementById('totalCitas').textContent =
      citas.length;

  } catch (error) {
    mostrarMensaje(
      'Error al cargar el resumen: ' + error.message,
      'error'
    );
  }
}




async function cargarPacientes() {
  try {
    pacientes = await obtenerDatos('/api/pacientes');

    const tabla = document.getElementById('tablaPacientes');

    if (!tabla) {
      return;
    }

    if (pacientes.length === 0) {
      tabla.innerHTML = filaVacia(7);
      return;
    }

    tabla.innerHTML = pacientes.map(paciente => `
      <tr>
        <td>${paciente.id_paciente}</td>
        <td>${paciente.nombres}</td>
        <td>${paciente.apellidos}</td>
        <td>${paciente.dni}</td>
        <td>${paciente.edad ?? ''}</td>
        <td>${paciente.telefono ?? ''}</td>
        <td>${paciente.direccion ?? ''}</td>
      </tr>
    `).join('');

  } catch (error) {
    mostrarMensaje(
      'Error al cargar pacientes: ' + error.message,
      'error'
    );
  }
}


function iniciarPacientes() {
  cargarPacientes();

  const formulario =
    document.getElementById('formPaciente');

  if (!formulario) {
    return;
  }

  formulario.addEventListener('submit', async evento => {
    evento.preventDefault();

    limpiarMensaje();

    try {
      const datos = {
        nombres:
          document.getElementById('pacienteNombres')
            .value.trim(),

        apellidos:
          document.getElementById('pacienteApellidos')
            .value.trim(),

        dni:
          document.getElementById('pacienteDni')
            .value.trim(),

        edad:
          Number(
            document.getElementById('pacienteEdad').value
          ) || null,

        telefono:
          document.getElementById('pacienteTelefono')
            .value.trim(),

        direccion:
          document.getElementById('pacienteDireccion')
            .value.trim()
      };

      await enviarDatos('/api/pacientes', datos);

      formulario.reset();

      mostrarMensaje(
        'Paciente registrado correctamente.',
        'ok'
      );

      await cargarPacientes();

    } catch (error) {
      mostrarMensaje(
        'Error al registrar paciente: ' + error.message,
        'error'
      );
    }
  });
}




async function cargarMedicos() {
  try {
    const resultados = await Promise.all([
      obtenerDatos('/api/medicos'),
      obtenerDatos('/api/especialidades')
    ]);

    medicos = resultados[0];
    especialidades = resultados[1];

    const selectEspecialidad =
      document.getElementById('medicoEspecialidad');

    const tabla =
      document.getElementById('tablaMedicos');

    if (selectEspecialidad) {
      selectEspecialidad.innerHTML =
        '<option value="">Seleccione especialidad</option>';

      especialidades.forEach(especialidad => {
        selectEspecialidad.innerHTML += `
          <option value="${especialidad.id_especialidad}">
            ${especialidad.nombre_especialidad}
          </option>
        `;
      });
    }

    if (!tabla) {
      return;
    }

    if (medicos.length === 0) {
      tabla.innerHTML = filaVacia(6);
      return;
    }

    tabla.innerHTML = medicos.map(medico => `
      <tr>
        <td>${medico.id_medico}</td>
        <td>${medico.nombres}</td>
        <td>${medico.apellidos}</td>
        <td>
          ${nombreEspecialidad(medico.id_especialidad)}
        </td>
        <td>${medico.cmp ?? ''}</td>
        <td>${medico.telefono ?? ''}</td>
      </tr>
    `).join('');

  } catch (error) {
    mostrarMensaje(
      'Error al cargar médicos: ' + error.message,
      'error'
    );
  }
}


function iniciarMedicos() {
  cargarMedicos();

  const formulario =
    document.getElementById('formMedico');

  if (!formulario) {
    return;
  }

  formulario.addEventListener('submit', async evento => {
    evento.preventDefault();

    limpiarMensaje();

    try {
      const datos = {
        nombres:
          document.getElementById('medicoNombres')
            .value.trim(),

        apellidos:
          document.getElementById('medicoApellidos')
            .value.trim(),

        id_especialidad:
          Number(
            document.getElementById(
              'medicoEspecialidad'
            ).value
          ),

        cmp:
          document.getElementById('medicoCmp')
            .value.trim(),

        telefono:
          document.getElementById('medicoTelefono')
            .value.trim()
      };

      await enviarDatos('/api/medicos', datos);

      formulario.reset();

      mostrarMensaje(
        'Médico registrado correctamente.',
        'ok'
      );

      await cargarMedicos();

    } catch (error) {
      mostrarMensaje(
        'Error al registrar médico: ' + error.message,
        'error'
      );
    }
  });
}




async function cargarHorarios() {
  try {
    const resultados = await Promise.all([
      obtenerDatos('/api/horarios'),
      obtenerDatos('/api/medicos')
    ]);

    horarios = resultados[0];
    medicos = resultados[1];

    const selectMedico =
      document.getElementById('horarioMedico');

    const tabla =
      document.getElementById('tablaHorarios');

    if (selectMedico) {
      selectMedico.innerHTML =
        '<option value="">Seleccione médico</option>';

      medicos.forEach(medico => {
        selectMedico.innerHTML += `
          <option value="${medico.id_medico}">
            ${medico.nombres} ${medico.apellidos}
          </option>
        `;
      });
    }

    if (!tabla) {
      return;
    }

    if (horarios.length === 0) {
      tabla.innerHTML = filaVacia(6);
      return;
    }

    tabla.innerHTML = horarios.map(horario => `
      <tr>
        <td>${horario.id_horario}</td>
        <td>${nombreMedico(horario.id_medico)}</td>
        <td>${horario.fecha}</td>
        <td>${formatearHora(horario.hora_inicio)}</td>
        <td>${formatearHora(horario.hora_fin)}</td>
        <td>${horario.estado}</td>
      </tr>
    `).join('');

  } catch (error) {
    mostrarMensaje(
      'Error al cargar horarios: ' + error.message,
      'error'
    );
  }
}


function iniciarHorarios() {
  cargarHorarios();

  const formulario =
    document.getElementById('formHorario');

  if (!formulario) {
    return;
  }

  formulario.addEventListener('submit', async evento => {
    evento.preventDefault();

    limpiarMensaje();

    try {
      const horaInicio =
        document.getElementById('horaInicio').value;

      const horaFin =
        document.getElementById('horaFin').value;

      if (horaFin <= horaInicio) {
        throw new Error(
          'La hora final debe ser mayor que la hora de inicio.'
        );
      }

      const datos = {
        id_medico:
          Number(
            document.getElementById(
              'horarioMedico'
            ).value
          ),

        fecha:
          document.getElementById(
            'horarioFecha'
          ).value,

        hora_inicio: horaInicio,

        hora_fin: horaFin,

        estado: 'Disponible'
      };

      await enviarDatos('/api/horarios', datos);

      formulario.reset();

      mostrarMensaje(
        'Horario registrado correctamente.',
        'ok'
      );

      await cargarHorarios();

    } catch (error) {
      mostrarMensaje(
        'Error al registrar horario: ' + error.message,
        'error'
      );
    }
  });
}




async function cargarCitas() {
  try {
    const resultados = await Promise.all([
      obtenerDatos('/api/pacientes'),
      obtenerDatos('/api/medicos'),
      obtenerDatos('/api/horarios'),
      obtenerDatos('/api/citas')
    ]);

    pacientes = resultados[0];
    medicos = resultados[1];
    horarios = resultados[2];
    citas = resultados[3];

    const selectPaciente =
      document.getElementById('citaPaciente');

    const selectMedico =
      document.getElementById('citaMedico');

    const selectHorario =
      document.getElementById('citaHorario');

    const tabla =
      document.getElementById('tablaCitas');


    if (selectPaciente) {
      selectPaciente.innerHTML =
        '<option value="">Seleccione paciente</option>';

      pacientes.forEach(paciente => {
        selectPaciente.innerHTML += `
          <option value="${paciente.id_paciente}">
            ${paciente.nombres}
            ${paciente.apellidos}
            - DNI: ${paciente.dni}
          </option>
        `;
      });
    }


    if (selectMedico) {
      selectMedico.innerHTML =
        '<option value="">Seleccione médico</option>';

      medicos.forEach(medico => {
        selectMedico.innerHTML += `
          <option value="${medico.id_medico}">
            ${medico.nombres} ${medico.apellidos}
          </option>
        `;
      });
    }


    if (selectHorario) {
      selectHorario.innerHTML =
        '<option value="">Seleccione horario</option>';

      horarios.forEach(horario => {
        selectHorario.innerHTML += `
          <option
            value="${horario.id_horario}"
            data-medico="${horario.id_medico}"
            data-fecha="${horario.fecha}"
            data-hora="${formatearHora(
              horario.hora_inicio
            )}"
          >
            ${nombreMedico(horario.id_medico)}
            | ${horario.fecha}
            | ${formatearHora(horario.hora_inicio)}
            - ${formatearHora(horario.hora_fin)}
          </option>
        `;
      });
    }


    if (!tabla) {
      return;
    }

    if (citas.length === 0) {
      tabla.innerHTML = filaVacia(6);
      return;
    }

    tabla.innerHTML = citas.map(cita => `
      <tr>
        <td>${cita.id_cita}</td>
        <td>${nombrePaciente(cita.id_paciente)}</td>
        <td>${nombreMedico(cita.id_medico)}</td>
        <td>${cita.fecha_cita}</td>
        <td>${formatearHora(cita.hora_cita)}</td>
        <td>${cita.estado}</td>
      </tr>
    `).join('');

  } catch (error) {
    mostrarMensaje(
      'Error al cargar citas: ' + error.message,
      'error'
    );
  }
}


function iniciarCitas() {
  cargarCitas();

  const selectHorario =
    document.getElementById('citaHorario');

  const formulario =
    document.getElementById('formCita');


  if (selectHorario) {
    selectHorario.addEventListener('change', () => {
      const opcion =
        selectHorario.selectedOptions[0];

      if (!opcion || !opcion.value) {
        return;
      }

      document.getElementById('citaMedico').value =
        opcion.dataset.medico;

      document.getElementById('citaFecha').value =
        opcion.dataset.fecha;

      document.getElementById('citaHora').value =
        opcion.dataset.hora;
    });
  }


  if (!formulario) {
    return;
  }

  formulario.addEventListener('submit', async evento => {
    evento.preventDefault();

    limpiarMensaje();

    try {
      const datos = {
        id_paciente:
          Number(
            document.getElementById(
              'citaPaciente'
            ).value
          ),

        id_medico:
          Number(
            document.getElementById(
              'citaMedico'
            ).value
          ),

        id_horario:
          Number(
            document.getElementById(
              'citaHorario'
            ).value
          ),

        id_usuario: obtenerUsuarioSesion().id_usuario,

        fecha_cita:
          document.getElementById(
            'citaFecha'
          ).value,

        hora_cita:
          document.getElementById(
            'citaHora'
          ).value,

        estado:
          document.getElementById(
            'citaEstado'
          ).value
      };

      await enviarDatos('/api/citas', datos);

      formulario.reset();

      mostrarMensaje(
        'Cita registrada correctamente.',
        'ok'
      );

      await cargarCitas();

    } catch (error) {
      mostrarMensaje(
        'Error al registrar cita: ' + error.message,
        'error'
      );
    }
  });
}


document.addEventListener('DOMContentLoaded', () => {
  const modulo = document.body.dataset.modulo;

  // Si estamos en la pantalla de login
  if (modulo === 'login') {
    const usuarioActivo = obtenerUsuarioSesion();

    if (usuarioActivo) {
      window.location.href = 'index.html';
      return;
    }

    iniciarLogin();
    return;
  }

  // Proteger las demás páginas
  const usuarioActivo = obtenerUsuarioSesion();

  if (!usuarioActivo) {
    window.location.href = 'login.html';
    return;
  }
  mostrarUsuarioActivo(usuarioActivo);
  aplicarPermisosPorRol(usuarioActivo);
  

  function aplicarPermisosPorRol(usuario) {
  const rol = usuario.rol.toLowerCase();

  const permisos = {
    administrador: [
      'inicio',
      'pacientes',
      'medicos',
      'horarios',
      'citas'
    ],

    recepcionista: [
      'inicio',
      'pacientes',
      'horarios',
      'citas'
    ],

    'gestor de citas': [
      'inicio',
      'citas'
    ]
  };

  const modulosPermitidos =
    permisos[rol] || ['inicio'];

  const moduloActual =
    document.body.dataset.modulo;

  document.querySelectorAll('nav a').forEach(enlace => {
    const archivo = enlace
      .getAttribute('href')
      .replace('.html', '');

    const moduloEnlace =
      archivo === 'index' ? 'inicio' : archivo;

    if (!modulosPermitidos.includes(moduloEnlace)) {
      enlace.style.display = 'none';
    }
  });

  document
    .querySelectorAll('.modulo-enlace')
    .forEach(enlace => {
      const archivo = enlace
        .getAttribute('href')
        .replace('.html', '');

      if (!modulosPermitidos.includes(archivo)) {
        enlace.style.display = 'none';
      }
    });

  if (!modulosPermitidos.includes(moduloActual)) {
    sessionStorage.setItem(
      'mensajeAcceso',
      'No tiene permisos para ingresar a ese módulo.'
    );

    window.location.href = 'index.html';
  }
}

  // Iniciar el módulo correspondiente
  if (modulo === 'inicio') {
    iniciarPanel();
  }

  if (modulo === 'pacientes') {
    iniciarPacientes();
  }

  if (modulo === 'medicos') {
    iniciarMedicos();
  }

  if (modulo === 'horarios') {
    iniciarHorarios();
  }

  if (modulo === 'citas') {
    iniciarCitas();
  }
});