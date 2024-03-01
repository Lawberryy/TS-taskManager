// main.ts
import { Task, Priority } from './task/task.js';
import categoryManager from './category/categoryManager.js';
import taskManager from './task/taskManager.js';


// Chargement des tâches depuis le local storage
taskManager.loadTasksFromLocalStorage();
// Affichage des tâches après chargement
taskManager.displayTasks();

// Chargement des catégories depuis le local storage
categoryManager.loadCategoriesFromLocalStorage();
// Initialisation des éléments HTML des catégories après chargement
categoryManager.initCategorySelect();
categoryManager.initFilterCategorySelect();

// Récupération du formulaire
const taskForm = document.getElementById('taskForm') as HTMLFormElement; // as HTMLFormElement est un type assertion pour indiquer que document.getElementById('taskForm') est un élément de formulaire HTML

// Récupération du champ d'entrée pour la nouvelle catégorie et du bouton pour soumettre la nouvelle catégorie
const newCategoryInput = document.getElementById('newCategoryInput') as HTMLInputElement;
const newCategoryButton = document.getElementById('newCategoryButton') as HTMLButtonElement;
// Récupération du champ de sélection de catégorie
const taskCategorySelect = document.getElementById('taskCategory') as HTMLSelectElement;

// Ajout d'un écouteur d'événements pour le bouton de nouvelle catégorie
newCategoryButton.addEventListener('click', (event) => {
    // Récupération de la nouvelle catégorie
    const newCategory = newCategoryInput.value;

    // Vérification que la nouvelle catégorie n'est pas vide
    if (newCategory) {
        // Création de la nouvelle catégorie
        categoryManager.createCategory(newCategory);

        // Vérification si l'option existe déjà dans le sélecteur de catégories du formulaire
        const optionExists = Array.from(taskCategorySelect.options).some(option => option.value === newCategory);

        // Si l'option n'existe pas, l'ajouter
        if (!optionExists) {
            // Création de la nouvelle option pour la nouvelle catégorie
            const newOption = document.createElement('option');
            newOption.value = newCategory;
            newOption.textContent = newCategory;

            // Ajout de la nouvelle option au champ de sélection de catégorie
            taskCategorySelect.appendChild(newOption);
        }

        // Réinitialisation du champ d'entrée pour la nouvelle catégorie
        newCategoryInput.value = '';
    } else {
        // Si la nouvelle catégorie est vide, afficher un message d'erreur
        alert('Veuillez entrer un nom pour la nouvelle catégorie');
    }
});

// Ajouter un écouteur d'événements submit au formulaire
taskForm.addEventListener('submit', (event) => {
    // Empêcher le rechargement de la page au moment de la soumission du formulaire
    event.preventDefault();

    // Obtenir les valeurs des champs du formulaire
    const taskTitle = (document.getElementById('taskTitle') as HTMLInputElement).value; // as HTMLInputElement est un type assertion pour indiquer que document.getElementById('taskTitle') est un élément de formulaire HTML de type input
    const taskDescription = (document.getElementById('taskDescription') as HTMLTextAreaElement).value; // as HTMLTextAreaElement est un type assertion pour indiquer que document.getElementById('taskDescription') est un élément de formulaire HTML de type textarea
    const taskDueDate = new Date((document.getElementById('taskDueDate') as HTMLInputElement).value);
    const taskPriority = (document.getElementById('taskPriority') as HTMLSelectElement).value as Priority; // as HTMLSelectElement est un type assertion pour indiquer que document.getElementById('taskPriority') est un élément de formulaire HTML de type select
    // Priority est un type énuméré, donc on utilise as Priority pour indiquer que la valeur de taskPriority doit être un des membres de l'énumération Priority
    const taskCategory = (document.getElementById('taskCategory') as HTMLSelectElement).value;

    // Créer une nouvelle instance de Task avec les valeurs récupérées du formulaire
    const newTask: Task = {
        id: 1, // L'ID sera généré automatiquement par la méthode addNewTask de TaskManager
        title: taskTitle,
        description: taskDescription,
        date: taskDueDate,
        priority: taskPriority,
        category: taskCategory
    };

    // Ajouter la nouvelle tâche au TaskManager
    taskManager.addNewTask(newTask);

    // Afficher les tâches
    taskManager.displayTasks();

    // Réinitialiser le formulaire après la soumission pour le vider et permettre à l'utilisateur d'ajouter une autre tâche
    taskForm.reset();

    // Mise à jour des éléments HTML des catégories
    categoryManager.initCategorySelect();
    categoryManager.initFilterCategorySelect();

    // Mise à jour de la liste des catégories dans le select
    taskManager.updateCategorySelect();
});
