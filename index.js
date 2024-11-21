const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());

const port = 3000;

// Ruta de inicio
app.get('/', (req, res) => {
    res.send('¡Hola Santy, este es el Sistema de Control de Vehículos!');
});





// Registrar un nuevo vehículo
app.post('/registrarVehiculo', (req, res) => {
    const nuevoVehiculo = req.body;

    try {
        let listadoVehiculos = JSON.parse(fs.readFileSync("vehiculos.json"));
        
        // Verificación de matrícula duplicada
        const vehiculoExistente = listadoVehiculos.find(vehiculo => vehiculo.matricula === nuevoVehiculo.matricula);
        
        if (vehiculoExistente) {
            return res.status(400).send('Error: El vehículo ya está registrado.');
        }
        
        listadoVehiculos.push(nuevoVehiculo);
        fs.writeFileSync("vehiculos.json", JSON.stringify(listadoVehiculos));
        res.send('Vehículo registrado correctamente');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al registrar el vehículo');
    }
});

// Actualizar los datos de un vehículo
app.put('/actualizarVehiculo/:matricula', (req, res) => {
    const { matricula } = req.params;  // Obtener la matrícula del vehículo
    const datosActualizados = req.body;  // Datos enviados para actualizar

    try {
        // Leer el archivo de vehículos
        let listadoVehiculos = JSON.parse(fs.readFileSync("vehiculos.json", "utf8"));
        
        // Buscar el vehículo con la matrícula especificada
        let vehiculo = listadoVehiculos.find(veh => veh.matricula === parseInt(matricula));

        if (!vehiculo) {
            return res.status(404).send({ mensaje: "Vehículo no encontrado." });
        }

        // Actualizar los datos del vehículo
        if (datosActualizados.marca) vehiculo.marca = datosActualizados.marca;
        if (datosActualizados.modelo) vehiculo.modelo = datosActualizados.modelo;
        if (datosActualizados.año) vehiculo.año = datosActualizados.año;
        if (datosActualizados.tipo) vehiculo.tipo = datosActualizados.tipo;
        if (datosActualizados.kilometraje) vehiculo.kilometraje = datosActualizados.kilometraje;
        if (datosActualizados.estado) vehiculo.estado = datosActualizados.estado;
        
        // Si hay datos de mantenimiento, actualizamos o agregamos
        if (datosActualizados.mantenimientos) {
            // Verificar si se quieren agregar nuevos mantenimientos o actualizar existentes
            vehiculo.mantenimientos = datosActualizados.mantenimientos;
        }

        // Guardar el archivo actualizado
        fs.writeFileSync("vehiculos.json", JSON.stringify(listadoVehiculos, null, 2));

        res.send({ mensaje: "Vehículo actualizado correctamente.", vehiculo });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar el vehículo');
    }
});


// Actualizar información de mantenimiento
app.put('/actualizarMantenimiento/:matricula', (req, res) => {
    const matricula = req.params.matricula;
    const datosActualizados = req.body;

    try {
        let mantenimientos = JSON.parse(fs.readFileSync("mantenimientos.json"));

        const indice = mantenimientos.findIndex(mant => mant.matricula === matricula);

        if (indice !== -1) {
            mantenimientos[indice] = {
                ...mantenimientos[indice],
                ...datosActualizados
            };

            fs.writeFileSync("mantenimientos.json", JSON.stringify(mantenimientos, null, 2));

            res.status(200).json({ mensaje: 'Mantenimiento actualizado correctamente', mantenimiento: mantenimientos[indice] });
        } else {
            res.status(404).json({ mensaje: 'Mantenimiento no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar el mantenimiento');
    }
});











// Ruta para registrar un nuevo conductor
app.post('/registrarConductor', (req, res) => {
    const nuevoConductor = req.body;

    try {
        // Verifica si el archivo 'conductores.json' existe, si no, crea un archivo vacío
        if (!fs.existsSync('conductores.json')) {
            fs.writeFileSync('conductores.json', JSON.stringify([]));
        }

        // Lee el contenido actual del archivo
        let conductores = JSON.parse(fs.readFileSync('conductores.json', 'utf8'));

        // Verificar si el número de licencia o el DNI ya están registrados
        const conductorExistente = conductores.find(conductor => conductor.nroLicencia === nuevoConductor.nroLicencia || conductor.dni === nuevoConductor.dni);

        if (conductorExistente) {
            return res.status(400).send({ mensaje: "Error: El conductor ya está registrado." });
        }

        // Agregar el nuevo conductor al array
        conductores.push({
            nombre: nuevoConductor.nombre,
            apellido: nuevoConductor.apellido,
            dni: nuevoConductor.dni,
            nroLicencia: nuevoConductor.nroLicencia,
            categLicencia: nuevoConductor.categLicencia,
            antiguedad: nuevoConductor.antiguedad,
            contacto: nuevoConductor.contacto,
         
        });

        // Escribir el contenido actualizado en el archivo
        fs.writeFileSync('conductores.json', JSON.stringify(conductores, null, 2));

        res.status(201).send({ mensaje: "Conductor registrado correctamente.", conductor: nuevoConductor });
    } catch (error) {
        console.error('Error al registrar el conductor:', error);
        res.status(500).send('Error al registrar el conductor');
    }
});
















// Actualizar información de un conductor
app.put('/actualizarConductor/:nroLicencia', (req, res) => {
    const nroLicencia = req.params.nroLicencia;
    const datosActualizados = req.body;

    try {
        let conductores = JSON.parse(fs.readFileSync("conductores.json"));

        const indice = conductores.findIndex(conductor => conductor.nroLicencia === nroLicencia);

        if (indice !== -1) {
            conductores[indice] = {
                ...conductores[indice],
                ...datosActualizados
            };

            fs.writeFileSync("conductores.json", JSON.stringify(conductores, null, 2));

            res.status(200).json({ mensaje: 'Conductor actualizado correctamente', conductor: conductores[indice] });
        } else {
            res.status(404).json({ mensaje: 'Conductor no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar el conductor');
    }
});

// Obtener lista de vehículos
app.get("/obtenerVehiculos", (req, res) => {
    let archivo = fs.readFileSync("vehiculos.json", "utf8");
    let listadoVehiculos = JSON.parse(archivo);
    res.send(listadoVehiculos);
});

// Registrar mantenimiento de un vehículo
app.post("/registrarMantenimiento", (req, res) => {
    const { matricula, tipoMantenimiento, fecha, costo, piezasCambiadas, proveedor, duracion } = req.body;

    try {
        let mantenimientos = JSON.parse(fs.readFileSync("mantenimientos.json"));
        const nuevoMantenimiento = { matricula, tipoMantenimiento, fecha, costo, piezasCambiadas, proveedor, duracion };
        mantenimientos.push(nuevoMantenimiento);
        fs.writeFileSync("mantenimientos.json", JSON.stringify(mantenimientos));

        let listadoVehiculos = JSON.parse(fs.readFileSync("vehiculos.json", "utf8"));
        let vehiculo = listadoVehiculos.find(veh => veh.matricula === matricula);
        
        if (!vehiculo) {
            res.status(404).send({ mensaje: "Vehículo no encontrado." });
            return;
        }
        if (!vehiculo.mantenimientos) vehiculo.mantenimientos = [];
        vehiculo.mantenimientos.push(nuevoMantenimiento);
        fs.writeFileSync("vehiculos.json", JSON.stringify(listadoVehiculos));

        res.send({ mensaje: "Mantenimiento registrado exitosamente.", vehiculo });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al registrar el mantenimiento');
    }
});

// Obtener historial de mantenimiento de un vehículo
app.get("/historialMantenimiento/:matricula", (req, res) => {
    try {
        const mantenimientos = JSON.parse(fs.readFileSync("mantenimientos.json"));
        const historial = mantenimientos.filter(mant => mant.matricula === req.params.matricula);

        if (historial.length === 0) {
            res.send({ mensaje: "El vehículo no tiene historial de mantenimiento." });
        } else {
            res.send(historial);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener el historial de mantenimiento');
    }
});

// Ruta para asignar un vehículo a un conductor
app.post('/asignarVehiculo', (req, res) => {
    const { matricula, dni, fechaAsignacion } = req.body;

    try {
        // Leer los archivos de vehículos y conductores
        let vehiculos = JSON.parse(fs.readFileSync("vehiculos.json", "utf8"));
        let conductores = JSON.parse(fs.readFileSync("conductores.json", "utf8"));
        let asignaciones = [];

        // Verificar si el archivo de asignaciones existe
        if (fs.existsSync("asignarVehiculos.json")) {
            asignaciones = JSON.parse(fs.readFileSync("asignarVehiculos.json", "utf8"));
        }

        // Buscar el vehículo y el conductor
        let vehiculo = vehiculos.find(veh => veh.matricula === matricula);
        let conductor = conductores.find(cond => cond.dni === dni);

        if (!vehiculo) {
            return res.status(404).send({ mensaje: "Vehículo no encontrado." });
        }
        if (!conductor) {
            return res.status(404).send({ mensaje: "Conductor no encontrado." });
        }

        // Verificar si el vehículo ya está asignado
        let asignacionExistente = asignaciones.find(asig => asig.matricula === matricula);
        if (asignacionExistente) {
            return res.status(400).send({ mensaje: "El vehículo ya está asignado a otro conductor." });
        }

        // Crear la nueva asignación
        const nuevaAsignacion = {
            matricula,
            dni,
            fechaAsignacion: fechaAsignacion || new Date().toISOString()
        };

        // Agregar la asignación y guardar en el archivo
        asignaciones.push(nuevaAsignacion);
        fs.writeFileSync("asignarVehiculos.json", JSON.stringify(asignaciones, null, 2));

        // Actualizar el historial del conductor
        conductor.historialVehiculos.push({
            matricula,
            fechaAsignacion: nuevaAsignacion.fechaAsignacion
        });
        fs.writeFileSync("conductores.json", JSON.stringify(conductores, null, 2));

        res.send({ mensaje: "Vehículo asignado exitosamente.", asignacion: nuevaAsignacion });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al asignar el vehículo');
    }
});


// Registrar disponibilidad de un vehículo
app.post("/registrarDisponibilidad", (req, res) => {
    const { matricula, fechaInicio, fechaFin, motivo, responsable } = req.body;

    try {
        let disponibilidad = JSON.parse(fs.readFileSync("disponibilidad.json"));
        const nuevaDisponibilidad = { matricula, fechaInicio, fechaFin, motivo, responsable };
        
        disponibilidad.push(nuevaDisponibilidad);
        fs.writeFileSync("disponibilidad.json", JSON.stringify(disponibilidad));

        res.send({ mensaje: "Disponibilidad registrada correctamente.", nuevaDisponibilidad });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al registrar disponibilidad');
    }
});

// Registrar historial de uso de un vehículo
app.post("/registrarUso", (req, res) => {
    const { matricula, fechaUso, conductor, kilometrosRecorridos, ruta, proposito } = req.body;

    try {
        let historialUso = JSON.parse(fs.readFileSync("historial_uso.json"));
        const nuevoUso = { matricula, fechaUso, conductor, kilometrosRecorridos, ruta, proposito };
        
        historialUso.push(nuevoUso);
        fs.writeFileSync("historial_uso.json", JSON.stringify(historialUso, null, 2));

        res.send({ mensaje: "Uso registrado correctamente.", nuevoUso });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al registrar uso');
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

