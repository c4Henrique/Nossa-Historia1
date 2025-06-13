const API_URL = 'https://nossa-historia-jl87.onrender.com/api';

// Função para carregar os vídeos
async function loadVideos() {
    try {
        const response = await fetch(`${API_URL}/videos`);
        const videos = await response.json();
        const container = document.querySelector('.video-carousel');
        container.innerHTML = '';
        
        videos.forEach(video => {
            const videoElement = createVideoElement(video);
            container.appendChild(videoElement);
        });
    } catch (error) {
        console.error('Erro ao carregar vídeos:', error);
    }
}

// Função para criar elemento de vídeo
function createVideoElement(video) {
    const div = document.createElement('div');
    div.className = 'video-item';
    div.innerHTML = `
        <div class="video-wrapper">
            ${video.type === 'url' 
                ? `<iframe src="${video.url}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
                : `<video controls><source src="${video.url}" type="video/mp4"></video>`
            }
        </div>
        <div class="video-actions">
            <button class="delete-video" data-id="${video.id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Adicionar evento de clique para deletar
    div.querySelector('.delete-video').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('Tem certeza que deseja excluir este vídeo?')) {
            try {
                await fetch(`${API_URL}/videos/${video.id}`, {
                    method: 'DELETE'
                });
                div.remove();
            } catch (error) {
                console.error('Erro ao deletar vídeo:', error);
            }
        }
    });
    
    return div;
}

// Função para adicionar novo vídeo
async function addVideo(videoData) {
    try {
        const response = await fetch(`${API_URL}/videos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(videoData)
        });
        
        if (response.ok) {
            const newVideo = await response.json();
            const container = document.querySelector('.video-carousel');
            const videoElement = createVideoElement(newVideo);
            container.appendChild(videoElement);
        }
    } catch (error) {
        console.error('Erro ao adicionar vídeo:', error);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadVideos();
    
    const form = document.getElementById('newVideoForm');
    const videoTypeInputs = document.querySelectorAll('input[name="videoType"]');
    const urlInput = document.getElementById('videoUrl');
    const fileInput = document.getElementById('videoFile');
    
    // Mostrar/esconder campos baseado no tipo de vídeo
    videoTypeInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            if (e.target.value === 'url') {
                urlInput.parentElement.style.display = 'block';
                fileInput.parentElement.style.display = 'none';
            } else {
                urlInput.parentElement.style.display = 'none';
                fileInput.parentElement.style.display = 'block';
            }
        });
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const type = document.querySelector('input[name="videoType"]:checked').value;
        let url;
        
        if (type === 'url') {
            url = urlInput.value.trim();
        } else {
            const file = fileInput.files[0];
            if (!file) {
                alert('Por favor, selecione um arquivo de vídeo');
                return;
            }
            // Aqui você precisaria implementar o upload do arquivo
            // Por enquanto, vamos apenas usar o nome do arquivo
            url = file.name;
        }
        
        if (url) {
            await addVideo({ type, url });
            form.reset();
            document.getElementById('videoModal').style.display = 'none';
        }
    });
}); 