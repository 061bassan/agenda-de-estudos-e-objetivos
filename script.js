document.addEventListener('DOMContentLoaded', () => {
    console.log("DevDash Inicializado!");

    // --- localStorage Utilities ---
    const saveData = (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`Erro ao salvar ${key} no localStorage:`, e);
        }
    };

    const loadData = (key, defaultValue = null) => {
        try {
            const data = localStorage.getItem(key);
            if (data && data !== 'undefined') {
                return JSON.parse(data);
            }
            return defaultValue;
        } catch (e) {
            console.error(`Erro ao carregar ${key} do localStorage:`, e);
            return defaultValue;
        }
    };

    // --- Seletores DOM ---
    const timeDisplay = document.getElementById('time-display');
    const dateDisplay = document.getElementById('date-display');
    const greetingText = document.getElementById('greeting-text');
    const nameInput = document.getElementById('name-input');
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');

    // --- Seletores DOM (OBJETIVOS - Novos/Modificados) ---
    const objectivesList = document.getElementById('objectives-list'); // A lista UL
    const addObjectiveBtn = document.getElementById('add-objective-btn');
    const newObjectiveInput = document.getElementById('new-objective-input');
    // Não precisamos mais dos seletores antigos do Foco Único

    // --- Relógio e Data --- (Sem alterações)
    const updateTime = () => {
        // ... seu código existente ...
         if (!timeDisplay || !dateDisplay) return;
         const now = new Date();
         const timeString = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
         const dateString = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
         timeDisplay.textContent = timeString;
         dateDisplay.textContent = dateString;
    };

    // --- Saudação --- (Sem alterações funcionais, só listener de clique opcional)
    const updateGreeting = () => {
        // ... seu código existente ...
         if (!greetingText || !nameInput) return;
         const now = new Date();
         const hour = now.getHours();
         let greeting = "Olá";
         const userName = loadData('devdash_username', '');

         if (hour < 5) greeting = "Boa Madrugada";
         else if (hour < 12) greeting = "Bom Dia";
         else if (hour < 18) greeting = "Boa Tarde";
         else greeting = "Boa Noite";

         // Adicionado ícone wave junto ao texto se nome existir
         const greetingHTML = userName
             ? `${greeting}, <span class="user-name">${userName}</span>!<i class="far fa-hand-peace wave-icon"></i>`
             : `${greeting} <i class="far fa-hand-peace wave-icon"></i>`; // Mostra ícone mesmo sem nome

         greetingText.innerHTML = greetingHTML; // Atualiza com HTML

         if (userName) {
             nameInput.style.display = 'none';
             greetingText.style.display = 'block'; // Ou 'inline-block' dependendo do seu CSS
         } else {
             greetingText.style.display = 'block'; // Mostra saudação genérica
             nameInput.style.display = 'block';
             // nameInput.focus(); // Talvez não queira focar sempre
         }
    };
    const saveName = () => {
        // ... seu código existente ...
        if (!nameInput || !greetingText) return;
         const name = nameInput.value.trim();
         if (name) {
             saveData('devdash_username', name);
             updateGreeting(); // Atualiza UI imediatamente
             nameInput.blur(); // Tira o foco
         } else {
            // Se apagou o nome, remove do storage e atualiza
             localStorage.removeItem('devdash_username');
             updateGreeting();
         }
    };
    if (nameInput) {
        nameInput.addEventListener('blur', saveName);
        nameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); saveName(); } });
    }
     // Permite clicar na saudação para editar o nome
     if(greetingText) {
         greetingText.addEventListener('click', () => {
             const currentName = loadData('devdash_username', '');
             nameInput.value = currentName || ''; // Preenche com nome ou vazio
             nameInput.style.display = 'block';
             nameInput.focus();
             // Opcional: esconder o greetingText enquanto edita
             // greetingText.style.display = 'none';
         });
     }

    // --- OBJETIVOS DO DIA (Lógica Reformulada) ---

    // Carrega objetivos OU inicializa com um array vazio
    let objectives = loadData('devdash_objectives', []);

    // Função para RENDERIZAR a lista de objetivos no HTML
    const renderObjectives = () => {
        if (!objectivesList) return; // Sai se a lista não existir no DOM

        objectivesList.innerHTML = ''; // Limpa a lista atual

        if (objectives.length === 0) {
            // Opcional: Mostrar mensagem se não houver objetivos
             objectivesList.innerHTML = '<li class="no-objectives-msg">Nenhum objetivo definido ainda. Adicione um abaixo!</li>';
             // Adicione um estilo para .no-objectives-msg no CSS se quiser
            return;
        }

        objectives.forEach(obj => {
            const li = document.createElement('li');
            li.setAttribute('data-id', obj.id); // ID para referência futura
            li.classList.toggle('is-editing', obj.isEditing || false); // Classe para estado de edição

            li.innerHTML = `
                <input type="checkbox" id="obj-${obj.id}" class="objective-checkbox" ${obj.completed ? 'checked' : ''}>
                <label for="obj-${obj.id}" class="sr-only">${obj.text}</label> <!-- Label para acessibilidade -->

                <span class="objective-text-display ${obj.completed ? 'is-completed' : ''}">${obj.text}</span>
                <input type="text" class="objective-edit-input" value="${obj.text}" style="display: none;">

                <div class="objective-actions">
                    <button class="objective-edit-btn" aria-label="Editar Objetivo"><i class="fas fa-pencil-alt"></i></button>
                    <button class="objective-delete-btn" aria-label="Excluir Objetivo"><i class="fas fa-trash"></i></button>
                </div>
            `;

            // Se o item estiver marcado como 'isEditing', mostra o input
             if (obj.isEditing) {
                 li.querySelector('.objective-text-display').style.display = 'none';
                 li.querySelector('.objective-edit-input').style.display = 'block';
             }

            objectivesList.appendChild(li);
        });
    };

    // Função para ADICIONAR um novo objetivo
    const addObjective = () => {
        if (!newObjectiveInput) return;
        const text = newObjectiveInput.value.trim();
        if (text) {
            const newObjective = {
                id: Date.now(), // ID único baseado no timestamp
                text: text,
                completed: false,
                isEditing: false // Estado inicial de edição
            };
            objectives.push(newObjective); // Adiciona ao array
            saveData('devdash_objectives', objectives); // Salva no localStorage
            newObjectiveInput.value = ''; // Limpa o input
            renderObjectives(); // Re-renderiza a lista
        }
    };

    // Função para MARCAR/DESMARCAR um objetivo como completo
    const toggleObjectiveComplete = (id) => {
        objectives = objectives.map(obj => {
            if (obj.id === id) {
                return { ...obj, completed: !obj.completed }; // Inverte o estado 'completed'
            }
            return obj;
        });
        saveData('devdash_objectives', objectives);
        renderObjectives();
    };

    // Função para EXCLUIR um objetivo
    const deleteObjective = (id) => {
        // Opcional: Confirmar exclusão
        if (confirm("Tem certeza que deseja excluir este objetivo?")) {
            objectives = objectives.filter(obj => obj.id !== id); // Filtra, removendo o item
            saveData('devdash_objectives', objectives);
            renderObjectives();
        }
    };

     // Função para INICIAR EDIÇÃO de um objetivo
     const startEditObjective = (id) => {
         objectives = objectives.map(obj => obj.id === id ? { ...obj, isEditing: true } : { ...obj, isEditing: false }); // Marca apenas este como editando
         renderObjectives(); // Re-renderiza para mostrar o input

         // Foca no input que acabou de aparecer (após pequena espera)
         setTimeout(() => {
             const li = objectivesList.querySelector(`li[data-id="${id}"]`);
             if (li) {
                 li.querySelector('.objective-edit-input')?.focus();
             }
         }, 0);
     };

     // Função para SALVAR EDIÇÃO de um objetivo
     const saveEditObjective = (id, newText) => {
         const trimmedText = newText.trim();
         objectives = objectives.map(obj => {
             if (obj.id === id) {
                 // Só salva se o texto não estiver vazio após trim
                 return { ...obj, text: trimmedText ? trimmedText : obj.text, isEditing: false };
             }
             return { ...obj, isEditing: false }; // Garante que outros não fiquem em modo de edição
         });
         saveData('devdash_objectives', objectives);
         renderObjectives(); // Re-renderiza com o texto atualizado
     };


    // Event Listener para ADICIONAR (Botão e Enter no Input)
    if (addObjectiveBtn) {
        addObjectiveBtn.addEventListener('click', addObjective);
    }
    if (newObjectiveInput) {
        newObjectiveInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addObjective();
            }
        });
    }

    // Event Listener DELEGADO na LISTA UL para ações nos itens LI
    if (objectivesList) {
        objectivesList.addEventListener('click', (e) => {
            const target = e.target;
            const li = target.closest('li'); // Encontra o LI pai do elemento clicado
            if (!li || !li.dataset.id) return; // Sai se não for um LI com ID

            const id = parseInt(li.dataset.id, 10);

            // --- Checkbox (MARCAR/DESMARCAR) ---
            // (Lidamos com 'change' abaixo para melhor prática com checkbox)

             // --- Botão EXCLUIR ---
             if (target.closest('.objective-delete-btn')) {
                 deleteObjective(id);
                 return; // Importante para não disparar outros eventos (ex: editar ao clicar no ícone)
             }

            // --- Botão EDITAR ---
            if (target.closest('.objective-edit-btn')) {
                startEditObjective(id);
                return;
            }

             // --- Clicar no TEXTO para editar ---
             if (target.classList.contains('objective-text-display')) {
                 startEditObjective(id);
                 return;
             }
        });

         // Listener para salvar edição quando o input perde foco (BLUR)
         objectivesList.addEventListener('blur', (e) => {
             if (e.target && e.target.classList.contains('objective-edit-input')) {
                 const li = e.target.closest('li');
                 if (li && li.dataset.id) {
                      const id = parseInt(li.dataset.id, 10);
                      saveEditObjective(id, e.target.value);
                 }
             }
         }, true); // Usa capturing phase para garantir que o blur seja pego

         // Listener para salvar edição com ENTER no input
         objectivesList.addEventListener('keypress', (e) => {
             if (e.key === 'Enter' && e.target && e.target.classList.contains('objective-edit-input')) {
                 e.preventDefault(); // Evita envio de formulário, se houver
                 const li = e.target.closest('li');
                  if (li && li.dataset.id) {
                       const id = parseInt(li.dataset.id, 10);
                       saveEditObjective(id, e.target.value);
                  }
             }
         });

         // Listener para o evento CHANGE do checkbox (melhor que 'click')
          objectivesList.addEventListener('change', (e) => {
             if (e.target && e.target.classList.contains('objective-checkbox')) {
                  const li = e.target.closest('li');
                   if (li && li.dataset.id) {
                       const id = parseInt(li.dataset.id, 10);
                       toggleObjectiveComplete(id);
                   }
              }
          });
    }

    // --- Citação --- (Sem alterações na lógica de fetch)
    const fetchQuote = async () => {
       // ... seu código existente ...
        if (!quoteText || !quoteAuthor) return;
         try {
             const response = await fetch('https://api.quotable.io/random?maxLength=120&tags=technology|inspirational|famous-quotes');
             if (!response.ok) throw new Error(`Falha ao buscar citação (${response.status})`);
             const data = await response.json();
             if (data.content) {
                 quoteText.textContent = data.content;
                 quoteAuthor.textContent = data.author || "Desconhecido";
             } else { throw new Error("Formato de citação inválido"); }
         } catch (error) {
             console.error("Erro ao buscar citação:", error);
             quoteText.textContent = "A persistência é o caminho do êxito.";
             quoteAuthor.textContent = "Charles Chaplin";
         }
    };

     // --- Links Rápidos --- (Mantendo sua lógica existente, caso haja)
     // Se você tinha código para links rápidos (addLinkForm, linksList, etc.),
     // garanta que os seletores e funções ainda existam e funcionem.
     // Exemplo básico de manutenção (adapte aos seus seletores REAIS):
     const linksList = document.getElementById('links-list'); // Supondo que exista
     const addLinkForm = document.getElementById('add-link-form'); // Supondo que exista
     const linkNameInput = document.getElementById('link-name-input'); // Supondo que exista
     const linkUrlInput = document.getElementById('link-url-input'); // Supondo que exista
     const toggleAddLinkFormBtn = document.getElementById('toggle-add-link-form-btn'); // Supondo que exista

     let quickLinks = loadData('devdash_links', []);

     const renderLinks = () => { /* ... sua função renderLinks ... */ };
     const addLink = (event) => { /* ... sua função addLink ... */ };
     const deleteLink = (index) => { /* ... sua função deleteLink ... */ };

     // Adicione seus listeners de links aqui novamente se necessário
     // Ex: if (addLinkForm) addLinkForm.addEventListener('submit', addLink); etc.

    // --- Inicialização Geral ---
    const init = () => {
        console.log("Iniciando Widgets...");
        // Tempo e Data
        updateTime();
        setInterval(updateTime, 1000);
        // Saudação
        updateGreeting();
        // OBJETIVOS (Nova Função)
        renderObjectives(); // <<<<<<<<<< MUDOU DE renderFocus para renderObjectives
        // Links Rápidos (Se existirem)
         // renderLinks(); // <<<<<<<<<< Descomente se você tiver links
        // Citação
        fetchQuote();
        console.log("Widgets Iniciados.");
    };

    init(); // Roda a inicialização

}); // Fim do DOMContentLoaded