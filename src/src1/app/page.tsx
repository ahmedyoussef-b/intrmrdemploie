
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, CalendarDays, Users, BookOpen, LayoutDashboard } from "lucide-react";
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Bienvenue sur ScolaTime</h1>
          <p className="text-muted-foreground">Votre système intelligent de gestion d'emplois du temps scolaires.</p>
        </div>
        <Link href="/admin/timetable/generate">
          <Button variant="default" size="lg">
            <Lightbulb className="mr-2 h-5 w-5" /> Générer un Nouvel Emploi du Temps
          </Button>
        </Link>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emplois du Temps Actifs</CardTitle>
            <CalendarDays className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Horaires actuellement publiés
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enseignants Gérés</CardTitle>
            <Users className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25</div>
            <p className="text-xs text-muted-foreground">
              Total du personnel enseignant actif
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matières Proposées</CardTitle>
            <BookOpen className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              Dans tous les départements
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-headline font-semibold mb-4 text-primary/90">Actions Rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Link href="/admin/classes" className="block">
            <Card className="h-full hover:bg-secondary/50 transition-colors duration-200 cursor-pointer p-4 flex flex-col items-center justify-center text-center">
                <LayoutDashboard className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-base font-medium">Gérer les Classes</CardTitle>
                <CardDescription className="text-xs">Ajouter, modifier ou voir les classes</CardDescription>
            </Card>
          </Link>
          <Link href="/admin/teachers" className="block">
           <Card className="h-full hover:bg-secondary/50 transition-colors duration-200 cursor-pointer p-4 flex flex-col items-center justify-center text-center">
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-base font-medium">Gérer les Enseignants</CardTitle>
                <CardDescription className="text-xs">Superviser profils et matières des enseignants</CardDescription>
            </Card>
          </Link>
          <Link href="/timetables/view/class" className="block">
            <Card className="h-full hover:bg-secondary/50 transition-colors duration-200 cursor-pointer p-4 flex flex-col items-center justify-center text-center">
                <CalendarDays className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-base font-medium">Voir les Emplois du Temps</CardTitle>
                <CardDescription className="text-xs">Accéder aux horaires des classes et enseignants</CardDescription>
            </Card>
          </Link>
           <Link href="/admin" className="block">
            <Card className="h-full hover:bg-secondary/50 transition-colors duration-200 cursor-pointer p-4 flex flex-col items-center justify-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mb-2 lucide lucide-settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 .54 1.74l-.03.59a2 2 0 0 1-1.54 2l-.4.06a2 2 0 0 0-1.63 2.52l.23.69a2 2 0 0 0 2.52 1.63l.4-.07a2 2 0 0 1 2-1.54l.03-.59a2 2 0 0 1 .54-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l.43-.25a2 2 0 0 1 1-1.73V4a2 2 0 0 0 2-2z"/><path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>
                <CardTitle className="text-base font-medium">Panneau d'Administration</CardTitle>
                <CardDescription className="text-xs">Accéder à tous les outils administratifs</CardDescription>
            </Card>
          </Link>
        </div>
      </section>
      
      <footer className="mt-auto pt-8 text-center text-sm text-muted-foreground">
        ScolaTime &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
