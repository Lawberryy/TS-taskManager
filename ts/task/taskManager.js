// taskManager.ts
import { Priority } from './task.js';
// import { Category } from '../category/category.js';
// Classe pour gérer les tâches
export default class TaskManager {
    categoryManager;
    static updateFilterCategorySelect() {
        throw new Error('Method not implemented.');
    }
    tasks = []; // Tableau vide au départ pour stocker les tâches ajoutées
    categories = ['non classée']; // Tableau pour stocker les catégories
    nextTaskId = 0;
    constructor(categoryManager) {
        this.categoryManager = categoryManager;
        this.categoryManager = categoryManager;
        // Récupérer nextTaskId du stockage local
        const storedNextTaskId = localStorage.getItem('nextTaskId');
        if (storedNextTaskId) {
            this.nextTaskId = Number(storedNextTaskId);
        }
    }
    // Méthode pour ajouter une tâche
    addNewTask(task) {
        // Ajouter un ID unique à la tâche
        task.id = this.nextTaskId++; // Utilisation de l'opérateur ++ pour incrémenter nextTaskId après l'avoir utilisé
        // Stocker lastTaskId dans le stockage local
        localStorage.setItem('nextTaskId', String(this.nextTaskId));
        // Ajouter une catégorie à la tâche si une catégorie a été sélectionnée
        const selectedCategory = document.getElementById('taskCategory').value;
        if (selectedCategory) {
            task.category = selectedCategory;
            // Ajouter la catégorie au tableau des catégories si elle n'y est pas déjà
            if (!this.categories.includes(selectedCategory)) {
                this.categories.push(selectedCategory);
                this.updateCategorySelect();
            }
        }
        else {
            task.category = "non classée";
        }
        // Ajouter la tâche dans le tableau tasks
        this.tasks.push(task);
        // Appeler la méthode pour sauvegarder les tâches dans le local storage après l'ajout d'une nouvelle tâche
        this.saveTasksToLocalStorage();
        this.updateCategorySelect();
    }
    // Méthode pour afficher les tâches
    displayTasks() {
        // Récupérer la div avec l'id tasks qui contient les tâches
        const tasksDiv = document.getElementById('tasks'); // as HTMLDivElement est un type assertion pour indiquer que document.getElementById('tasks') est un élément de div HTML
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
            }
            else if (task.priority === Priority.Moyenne) {
                priorityText = 'Moyenne';
            }
            else {
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
            if (editButton) {
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
                        editForm.addEventListener('submit', (event) => {
                            event.preventDefault();
                            // Mise à jour de la tâche avec les nouvelles valeurs
                            task.title = editForm.elements.namedItem('title').value;
                            task.description = editForm.elements.namedItem('description').value;
                            task.date = new Date(editForm.elements.namedItem('date').value);
                            task.priority = editForm.elements.namedItem('priority').value;
                            task.category = editForm.elements.namedItem('category').value;
                            // Appeler la méthode pour sauvegarder les tâches dans le local storage après la modification d'une tâche
                            this.saveTasksToLocalStorage();
                            // Rafraîchir l'affichage des tâches
                            this.displayTasks();
                        });
                        // Ajouter le formulaire à la div de la tâche
                        taskDiv.appendChild(editForm);
                    }
                    else {
                        console.error('Le formulaire de modification n\'a pas été trouvé');
                    }
                });
            }
            // Ajouter un écouteur d'événements sur le bouton "Appliquer le filtre" pour filtrer les tâches
            document.getElementById('applyFilter')?.addEventListener('click', function () {
                // Cacher le message au début du filtrage
                document.getElementById('noTasksMessage').style.display = 'none';
                // Obtenir la priorité sélectionnée dans le select
                const selectedPriority = document.getElementById('filterPriority').value;
                // Obtenir la date sélectionnée
                const selectedDate = document.getElementById('filterDate').value;
                // Obtenir la catégorie sélectionnée dans le select
                const selectedCategory = document.getElementById('filterCategory').value;
                // Obtenir toutes les tâches
                const tasks = document.querySelectorAll('.task');
                // Initialiser un compteur pour le nombre de tâches affichées
                let displayedTasksCount = 0;
                // Parcourir toutes les tâches
                tasks.forEach((taskElement) => {
                    const task = taskElement;
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
                        (!selectedDate || taskDate === selectedDate) && // Vérifier si aucune date n'est sélectionnée ou si la date de la tâche correspond à la date sélectionnée
                        (selectedCategory === 'all' || taskCategory === selectedCategory)) { // Vérifier si la catégorie sélectionnée est "all" ou si la catégorie de la tâche correspond à la catégorie sélectionnée
                        task.style.display = 'block';
                        displayedTasksCount++;
                    }
                    else {
                        task.style.display = 'none';
                    }
                });
                // Afficher un message si aucune tâche n'est affichée
                if (displayedTasksCount === 0) {
                    document.getElementById('noTasksMessage').style.display = 'block';
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
        const taskCategorySelect = document.getElementById('taskCategory');
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
}
