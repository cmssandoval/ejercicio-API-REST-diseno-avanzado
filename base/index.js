const express = require('express');
const app = express();
app.listen(5000, console.log('Server ON'));

const { medicamentosModelo, personalModelo } = require('./consultas.js');

app.get('/medicamentos', async ( req, res ) => {
  const medicamentos = await medicamentosModelo.obtenerMedicamentos(req.query);
  const HATEOAS = medicamentosModelo.prepararHATEOASMedicamentos(medicamentos);
  res.json(HATEOAS);
});

app.get('/medicamentos/filtros', async ( req, res ) => {
  const filtros = req.query;
  const medicamentos = await medicamentosModelo.obtenerMedicamentosPorFiltros(filtros);
  res.json(medicamentos);
});

// app.get('/medicamentos/medicamento/:id', async ( req, res ) => {
//   ...
// });

app.get('/personal', async ( req, res ) => {
  const personal = await personalModelo.obtenerPersonal(req.query);
  const HATEOAS = personalModelo.prepararHATEOASPersonal(personal);
  res.json(HATEOAS);
});

app.get('/personal/filtros', async ( req, res ) => {
  const filtros = req.query;
  const personal = await personalModelo.obtenerPersonalPorFiltros(filtros);
  res.json(personal);
});

// Debe estar al final porque actúa sobre todas las rutas,
// dejarla al principio anula todas las rutas,
// mientras que dejarla aquí hace que primero intente
// las rutas declaradas con anterioridad.
app.get('*', ( req, res ) => {
  res.status(404).send('Esta ruta no existe');
});