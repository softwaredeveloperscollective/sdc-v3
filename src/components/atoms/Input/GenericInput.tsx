import type { InputHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface GenericInputProps extends InputHTMLAttributes<HTMLInputElement> {
  register: UseFormRegisterReturn;
}

export default function GenericInput({ register, ...rest }: GenericInputProps) {
  return (
    <input
      {...register}
      className="block w-full max-w-lg rounded-md border-0 p-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-600 sm:max-w-xs sm:text-sm sm:leading-6"
      {...rest}
    />
  );
}
