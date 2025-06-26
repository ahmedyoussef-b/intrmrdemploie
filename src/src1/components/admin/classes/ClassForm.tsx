
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
import type { Classe, Etablissement, AnneeScolaire, Enseignant, Utilisateur } from "@/types";
import { NiveauScolaire } from "@/types";
import { handleAddClass, type ClassActionResponse } from "@/actions/classActions";
import { useActionState, useEffect, startTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const classFormSchema = z.object({
  id: z.string().optional(),
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  niveau: z.nativeEnum(NiveauScolaire, { errorMap: () => ({ message: "Veuillez sélectionner un niveau."}) }),
  etablissementId: z.string().min(1, "Veuillez sélectionner un établissement."),
  anneeScolaireId: z.string().min(1, "Veuillez sélectionner une année scolaire."),
  capacite: z.coerce.number().min(1, "La capacité doit être d'au moins 1.").max(100, "La capacité ne peut excéder 100."),
  professeurPrincipalId: z.string().optional(),
});

type ClassFormValues = z.infer<typeof classFormSchema>;

interface ClassFormProps {
  initialData?: Classe | null;
  etablissements: Etablissement[];
  anneesScolaires: AnneeScolaire[];
  enseignants: Enseignant[];
  utilisateurs: Utilisateur[]; // Pour afficher les noms des enseignants
  onSuccess: () => void;
  onCancel: () => void;
}

export function ClassForm({ initialData, etablissements, anneesScolaires, enseignants, utilisateurs, onSuccess, onCancel }: ClassFormProps) {
  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: initialData || {
      nom: "",
      niveau: undefined,
      etablissementId: etablissements.length > 0 ? etablissements[0].id : "",
      anneeScolaireId: anneesScolaires.length > 0 ? anneesScolaires[0].id : "",
      capacite: 30,
      professeurPrincipalId: undefined,
    },
  });

  const { toast } = useToast();
  const actionToCall = handleAddClass; // Placeholder for edit
  const [state, formAction, isPending] = useActionState<ClassActionResponse | undefined, FormData>(actionToCall, undefined);

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

  function onSubmit(data: ClassFormValues) {
    const formData = new FormData();
    if (initialData?.id) {
      formData.append('id', initialData.id);
    }
    formData.append('nom', data.nom);
    formData.append('niveau', data.niveau);
    formData.append('etablissementId', data.etablissementId);
    formData.append('anneeScolaireId', data.anneeScolaireId);
    formData.append('capacite', data.capacite.toString());
    if (data.professeurPrincipalId) {
      formData.append('professeurPrincipalId', data.professeurPrincipalId);
    }
    
    startTransition(() => {
      formAction(formData);
    });
  }
  
  const getEnseignantName = (enseignantId: string): string => {
    const enseignant = enseignants.find(e => e.id === enseignantId);
    if (!enseignant) return "Inconnu";
    const utilisateur = utilisateurs.find(u => u.id === enseignant.utilisateurId);
    return utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : "Inconnu";
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <FormField
          control={form.control}
          name="nom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de la classe</FormLabel>
              <FormControl>
                <Input placeholder="6ème A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="niveau"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Niveau</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un niveau" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(NiveauScolaire).map(value => (
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
          name="anneeScolaireId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Année Scolaire</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={anneesScolaires.length === 0}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une année scolaire" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {anneesScolaires.map(annee => (
                    <SelectItem key={annee.id} value={annee.id}>{annee.annee}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="capacite"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacité</FormLabel>
              <FormControl>
                <Input type="number" placeholder="30" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="professeurPrincipalId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professeur Principal (Optionnel)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={enseignants.length === 0}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un professeur principal" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Aucun</SelectItem>
                  {enseignants.map(ens => (
                    <SelectItem key={ens.id} value={ens.id}>{getEnseignantName(ens.id)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
