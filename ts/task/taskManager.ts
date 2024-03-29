// taskManager.ts
import { Task, Priority } from './task.js';
import { CategoryManager } from '../category/categoryManager.js';
import categoryManager from '../category/categoryManager.js';

// Classe pour gérer les tâches
export class TaskManager {

    private tasks: Task[] = []; // Tableau vide au départ pour stocker les tâches ajoutées
    private categories: string[] = ['non classée']; // Tableau pour stocker les catégories
    
    nextTaskId : number = 0;

    constructor(private categoryManager: CategoryManager) {
        this.categoryManager = categoryManager;
        // Récupérer nextTaskId du stockage local
        const storedNextTaskId = localStorage.getItem('nextTaskId');
        if (storedNextTaskId) {
            this.nextTaskId = Number(storedNextTaskId);
        }
    }

    // Méthode pour ajouter une tâche
    addNewTask(task: Task) {
        console.log('addNewTask called on', this); // Ajouté pour le débogage
        // Ajouter un ID unique à la tâche
        task.id = this.nextTaskId++; // Utilisation de l'opérateur ++ pour incrémenter nextTaskId après l'avoir utilisé
        // Stocker lastTaskId dans le stockage local
        localStorage.setItem('nextTaskId', String(this.nextTaskId));

        // Ajouter une catégorie à la tâche si une catégorie a été sélectionnée
        const selectedCategory = (document.getElementById('taskCategory') as HTMLSelectElement).value;
        if (selectedCategory) {
            task.category = selectedCategory;

            // Ajouter la catégorie au tableau des catégories si elle n'y est pas déjà
            if (!this.categories.includes(selectedCategory)) {
                this.categories.push(selectedCategory);

                this.updateCategorySelect();
            }
        } else {
            task.category = "non classée";
        }

        // Ajouter la tâche dans le tableau tasks
        this.tasks.push(task);

        console.log('tasks before saveTasksToLocalStorage:', this.tasks); // Ajouté pour le débogage

        // Appeler la méthode pour sauvegarder les tâches dans le local storage après l'ajout d'une nouvelle tâche
        this.saveTasksToLocalStorage();

        console.log('tasks after saveTasksToLocalStorage:', this.tasks); // Ajouté pour le débogage

        this.updateCategorySelect();
    }

    // Méthode pour afficher les tâches
    displayTasks() {
        // Récupérer la div avec l'id tasks qui contient les tâches
        const tasksDiv = document.getElementById('tasks') as HTMLDivElement; // as HTMLDivElement est un type assertion pour indiquer que document.getElementById('tasks') est un élément de div HTML

        // Supprimer les tâches existantes
        tasksDiv.innerHTML = '';

        this.tasks.forEach((task) => {
            // Créer un nouvel élément div pour la tâche
            const taskDiv = document.createElement('div');
            taskDiv.className = 'task ' + task.priority; // Ajout de la classe de priorité à la div
            
            // Vérifier si task.date est une instance de Date
            if (!(task.date instanceof Date)) {
                // Si ce n'est pas le cas, le convertir en une instance de Date
                task.date = new Date(task.date);
            }
            // Utiliser task.date comme une instance de Date
            taskDiv.setAttribute('data-date', task.date.toISOString().split('T')[0]);

            // Déterminer le texte à afficher pour la priorité (traduire high, medium et low en français)
            let priorityText;
            if (task.priority === Priority.Haute) {
                priorityText = 'Haute';
            } else if (task.priority === Priority.Moyenne) {
                priorityText = 'Moyenne';
            } else {
                priorityText = 'Faible';
            }

            // Ajouter le contenu de la tâche à la div
            taskDiv.innerHTML = `
                <h3>${task.title} <span>– Priorité ${priorityText}</span></h3>
                <p>Catégorie : ${task.category}</p>
                <p>Date d'échéance: ${task.date.toISOString().split('T')[0]}</p>
                <p>${task.description}</p>
                <button type="button" class="delete-btn">Supprimer</button>
                <button class="edit-btn">Modifier</button>
            `;
            // toISOString().split('T')[0] retourne la date au format ISO (YYYY-MM-DD)

            // Ajout d'un évènement au clic au bouton "Supprimer"
            const deleteButton = taskDiv.querySelector('.delete-btn');
            if (deleteButton) {
                deleteButton.addEventListener('click', () => {
                    // Supprimer la tâche du tableau
                    this.tasks = this.tasks.filter(t => t.id !== task.id);

                    // Appeler la méthode pour sauvegarder les tâches dans le local storage après la suppression d'une tâche
                    this.saveTasksToLocalStorage();

                    // Rafraîchir l'affichage des tâches
                    this.displayTasks();
                });
            }

            // Ajouter un gestionnaire d'événements au bouton "Modifier"
            const editButton = taskDiv.querySelector('.edit-btn');
            if(editButton) {
                editButton.addEventListener('click', () => {
                    // Vérifier si un formulaire existe déjà
                    let editForm = taskDiv.querySelector('form');
                    if (!editForm) {
                        // Crée un nouveau formulaire s'il n'en existe pas déjà un
                        editForm = document.createElement('form');
                        taskDiv.appendChild(editForm);
                    }

                    // Charger et ajouter les catégories depuis CategoryManager
                    this.categoryManager.loadCategoriesFromLocalStorage();
                    const categories = this.categoryManager.categories;
                    
                    // Remplir le formulaire avec les détails de la tâche
                    editForm.innerHTML = `
                        <input type="text" name="title" value="${task.title}">
                        <input type="text" name="description" value="${task.description}">
                        <input type="date" name="date" value="${task.date.toISOString().split('T')[0]}">
                        <select name="priority">
                            <option value="${Priority.Haute}" ${task.priority === Priority.Haute ? 'selected' : ''}>Haute</option>
                            <option value="${Priority.Moyenne}" ${task.priority === Priority.Moyenne ? 'selected' : ''}>Moyenne</option>
                            <option value="${Priority.Faible}" ${task.priority === Priority.Faible ? 'selected' : ''}>Faible</option>
                        </select>
                        <select name="category">
                            <option value="non classée">Non classée</option>
                            ${categories.map(category => `<option value="${category.name}" ${task.category === category.toString() ? 'selected' : ''}>${category.name}</option>`).join('')}
                        </select>
                        <button type="submit">Mettre à jour</button>
                    `;

                    // Ajouter un gestionnaire d'événements au formulaire pour mettre à jour la tâche
                    if (editForm) { 
                        editForm!.addEventListener('submit', (event) => {
                            event.preventDefault();
                        
                            // Mise à jour de la tâche avec les nouvelles valeurs
                            task.title = (editForm!.elements.namedItem('title') as HTMLInputElement).value;
                            task.description = (editForm!.elements.namedItem('description') as HTMLInputElement).value;
                            task.date = new Date((editForm!.elements.namedItem('date') as HTMLInputElement).value);
                            task.priority = (editForm!.elements.namedItem('priority') as HTMLInputElement).value as Priority;
                            task.category = (editForm!.elements.namedItem('category') as HTMLSelectElement).value;

                            // Appeler la méthode pour sauvegarder les tâches dans le local storage après la modification d'une tâche
                            this.saveTasksToLocalStorage();
                        
                            // Rafraîchir l'affichage des tâches
                            this.displayTasks();
                        });

                        // Ajouter le formulaire à la div de la tâche
                        taskDiv.appendChild(editForm);
                    } else {
                        console.error('Le formulaire de modification n\'a pas été trouvé');
                    }
                });
            }

            // Ajouter un écouteur d'événements sur le bouton "Appliquer le filtre" pour filtrer les tâches
            document.getElementById('applyFilter')?.addEventListener('click', function() { // Utilisation de l'opérateur de ? pour vérifier si l'élément avec l'id filterPriority existe (et éviter l'error "Cannot read property of null")
                // Cacher le message au début du filtrage
                document.getElementById('noTasksMessage')!.style.display = 'none';
                
                // Obtenir la priorité sélectionnée dans le select
                const selectedPriority = (document.getElementById('filterPriority') as HTMLInputElement).value;

                // Obtenir la date sélectionnée
                const selectedDate = (document.getElementById('filterDate') as HTMLInputElement).value;

                // Obtenir la catégorie sélectionnée dans le select
                const selectedCategory = (document.getElementById('filterCategory') as HTMLSelectElement).value;

                // Obtenir toutes les tâches
                const tasks = document.querySelectorAll('.task');

                // Initialiser un compteur pour le nombre de tâches affichées
                let displayedTasksCount = 0;

                // Parcourir toutes les tâches
                tasks.forEach((taskElement) => {
                    const task = taskElement as HTMLElement;

                    // Obtenir la catégorie de la tâche
                    const taskCategoryElement = task.querySelector('p:nth-child(2)'); // Sélectionne le deuxième élément p qui contient la catégorie
                    const taskCategory = taskCategoryElement ? taskCategoryElement.textContent?.split(': ')[1] : ''; //

                    // Obtenir la priorité de la tâche
                    const taskPriority = task.classList.contains('high') ? 'high' : // Utilisation de la méthode contains pour vérifier si la classe de priorité est présente
                                        task.classList.contains('medium') ? 'medium' : // Si la classe est présente, la priorité est définie à la valeur correspondante
                                        task.classList.contains('low') ? 'low' : ''; // Sinon, la priorité est définie à une chaîne vide

                    // Obtenir la date de la tâche
                    const taskDate = task.getAttribute('data-date');

                    // Filtrage par priorité et date
                    if ((selectedPriority === 'all' || taskPriority === selectedPriority) && // Vérifier si la priorité sélectionnée est "all" ou si la priorité de la tâche correspond à la priorité sélectionnée
                        (!selectedDate || taskDate === selectedDate) &&  // Vérifier si aucune date n'est sélectionnée ou si la date de la tâche correspond à la date sélectionnée
                        (selectedCategory === 'all' || taskCategory === selectedCategory)) { // Vérifier si la catégorie sélectionnée est "all" ou si la catégorie de la tâche correspond à la catégorie sélectionnée
                        task.style.display = 'block';
                        displayedTasksCount++;
                    } else {
                        task.style.display = 'none';
                    }
                });

                // Afficher un message si aucune tâche n'est affichée
                if (displayedTasksCount === 0) {
                    document.getElementById('noTasksMessage')!.style.display = 'block';
                }
            });

            // Ajouter la div de la tâche à la div de la liste des tasks
            tasksDiv.appendChild(taskDiv);
        });
    }

    // Méthode pour sauvegarder les tâches dans le local storage
    saveTasksToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
    
    // Méthode pour récupérer les tâches depuis le local storage
    loadTasksFromLocalStorage() {
        const tasksData = localStorage.getItem('tasks');
        if (tasksData) {
            this.tasks = JSON.parse(tasksData);
        }
    }

    updateCategorySelect() {
        const taskCategorySelect = document.getElementById('taskCategory') as HTMLSelectElement;
       
        // Charger et ajouter les catégories depuis CategoryManager
        this.categoryManager.loadCategoriesFromLocalStorage();

        const categories = this.categoryManager.categories;

        taskCategorySelect.innerHTML = '<option value="">Sélectionnez une catégorie</option>';

        categories.forEach(category => {
            const newOption = document.createElement('option');
            newOption.value = String(category.name); // Convert category to string
            newOption.textContent = String(category.name); // Convert category to string
            taskCategorySelect.appendChild(newOption);
        });
    }

    // Méthode pour rechercher des tâches par mot-clé
    // (Précision : les boutons supprimer et modifier ne fonctionnent pas pour les tâches filtrées)
    searchTasks(keyword: string): Task[] {
        console.log('searchTasks called on', this); // Ajouté pour le débogage
        console.log('searchTasks called with keyword:', keyword); // Ajouté pour le débogage
        console.log('tasks:', this.tasks); // Ajouté pour le débogage

        const lowerCaseKeyword = keyword.toLowerCase();
        return this.tasks.filter(task => {
            const matchesTitle = task.title.toLowerCase().includes(lowerCaseKeyword);
            const matchesDescription = task.description.toLowerCase().includes(lowerCaseKeyword);
            const matchesCategory = (task.category?.toLowerCase() ?? '').includes(lowerCaseKeyword);

            console.log('matchesTitle:', matchesTitle);
            console.log('matchesDescription:', matchesDescription);
            console.log('matchesCategory:', matchesCategory);

            return matchesTitle || matchesDescription || matchesCategory;
        });
    }
}

// Récupérer l'input de recherche et le bouton de recherche
const searchInput = document.getElementById('searchInput') as HTMLInputElement;
const searchButton = document.getElementById('searchButton') as HTMLButtonElement;

// Instance de TaskManager
const taskManager = new TaskManager(categoryManager);
export default taskManager;

// Gestionnaire d'événements au bouton de recherche
searchButton.addEventListener('click', () => {
    // Récupérer la valeur de l'input de recherche
    const searchValue = searchInput.value;

    console.log(typeof searchValue, searchValue);

    // Rechercher les tâches
    const matchingTasks = taskManager.searchTasks(searchValue);

    console.log('matchingTasks', matchingTasks);

    // Afficher les tâches correspondantes
    displaySearchedTasks(matchingTasks);
});

// Fonction pour afficher les tâches
function displaySearchedTasks(tasks: Task[]) {
    // Supprimer toutes les tâches actuellement affichées
    const tasksContainer = document.getElementById('tasks');
    if (tasksContainer) {
        tasksContainer.innerHTML = '';
    }

    // Ajouter chaque tâche à taskContainer
    for (const task of tasks) {
        const taskContainer = document.createElement('div');
        // ajoute une class à la div avec task et la valeur de la priorité
        taskContainer.className = `task ${task.priority}`;
        taskContainer.innerHTML = `
                <h3>${task.title}<span>– Priorité ${task.priority}</span></h3>
                <p>Catégorie : ${task.category}</p>
                <p>Date d'échéance: ${task.date.toISOString().split('T')[0]}</p>
                <p>${task.description}</p>
                <button type="button" class="delete-btn">Supprimer</button>
                <button class="edit-btn">Modifier</button>
            `;
        if (tasksContainer) {
            tasksContainer.appendChild(taskContainer);
        }
    }
}