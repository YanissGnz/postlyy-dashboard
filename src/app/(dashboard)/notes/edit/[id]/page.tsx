"use client";

import dynamic from "next/dynamic";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
const Editor = dynamic(() => import("@/components/ui/editor"), {
  ssr: false,
});
import { type OutputData } from "@editorjs/editorjs";
import { Spinner } from "@/components/ui/Spinner";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/routes";
import {
  useEditNoteMutation,
  useGetNoteQuery,
} from "@/redux/api/notes/apiSlice";

const formSchema = z.object({
  name: z.string().min(2),
  content: z.string(),
});

export default function EditNotePage({ params }: { params: { id: string } }) {
  const { push } = useRouter();

  const [editNote, { isLoading }] = useEditNoteMutation();

  const { data: note, isLoading: isLoadingNote } = useGetNoteQuery(params.id);

  const defaultValues = useMemo(() => {
    if (note) {
      return {
        name: note.data.name,
        content: JSON.parse(note.data.content) as string,
      };
    }
    return {
      name: "",
      content: "",
    };
  }, [note, isLoadingNote]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData();

    formData.append("name", values.name);
    formData.append("content", JSON.stringify(values.content));

    editNote({
      id: params.id,
      note: formData,
    })
      .unwrap()
      .then(() => {
        push(ROUTES.notes.root);
        toast.success("Note updated successfully");
      })
      .catch(() => {
        toast.error("Error updating note");
      });
  }

  useEffect(() => {
    if (note) {
      form.reset(defaultValues);
    }
  }, [note, isLoadingNote]);

  return (
    <div className="space-y-2 px-4 py-4 md:px-8">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Edit Note</h2>
      </div>
      <div className="flex flex-col space-y-4 lg:flex-row lg:space-x-12 lg:space-y-0">
        <div className="flex-1">
          {isLoading || defaultValues.content === "" ? (
            <div className="flex h-56 items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {" "}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the name" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>content</FormLabel>
                      <FormControl>
                        <Editor
                          onChange={(content) => {
                            const e = {
                              target: {
                                name: "content",
                                value: content,
                              },
                            };
                            field.onChange(e);
                          }}
                          defaultData={
                            defaultValues.content !== ""
                              ? (JSON.parse(
                                  defaultValues.content,
                                ) as OutputData)
                              : undefined
                          }
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} loading={isLoading}>
                  Update
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
