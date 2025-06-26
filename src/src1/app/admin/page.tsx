
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { School, Users, BookOpen, CalendarPlus, Puzzle, LayoutDashboard, CalendarDays, History, Settings } from "lucide-react";

const adminSections = [
  { title: "Gérer les Établissements", href: "/admin/schools", icon: School, description: "Configurer les détails et paramètres des établissements." },
  { title: "Structure Académique", href: "/admin/academic-years", icon: CalendarDays, description: "Définir les années académiques et les périodes." },
  { title: "Gérer les Classes", href: "/admin/classes", icon: Users, description: "Organiser les classes et affecter les élèves." },
  { title: "Gérer les Enseignants", href: "/admin/teachers", icon: Users, description: "Superviser les profils et matières des enseignants." },
  { title: "Gérer les Élèves", href: "/admin/students", icon: Users, description: "Administrer les dossiers des élèves." },
  { title: "Gérer les Matières", href: "/admin/subjects", icon: BookOpen, description: "Définir les matières et détails du curriculum." },
  { title: "Gérer les Salles", href: "/admin/rooms", icon: LayoutDashboard, description: "Lister et catégoriser les salles de l'établissement." },
  { title: "Génération d'Emploi du Temps", href: "/admin/timetable/generate", icon: CalendarPlus, description: "Utiliser l'IA pour créer de nouveaux emplois du temps." },
  { title: "Contraintes", href: "/admin/constraints", icon: Puzzle, description: "Définir les contraintes pédagogiques et de ressources." },
];

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-primary font-headline flex items-center">
          <Settings className="mr-3 h-10 w-10" />
          Tableau de Bord Administration
        </h1>
        <p className="text-lg text-muted-foreground mt-1">
          Supervisez et gérez tous les aspects de ScolaTime.
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section) => (
          <Link href={section.href} key={section.title} className="block group">
            <Card className="h-full shadow-lg hover:shadow-xl hover:border-primary transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center gap-4 pb-3">
                <section.icon className="h-8 w-8 text-accent" />
                <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors">
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{section.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
