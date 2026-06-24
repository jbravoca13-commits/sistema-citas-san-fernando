require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseKey = (process.env.SUPABASE_ANON_KEY || '').trim();

async function supabaseRequest(endpoint, options = {}) {
  const respuesta = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options.headers || {})
    }
  });

  const data = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}

app.get('/api/test', async (req, res) => {
  try {
    const data = await supabaseRequest('pacientes?select=*');
    res.json({
      mensaje: 'Conexión correcta con Supabase',
      pacientes: data
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al conectar con Supabase',
      error: error.message
    });
  }
});

// PACIENTES
app.get('/api/pacientes', async (req, res) => {
  try {
    const data = await supabaseRequest('pacientes?select=*&order=id_paciente.asc');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pacientes', async (req, res) => {
  try {
    const data = await supabaseRequest('pacientes', {
      method: 'POST',
      body: JSON.stringify(req.body)
    });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ESPECIALIDADES
app.get('/api/especialidades', async (req, res) => {
  try {
    const data = await supabaseRequest('especialidades?select=*&order=id_especialidad.asc');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MÉDICOS
app.get('/api/medicos', async (req, res) => {
  try {
    const data = await supabaseRequest('medicos?select=*&order=id_medico.asc');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/medicos', async (req, res) => {
  try {
    const data = await supabaseRequest('medicos', {
      method: 'POST',
      body: JSON.stringify(req.body)
    });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// HORARIOS
app.get('/api/horarios', async (req, res) => {
  try {
    const data = await supabaseRequest('horarios?select=*&order=id_horario.asc');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/horarios', async (req, res) => {
  try {
    const data = await supabaseRequest('horarios', {
      method: 'POST',
      body: JSON.stringify(req.body)
    });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CITAS
app.get('/api/citas', async (req, res) => {
  try {
    const data = await supabaseRequest('citas?select=*&order=id_cita.asc');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/citas', async (req, res) => {
  try {
    const { id_medico, fecha_cita, hora_cita } = req.body;

    const existe = await supabaseRequest(
      `citas?select=id_cita&id_medico=eq.${id_medico}&fecha_cita=eq.${fecha_cita}&hora_cita=eq.${hora_cita}`
    );

    if (existe.length > 0) {
      return res.status(409).json({
        error: 'El médico ya tiene una cita registrada en esa fecha y hora.'
      });
    }

    const data = await supabaseRequest('citas', {
      method: 'POST',
      body: JSON.stringify(req.body)
    });

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { nombre_usuario, clave } = req.body;

    if (!nombre_usuario || !clave) {
      return res.status(400).json({
        error: 'Ingrese el usuario y la contraseña.'
      });
    }

    const usuarioSeguro = encodeURIComponent(nombre_usuario);
    const claveSegura = encodeURIComponent(clave);

    const usuarios = await supabaseRequest(
      `usuarios?select=id_usuario,nombre_usuario,rol&nombre_usuario=eq.${usuarioSeguro}&clave=eq.${claveSegura}`
    );

    if (!usuarios || usuarios.length === 0) {
      return res.status(401).json({
        error: 'Usuario o contraseña incorrectos.'
      });
    }

    const usuario = usuarios[0];

    res.json({
      mensaje: 'Inicio de sesión correcto.',
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        rol: usuario.rol
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'No se pudo iniciar sesión: ' + error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});