import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAddTicketMutation } from "@/redux/api/support/apiSlice";
import { ETicketType } from "@/types/ETicketType";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const ticketSchema = z.object({
  title: z.string().min(1, "Title is required"),
  context: z.string().min(1, "Context is required"),
  type: z.nativeEnum(ETicketType),
});

export default function AddTicketForm({
  closeModal,
}: {
  closeModal: () => void;
}) {
  const [addTicket] = useAddTicketMutation();

  const form = useForm<z.infer<typeof ticketSchema>>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: "",
      context: "",
      type: ETicketType.Question,
    },
  });

  const onSubmit = (data: z.infer<typeof ticketSchema>) => {
    const addTicketPromise = addTicket(data).unwrap();

    closeModal();

    toast.promise(addTicketPromise, {
      loading: "Adding ticket...",
      success: "Ticket added successfully",
      error: "Failed to add ticket",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mb-2 space-y-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter the title" {...field} />
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
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(Number(value));
                  }}
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ticket type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">Question</SelectItem>
                    <SelectItem value="1">Problem</SelectItem>
                    <SelectItem value="2">Incident</SelectItem>
                    <SelectItem value="3">Feature Request</SelectItem>
                    <SelectItem value="4">Technical Support</SelectItem>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="context"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Context</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Please provide us with as much context as possible"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
          <Button type="submit">Add</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
