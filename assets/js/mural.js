import { database, storage } from './firebase-config.js';
import { ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

let photosContainer = null;

// Função para carregar as fotos
function loadPhotos() {
    console.log('Iniciando carregamento das fotos...');
    const photosRef = ref(database, 'photos');
    
    onValue(photosRef, (snapshot) => {
        const photos = snapshot.val() || {};
        console.log('Dados recebidos do Firebase:', photos);
        
        if (!photosContainer) {
            photosContainer = document.querySelector('.photos-container');
        }
        
        // Limpar container
        photosContainer.innerHTML = '';
        
        // Converter para array e ordenar por timestamp
        const photosArray = Object.entries(photos)
            .map(([id, photo]) => ({ id, ...photo }))
            .sort((a, b) => b.timestamp - a.timestamp);
        
        // Adicionar cada foto ao container
        photosArray.forEach(photo => {
            const photoElement = createPhotoElement(photo);
            photosContainer.appendChild(photoElement);
        });
    });
}

// Função para criar elemento de foto
function createPhotoElement(photo) {
    const div = document.createElement('div');
    div.className = 'photo-card';
    div.innerHTML = `
        <div class="photo-container">
            <img src="${photo.url}" alt="${photo.title}" class="photo">
            <div class="photo-info">
                <h3>${photo.title}</h3>
                <p>${photo.description}</p>
                <span class="photo-date">${new Date(photo.timestamp).toLocaleDateString()}</span>
            </div>
            <button class="delete-photo-button" data-id="${photo.id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Adicionar evento de clique para o botão de deletar
    div.querySelector('.delete-photo-button').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('Tem certeza que deseja excluir esta foto?')) {
            try {
                // Deletar do Storage
                const photoStorageRef = storageRef(storage, `photos/${photo.id}`);
                await deleteObject(photoStorageRef);
                
                // Deletar do Database
                const photoRef = ref(database, `photos/${photo.id}`);
                await remove(photoRef);
                
                console.log('Foto deletada com sucesso:', photo.id);
            } catch (error) {
                console.error('Erro ao deletar foto:', error);
                alert('Erro ao excluir a foto. Por favor, tente novamente.');
            }
        }
    });
    
    return div;
}

// Função para adicionar nova foto
async function addPhoto(file, title, description) {
    try {
        const timestamp = Date.now();
        const photoId = `photo_${timestamp}`;
        
        // Upload para o Storage
        const photoStorageRef = storageRef(storage, `photos/${photoId}`);
        const snapshot = await uploadBytes(photoStorageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        
        // Salvar no Database
        const photoRef = ref(database, `photos/${photoId}`);
        await set(photoRef, {
            title,
            description,
            url,
            timestamp
        });
        
        console.log('Foto adicionada com sucesso!');
        return true;
    } catch (error) {
        console.error('Erro ao adicionar foto:', error);
        alert('Erro ao salvar a foto. Por favor, tente novamente.');
        return false;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar container
    photosContainer = document.querySelector('.photos-container');
    
    // Carregar fotos após um pequeno delay
    setTimeout(loadPhotos, 1000);
    
    // Modal de nova foto
    const modal = document.getElementById('newPhotoModal');
    const addButton = document.getElementById('openNewPhotoModal');
    const closeButton = document.querySelector('#newPhotoModal .close-modal');
    const form = document.getElementById('newPhotoForm');
    
    if (!modal || !addButton || !closeButton || !form) {
        console.error('Elementos do modal não encontrados:', { modal, addButton, closeButton, form });
        return;
    }
    
    addButton.addEventListener('click', () => {
        modal.style.display = 'block';
    });
    
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('photoTitle').value;
        const description = document.getElementById('photoDescription').value;
        const fileInput = document.getElementById('photoFile');
        
        if (!title || !description || !fileInput.files[0]) {
            alert('Por favor, preencha todos os campos e selecione uma foto!');
            return;
        }
        
        const success = await addPhoto(fileInput.files[0], title, description);
        
        if (success) {
            form.reset();
            modal.style.display = 'none';
        }
    });
}); 