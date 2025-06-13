// Funções gerais do site
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se está logado
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Inicialização do site
    console.log('Site Sophia Valentine\'s inicializado');
    
    // Função para carregar componentes
    loadComponents();

    // Adicionar botão de logout
    addLogoutButton();
});

// Função para carregar componentes reutilizáveis
async function loadComponents() {
    try {
        // Carregar header
        const headerResponse = await fetch('/components/header.html');
        const headerHtml = await headerResponse.text();
        document.querySelector('header').innerHTML = headerHtml;

        // Carregar footer
        const footerResponse = await fetch('/components/footer.html');
        const footerHtml = await footerResponse.text();
        document.querySelector('footer').innerHTML = footerHtml;
    } catch (error) {
        console.error('Erro ao carregar componentes:', error);
    }
}

// Função para adicionar botão de logout
function addLogoutButton() {
    const header = document.querySelector('header');
    const logoutButton = document.createElement('button');
    logoutButton.className = 'logout-button';
    logoutButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sair';
    logoutButton.onclick = logout;
    header.appendChild(logoutButton);
}

function logout() {
    // Remove o estado de login
    localStorage.removeItem('isLoggedIn');
    
    // Redireciona para a página de login
    window.location.href = 'login.html';
} 