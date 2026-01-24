/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-misused-promises */
import StyledCircleLoader from "@/components/StyledCircleLoader/StyledCircleLoader";
import UserCard from "@/components/User/UserCard";
import UserForm from "@/components/UserForm/UserForm";
import UserTechsModal from "@/components/UserTechsModal/UserTechsModal";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import { useState } from "react";
import type { TechOutput } from "@/server/api/routers/schema/tech.schema";

export interface ProfileEditProps {
  title: string;
  github: string;
  twitter: string;
  linkedin: string;
  website: string;
}

export default function UserDetail() {
  const router = useRouter();
  const utils = api.useContext();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTechs, setSelectedTechs] = useState<TechOutput[]>([]);

  const techs = api.techs.getAll.useQuery();
  const { mutateAsync: updateUser } = api.users.update.useMutation({
    onSuccess: async () => {
      await utils.users.getById.invalidate({
        id: router.query.id as string,
      });
    },
  });

  const {
    data: userData,
    isLoading,
    isError,
  } = api.users.getById.useQuery(
    {
      id: router.query?.id as string,
    },
    {
      enabled: !!router.query.id,
    }
  );

  const onSubmit = async (data: ProfileEditProps) => {
    await updateUser({
      id: router.query.id as string,
      title: data.title,
      github: data.github,
      twitter: data.twitter,
      linkedin: data.linkedin,
      website: data.website,
      techs: selectedTechs.map((tech: TechOutput) => tech.id),
    });
  };

  if (isLoading || techs.isLoading)
    return <StyledCircleLoader isLoading={isLoading} />;
  if (isError || techs.isError) return <div>Error!!</div>;

  return (
    <div className="flex flex-col items-center justify-center pt-10">
      <UserCard userData={userData} />

      <div className="w-96 space-y-6 pt-8 sm:space-y-5 sm:pt-10">
        <UserForm user={userData} onSubmit={onSubmit} setIsOpen={setIsOpen} />
        <UserTechsModal
          userId={userData?.id}
          ogTechs={userData?.techs}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          data={techs?.data}
          selectedTechs={selectedTechs}
          setSelectedTechs={setSelectedTechs}
        />
      </div>
    </div>
  );
}
