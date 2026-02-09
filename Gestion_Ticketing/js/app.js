/* js/app.js - Cerveau complet de l'application */

document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Application Ticketing chargée !");

    // ============================================================
    // 0. FONCTIONS UTILITAIRES (GLOBALES)
    // ============================================================
    
    // Affiche une notification (Succès/Erreur)
    function showNotification(message, type = 'success', targetElement) {
        if (!targetElement) return; // Sécurité

        const existingAlert = targetElement.parentNode.querySelector('.alert');
        if (existingAlert) existingAlert.remove();

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.innerHTML = message;

        targetElement.parentNode.insertBefore(alertDiv, targetElement);

        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }

    // Gestion de la Déconnexion (Global)
    // Cherche tous les liens qui contiennent "index.html" (la page de login)
    const logoutLinks = document.querySelectorAll('a[href="index.html"]');
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Si c'est un lien de retour simple (ex: depuis inscription), on ne confirme pas
            if (this.innerText.includes('Retour') || this.innerText.includes('Se connecter')) return;

            if (!confirm("Voulez-vous vraiment vous déconnecter ?")) {
                e.preventDefault(); // Annule le clic si l'utilisateur dit Non
            }
        });
    });

    // ============================================================
    // 1. DASHBOARD : Animation des Chiffres
    // ============================================================
    // Cible les éléments avec la classe .animate-number
    const numbersToAnimate = document.querySelectorAll('.animate-number');
    
    numbersToAnimate.forEach(counter => {
        // On lit le chiffre final écrit dans le HTML (ex: "12")
        // On nettoie le texte pour ne garder que les chiffres (enlève "h" ou "€")
        const target = +counter.innerText.replace(/\D/g, ''); 
        const originalText = counter.innerText; // On garde le format original (ex: "34h")
        const suffix = originalText.replace(/[0-9]/g, ''); // On garde juste "h" ou "%"

        const speed = 200; // Vitesse de l'animation
        const increment = target / speed;

        let current = 0;
        
        const updateCount = () => {
            if(current < target) {
                current += Math.ceil(target / 50); // On augmente par pas
                if(current > target) current = target;
                
                counter.innerText = current + suffix;
                setTimeout(updateCount, 20);
            } else {
                counter.innerText = originalText; // On remet le texte exact à la fin
            }
        };
        updateCount();
    });

    // ============================================================
    // 2. PAGES FORMULAIRES SIMPLES (Login, Forgot Pass, Settings)
    // ============================================================
    
    // Fonction générique pour simuler un envoi réussi
    function handleSimpleForm(formId, successMessage, redirectUrl = null) {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                // Simulation de chargement (bouton change de texte)
                const btn = form.querySelector('button');
                const originalBtnText = btn.innerText;
                btn.innerText = "Traitement...";
                btn.disabled = true;

                setTimeout(() => {
                    showNotification(successMessage, "success", form);
                    btn.innerText = originalBtnText;
                    btn.disabled = false;

                    if (redirectUrl) {
                        setTimeout(() => window.location.href = redirectUrl, 1000);
                    }
                }, 1000);
            });
        }
    }

    // Appels pour les différents formulaires
    handleSimpleForm('loginForm', "👋 Connexion réussie...", "dashboard.html");
    handleSimpleForm('forgotForm', "📧 Lien de réinitialisation envoyé sur votre email !");
    handleSimpleForm('settingsForm', "💾 Préférences enregistrées avec succès !");
    handleSimpleForm('profileForm', "👤 Profil mis à jour.");


    // ============================================================
    // 3. PAGE : NOUVEAU TICKET & PROJET (Validation)
    // ============================================================
    const ticketForm = document.getElementById('ticketForm');
    const projectForm = document.getElementById('projectForm'); // ID à ajouter sur project-new.html

    // Logique pour le ticket (Inclus vs Facturable)
    const typeSelect = document.getElementById('type');
    const warningMsg = document.getElementById('billable-warning');
    if (typeSelect && warningMsg) {
        typeSelect.addEventListener('change', function() {
            if (this.value === 'billable') warningMsg.classList.remove('hidden');
            else warningMsg.classList.add('hidden');
        });
    }

    // Fonction de validation commune
    function validateAndSubmit(form, redirectUrl) {
        if (!form) return;
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Vérification basique : champs vides
            let isValid = true;
            const requiredInputs = form.querySelectorAll('[required]');
            
            requiredInputs.forEach(input => {
                if (!input.value.trim()) {
                    input.style.borderColor = "var(--danger-color)";
                    isValid = false;
                } else {
                    input.style.borderColor = "#ccc";
                }
            });

            if (isValid) {
                showNotification("✅ Création réussie ! Redirection...", "success", form);
                setTimeout(() => window.location.href = redirectUrl, 1500);
            } else {
                showNotification("❌ Veuillez remplir correctement tous les champs obligatoires.", "error", form);
            }
        });
    }

    validateAndSubmit(ticketForm, 'tickets.html');
    validateAndSubmit(projectForm, 'projects.html');

    // ============================================================
    // 4. PAGES LISTES (Tickets & Projets) : Filtres de recherche
    // ============================================================
    
    // Filtre Tickets
    const filterProject = document.getElementById('filter-project');
    const filterStatus = document.getElementById('filter-status');
    
    if (filterProject || filterStatus) {
        const ticketRows = document.querySelectorAll('table tbody tr');
        function filterTickets() {
            const pVal = filterProject ? filterProject.value.toLowerCase() : '';
            const sVal = filterStatus ? filterStatus.value.toLowerCase() : '';
            ticketRows.forEach(row => {
                const text = row.innerText.toLowerCase();
                if ((pVal === '' || text.includes(pVal)) && (sVal === '' || text.includes(sVal))) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }
        if(filterProject) filterProject.addEventListener('change', filterTickets);
        if(filterStatus) filterStatus.addEventListener('change', filterTickets);
    }

    // Barre de recherche Projets
    const projectSearch = document.getElementById('project-search'); 
    
    if (projectSearch) {
        const projectCards = document.querySelectorAll('.card h3'); // On cherche les titres des cartes
        
        projectSearch.addEventListener('keyup', function(e) {
            const term = e.target.value.toLowerCase();
            
            projectCards.forEach(title => {
                const card = title.closest('.card'); 
                
                if (title.innerText.toLowerCase().includes(term)) {
                    card.style.display = 'block'; 
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // ============================================================
    // 5. PAGE : INSCRIPTION & PROFIL (Mots de passe)
    // ============================================================
    const registerForm = document.getElementById('registerForm');
    const passwordForm = document.getElementById('passwordForm'); // Sur profile.html

    function validatePasswords(form, redirectUrl = null) {
        if (!form) return;
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const passInputs = form.querySelectorAll('input[type="password"]');
            
            // On suppose que les 2 derniers sont "Nouveau" et "Confirmer"
            if (passInputs.length >= 2) {
                const pass1 = passInputs[passInputs.length - 2];
                const pass2 = passInputs[passInputs.length - 1];

                if (pass1.value !== pass2.value) {
                    pass2.style.borderColor = "var(--danger-color)";
                    showNotification("❌ Les mots de passe ne correspondent pas.", "error", form);
                    return;
                }
            }

            showNotification("✅ Action effectuée avec succès !", "success", form);
            if(redirectUrl) setTimeout(() => window.location.href = redirectUrl, 1500);
        });
    }

    validatePasswords(registerForm, 'index.html');
    validatePasswords(passwordForm); 

    // ============================================================
    // 6. DETAIL TICKET : Chronomètre depuis création
    // ============================================================
    const creationSpan = document.getElementById('ticket-creation-date');
    const timerDisplay = document.getElementById('live-timer');

    if (creationSpan && timerDisplay) {
        // 1. On récupère la date exacte stockée dans l'attribut data-created
        const creationDate = new Date(creationSpan.getAttribute('data-created')).getTime();

        // 2. Fonction qui calcule et affiche la différence
        function updateTimer() {
            const now = new Date().getTime(); // Heure actuelle
            const distance = now - creationDate; // Différence en millisecondes

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Affichage propre (on ajoute un 0 devant si < 10, ex: 09s)
            const hDisplay = hours < 10 ? "0" + hours : hours;
            const mDisplay = minutes < 10 ? "0" + minutes : minutes;
            const sDisplay = seconds < 10 ? "0" + seconds : seconds;

            // Injection du texte dans le HTML
            if (days > 0) {
                timerDisplay.innerText = `${days}j ${hDisplay}h ${mDisplay}m ${sDisplay}s`;
            } else {
                timerDisplay.innerText = `${hDisplay}h ${mDisplay}m ${sDisplay}s`;
            }
        }

        // 3. On lance la fonction tout de suite
        updateTimer();

        // 4. On relance la fonction toutes les 1000ms (1 seconde)
        setInterval(updateTimer, 1000);
    }

});