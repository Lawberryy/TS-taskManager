// categoryManager.ts

// Classe pour gérer les catégories
import { Category } from './category';
import { Task } from '../task/task';
import TaskManager from '../task/taskManager';

// Classe pour gérer les catégories
export class CategoryManager {
    categories: Category[] = []; // Tableau vide au départ pour stocker les catégories ajoutées
    static categories: any;

    // Méthode pour créer une catégorie
    createCategory(name: string): Category {
        const category = { name, tasks: [] }; // Créer une nouvelle catégorie avec le nom spécifié et un tableau vide pour stocker les tâches
        this.categories.push(category); // Ajouter la catégorie dans le tableau categories
        
        // Appeler la méthode pour sauvegarder les catégories dans le local storage après la création d'une nouvelle catégorie
        this.saveCategoriesToLocalStorage();
        
        return category;
    }

    // Méthode pour assigner une tâche à une catégorie
    assignTask(category: Category, task: Task) {
        category.tasks.push(task); // Ajouter la tâche dans le tableau tasks de la catégorie
    
        this.saveCategoriesToLocalStorage();
    }

    // Méthode pour sauvegarder les catégories dans le local storage
    saveCategoriesToLocalStorage() {
        localStorage.setItem('categories', JSON.stringify(this.categories));
    }

    // Méthode pour charger les catégories depuis le local storage
    loadCategoriesFromLocalStorage() {
        const categoriesData = localStorage.getItem('categories');
        if (categoriesData) {
            this.categories = JSON.parse(categoriesData);
        }

        console.log('categories', this.categories);
    }

    // 
    getAllCategories(): string[] {
        // Assurez-vous que les catégories sont chargées
        this.loadCategoriesFromLocalStorage();

        return this.categories.map(category => category.name);
    }

    // Méthode pour initialiser les éléments HTML des catégories après chargement
    initCategorySelect() {
        const categorySelect = document.getElementById('taskCategory') as HTMLSelectElement;
        let firstOption: HTMLOptionElement | null = null; // Initialiser la variable firstOption à null
        
        // Sauvegarder la première <option> de la liste déroulante
        // Dans le but de donner la possibilité à l'utilisateur de ne pas sélectionner de catégorie
        if (firstOption) {
            categorySelect.appendChild(firstOption);
        }
        
        // Ajouter une option pour chaque catégorie
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });

        console.log('categorySelect', categorySelect);
    }

    // Méthode pour initialiser le sélecteur de catégories dans le formulaire de filtrage
    initFilterCategorySelect() {
        const filterCategorySelect = document.getElementById('filterCategory') as HTMLSelectElement;
        
        // Supprimer les options au-delà des deux premières
        while (filterCategorySelect.options.length > 2) {
            filterCategorySelect.remove(filterCategorySelect.options.length - 1);
        }

        // Ajouter une option pour chaque catégorie
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            filterCategorySelect.appendChild(option);
        });

        console.log('filterCategorySelect', filterCategorySelect);
    }
}