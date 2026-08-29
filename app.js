const CLAVE_MEMORIA = 'gym_app_rutinas';
let rutinas = JSON.parse(localStorage.getItem(CLAVE_MEMORIA)) || [];

function guardarDatos() {
    localStorage.setItem(CLAVE_MEMORIA, JSON.stringify(rutinas));
}

function borrarRutina(id) {
    // Pedimos confirmación antes de borrar
    if(confirm("¿Seguro que quieres borrar esta rutina?")) {
        rutinas = rutinas.filter(r => r.id !== id);
        guardarDatos();
        renderizarRutinas();
    }
}

function renderizarRutinas() {
    const contenedor = document.getElementById('rutinas-container');
    contenedor.innerHTML = ''; 

    if (rutinas.length === 0) {
        contenedor.innerHTML = '<p style="text-align: center; color: var(--text-secondary); margin-top: 20px;">No tienes rutinas. Toca el botón + para crear una.</p>';
        return;
    }

    rutinas.forEach(rutina => {
        // Creamos el contenedor que guarda tanto la tarjeta como el botón de borrar
        const wrapper = document.createElement('div');
        wrapper.className = 'rutina-wrapper';
        
        wrapper.innerHTML = `
            <div class="btn-delete" onclick="borrarRutina('${rutina.id}')">Borrar</div>
            <div class="rutina-card" id="card-${rutina.id}">
                <span>🏋️‍♂️ ${rutina.nombre}</span>
                <span style="color: var(--text-secondary)">></span>
            </div>
        `;
        
        contenedor.appendChild(wrapper);

        // Lógica para detectar el dedo deslizando (Touch Events)
        const card = wrapper.querySelector('.rutina-card');
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        let isSwiped = false; // Nos dice si la tarjeta está abierta o cerrada

        card.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            card.style.transition = 'none'; // Quitamos la animación al arrastrar para que siga al dedo exacto
        }, {passive: true});

        card.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const x = e.touches[0].clientX;
            currentX = x - startX;
            
            // Solo permitimos deslizar hacia la izquierda (números negativos) y un máximo de 100px
            if (currentX < 0 && currentX > -100) {
                card.style.transform = `translateX(${currentX}px)`;
            }
        }, {passive: true});

        card.addEventListener('touchend', () => {
            isDragging = false;
            card.style.transition = 'transform 0.2s ease'; // Devolvemos la animación suave
            
            // Si deslizó más de 40px, lo bloqueamos abierto (-80px)
            if (currentX < -40) {
                card.style.transform = `translateX(-80px)`;
                isSwiped = true;
            } else {
                // Si no, lo cerramos
                card.style.transform = `translateX(0px)`;
                setTimeout(() => { isSwiped = false; }, 100);
            }
            currentX = 0;
        });

        // Qué pasa cuando tocamos la tarjeta
        card.addEventListener('click', () => {
            if (isSwiped) {
                // Si estaba abierta, el toque la cierra
                card.style.transform = `translateX(0px)`;
                isSwiped = false;
            } else {
                // Si estaba cerrada, entramos a la rutina
                alert("Próximamente: Aquí agregaremos los ejercicios de " + rutina.nombre);
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

renderizarRutinas();