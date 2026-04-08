
import type {IconName} from'./icons';

export type Category = "Food" | "Fitness" | "Mental_Health" | "Social" | "Study" | "Sleep" | "Other";

export const ICONS: Record<Category, IconName> = {
        Food: "food-fork-drink",
        Fitness: "dumbbell",
        Mental_Health: "brain",
        Social: "account-group",
        Study: "book-alphabet",
        Sleep: "sleep",
        Other: "cloud-question",
    }

export const OPTIONS: Record<Category, string[]> = {
        Food: ["Eat breakfast", "Eat lunch", "Eat dinner", "Snack","Drink more water", "Eat more fruits", "Eat more vegetables"],
        Fitness: ["Go for a walk","Go for a run", "Do yoga", "Lift weights", "Got to the gym", "Go to the pool"],
        Mental_Health: ["Meditate", "Journal", "Practice gratitude", "Take a break", "Go outside", "Practice mindfulness"],
        Social: ["Call a friend", "Meet up with a friend", "Go to a social event", "Join a club", "Volunteer", "Attend a community event"],
        Study: ["Review notes", "Read a book", "Practice problems", "Attend a study group", "Watch educational videos", "Take practice tests"],
        Sleep: ["Go to bed earlier", "Wake up earlier", "Take a nap", "Create a bedtime routine", "Limit screen time before bed", "Avoid caffeine in the evening"],
        Other: ["Practice a hobby", "Learn something new", "Organize your space", "Set goals for the week", "Reflect on your day","test","test2","test4"]
    }

export const CATEGORYNAMES: Record<Category, string> = {
        Food: "Food",
        Fitness: "Fitness",
        Mental_Health: "Mental Health",
        Social: "Social",
        Study: "Study",
        Sleep: "Sleep",
        Other: "Other"
    }