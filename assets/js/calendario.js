// Funções específicas para o calendário
document.addEventListener('DOMContentLoaded', () => {
    loadSpecialDates();
});

function loadSpecialDates() {
    const dates = JSON.parse(localStorage.getItem('specialDates')) || [];
    renderCalendar(dates);
}

function renderCalendar(dates) {
    const calendarContainer = document.getElementById('calendario');
    if (!calendarContainer) return;

    // Ordenar datas cronologicamente
    dates.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Agrupar datas por mês e ano
    const datesByMonthYear = {};
    dates.forEach(date => {
        const dateObj = new Date(date.date);
        const month = dateObj.getMonth();
        const year = dateObj.getFullYear();
        const key = `${year}-${month}`;
        
        if (!datesByMonthYear[key]) {
            datesByMonthYear[key] = {
                year: year,
                month: month,
                dates: []
            };
        }
        datesByMonthYear[key].dates.push(date);
    });

    // Ordenar as chaves (ano-mês) cronologicamente
    const sortedKeys = Object.keys(datesByMonthYear).sort((a, b) => {
        const [yearA, monthA] = a.split('-').map(Number);
        const [yearB, monthB] = b.split('-').map(Number);
        return yearA === yearB ? monthA - monthB : yearA - yearB;
    });

    // Renderizar cada mês
    calendarContainer.innerHTML = sortedKeys.map(key => {
        const { year, month, dates } = datesByMonthYear[key];
        return `
            <div class="month-section">
                <h3>${getMonthName(month)} ${year}</h3>
                <div class="dates-grid">
                    ${dates.map((date, index) => `
                        <div class="date-card ${date.priority || 'baixa'}" data-index="${index}">
                            <div class="date-content">
                                <span class="date-day">${formatDay(date.date)}</span>
                                <div class="date-header">
                                    <h4>${date.title}</h4>
                                    <span class="priority-badge ${date.priority || 'baixa'}">${(date.priority || 'baixa').toUpperCase()}</span>
                                </div>
                                <p>${date.description}</p>
                            </div>
                            <div class="date-actions">
                                <button class="edit-date" onclick="editDate(${index})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="delete-date" onclick="deleteDate(${index})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');

    // Adicionar botão de adicionar nova data
    calendarContainer.innerHTML += `
        <div class="add-date-section">
            <button class="add-date-button" onclick="showAddDateForm()">
                <i class="fas fa-plus"></i> Adicionar Data Especial
            </button>
        </div>
    `;
}

function getMonthName(month) {
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month];
}

function formatDay(dateString) {
    return new Date(dateString).getDate();
}

function showAddDateForm() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Adicionar Data Especial</h3>
            <form id="add-date-form">
                <div class="form-group">
                    <label for="date-title">Título</label>
                    <input type="text" id="date-title" required>
                </div>
                <div class="form-group">
                    <label for="date-date">Data</label>
                    <input type="date" id="date-date" required>
                </div>
                <div class="form-group">
                    <label for="date-priority">Prioridade</label>
                    <select id="date-priority" required>
                        <option value="alta">Alta</option>
                        <option value="media">Média</option>
                        <option value="baixa">Baixa</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="date-description">Descrição</label>
                    <textarea id="date-description" required></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" onclick="closeModal()">Cancelar</button>
                    <button type="submit">Salvar</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    const form = document.getElementById('add-date-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newDate = {
            title: document.getElementById('date-title').value,
            date: document.getElementById('date-date').value,
            priority: document.getElementById('date-priority').value,
            description: document.getElementById('date-description').value
        };
        saveDate(newDate);
        closeModal();
    });
}

function showEditDateForm(date, index) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Editar Data Especial</h3>
            <form id="edit-date-form">
                <div class="form-group">
                    <label for="date-title">Título</label>
                    <input type="text" id="date-title" value="${date.title}" required>
                </div>
                <div class="form-group">
                    <label for="date-date">Data</label>
                    <input type="date" id="date-date" value="${date.date}" required>
                </div>
                <div class="form-group">
                    <label for="date-priority">Prioridade</label>
                    <select id="date-priority" required>
                        <option value="alta" ${date.priority === 'alta' ? 'selected' : ''}>Alta</option>
                        <option value="media" ${date.priority === 'media' ? 'selected' : ''}>Média</option>
                        <option value="baixa" ${date.priority === 'baixa' ? 'selected' : ''}>Baixa</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="date-description">Descrição</label>
                    <textarea id="date-description" required>${date.description}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" onclick="closeModal()">Cancelar</button>
                    <button type="submit">Salvar</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    const form = document.getElementById('edit-date-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const updatedDate = {
            title: document.getElementById('date-title').value,
            date: document.getElementById('date-date').value,
            priority: document.getElementById('date-priority').value,
            description: document.getElementById('date-description').value
        };
        updateDate(index, updatedDate);
        closeModal();
    });
}

function editDate(index) {
    const dates = JSON.parse(localStorage.getItem('specialDates')) || [];
    const date = dates[index];
    showEditDateForm(date, index);
}

function updateDate(index, updatedDate) {
    const dates = JSON.parse(localStorage.getItem('specialDates')) || [];
    dates[index] = updatedDate;
    localStorage.setItem('specialDates', JSON.stringify(dates));
    loadSpecialDates();
}

function deleteDate(index) {
    if (confirm('Tem certeza que deseja excluir esta data especial?')) {
        const dates = JSON.parse(localStorage.getItem('specialDates')) || [];
        dates.splice(index, 1);
        localStorage.setItem('specialDates', JSON.stringify(dates));
        loadSpecialDates();
    }
}

function saveDate(newDate) {
    const dates = JSON.parse(localStorage.getItem('specialDates')) || [];
    dates.push(newDate);
    localStorage.setItem('specialDates', JSON.stringify(dates));
    loadSpecialDates();
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
} 