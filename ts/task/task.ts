// task.ts

// Enumération pour définir les priorités des tâches
export enum Priority {
    Haute = 'high',
    Moyenne = 'medium',
    Faible = 'low'
}
// Interface pour définir la structure d'une tâche
export interface Task {
    id: number; // ID pour identifier de manière unique chaque tâche
    title: string;
    description: string;
    date: Date;
    priority: Priority;
    category?: string; // La catégorie est optionnelle
}
