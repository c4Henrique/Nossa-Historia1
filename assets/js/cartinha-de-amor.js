const API_URL = 'https://nossa-historia-jl87.onrender.com/api';

// Função para carregar as cartas
async function loadLetters() {
    try {
        const response = await fetch(`${API_URL}/love-letters`);
        const letters = await response.json();
        const container = document.querySelector('.love-letters-container');
        container.innerHTML = '';
        
        letters.forEach(letter => {
            const letterElement = createLetterElement(letter);
            container.appendChild(letterElement);
        });
    } catch (error) {
        console.error('Erro ao carregar cartas:', error);
    }
}

// Função para criar elemento de carta
function createLetterElement(letter) {
    const div = document.createElement('div');
    div.className = 'love-letter-card card fade-in';
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
                await fetch(`${API_URL}/love-letters/${letter.id}`, {
                    method: 'DELETE'
                });
                div.remove();
            } catch (error) {
                console.error('Erro ao deletar carta:', error);
            }
        }
    });
    
    return div;
}

// Função para adicionar nova carta
async function addLetter(title, content) {
    try {
        const response = await fetch(`${API_URL}/love-letters`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content })
        });
        
        if (response.ok) {
            const newLetter = await response.json();
            const container = document.querySelector('.love-letters-container');
            const letterElement = createLetterElement({
                id: newLetter.id,
                title,
                content
            });
            container.insertBefore(letterElement, container.firstChild);
        }
    } catch (error) {
        console.error('Erro ao adicionar carta:', error);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadLetters();
    
    // Modal de nova carta
    const modal = document.getElementById('newLetterModal');
    const addButton = document.querySelector('.add-letter-button');
    const closeButton = document.querySelector('.close-modal');
    const form = document.getElementById('newLetterForm');
    
    addButton.addEventListener('click', () => {
        modal.style.display = 'block';
    });
    
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('letterTitle').value;
        const content = document.getElementById('letterContent').value;
        
        await addLetter(title, content);
        
        form.reset();
        modal.style.display = 'none';
    });
}); 