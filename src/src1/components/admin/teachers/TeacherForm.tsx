
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import type { Enseignant, Etablissement, Utilisateur } from "@/types";
import { JourSemaine } from "@/types";
import { handleAddTeacher, type TeacherActionResponse } from "@/actions/teacherActions";
import { useActionState, useEffect, startTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const teacherFormSchema = z.object({
  id: z.string().optional(),
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères."),
  email: z.string().email("Veuillez entrer une adresse e-mail valide."),
  etablissementId: z.string().min(1, "Veuillez sélectionner un établissement."),
  jourPedagogique: z.nativeEnum(JourSemaine, { errorMap: () => ({ message: "Veuillez sélectionner un jour."}) }),
  heuresMaxParJour: z.coerce.number().min(1, "Minimum 1 heure.").max(10, "Maximum 10 heures."),
  specialitePrincipale: z.string().min(2, "La spécialité doit contenir au moins 2 caractères."),
  dateEmbauche: z.date({ required_error: "La date d'embauche est requise."}),
});

type TeacherFormValues = z.infer<typeof teacherFormSchema>;

interface TeacherFormProps {
  initialData?: Enseignant | null; // Teacher data
  // Corresponding user data might be needed if editing an existing teacher's user details too
  // initialUser?: Utilisateur | null; 
  etablissements: Etablissement[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function TeacherForm({ initialData, etablissements, onSuccess, onCancel }: TeacherFormProps) {
  // If initialData (Enseignant) is provided, we might need to fetch/pass the associated Utilisateur data.
  // For simplicity, this form focuses on adding. Editing would require more complex data handling.
  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: initialData ? {
        ...initialData,
        // Assuming we'd pre-fill user fields if initialData and initialUser were provided
        nom: '', // Populate from initialUser if editing
        prenom: '', // Populate from initialUser if editing
        email: '', // Populate from initialUser if editing
        dateEmbauche: new Date(initialData.dateEmbauche),
    } : {
      nom: "",
      prenom: "",
      email: "",
      etablissementId: etablissements.length > 0 ? etablissements[0].id : "",
      jourPedagogique: JourSemaine.LUNDI,
      heuresMaxParJour: 6,
      specialitePrincipale: "",
      dateEmbauche: undefined,
    },
  });

  const { toast } = useToast();
  const actionToCall = handleAddTeacher; // Placeholder for edit
  const [state, formAction, isPending] = useActionState<TeacherActionResponse | undefined, FormData>(actionToCall, undefined);

  useEffect(() => {
    if (state?.success) {
      onSuccess();
    } else if (state?.success === false && state.message) {
      toast({
        title: "Erreur",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, onSuccess, toast]);

  function onSubmit(data: TeacherFormValues) {
    const formData = new FormData();
    if (initialData?.id) { // This would be teacher's ID
      formData.append('id', initialData.id);
    }
    formData.append('nom', data.nom);
    formData.append('prenom', data.prenom);
    formData.append('email', data.email);
    formData.append('etablissementId', data.etablissementId);
    formData.append('jourPedagogique', data.jourPedagogique);
    formData.append('heuresMaxParJour', data.heuresMaxParJour.toString());
    formData.append('specialitePrincipale', data.specialitePrincipale);
    formData.append('dateEmbauche', data.dateEmbauche.toISOString());
    
    startTransition(() => {
      formAction(formData);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <FormField
          control={form.control}
          name="nom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="Dupont" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="prenom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prénom</FormLabel>
              <FormControl>
                <Input placeholder="Jean" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="jean.dupont@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="etablissementId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Établissement</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={etablissements.length === 0}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un établissement" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {etablissements.map(etab => (
                    <SelectItem key={etab.id} value={etab.id}>{etab.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="specialitePrincipale"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Spécialité Principale</FormLabel>
              <FormControl>
                <Input placeholder="Mathématiques" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="jourPedagogique"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jour Pédagogique (Indisponibilité)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un jour" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(JourSemaine).map(value => (
                    <SelectItem key={value} value={value}>{value.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="heuresMaxParJour"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Heures Max par Jour</FormLabel>
              <FormControl>
                <Input type="number" placeholder="6" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dateEmbauche"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date d'embauche</FormLabel>
                <DatePicker date={field.value} setDate={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4 sticky bottom-0 bg-background py-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Annuler
          </Button>
          <Button type="submit" disabled={isPending}>
             {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Modifier" : "Ajouter"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
