document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');

    // Adiciona a máscara de data
    passwordInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, ''); // Remove não-dígitos
        if (value.length > 8) value = value.substr(0, 8);
        
        // Formata a data (DD/MM/AAAA)
        if (value.length >= 2) {
            value = value.substr(0, 2) + '/' + value.substr(2);
        }
        if (value.length >= 5) {
            value = value.substr(0, 5) + '/' + value.substr(5);
        }
        
        e.target.value = value;
    });

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const password = passwordInput.value;
        
        // Verifica se a senha está no formato correto de data (DD/MM/AAAA)
        const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
        
        if (dateRegex.test(password) && password === '26/10/2024') {
            // Remove a classe de erro se existir
            passwordInput.classList.remove('error');
            
            // Armazena o estado de login
            localStorage.setItem('isLoggedIn', 'true');
            
            // Redireciona para a página principal
            window.location.href = 'index.html';
        } else {
            // Adiciona a classe de erro para animação
            passwordInput.classList.add('error');
            
            // Limpa o campo de senha
            passwordInput.value = '';
            
            // Remove a classe de erro após a animação
            setTimeout(() => {
                passwordInput.classList.remove('error');
            }, 500);
        }
    });

    // Verifica se já está logado
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'index.html';
    }
});