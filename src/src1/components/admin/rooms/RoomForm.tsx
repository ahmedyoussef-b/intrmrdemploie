
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
import type { Salle, Etablissement } from "@/types";
import { TypeSalle, OptionEquipementSalle } from "@/types";
import { handleAddRoom, type RoomActionResponse } from "@/actions/roomActions";
import { useActionState, useEffect, startTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const roomFormSchema = z.object({
  id: z.string().optional(),
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  type: z.nativeEnum(TypeSalle, { errorMap: () => ({ message: "Veuillez sélectionner un type de salle."}) }),
  capacite: z.coerce.number().min(1, "La capacité doit être d'au moins 1.").max(500, "La capacité ne peut excéder 500."),
  etablissementId: z.string().min(1, "Veuillez sélectionner un établissement."),
  equipements: z.array(z.nativeEnum(OptionEquipementSalle)).optional(),
});

type RoomFormValues = z.infer<typeof roomFormSchema>;

interface RoomFormProps {
  initialData?: Salle | null;
  etablissements: Etablissement[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function RoomForm({ initialData, etablissements, onSuccess, onCancel }: RoomFormProps) {
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: initialData || {
      nom: "",
      type: undefined,
      capacite: 30,
      etablissementId: etablissements.length > 0 ? etablissements[0].id : "",
      equipements: [],
    },
  });

  const { toast } = useToast();
  const actionToCall = handleAddRoom; // Placeholder for edit
  const [state, formAction, isPending] = useActionState<RoomActionResponse | undefined, FormData>(actionToCall, undefined);

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

  function onSubmit(data: RoomFormValues) {
    const formData = new FormData();
    if (initialData?.id) {
      formData.append('id', initialData.id);
    }
    formData.append('nom', data.nom);
    formData.append('type', data.type);
    formData.append('capacite', data.capacite.toString());
    formData.append('etablissementId', data.etablissementId);
    data.equipements?.forEach(eq => formData.append('equipements', eq));
    
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
              <FormLabel>Nom de la salle</FormLabel>
              <FormControl>
                <Input placeholder="Salle 101" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type de Salle</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(TypeSalle).map(value => (
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
          name="equipements"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Équipements</FormLabel>
                <FormDescription>
                  Sélectionnez les équipements disponibles dans la salle.
                </FormDescription>
              </div>
              <ScrollArea className="h-40 rounded-md border p-4">
                <div className="grid grid-cols-2 gap-4">
                {Object.values(OptionEquipementSalle).map((item) => (
                  <FormField
                    key={item}
                    control={form.control}
                    name="equipements"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), item])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal capitalize">
                            {item.toLowerCase().replace(/_/g, " ")}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
                </div>
              </ScrollArea>
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
