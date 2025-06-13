import { database, ref, set, onValue, remove } from './firebase.js';

// Variáveis para as seções
let upcomingDatesContainer = null;
let dateIdeasContainer = null;

// --- Funções para Datas Próximas ---

// Inicializar a seção de Datas Próximas
function initUpcomingDates() {
    upcomingDatesContainer = document.querySelector('.upcoming-dates-list');
    if (!upcomingDatesContainer) {
        console.error('Container de Datas Próximas não encontrado!');
        return;
    }
    loadUpcomingDates();
    setupUpcomingDateModal();
}

// Carregar datas do Firebase
function loadUpcomingDates() {
    const datesRef = ref(database, 'upcomingDates');
    onValue(datesRef, (snapshot) => {
        const dates = snapshot.val() || {};
        upcomingDatesContainer.innerHTML = ''; // Limpar antes de adicionar

        const datesArray = Object.entries(dates)
            .map(([id, date]) => ({ id, ...date }))
            .sort((a, b) => new Date(a.date) - new Date(b.date)); // Ordenar por data

        if (datesArray.length === 0) {
            upcomingDatesContainer.innerHTML = '<p class="no-items-message">Nenhuma data próxima adicionada ainda. Clique no botão para adicionar uma!</p>';
        } else {
            datesArray.forEach(date => {
                const dateElement = createUpcomingDateElement(date);
                upcomingDatesContainer.appendChild(dateElement);
            });
        }
    });
}

// Criar elemento HTML para uma data próxima
function createUpcomingDateElement(date) {
    const li = document.createElement('li');
    li.className = 'upcoming-date-item';
    li.innerHTML = `
        <span>${new Date(date.date).toLocaleDateString('pt-BR')} - ${date.title}</span>
        <button class="delete-date-button" data-id="${date.id}">
            <i class="fas fa-trash"></i>
        </button>
    `;
    li.querySelector('.delete-date-button').addEventListener('click', () => {
        if (confirm(`Tem certeza que deseja excluir a data: ${date.title}?`)) {
            deleteUpcomingDate(date.id);
        }
    });
    return li;
}

// Adicionar nova data
async function addUpcomingDate(title, date) {
    console.log('Tentando adicionar nova data próxima:', { title, date });
    try {
        const timestamp = Date.now();
        const newDateId = `date_${timestamp}`;
        await set(ref(database, `upcomingDates/${newDateId}`), {
            title,
            date,
            timestamp
        });
        console.log('Data próxima adicionada com sucesso!', newDateId);
        return true;
    } catch (error) {
        console.error('Erro ao adicionar data próxima:', error);
        alert('Erro ao salvar a data. Por favor, tente novamente.');
        return false;
    }
}

// Deletar data
async function deleteUpcomingDate(id) {
    try {
        await remove(ref(database, `upcomingDates/${id}`));
        console.log('Data próxima deletada com sucesso!', id);
        return true;
    } catch (error) {
        console.error('Erro ao deletar data próxima:', error);
        alert('Erro ao excluir a data. Por favor, tente novamente.');
        return false;
    }
}

// Configurar modal de Datas Próximas
function setupUpcomingDateModal() {
    const modal = document.getElementById('newDateModal');
    const addButton = document.getElementById('openNewDateModal');
    const closeButton = document.querySelector('#newDateModal .close-modal');
    const form = document.getElementById('newDateForm');
    const errorMessageElement = form.querySelector('.error-message');

    console.log('Configurando modal de Datas Próximas.');
    modal.style.display = 'none'; // Garante que o modal está oculto ao inicializar

    if (!modal || !addButton || !closeButton || !form || !errorMessageElement) {
        console.error('Elementos do modal de datas não encontrados!', { modal, addButton, closeButton, form, errorMessageElement });
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

    addButton.addEventListener('click', () => {
        modal.style.display = 'block';
        clearErrorMessage(); // Limpa mensagens de erro ao abrir
    });
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
        form.reset();
        clearErrorMessage();
    });
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            form.reset();
            clearErrorMessage();
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrorMessage(); // Limpa mensagens de erro ao submeter

        const title = document.getElementById('dateTitle').value;
        const date = document.getElementById('dateDate').value;

        if (!title || !date) {
            showErrorMessage('Por favor, preencha todos os campos!');
            return;
        }

        const success = await addUpcomingDate(title, date);
        if (success) {
            form.reset();
            modal.style.display = 'none';
            clearErrorMessage();
        }
    });
}

// --- Funções para Ideias de Dates ---

// Inicializar a seção de Ideias de Dates
function initDateIdeas() {
    dateIdeasContainer = document.querySelector('.date-ideas-list');
    if (!dateIdeasContainer) {
        console.error('Container de Ideias de Dates não encontrado!');
        return;
    }
    loadDateIdeas();
    setupDateIdeaModal();
}

// Carregar ideias do Firebase
function loadDateIdeas() {
    const ideasRef = ref(database, 'dateIdeas');
    onValue(ideasRef, (snapshot) => {
        const ideas = snapshot.val() || {};
        dateIdeasContainer.innerHTML = ''; // Limpar antes de adicionar

        const ideasArray = Object.entries(ideas)
            .map(([id, idea]) => ({ id, ...idea }));

        if (ideasArray.length === 0) {
            dateIdeasContainer.innerHTML = '<p class="no-items-message">Nenhuma ideia de date adicionada ainda. Que tal adicionar uma?</p>';
        } else {
            ideasArray.forEach(idea => {
                const ideaElement = createDateIdeaElement(idea);
                dateIdeasContainer.appendChild(ideaElement);
            });
        }
    });
}

// Criar elemento HTML para uma ideia de date
function createDateIdeaElement(idea) {
    const li = document.createElement('li');
    li.className = 'date-idea-item';
    li.innerHTML = `
        <span>${idea.title}: ${idea.description}</span>
        <button class="delete-idea-button" data-id="${idea.id}">
            <i class="fas fa-trash"></i>
        </button>
    `;
    li.querySelector('.delete-idea-button').addEventListener('click', () => {
        if (confirm(`Tem certeza que deseja excluir a ideia: ${idea.title}?`)) {
            deleteDateIdea(idea.id);
        }
    });
    return li;
}

// Adicionar nova ideia de date
async function addDateIdea(title, description) {
    console.log('Tentando adicionar nova ideia de date:', { title, description });
    try {
        const timestamp = Date.now();
        const newIdeaId = `idea_${timestamp}`;
        await set(ref(database, `dateIdeas/${newIdeaId}`), {
            title,
            description,
            timestamp
        });
        console.log('Ideia de date adicionada com sucesso!', newIdeaId);
        return true;
    } catch (error) {
        console.error('Erro ao adicionar ideia de date:', error);
        alert('Erro ao salvar a ideia. Por favor, tente novamente.');
        return false;
    }
}

// Deletar ideia de date
async function deleteDateIdea(id) {
    try {
        await remove(ref(database, `dateIdeas/${id}`));
        console.log('Ideia de date deletada com sucesso!', id);
        return true;
    } catch (error) {
        console.error('Erro ao deletar ideia de date:', error);
        alert('Erro ao excluir a ideia. Por favor, tente novamente.');
        return false;
    }
}

// Configurar modal de Ideias de Dates
function setupDateIdeaModal() {
    const modal = document.getElementById('newIdeaModal');
    const addButton = document.getElementById('openNewIdeaModal');
    const closeButton = document.querySelector('#newIdeaModal .close-modal');
    const form = document.getElementById('newIdeaForm');
    const errorMessageElement = form.querySelector('.error-message');

    console.log('Configurando modal de Ideias de Dates.');
    modal.style.display = 'none'; // Garante que o modal está oculto ao inicializar

    if (!modal || !addButton || !closeButton || !form || !errorMessageElement) {
        console.error('Elementos do modal de ideias não encontrados!', { modal, addButton, closeButton, form, errorMessageElement });
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

    addButton.addEventListener('click', () => {
        modal.style.display = 'block';
        clearErrorMessage(); // Limpa mensagens de erro ao abrir
    });
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
        form.reset();
        clearErrorMessage();
    });
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            form.reset();
            clearErrorMessage();
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrorMessage(); // Limpa mensagens de erro ao submeter

        const title = document.getElementById('ideaTitle').value;
        const description = document.getElementById('ideaDescription').value;

        if (!title || !description) {
            showErrorMessage('Por favor, preencha todos os campos!');
            return;
        }

        const success = await addDateIdea(title, description);
        if (success) {
            form.reset();
            modal.style.display = 'none';
            clearErrorMessage();
        }
    });
}

// Inicialização ao carregar o DOM
document.addEventListener('DOMContentLoaded', () => {
    initUpcomingDates();
    initDateIdeas();
}); 