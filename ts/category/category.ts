import { Task } from '../task/task.js';

// Interface pour définir la structure d'une catégorie
export interface Category {
    name: string;
    tasks: Task[];
}