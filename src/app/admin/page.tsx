
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Puzzle, Wand2, Settings } from "lucide-react";

const adminSections = [
  { title: "Générateur d'Emploi du Temps", href: "/wizard", icon: Wand2, description: "Utiliser l'assistant pour créer un emploi du temps." },
  { title: "Gérer les Contraintes", href: "/admin/constraints", icon: Puzzle, description: "Définir les contraintes pour la génération." },
];

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-primary flex items-center">
          <Settings className="mr-3 h-10 w-10" />
          Panneau d'Administration
        </h1>
        <p className="text-lg text-muted-foreground mt-1">
          Gérez les paramètres avancés de la planification.
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section) => (
          <Link href={section.href} key={section.title} className="block group">
            <Card className="h-full shadow-lg hover:shadow-xl hover:border-primary transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center gap-4 pb-3">
                <section.icon className="h-8 w-8 text-accent" />
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
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
