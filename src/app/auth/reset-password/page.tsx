import ResetPasswordForm from "./form";

export default function ResetPassword() {
  return (
    <div className="grid h-screen w-screen grid-cols-12 items-center overflow-hidden">
      <div className="absolute -left-10 -top-10 -z-10 h-fit w-fit opacity-60 blur-2xl">
        <svg
          viewBox="0 0 200 180"
          height={250}
          width={250}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#1DA1F2"
            d="M31.7,-57.9C39,-50.7,41.2,-37.9,49.3,-27.3C57.4,-16.7,71.4,-8.4,77.5,3.5C83.6,15.4,81.8,30.8,75.2,44C68.5,57.1,57,68,43.7,76C30.4,84.1,15.2,89.3,0.9,87.7C-13.4,86.2,-26.8,78,-35.7,67.3C-44.5,56.7,-48.8,43.6,-57.2,32C-65.7,20.4,-78.3,10.2,-82.7,-2.5C-87,-15.2,-83.1,-30.5,-72.2,-37.9C-61.3,-45.2,-43.4,-44.8,-30.2,-48.5C-17,-52.2,-8.5,-60.1,1.9,-63.3C12.2,-66.5,24.5,-65.1,31.7,-57.9Z"
            transform="translate(100 60)"
          />
        </svg>
      </div>

      <div className="col-span-12 flex h-full w-full items-center justify-center px-2 py-10 md:col-span-6">
        <div className="flex w-full max-w-xl flex-col px-8 py-10 sm:px-16 md:px-16 lg:px-20">
          <h6 className="mb-4 text-center text-4xl font-bold">
            Reset your password
          </h6>
          <ResetPasswordForm />
        </div>
      </div>
      <div className="hidden h-full md:col-span-6 md:block">
        <div className="h-full bg-[url(/images/login-image.png)] bg-cover bg-no-repeat shadow-xl"></div>
      </div>
    </div>
  );
}
