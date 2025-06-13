const API_URL = 'https://nossa-historia-jl87.onrender.com/api';

// Função para carregar as datas
async function loadDates() {
    try {
        const response = await fetch(`${API_URL}/date-ideas`);
        const dates = await response.json();
        const container = document.querySelector('.date-ideas-container');
        container.innerHTML = '';
        
        dates.forEach(date => {
            const dateElement = createDateElement(date);
            container.appendChild(dateElement);
        });
    } catch (error) {
        console.error('Erro ao carregar datas:', error);
    }
}

// Função para criar elemento de data
function createDateElement(date) {
    const div = document.createElement('div');
    div.className = `date-card card ${date.completed ? 'completed' : ''}`;
    div.innerHTML = `
        <p>${date.idea}</p>
        <div class="date-actions">
            <button class="complete-date" data-id="${date.id}">
                <i class="fas fa-check"></i>
            </button>
            <button class="delete-date" data-id="${date.id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Adicionar eventos de clique
    div.querySelector('.complete-date').addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
            await fetch(`${API_URL}/date-ideas/${date.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ completed: !date.completed })
            });
            div.classList.toggle('completed');
        } catch (error) {
            console.error('Erro ao atualizar data:', error);
        }
    });
    
    div.querySelector('.delete-date').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('Tem certeza que deseja excluir esta data?')) {
            try {
                await fetch(`${API_URL}/date-ideas/${date.id}`, {
                    method: 'DELETE'
                });
                div.remove();
            } catch (error) {
                console.error('Erro ao deletar data:', error);
            }
        }
    });
    
    return div;
}

// Função para adicionar nova data
async function addDate(idea) {
    try {
        const response = await fetch(`${API_URL}/date-ideas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idea })
        });
        
        if (response.ok) {
            const newDate = await response.json();
            const container = document.querySelector('.date-ideas-container');
            const dateElement = createDateElement({
                id: newDate.id,
                idea,
                completed: false
            });
            container.insertBefore(dateElement, container.firstChild);
        }
    } catch (error) {
        console.error('Erro ao adicionar data:', error);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadDates();
    
    const form = document.getElementById('newDateForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const idea = document.getElementById('newDateIdea').value.trim();
        
        if (idea) {
            await addDate(idea);
            form.reset();
        }
    });
}); 