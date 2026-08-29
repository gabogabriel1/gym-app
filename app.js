const CLAVE_MEMORIA = 'gym_app_rutinas';
let rutinas = JSON.parse(localStorage.getItem(CLAVE_MEMORIA)) || [];
let rutinaActivaId = null; // Guarda el ID de la rutina que estás viendo actualmente

function guardarDatos() {
    localStorage.setItem(CLAVE_MEMORIA, JSON.stringify(rutinas));
}

// --- VISTA 1: RUTINAS ---

function renderizarRutinas() {
    const contenedor = document.getElementById('rutinas-container');
    contenedor.innerHTML = ''; 

    if (rutinas.length === 0) {
        contenedor.innerHTML = '<p style="text-align: center; color: var(--text-secondary); margin-top: 20px;">No tienes rutinas. Toca el botón + para crear una.</p>';
        return;
    }

    rutinas.forEach(rutina => {
        const wrapper = document.createElement('div');
        wrapper.className = 'rutina-wrapper';
        
        wrapper.innerHTML = `
            <div class="btn-delete" onclick="borrarRutina(event, '${rutina.id}')">Borrar</div>
            <div class="rutina-card" id="card-${rutina.id}">
                <span>🏋️‍♂️ ${rutina.nombre}</span>
                <span style="color: var(--text-secondary)">></span>
            </div>
        `;
        
        contenedor.appendChild(wrapper);

        const card = wrapper.querySelector('.rutina-card');
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        let isSwiped = false;

        card.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            card.style.transition = 'none';
        }, {passive: true});

        card.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const x = e.touches[0].clientX;
            currentX = x - startX;
            if (currentX < 0 && currentX > -100) {
                card.style.transform = `translateX(${currentX}px)`;
            }
        }, {passive: true});

        card.addEventListener('touchend', () => {
            isDragging = false;
            card.style.transition = 'transform 0.2s ease';
            if (currentX < -40) {
                card.style.transform = `translateX(-80px)`;
                isSwiped = true;
            } else {
                card.style.transform = `translateX(0px)`;
                setTimeout(() => { isSwiped = false; }, 100);
            }
            currentX = 0;
        });

        card.addEventListener('click', () => {
            if (isSwiped) {
                card.style.transform = `translateX(0px)`;
                isSwiped = false;
            } else {
                abrirRutina(rutina.id);
            }
        });
    });
}

function crearRutina() {
    const nombre = prompt("Nombre de la nueva rutina (ej. Pierna pesado):");
    if (nombre && nombre.trim() !== "") {
        const nuevaRutina = {
            id: Date.now().toString(),
            nombre: nombre.trim(),
            ejercicios: [] 
        };
        rutinas.push(nuevaRutina);
        guardarDatos();
        renderizarRutinas(); 
    }
}

function borrarRutina(event, id) {
    event.stopPropagation(); // Evita que se abra la rutina al tocar borrar
    if(confirm("¿Seguro que quieres borrar esta rutina?")) {
        rutinas = rutinas.filter(r => r.id !== id);
        guardarDatos();
        renderizarRutinas();
    }
}


// --- NAVEGACIÓN Y VISTA 2: DETALLE / EJERCICIOS ---

function abrirRutina(id) {
    rutinaActivaId = id;
    const rutina = rutinas.find(r => r.id === id);
    if (!rutina) return;

    // Cambiar título de la vista interior
    document.getElementById('titulo-rutina-detalle').innerText = rutina.nombre;

    // Cambiar de pantalla
    document.getElementById('vista-rutinas').classList.remove('active');
    document.getElementById('vista-detalle').classList.add('active');

    renderizarEjercicios();
}

function volverARutinas() {
    rutinaActivaId = null;
    document.getElementById('vista-detalle').classList.remove('active');
    document.getElementById('vista-rutinas').classList.add('active');
    renderizarRutinas();
}

function renderizarEjercicios() {
    const contenedor = document.getElementById('ejercicios-container');
    contenedor.innerHTML = '';

    const rutina = rutinas.find(r => r.id === rutinaActivaId);
    if (!rutina || rutina.ejercicios.length === 0) {
        contenedor.innerHTML = '<p style="text-align: center; color: var(--text-secondary); margin-top: 20px;">No hay ejercicios en esta rutina. Toca el botón + para agregar uno.</p>';
        return;
    }

    rutina.ejercicios.forEach(ej => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'ejercicio-card';
        
        // Si el ejercicio tiene imagen guardada la mostramos, sino un icono por defecto
        let contenidoImg = ej.imagen ? `<img src="${ej.imagen}" class="ejercicio-img">` : `<div class="ejercicio-img">🏋️</div>`;

        tarjeta.innerHTML = `
            ${contenidoImg}
            <div class="ejercicio-info">
                <h3>${ej.nombre}</h3>
                <p>Objetivo: ${ej.series} series × ${ej.repeticiones} reps</p>
            </div>
        `;
        contenedor.appendChild(tarjeta);
    });
}

function crearEjercicio() {
    const nombre = prompt("Nombre del ejercicio (ej. Press de Banca):");
    if (!nombre || nombre.trim() === "") return;

    const series = prompt("¿Cuántas series planeas hacer?", "4");
    const repeticiones = prompt("¿Cuántas repeticiones por serie?", "10");

    // Creamos un selector de archivos invisible temporalmente para que selecciones la foto desde el celular
    const inputFoto = document.createElement('input');
    inputFoto.type = 'file';
    inputFoto.accept = 'image/*';
    
    inputFoto.onchange = (e) => {
        const archivo = e.target.files[0];
        if (archivo) {
            const lector = new FileReader();
            lector.onload = function(eventoLectura) {
                const base64Imagen = eventoLectura.target.result;
                guardarNuevoEjercicio(nombre.trim(), series, repeticiones, base64Imagen);
            };
            lector.readAsDataURL(archivo);
        } else {
            guardarNuevoEjercicio(nombre.trim(), series, repeticiones, null);
        }
    };

    // Disparamos el selector de archivos del sistema
    inputFoto.click();
}

function guardarNuevoEjercicio(nombre, series, repeticiones, imagen) {
    const rutina = rutinas.find(r => r.id === rutinaActivaId);
    if (rutina) {
        const nuevoEj = {
            id: Date.now().toString(),
            nombre: nombre,
            series: series,
            repeticiones: repeticiones,
            imagen: imagen
        };
        rutina.ejercicios.push(nuevoEj);
        guardarDatos();
        renderizarEjercicios();
    }
}

// Inicializar app en la vista de rutinas
renderizarRutinas();