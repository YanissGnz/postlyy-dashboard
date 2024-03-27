import { Spinner } from "@/components/ui/Spinner";
import Image from "next/image";

export default function loading() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <Image
        src="/icons/logo-transparent.png"
        alt="logo"
        width={100}
        height={100}
      />
      <Spinner />
    </div>
  );
}
