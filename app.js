// app.js
const CLAVE_MEMORIA = 'gym_app_rutinas';

// 1. Cargar datos de la memoria del iPhone. Si es la primera vez, inicia vacío.
let rutinas = JSON.parse(localStorage.getItem(CLAVE_MEMORIA)) || [];

// 2. Función para guardar los cambios permanentemente
function guardarDatos() {
    localStorage.setItem(CLAVE_MEMORIA, JSON.stringify(rutinas));
}

// 3. Función para dibujar las rutinas en la pantalla
function renderizarRutinas() {
    const contenedor = document.getElementById('rutinas-container');
    contenedor.innerHTML = ''; // Limpiamos la pantalla antes de dibujar

    // Si no hay rutinas, mostramos un mensaje amigable
    if (rutinas.length === 0) {
        contenedor.innerHTML = '<p style="text-align: center; color: var(--text-secondary); margin-top: 20px;">No tienes rutinas. Toca el botón + para crear una.</p>';
        return;
    }

    // Dibujamos cada rutina guardada
    rutinas.forEach(rutina => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'rutina-card';
        // Agregamos un pequeño margen para que si tocas la tarjeta cambie el cursor (visual)
        tarjeta.style.cursor = 'pointer'; 
        tarjeta.innerHTML = `
            <span>🏋️‍♂️ ${rutina.nombre}</span>
            <span style="color: var(--text-secondary)">></span>
        `;
        
        // Cuando toques la rutina, por ahora saldrá una alerta (lo conectaremos en el siguiente paso)
        tarjeta.onclick = () => alert("Próximamente: Aquí verás los ejercicios de " + rutina.nombre);
        
        contenedor.appendChild(tarjeta);
    });
}

// 4. Función que se ejecuta al tocar el botón "+"
function crearRutina() {
    // Usamos la ventana emergente nativa del sistema
    const nombre = prompt("Nombre de la nueva rutina (ej. Pierna pesado):");
    
    if (nombre && nombre.trim() !== "") {
        const nuevaRutina = {
            id: Date.now().toString(), // Creamos un ID único usando la hora exacta
            nombre: nombre.trim(),
            ejercicios: [] // Lista vacía lista para el siguiente paso
        };
        
        rutinas.push(nuevaRutina);
        guardarDatos();
        renderizarRutinas(); // Volvemos a dibujar la pantalla para que aparezca la nueva
    }
}

// Arrancar la aplicación la primera vez que se abre
renderizarRutinas();