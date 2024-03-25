import { Spinner } from "@/components/ui/Spinner";
import Image from "next/image";

export default function loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center ">
      <Image src="/icons/logo.png" alt="logo" width={100} height={100} />
      <Spinner />
    </div>
  );
}
