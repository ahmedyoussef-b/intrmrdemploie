
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { Matiere, Etablissement } from "@/types";
import { DureeMatiere, CategorieMatiere } from "@/types";
import { handleAddSubject, handleEditSubject, type SubjectActionResponse } from "@/actions/subjectActions";
import { useActionState, useEffect, startTransition } from "react"; // Added startTransition
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const subjectFormSchema = z.object({
  id: z.string().optional(),
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  code: z.string().min(2, "Le code doit contenir au moins 2 caractères.").max(10, "Le code ne peut pas dépasser 10 caractères."),
  duree: z.nativeEnum(DureeMatiere, { errorMap: () => ({ message: "Veuillez sélectionner une durée."}) }),
  priorite: z.coerce.number().min(1, "La priorité doit être au moins 1.").max(5, "La priorité ne peut pas dépasser 5."),
  categorie: z.nativeEnum(CategorieMatiere, { errorMap: () => ({ message: "Veuillez sélectionner une catégorie."}) }),
  etablissementId: z.string().min(1, "Veuillez sélectionner un établissement."),
  couleur: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, "Format de couleur invalide (ex: #RRGGBB).").optional(),
  requis: z.object({
    heuresParSemaine: z.coerce.number().min(1, "Les heures par semaine doivent être au moins 1."),
    necessiteLabo: z.boolean().default(false),
    dureeMin: z.coerce.number().min(1, "La durée min. doit être au moins 1.").max(4, "La durée min. ne peut pas dépasser 4."),
    dureeMax: z.coerce.number().min(1, "La durée max. doit être au moins 1.").max(4, "La durée max. ne peut pas dépasser 4."),
  }),
}).refine(data => data.requis.dureeMax >= data.requis.dureeMin, {
  message: "La durée maximale doit être supérieure ou égale à la durée minimale.",
  path: ["requis", "dureeMax"], 
});

type SubjectFormValues = z.infer<typeof subjectFormSchema>;

interface SubjectFormProps {
  initialData?: Matiere | null;
  etablissements: Etablissement[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function SubjectForm({ initialData, etablissements, onSuccess, onCancel }: SubjectFormProps) {
  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: initialData || {
      nom: "",
      code: "",
      duree: DureeMatiere.UNE_HEURE,
      priorite: 1,
      categorie: CategorieMatiere.AUTRE,
      etablissementId: etablissements.length > 0 ? etablissements[0].id : "",
      couleur: "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
      requis: {
        heuresParSemaine: 1,
        necessiteLabo: false,
        dureeMin: 1,
        dureeMax: 1,
      },
    },
  });

  const { toast } = useToast();
  const actionToCall = initialData ? handleEditSubject : handleAddSubject;
  const [state, formAction, isPending] = useActionState<SubjectActionResponse|undefined, FormData>(actionToCall, undefined);

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

  function onSubmit(data: SubjectFormValues) {
    const formData = new FormData();
    if (initialData?.id) {
      formData.append('id', initialData.id);
    }
    formData.append('nom', data.nom);
    formData.append('code', data.code);
    formData.append('duree', data.duree);
    formData.append('priorite', data.priorite.toString());
    formData.append('categorie', data.categorie);
    formData.append('etablissementId', data.etablissementId);
    if(data.couleur) formData.append('couleur', data.couleur);
    
    formData.append('requis.heuresParSemaine', data.requis.heuresParSemaine.toString());
    formData.append('requis.necessiteLabo', data.requis.necessiteLabo.toString());
    formData.append('requis.dureeMin', data.requis.dureeMin.toString());
    formData.append('requis.dureeMax', data.requis.dureeMax.toString());
    
    startTransition(() => {
      formAction(formData);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
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
          name="nom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de la matière</FormLabel>
              <FormControl>
                <Input placeholder="Mathématiques Générales" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code matière</FormLabel>
              <FormControl>
                <Input placeholder="MATH-GEN" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="duree"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Durée standard de session</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une durée" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(DureeMatiere).map(value => (
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
          name="categorie"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(CategorieMatiere).map(value => (
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
          name="priorite"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priorité (1-5)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="couleur"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Couleur (optionnel)</FormLabel>
              <FormControl>
                <Input type="color" {...field} className="p-1 h-10 w-full block"/>
              </FormControl>
              <FormDescription>Couleur d'affichage pour l'emploi du temps.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2 border p-4 rounded-md">
            <h4 className="font-medium text-md">Exigences Pédagogiques</h4>
            <FormField
              control={form.control}
              name="requis.heuresParSemaine"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heures par semaine</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="4" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="requis.dureeMin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Durée min. session (heures)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="requis.dureeMax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Durée max. session (heures)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="requis.necessiteLabo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Nécessite un laboratoire</FormLabel>
                  </div>
                </FormItem>
              )}
            />
        </div>

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

