import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/icon";
import { useChangeDashboardConfigMutation } from "@/redux/api/user/dashboard/apiSlice";
import { useAppSelector } from "@/redux/hooks";
import { useCallback } from "react";
import { toast } from "sonner";

type Props = {
  handleToggleEditLayout: () => void;
  isEdit: boolean;
};

export default function EditLayoutButton({
  handleToggleEditLayout,
  isEdit,
}: Props) {
  const { layout } = useAppSelector((state) => state.dashboard);
  const [changeConfig] = useChangeDashboardConfigMutation();
  const handleEditLayout = useCallback(async () => {
    if (isEdit) {
      const promise = changeConfig(layout).unwrap();
      toast.promise(promise, {
        loading: "Saving layout...",
        success: "New layout saved",
        error: "Something went wrong",
      });
    }
    handleToggleEditLayout();
  }, [handleToggleEditLayout, layout, isEdit]);

  return (
    <Button variant="outline" onClick={handleEditLayout}>
      <Iconify
        icon={
          isEdit
            ? "solar:check-circle-bold-duotone"
            : "solar:ruler-cross-pen-bold-duotone"
        }
        className="mr-2 h-5 w-5"
      />
      {isEdit ? "Done" : "Edit"}
    </Button>
  );
}
