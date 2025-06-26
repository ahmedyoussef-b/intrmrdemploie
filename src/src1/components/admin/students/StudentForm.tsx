
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
import type { Apprenant, Classe, Parent, Utilisateur } from "@/types";
import { handleAddStudent, type StudentActionResponse } from "@/actions/studentActions";
import { useActionState, useEffect, startTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const studentFormSchema = z.object({
  id: z.string().optional(),
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères."),
  email: z.string().email("Veuillez entrer une adresse e-mail valide."),
  classeId: z.string().min(1, "Veuillez sélectionner une classe."),
  parentId: z.string().optional(),
  dateInscription: z.date({ required_error: "La date d'inscription est requise." }),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

interface StudentFormProps {
  initialData?: Apprenant | null;
  classes: Classe[];
  parents: Parent[];
  utilisateurs: Utilisateur[]; // To get parent names for the dropdown
  onSuccess: () => void;
  onCancel: () => void;
}

export function StudentForm({ initialData, classes, parents, utilisateurs, onSuccess, onCancel }: StudentFormProps) {
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: initialData ? {
        ...initialData,
        nom: '', // Populate from associated user if editing
        prenom: '', // Populate from associated user if editing
        email: '', // Populate from associated user if editing
        dateInscription: new Date(initialData.dateInscription),
    } : {
      nom: "",
      prenom: "",
      email: "",
      classeId: classes.length > 0 ? classes[0].id : "",
      parentId: undefined,
      dateInscription: new Date(),
    },
  });

  const { toast } = useToast();
  const actionToCall = handleAddStudent; // Placeholder for edit
  const [state, formAction, isPending] = useActionState<StudentActionResponse | undefined, FormData>(actionToCall, undefined);

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

  function onSubmit(data: StudentFormValues) {
    const formData = new FormData();
    if (initialData?.id) {
      formData.append('id', initialData.id);
    }
    formData.append('nom', data.nom);
    formData.append('prenom', data.prenom);
    formData.append('email', data.email);
    formData.append('classeId', data.classeId);
    if (data.parentId) {
      formData.append('parentId', data.parentId);
    }
    formData.append('dateInscription', data.dateInscription.toISOString());
    
    startTransition(() => {
      formAction(formData);
    });
  }
  
  const getParentName = (parentId: string): string => {
    const parent = parents.find(p => p.id === parentId);
    if (!parent) return "Inconnu";
    const utilisateur = utilisateurs.find(u => u.id === parent.utilisateurId);
    return utilisateur ? `${utilisateur.prenom} ${utilisateur.nom} (${parent.lienParente})` : "Inconnu";
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <FormField
          control={form.control}
          name="nom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de l'élève</FormLabel>
              <FormControl>
                <Input placeholder="Durand" {...field} />
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
              <FormLabel>Prénom de l'élève</FormLabel>
              <FormControl>
                <Input placeholder="Alice" {...field} />
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
              <FormLabel>Email de l'élève</FormLabel>
              <FormControl>
                <Input type="email" placeholder="alice.durand@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="classeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Classe</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={classes.length === 0}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une classe" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {classes.map(cl => (
                    <SelectItem key={cl.id} value={cl.id}>{cl.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent (Optionnel)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={parents.length === 0}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un parent" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Aucun</SelectItem>
                  {parents.map(p => (
                    <SelectItem key={p.id} value={p.id}>{getParentName(p.id)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dateInscription"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date d'inscription</FormLabel>
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
