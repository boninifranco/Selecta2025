let player;


function onYouTubeIframeAPIReady() {
}

document.addEventListener('DOMContentLoaded', async () => {
    const bovinoGallery = document.getElementById('bovino-gallery');
    const youtubePlayerContainer = document.getElementById('youtube-player');
    let bovinos = [];
    try {
        const response = await fetch('bovinos_youtube_data.json');
        bovinos = await response.json();
        console.log("Datos de bovinos cargados:", bovinos);
    } catch (error) {
        console.error("Error al cargar los datos de bovinos:", error);
        alert("No se pudieron cargar los datos de los bovinos. Asegúrate de que 'bovinos_youtube_data.json' existe.");
        return; 
    }

    /**
     * Carga las miniaturas de los bovinos en la galería.
     */
    function loadBovinosGallery() {
        bovinos.forEach(bovino => {
            if (bovino.thumbnail_image && bovino.youtube_video_id) {
                const bovinoItem = document.createElement('div');
                bovinoItem.classList.add('bovino-item');
                bovinoItem.dataset.videoId = bovino.youtube_video_id; 

                bovinoItem.innerHTML = `
                    <img src="${bovino.thumbnail_image}" alt="${bovino.name}">
                    <h3>${bovino.name}</h3>
                    `;

                bovinoItem.addEventListener('click', () => {
                    playYouTubeVideo(bovino.youtube_video_id);
                });

                bovinoGallery.appendChild(bovinoItem);
            }
        });
    }

    /**
     * Reproduce el video de YouTube usando la API de IFrame Player.
     * @param {string} videoId - El ID del video de YouTube a reproducir.
     */
    function playYouTubeVideo(videoId) {
        // Asegúrate de que la API de YouTube esté cargada y lista
        if (typeof YT !== 'undefined' && YT.Player) {
            if (!player) { // Si el reproductor no ha sido creado aún
                player = new YT.Player('youtube-player', {
                    height: '100%', // El iframe ocupará el 100% de la altura de su contenedor
                    width: '100%',  // El iframe ocupará el 100% del ancho de su contenedor
                    videoId: videoId,
                    playerVars: {
                        'autoplay': 1,      // Reproducción automática
                        'loop': 1,
                        'controls': 1,      // Mostrar controles del reproductor
                        'rel': 0,           // No mostrar videos relacionados al final
                        'fs': 0,
                        'mute': 1,
                    },
                    events: {
                        'onReady': onPlayerReady,
                        'onStateChange': onPlayerStateChange
                    }
                });
            } else { // Si el reproductor ya existe, simplemente carga un nuevo video
                player.loadVideoById(videoId);
            }
        } else {
            console.warn("La API de YouTube no está cargada aún. Intentando reproducir más tarde...");
            // Si la API aún no está lista, puedes añadir un reintento o una cola
            // Para este ejemplo, asumiremos que se cargará rápidamente
        }
    }

    function onPlayerReady(event) {
        event.target.playVideo();
    }

    function onPlayerStateChange(event) {
        // Puedes añadir lógica aquí, por ejemplo, para reproducir el siguiente video
        // cuando el actual termine, o mostrar un mensaje.
        // console.log("Estado del reproductor:", event.data);
    }

        function scrollToTop() {
        // Opción 1: Desplazamiento suave (recomendado)
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

    // --- Lógica de Inicialización ---

    // Carga la galería al iniciar
    loadBovinosGallery();

    // Reproducir el primer video al cargar la página si hay datos y la API de YouTube está lista
    // onYouTubeIframeAPIReady se encargará de esto si es llamada por la API
    // Si bovinos_youtube_data.json se carga después de onYouTubeIframeAPIReady,
    // es posible que necesitemos llamar a playYouTubeVideo aquí.
    if (bovinos.length > 0 && bovinos[0].youtube_video_id) {
        // Si onYouTubeIframeAPIReady ya se ejecutó, el reproductor puede ser creado inmediatamente.
        // Si no, la llamada a playYouTubeVideo esperará a que YT.Player esté disponible.
        // La función onYouTubeIframeAPIReady asegura que el reproductor se inicialice cuando la API esté lista.
        // Para asegurar que el primer video se cargue, lo asignaremos directamente al onYouTubeIframeAPIReady
        // o lo haremos aquí si la API ya está lista.
        // Aquí ajustamos la lógica para que el primer video se cargue cuando el reproductor esté listo.
        if (typeof YT !== 'undefined' && YT.Player) {
            playYouTubeVideo(bovinos[0].youtube_video_id);
        } else {
            // Si la API aún no está lista, la función global onYouTubeIframeAPIReady se encargará
            // de inicializar el reproductor con el primer video cuando se cargue.
            // Sobreescribimos onYouTubeIframeAPIReady para que lo haga.
            window.onYouTubeIframeAPIReady = function() {
                if (bovinos.length > 0 && bovinos[0].youtube_video_id) {
                    playYouTubeVideo(bovinos[0].youtube_video_id);
                }
            };
        }
    }
});