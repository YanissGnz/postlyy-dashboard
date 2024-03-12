"use client";

import BottomButtons from "@/components/bottom-buttons";
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
import { useAddNoteMutation } from "@/redux/api/notes/apiSlice";
import { ROUTES } from "@/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
const Editor = dynamic(() => import("@/components/ui/editor"), {
  ssr: false,
});

const formSchema = z.object({
  name: z.string().min(2),
  content: z.string(),
});

export default function CreateNotePage() {
  const [addNote, { isLoading }] = useAddNoteMutation();

  const { push } = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      content: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const data = new FormData();

    data.append("Name", values.name);
    data.append("Content", values.content);

    addNote(data)
      .unwrap()
      .then(() => {
        toast.success("Note created successfully");
        push(ROUTES.notes.root);
      })
      .catch(() => {
        toast.error("Error creating note");
      });
  }

  return (
    <div className="space-y-2 px-4 py-4 md:px-8">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Create Note</h2>
      </div>
      <div className="flex flex-col space-y-4 lg:flex-row lg:space-x-12 lg:space-y-0">
        <div className="flex-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Editor
                        onChange={(content) => {
                          const e = {
                            target: {
                              name: "Content",
                              value: content,
                            },
                          };
                          field.onChange(e);
                          // form.setValue("Content", content)
                        }}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <BottomButtons>
                <Button type="submit" disabled={isLoading} loading={isLoading}>
                  Add note
                </Button>
              </BottomButtons>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
