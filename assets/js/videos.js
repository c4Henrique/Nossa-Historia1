import { database } from './firebase-config.js';
import { ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
const API_URL = 'https://nossa-historia-jl87.onrender.com/api';

// Função para carregar os vídeos
async function loadVideos() {
    console.log('Iniciando carregamento dos vídeos...');
    try {
        const response = await fetch(`${API_URL}/videos`);
        const videos = await response.json();
        const container = document.querySelector('.video-carousel');
        container.innerHTML = '';
        
        if (videos.length === 0) {
            container.innerHTML = '<p class="no-items-message">Nenhum vídeo adicionado ainda. Que tal adicionar um?</p>';
        } else {
            videos.forEach(video => {
                const videoElement = createVideoElement(video);
                container.appendChild(videoElement);
            });
        }
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
                const response = await fetch(`${API_URL}/videos/${video.id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    div.remove();
                    console.log('Vídeo deletado com sucesso:', video.id);
                } else {
                    console.error('Erro ao deletar vídeo: Resposta não OK', response.status);
                    alert('Erro ao excluir o vídeo. Por favor, tente novamente.');
                }
            } catch (error) {
                console.error('Erro ao deletar vídeo:', error);
                alert('Erro ao excluir o vídeo. Por favor, tente novamente.');
            }
        }
    });
    
    return div;
}

// Função para adicionar novo vídeo
async function addVideo(videoData) {
    console.log('Tentando adicionar novo vídeo:', videoData);
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
            console.log('Vídeo adicionado com sucesso!');
            return true;
        } else {
            console.error('Erro ao adicionar vídeo: Resposta não OK', response.status);
            alert('Erro ao salvar o vídeo. Por favor, tente novamente.');
            return false;
        }
    } catch (error) {
        console.error('Erro ao adicionar vídeo:', error);
        alert('Erro ao salvar o vídeo. Por favor, tente novamente.');
        return false;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadVideos();
    
    // Modal de novo vídeo
    const modal = document.getElementById('newVideoModal');
    const addButton = document.getElementById('openNewVideoModal');
    const closeButton = document.querySelector('#newVideoModal .close-modal');
    const cancelButton = document.getElementById('cancelNewVideo');
    const saveButton = document.getElementById('saveNewVideo');
    const videoTypeInputs = document.querySelectorAll('input[name="videoType"]');
    const urlGroup = document.getElementById('videoUrlGroup');
    const localPathGroup = document.getElementById('videoLocalPathGroup');
    
    if (!modal || !addButton || !closeButton || !cancelButton || !saveButton || !urlGroup || !localPathGroup) {
        console.error('Elementos do modal de vídeo não encontrados:', { modal, addButton, closeButton, cancelButton, saveButton, urlGroup, localPathGroup });
        return;
    }

    // Garantir que o modal comece oculto
    modal.classList.remove('show');

    // Função para limpar o formulário e esconder o modal
    function clearFormAndHideModal() {
        modal.classList.remove('show');
        document.getElementById('videoTitle').value = '';
        document.getElementById('videoUrl').value = '';
        document.getElementById('videoLocalPath').value = '';
        document.getElementById('videoTypeUrl').checked = true; // Resetar para URL por padrão
        urlGroup.style.display = 'block';
        localPathGroup.style.display = 'none';
        console.log('Modal de vídeo fechado e formulário limpo.');
    }
    
    // Mostrar/esconder campos baseado no tipo de vídeo
    videoTypeInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            console.log('Tipo de vídeo alterado para:', e.target.value);
            if (e.target.value === 'url') {
                urlGroup.style.display = 'block';
                localPathGroup.style.display = 'none';
            } else {
                urlGroup.style.display = 'none';
                localPathGroup.style.display = 'block';
            }
        });
    });
    
    // Abrir modal
    addButton.addEventListener('click', () => {
        console.log('Botão Adicionar Novo Vídeo clicado.');
        modal.classList.add('show');
    });
    
    // Fechar modal
    closeButton.addEventListener('click', () => {
        console.log('Botão fechar (X) clicado.');
        clearFormAndHideModal();
    });
    
    cancelButton.addEventListener('click', () => {
        console.log('Botão Cancelar clicado.');
        clearFormAndHideModal();
    });
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            console.log('Clicou fora do modal de vídeo.');
            clearFormAndHideModal();
        }
    });
    
    // Salvar vídeo
    saveButton.addEventListener('click', async () => {
        console.log('Botão Salvar Vídeo clicado.');
        const type = document.querySelector('input[name="videoType"]:checked').value;
        const title = document.getElementById('videoTitle').value;
        let url;
        
        if (type === 'url') {
            url = document.getElementById('videoUrl').value.trim();
        } else {
            url = document.getElementById('videoLocalPath').value.trim();
        }
        
        if (!title || !url) {
            alert('Por favor, preencha todos os campos!');
            return;
        }

        // Desabilitar o botão durante o upload
        saveButton.disabled = true;
        saveButton.textContent = 'Adicionando...';
        
        const success = await addVideo({ type, url, title });
        
        if (success) {
            clearFormAndHideModal();
        }

        // Reabilitar o botão
        saveButton.disabled = false;
        saveButton.textContent = 'Adicionar Vídeo';
    });
}); 