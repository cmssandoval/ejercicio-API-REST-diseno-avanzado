const { Pool } = require("pg");
const format = require('pg-format');

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    password: "postgres",
    database: "farmacia",
    port: 5432,
    allowExitOnIdle: true
});

const obtenerMedicamentos = async ({ limit = 10, order_by = "id_ASC", page = 1 }) => {

    // const consulta = "SELECT * FROM medicamentos LIMIT $1";
    // const { rows: medicamentos } = await pool.query(consulta, [limit]);

    const [ campo, direccion ] = order_by.split("_");
    const offset = Math.abs((page - 1) * limit);
    const consultaFormateada = format(
        `SELECT * FROM medicamentos
        ORDER BY %s %s
        LIMIT %s OFFSET %s
        `, campo, direccion, limit, offset );
    const { rows: medicamentos } = await pool.query( consultaFormateada );
    return medicamentos;
};

const obtenerMedicamentosPorFiltros = async ({ stock_min, precio_max }) => {
    let filtros = [];
    const values = [];

    const agregarFiltro = ( campo, comparador, valor ) => {
        values.push(valor);
        const { length } = filtros;
        filtros.push(`${campo} ${comparador} $${length + 1}`);
    };

    if (precio_max) agregarFiltro('precio', '<=', precio_max);
    if (stock_min) agregarFiltro('stock', '>=', stock_min);

    let consulta = "SELECT * FROM medicamentos";
    
    if (filtros.length > 0 ) {
        filtros = filtros.join(" AND ");
        consulta += ` WHERE ${filtros}`;
    }

    const { rows: medicamentos } = await pool.query(consulta, values);
    return medicamentos;
};

const prepararHATEOASMedicamentos = ( medicamentos ) => {
    const results = medicamentos.map(( med ) => {
        return {
            name: med.nombre,
            href: `/medicamentos/medicamento/${med.id}`,
        }
    }).slice( 0, 4 );
    const total = medicamentos.length;
    const HATEOAS = {
        total,
        results,
    };
    return HATEOAS;
}

const obtenerPersonal = async ({ limit = 10, order_by = "id_ASC", page = 1 }) => {
    // const consulta = "SELECT * FROM personal LIMIT $1";
    // const { rows: personal } = await pool.query(consulta, [limit]);

    const [ campo, direccion ] = order_by.split("_");
    const offset = Math.abs((page - 1) * limit);
    const consultaFormateada = format(
        `SELECT * FROM personal
        ORDER BY %s %s
        LIMIT %s OFFSET %s
        `, campo, direccion, limit, offset);
    
    const { rows: personal } = await pool.query( consultaFormateada );
    return personal;
};

const obtenerPersonalPorFiltros = async ({ salario_max, salario_min, rol }) => {
    let filtros = [];
    const values = [];

    const agregarFiltro = ( campo, comparador, valor ) => {
        values.push(valor);
        const { length } = filtros;
        filtros.push(`${campo} ${comparador} $${length + 1}`);
    };

    if ( rol )          agregarFiltro('rol', '=', rol);
    if ( salario_max )  agregarFiltro('salario', '<=', salario_max);
    if ( salario_min )  agregarFiltro('salario', '>=', salario_min);

    let consulta = "SELECT * FROM personal"
    if ( filtros.length > 0 ) {
        filtros = filtros.join(" AND ");
        consulta += ` WHERE ${filtros}`;
    }

    const { rows: personal } = await pool.query(consulta, values);
    return personal;
};

const prepararHATEOASPersonal = ( personal ) => {
    const results = personal.map(( person ) => {
        return{
            name: person.nombre,
            href: `/personal/person/${person.id}`
        };
    }).slice( 0, 3 );

    const total = personal.length;
    const HATEOAS = {
        total,
        results,
    };
    return HATEOAS;
};

//* Ejercicio de la guía donde faltaba parametrizar
//* la consulta para insertar limits de manera segura.
// const obtenerMedicamentos = async ({ limits }) => {
//     let values = [];
//     let consulta = "SELECT * FROM medicamentos"
//     if (limits) {
//         values.push( limits );
//         consulta += " LIMIT $1"
//     }
//         const { rows: medicamentos } = await pool.query(consulta, values)
//     return medicamentos
// }


const medicamentosModelo = {
    obtenerMedicamentos,
    obtenerMedicamentosPorFiltros,
    prepararHATEOASMedicamentos,
};

const personalModelo = {
    obtenerPersonal,
    obtenerPersonalPorFiltros,
    prepararHATEOASPersonal,
};

module.exports = {
    medicamentosModelo,
    personalModelo,
}; 