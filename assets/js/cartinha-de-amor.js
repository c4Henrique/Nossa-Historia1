import { database } from './firebase-config.js';
import { ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

let lettersContainer = null;

// Função para carregar as cartas
function loadLetters() {
    console.log('Iniciando carregamento das cartas...');
    const lettersRef = ref(database, 'letters');
    
    onValue(lettersRef, (snapshot) => {
        const letters = snapshot.val() || {};
        console.log('Dados recebidos do Firebase:', letters);
        
        if (!lettersContainer) {
            lettersContainer = document.querySelector('.love-letters-container');
        }
        
        // Limpar container
        lettersContainer.innerHTML = '';
        
        // Converter para array e ordenar por timestamp
        const lettersArray = Object.entries(letters)
            .map(([id, letter]) => ({ id, ...letter }))
            .sort((a, b) => b.timestamp - a.timestamp);
        
        if (lettersArray.length === 0) {
            lettersContainer.innerHTML = '<p class="no-items-message">Nenhuma cartinha adicionada ainda. Que tal escrever uma?</p>';
        } else {
            // Adicionar cada carta ao container
            lettersArray.forEach(letter => {
                const letterElement = createLetterElement(letter);
                lettersContainer.appendChild(letterElement);
            });
        }
    });
}

// Função para criar elemento de carta
function createLetterElement(letter) {
    const div = document.createElement('div');
    div.className = 'love-letter-card card';
    div.innerHTML = `
        <h3>${letter.title}</h3>
        <p>${letter.content}</p>
        <button class="delete-letter-button" data-id="${letter.id}">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    // Adicionar evento de clique para o botão de deletar
    div.querySelector('.delete-letter-button').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('Tem certeza que deseja excluir esta carta?')) {
            try {
                const letterRef = ref(database, `letters/${letter.id}`);
                await remove(letterRef);
                console.log('Carta deletada com sucesso:', letter.id);
            } catch (error) {
                console.error('Erro ao deletar carta:', error);
                alert('Erro ao excluir a carta. Por favor, tente novamente.');
            }
        }
    });
    
    return div;
}

// Função para adicionar nova carta
async function addLetter(title, content) {
    console.log('Tentando adicionar nova carta:', { title, content });
    try {
        const timestamp = Date.now();
        const newLetterRef = ref(database, 'letters/' + timestamp);
        
        await set(newLetterRef, {
            title,
            content,
            timestamp
        });
        
        console.log('Carta adicionada com sucesso!');
        return true;
    } catch (error) {
        console.error('Erro ao adicionar carta:', error);
        alert('Erro ao salvar a carta. Por favor, tente novamente.');
        return false;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar container
    lettersContainer = document.querySelector('.love-letters-container');
    
    // Carregar cartas após um pequeno delay
    setTimeout(loadLetters, 1000);
    
    // Modal de nova carta
    const modal = document.getElementById('newLetterModal');
    const addButton = document.getElementById('openNewLetterModal');
    const closeButton = document.querySelector('#newLetterModal .close-modal');
    const form = document.getElementById('newLetterForm');
    const errorMessageElement = form.querySelector('.error-message');
    const cancelButton = form.querySelector('.cancel-button');
    
    if (!modal || !addButton || !closeButton || !form || !errorMessageElement || !cancelButton) {
        console.error('Elementos do modal não encontrados:', { modal, addButton, closeButton, form, errorMessageElement, cancelButton });
        return;
    }
    
    // Função para exibir mensagem de erro
    function showErrorMessage(message) {
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = 'block';
    }

    // Função para limpar mensagem de erro
    function clearErrorMessage() {
        errorMessageElement.textContent = '';
        errorMessageElement.style.display = 'none';
    }

    // Função para mostrar o modal
    function showModal() {
        modal.classList.add('show');
        clearErrorMessage();
    }

    // Função para esconder o modal
    function hideModal() {
        modal.classList.remove('show');
        form.reset();
        clearErrorMessage();
    }
    
    addButton.addEventListener('click', showModal);
    
    closeButton.addEventListener('click', hideModal);

    cancelButton.addEventListener('click', hideModal);
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrorMessage();
        
        const title = document.getElementById('letterTitle').value;
        const content = document.getElementById('letterContent').value;
        
        if (!title || !content) {
            showErrorMessage('Por favor, preencha todos os campos!');
            return;
        }
        
        const success = await addLetter(title, content);
        
        if (success) {
            hideModal();
        }
    });
}); 