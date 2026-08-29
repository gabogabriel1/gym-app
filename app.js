const CLAVE_MEMORIA = 'gym_app_rutinas';
let rutinas = JSON.parse(localStorage.getItem(CLAVE_MEMORIA)) || [];
let rutinaActivaId = null; 
let ejercicioEditandoId = null; 
let imagenBase64Temporal = null;

function guardarDatos() {
    localStorage.setItem(CLAVE_MEMORIA, JSON.stringify(rutinas));
}

// --- UTILIDAD DE GESTO SWIPE ---
function activarSwipe(cardElement) {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let isSwiped = false; // 'left', 'right', o false

    cardElement.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
        cardElement.style.transition = 'none';
    }, {passive: true});

    cardElement.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const x = e.touches[0].clientX;
        currentX = x - startX;
        
        if (currentX > -110 && currentX < 110) {
            cardElement.style.transform = `translateX(${currentX}px)`;
        }
    }, {passive: true});

    cardElement.addEventListener('touchend', () => {
        isDragging = false;
        cardElement.style.transition = 'transform 0.2s ease';
        
        if (currentX < -45) {
            cardElement.style.transform = `translateX(-90px)`;
            isSwiped = 'left';
        } else if (currentX > 45) {
            cardElement.style.transform = `translateX(90px)`;
            isSwiped = 'right';
        } else {
            cardElement.style.transform = `translateX(0px)`;
            isSwiped = false;
        }
        currentX = 0;
    });

    cardElement.addEventListener('click', (e) => {
        if (isSwiped) {
            cardElement.style.transform = `translateX(0px)`;
            isSwiped = false;
            e.stopPropagation();
        }
    });
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
        wrapper.className = 'card-wrapper';
        
        wrapper.innerHTML = `
            <div class="action-bg-right" onclick="borrarRutina('${rutina.id}')">Borrar</div>
            <div class="swipe-card" id="rutina-${rutina.id}">
                <span>🏋️‍♂️ ${rutina.nombre}</span>
                <span style="color: var(--text-secondary)">›</span>
            </div>
        `;
        
        contenedor.appendChild(wrapper);
        const card = wrapper.querySelector('.swipe-card');
        
        activarSwipe(card);

        card.addEventListener('click', () => {
            abrirRutina(rutina.id);
        });
    });
}

function crearRutina() {
    const nombre = prompt("Nombre de la nueva rutina (ej. Tren Superior):");
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

function borrarRutina(id) {
    if(confirm("¿Seguro que quieres borrar esta rutina?")) {
        rutinas = rutinas.filter(r => r.id !== id);
        guardarDatos();
        renderizarRutinas();
    }
}


// --- VISTA 2: DETALLE Y EJERCICIOS ---

function abrirRutina(id) {
    rutinaActivaId = id;
    const rutina = rutinas.find(r => r.id === id);
    if (!rutina) return;

    document.getElementById('titulo-rutina-detalle').innerText = rutina.nombre;
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
        contenedor.innerHTML = '<p style="text-align: center; color: var(--text-secondary); margin-top: 20px;">No hay ejercicios. Toca el botón + para agregar uno.</p>';
        return;
    }

    rutina.ejercicios.forEach(ej => {
        const wrapper = document.createElement('div');
        wrapper.className = 'card-wrapper';
        
        let contenidoImg = ej.imagen ? `<img src="${ej.imagen}" class="ejercicio-img">` : `<div class="ejercicio-img">🏋️</div>`;

        wrapper.innerHTML = `
            <div class="action-bg-left" onclick="editarEjercicio('${ej.id}')">Editar</div>
            <div class="action-bg-right" onclick="borrarEjercicio('${ej.id}')">Borrar</div>
            <div class="swipe-card" id="ejercicio-${ej.id}">
                <div class="ejercicio-content">
                    ${contenidoImg}
                    <div class="ejercicio-info">
                        <h3>${ej.nombre}</h3>
                        <p>Objetivo: ${ej.series} series × ${ej.repeticiones} reps</p>
                    </div>
                </div>
            </div>
        `;
        
        contenedor.appendChild(wrapper);
        const card = wrapper.querySelector('.swipe-card');
        activarSwipe(card);
    });
}


// --- GESTIÓN DEL MODAL CENTRALIZADO ---

function abrirModalEjercicio(ejercicioId = null) {
    ejercicioEditandoId = ejercicioId;
    imagenBase64Temporal = null;
    
    document.getElementById('input-foto').value = '';
    document.getElementById('label-foto').innerHTML = "📷 Agregar foto (Opcional)";

    if (ejercicioId) {
        const rutina = rutinas.find(r => r.id === rutinaActivaId);
        const ej = rutina.ejercicios.find(e => e.id === ejercicioId);
        
        document.getElementById('modal-titulo').innerText = "Editar Ejercicio";
        document.getElementById('input-nombre').value = ej.nombre;
        document.getElementById('input-series').value = ej.series;
        document.getElementById('input-repeticiones').value = ej.repeticiones;
        imagenBase64Temporal = ej.imagen || null;
        if (ej.imagen) {
            document.getElementById('label-foto').innerHTML = "✅ Foto cargada (Toca para cambiar)";
        }
    } else {
        document.getElementById('modal-titulo').innerText = "Nuevo Ejercicio";
        document.getElementById('input-nombre').value = '';
        document.getElementById('input-series').value = '';
        document.getElementById('input-repeticiones').value = '';
    }

    document.getElementById('modal-overlay').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}

document.getElementById('input-foto').addEventListener('change', function(e) {
    const archivo = e.target.files[0];
    if (archivo) {
        const lector = new FileReader();
        lector.onload = function(eventoLectura) {
            imagenBase64Temporal = eventoLectura.target.result;
            document.getElementById('label-foto').innerHTML = "✅ Foto seleccionada con éxito";
        };
        lector.readAsDataURL(archivo);
    }
});

function guardarModal() {
    const nombre = document.getElementById('input-nombre').value.trim();
    const series = document.getElementById('input-series').value.trim();
    const repeticiones = document.getElementById('input-repeticiones').value.trim();

    if (!nombre || !series || !repeticiones) {
        alert("Por favor completa los campos de nombre, series y repeticiones.");
        return;
    }

    const rutina = rutinas.find(r => r.id === rutinaActivaId);
    if (!rutina) return;

    if (ejercicioEditandoId) {
        const ej = rutina.ejercicios.find(e => e.id === ejercicioEditandoId);
        if (ej) {
            ej.nombre = nombre;
            ej.series = series;
            ej.repeticiones = repeticiones;
            ej.imagen = imagenBase64Temporal;
        }
    } else {
        const nuevoEj = {
            id: Date.now().toString(),
            nombre: nombre,
            series: series,
            repeticiones: repeticiones,
            imagen: imagenBase64Temporal
        };
        rutina.ejercicios.push(nuevoEj);
    }

    guardarDatos();
    cerrarModal();
    renderizarEjercicios();
}

function editarEjercicio(id) {
    abrirModalEjercicio(id);
}

function borrarEjercicio(id) {
    if (confirm("¿Estás seguro de eliminar este ejercicio?")) {
        const rutina = rutinas.find(r => r.id === rutinaActivaId);
        if (rutina) {
            rutina.ejercicios = rutina.ejercicios.filter(e => e.id !== id);
            guardarDatos();
            renderizarEjercicios();
        }
    }
}

// Arrancar app
renderizarRutinas();