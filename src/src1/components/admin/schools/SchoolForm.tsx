
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
import type { Etablissement } from "@/types";
import { handleAddSchool, handleEditSchool, type SchoolActionResponse } from "@/actions/schoolActions";
import { useActionState, useEffect, startTransition } from "react"; // Added startTransition
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const schoolFormSchema = z.object({
  id: z.string().optional(),
  nom: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  adresse: z.string().min(5, {
    message: "L'adresse doit contenir au moins 5 caractères.",
  }),
  telephone: z.string().regex(/^\+?[0-9\s-()]*$/, {
    message: "Format de téléphone invalide.",
  }).min(8, {message: "Le téléphone doit avoir au moins 8 chiffres."}),
  email: z.string().email({
    message: "Veuillez entrer une adresse e-mail valide.",
  }),
});

type SchoolFormValues = z.infer<typeof schoolFormSchema>;

interface SchoolFormProps {
  initialData?: Etablissement | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SchoolForm({ initialData, onSuccess, onCancel }: SchoolFormProps) {
  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolFormSchema),
    defaultValues: initialData || {
      nom: "",
      adresse: "",
      telephone: "",
      email: "",
    },
  });

  const { toast } = useToast();
  
  const actionToCall = initialData ? handleEditSchool : handleAddSchool;
  const [state, formAction, isPending] = useActionState<SchoolActionResponse|undefined, FormData>(actionToCall, undefined);

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

  function onSubmit(data: SchoolFormValues) {
    const formData = new FormData();
    if (initialData?.id) {
      formData.append('id', initialData.id);
    }
    formData.append('nom', data.nom);
    formData.append('adresse', data.adresse);
    formData.append('telephone', data.telephone);
    formData.append('email', data.email);
    
    startTransition(() => {
      formAction(formData);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de l'établissement</FormLabel>
              <FormControl>
                <Input placeholder="Collège Les Lilas" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="adresse"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Input placeholder="123 Rue Principale, Ville" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="telephone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone</FormLabel>
              <FormControl>
                <Input placeholder="01 23 45 67 89" {...field} />
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
              <FormLabel>Email de contact</FormLabel>
              <FormControl>
                <Input placeholder="contact@etablissement.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
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
