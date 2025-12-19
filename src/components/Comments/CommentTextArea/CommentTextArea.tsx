/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @next/next/no-img-element */
import useUserSession from "@/hooks/useUserSession";
import type {
  FieldValues,
  UseFormHandleSubmit,
  UseFormRegister,
} from "react-hook-form";

interface CommentTextAreaProps {
  handleSubmit: UseFormHandleSubmit<FieldValues>;
  register: UseFormRegister<FieldValues>;
  onSubmit: (data: CommentTextAreaValues) => void;
  rows?: number;
  isLoading: boolean;
}

export interface CommentTextAreaValues {
  comment: string;
}

export default function CommentTextArea({
  handleSubmit,
  register,
  onSubmit,
  rows = 3,
  isLoading,
}: CommentTextAreaProps) {
  const user = useUserSession();

  return (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0">
        <img
          className="inline-block h-10 w-10 rounded-full"
          src={user?.image || "/images/blank-avatar.png"}
          alt=""
        />
      </div>
      <div className="min-w-0 flex-1">
        {/* @ts-ignore */}
        <form onSubmit={handleSubmit(onSubmit)} className="relative">
          <div className="overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-gray-600">
            <label htmlFor="comment" className="sr-only">
              Add your comment
            </label>
            <textarea
              rows={rows}
              {...register("comment", { required: true })}
              id="comment"
              className="block w-full resize-none border-0 border-none bg-transparent p-3 text-gray-900 placeholder:text-gray-400 focus:outline-none sm:py-1.5 sm:text-sm sm:leading-6"
              placeholder="Add your comment..."
              defaultValue={""}
            />

            {/* Spacer element to match the height of the toolbar */}
            <div className="py-2" aria-hidden="true">
              {/* Matches height of button in toolbar (1px border + 36px content height) */}
              <div className="py-px">
                <div className="h-9" />
              </div>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 flex justify-end py-2 pl-3 pr-2">
            <div className="flex-shrink-0">
              <button
                disabled={isLoading}
                type="submit"
                className={`
                inline-flex items-center rounded-md  px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600
                ${
                  isLoading
                    ? "cursor-not-allowed bg-gray-300 hover:bg-gray-300"
                    : "bg-gray-600"
                }
                `}
              >
                {isLoading ? "Loading..." : "Post"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
