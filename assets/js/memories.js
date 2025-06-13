// Gerenciamento do carrossel de memórias

document.addEventListener('DOMContentLoaded', () => {
    loadCarouselImages();
});

let currentSlide = 0;
let carouselImages = [];
let autoPlayInterval;

async function loadCarouselImages() {
    try {
        const response = await fetch('/data/memories_carousel.json');
        const data = await response.json();
        carouselImages = data.carousel_images;
        renderCarousel();

        // Inicializa o auto-play
        startAutoPlay();
    } catch (error) {
        console.error('Erro ao carregar imagens do carrossel:', error);
    }
}

function renderCarousel() {
    const carouselSlide = document.querySelector('.carousel-slide');
    const carouselDots = document.querySelector('.carousel-dots');
    const carouselPrev = document.querySelector('.carousel-prev');
    const carouselNext = document.querySelector('.carousel-next');
    const carouselCaption = document.querySelector('.carousel-caption');
    const carouselContainer = document.querySelector('.carousel-container');

    if (!carouselSlide || !carouselDots || !carouselPrev || !carouselNext || !carouselCaption || !carouselContainer) return;

    carouselSlide.innerHTML = ''; // Limpa antes de adicionar

    carouselImages.forEach(image => {
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.alt;
        img.addEventListener('load', () => {
            requestAnimationFrame(updateCarousel); // Atualiza quando a imagem é carregada
        });
        carouselSlide.appendChild(img);
    });

    carouselDots.innerHTML = carouselImages.map((_, index) => `
        <span class="dot" data-index="${index}"></span>
    `).join('');

    carouselPrev.addEventListener('click', () => {
        stopAutoPlay();
        currentSlide = (currentSlide === 0) ? carouselImages.length - 1 : currentSlide - 1;
        requestAnimationFrame(updateCarousel);
        startAutoPlay();
    });

    carouselNext.addEventListener('click', () => {
        stopAutoPlay();
        currentSlide = (currentSlide === carouselImages.length - 1) ? 0 : currentSlide + 1;
        requestAnimationFrame(updateCarousel);
        startAutoPlay();
    });

    carouselDots.querySelectorAll('.dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
            stopAutoPlay();
            currentSlide = parseInt(e.target.dataset.index);
            requestAnimationFrame(updateCarousel);
            startAutoPlay();
        });
    });

    // Adicionar listener para redimensionamento da janela
    window.addEventListener('resize', () => {
        requestAnimationFrame(updateCarousel);
    });

    // Chamar updateCarousel após o carregamento completo da página (incluindo imagens)
    window.addEventListener('load', () => {
        requestAnimationFrame(updateCarousel);
    });
}

function startAutoPlay() {
    stopAutoPlay(); // Garante que apenas um intervalo esteja ativo
    autoPlayInterval = setInterval(() => {
        currentSlide = (currentSlide === carouselImages.length - 1) ? 0 : currentSlide + 1;
        updateCarousel();
    }, 5000); // Muda a cada 5 segundos (ajuste o tempo conforme preferir)
}

function stopAutoPlay() {
    clearInterval(autoPlayInterval);
}

function updateCarousel() {
    const carouselSlide = document.querySelector('.carousel-slide');
    const carouselDots = document.querySelector('.carousel-dots');
    const carouselCaption = document.querySelector('.carousel-caption');
    const carouselContainer = document.querySelector('.carousel-container');

    if (!carouselSlide || !carouselDots || !carouselCaption || !carouselContainer) return;

    // Obter a largura atual do contêiner do carrossel
    const containerWidth = carouselContainer.clientWidth;

    // Garante que a largura total do carouselSlide acomode todas as imagens
    carouselSlide.style.width = `${containerWidth * carouselImages.length}px`;

    // Ajustar a largura de cada imagem para ser igual à largura do container do carrossel
    const images = carouselSlide.querySelectorAll('img');
    images.forEach(img => {
        img.style.width = `${containerWidth}px`;
    });

    // Calcular a translação com base na largura atual do contêiner
    carouselSlide.style.transform = `translateX(${-containerWidth * currentSlide}px)`;

    carouselDots.querySelectorAll('.dot').forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });

    // Atualiza a legenda
    carouselCaption.textContent = carouselImages[currentSlide].caption;
} 

import { database, storage } from './firebase-config.js';
import { ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

let photosContainer = null;
let currentPage = '';

// Função para inicializar a página de memórias
function initMemoriesPage(pageName) {
    currentPage = pageName;
    photosContainer = document.querySelector('.photos-container');
    
    if (!photosContainer) {
        console.error('Container de fotos não encontrado!');
        return;
    }
    
    // Carregar fotos após um pequeno delay
    setTimeout(() => loadPhotos(), 1000);
    
    // Configurar modal
    setupModal();
}

// Função para carregar as fotos estáticas
async function loadStaticPhotos() {
    try {
        const response = await fetch('/data/memories_carousel.json');
        const data = await response.json();
        return data.carousel_images || [];
    } catch (error) {
        console.error('Erro ao carregar fotos estáticas:', error);
        return [];
    }
}

// Função para criar elemento de foto estática
function createStaticPhotoElement(photo) {
    console.log('Criando elemento para foto estática:', photo);
    const div = document.createElement('div');
    div.className = 'photo-card';
    div.innerHTML = `
        <div class="photo-container">
            <img src="${photo.src}" alt="${photo.alt || 'Foto'}" class="photo" onerror="this.onerror=null; this.src='assets/img/placeholder.jpg';">
            <div class="photo-info">
                <h3>${photo.alt || 'Foto'}</h3>
                <p>${photo.caption || ''}</p>
                <span class="photo-date">${photo.date || '2024'}</span>
            </div>
        </div>
    `;
    return div;
}

// Função para carregar as fotos
async function loadPhotos() {
    console.log('Iniciando carregamento das fotos...');
    const photosRef = ref(database, `photos/${currentPage}`);
    
    // Carregar fotos estáticas
    const staticPhotos = await loadStaticPhotos();
    console.log('Fotos estáticas carregadas:', staticPhotos);
    
    onValue(photosRef, (snapshot) => {
        const photos = snapshot.val() || {};
        console.log('Dados recebidos do Firebase:', photos);
        
        // Limpar container
        photosContainer.innerHTML = '';
        
        // Adicionar fotos estáticas primeiro
        staticPhotos.forEach(photo => {
            const photoElement = createStaticPhotoElement(photo);
            photosContainer.appendChild(photoElement);
        });
        
        // Converter para array e ordenar por timestamp
        const photosArray = Object.entries(photos)
            .map(([id, photo]) => ({ id, ...photo }))
            .sort((a, b) => b.timestamp - a.timestamp);
        
        console.log('Fotos do Firebase para exibir:', photosArray);
        
        // Adicionar cada foto do Firebase ao container
        photosArray.forEach(photo => {
            const photoElement = createPhotoElement(photo);
            photosContainer.appendChild(photoElement);
        });
    }, (error) => {
        console.error('Erro ao carregar fotos:', error);
    });
}

// Função para criar elemento de foto
function createPhotoElement(photo) {
    console.log('Criando elemento para foto:', photo);
    const div = document.createElement('div');
    div.className = 'photo-card';
    div.innerHTML = `
        <div class="photo-container">
            <img src="${photo.url}" alt="${photo.title}" class="photo" onerror="this.onerror=null; this.src='assets/img/placeholder.jpg';">
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
                const photoStorageRef = storageRef(storage, `photos/${currentPage}/${photo.id}`);
                await deleteObject(photoStorageRef);
                
                // Deletar do Database
                const photoRef = ref(database, `photos/${currentPage}/${photo.id}`);
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
        console.log('Iniciando processamento da foto...');
        const timestamp = Date.now();
        const photoId = `photo_${timestamp}`;
        
        // Converter a foto para base64
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        return new Promise((resolve, reject) => {
            reader.onload = async () => {
                try {
                    const url = reader.result;
                    
                    // Salvar no Database
                    const photoRef = ref(database, `photos/${currentPage}/${photoId}`);
                    await set(photoRef, {
                        title,
                        description,
                        url,
                        timestamp,
                        page: currentPage
                    });
                    
                    console.log('Foto adicionada com sucesso!');
                    resolve(true);
                } catch (error) {
                    console.error('Erro ao salvar foto:', error);
                    alert('Erro ao salvar a foto. Por favor, tente novamente.');
                    reject(error);
                }
            };
            
            reader.onerror = (error) => {
                console.error('Erro ao ler a foto:', error);
                alert('Erro ao processar a foto. Por favor, tente novamente.');
                reject(error);
            };
        });
    } catch (error) {
        console.error('Erro ao adicionar foto:', error);
        alert('Erro ao salvar a foto. Por favor, tente novamente.');
        return false;
    }
}

// Função para deletar foto
async function deletePhoto(photoId) {
    try {
        // Deletar do Database
        const photoRef = ref(database, `photos/${currentPage}/${photoId}`);
        await remove(photoRef);
        
        console.log('Foto deletada com sucesso:', photoId);
        return true;
    } catch (error) {
        console.error('Erro ao deletar foto:', error);
        alert('Erro ao excluir a foto. Por favor, tente novamente.');
        return false;
    }
}

// Função para configurar o modal
function setupModal() {
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
        form.reset();
    });
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            form.reset();
        }
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
        
        // Desabilitar o botão durante o upload
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Salvando...';
        
        try {
            const success = await addPhoto(fileInput.files[0], title, description);
            
            if (success) {
                form.reset();
                modal.style.display = 'none';
            }
        } catch (error) {
            console.error('Erro ao processar o formulário:', error);
            alert('Erro ao salvar a foto. Por favor, tente novamente.');
        } finally {
            // Reabilitar o botão
            submitButton.disabled = false;
            submitButton.textContent = 'Salvar';
        }
    });
}

// Exportar a função de inicialização
export { initMemoriesPage }; 