/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-misused-promises */
import CommentBubble from "@/components/Comments/CommentTextArea/CommentBubble/CommentBubble";
import CommentTextArea from "@/components/Comments/CommentTextArea/CommentTextArea";
import type { CommentTextAreaValues } from "@/components/Comments/CommentTextArea/CommentTextArea";
import PillButton from "@/components/atoms/PillButton/PillButton";
import useUserSession from "@/hooks/useUserSession";
import { api } from "@/utils/api";
import { HandThumbUpIcon } from "@heroicons/react/24/outline";
import { HandThumbUpIcon as HandThumbUpIconSolid } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useState } from "react";
import TechTagRow from "../../TechTagRow/TechTagRow";
import type { ProjectModel } from "../Project.model";
import MemberTagRow from "@/components/atoms/MemberTagRow/MemberTagRow";
import { EditProjectModal } from "@/components/NewProjectModal/NewProjectModal";
import { formatDateForDisplayLong } from "@/helpers/dateFormatters";

interface ProjectCardProps {
  project: ProjectModel;
  isUserAttendEvent: boolean;
}

export default function ProjectCard({ project, isUserAttendEvent }: ProjectCardProps) {
  const utils = api.useContext();
  const user = useUserSession();
  const isUserAttendingEvent: boolean = isUserAttendEvent;
  const { handleSubmit, register, reset } = useForm();
  const { mutateAsync: createComment, isLoading } =
    api.projects.createComment.useMutation({
      onSuccess: async () => {
        await utils.events.findUnique.invalidate({
          id: project.eventId,
        });
      },
    });
  const { mutateAsync: deleteComment } =
  api.projects.deleteComment.useMutation({
      onSuccess: async () => {
        await utils.events.findUnique.invalidate({
          id: project.eventId,
        });
      },
  });
  const { mutateAsync: editComment } =
  api.projects.updateComment.useMutation({
    onSuccess: async () => {
      await utils.events.findUnique.invalidate({
        id: project.eventId,
      });
    },
  });

  const onCommentSubmit = async (data: CommentTextAreaValues) => {
    await createComment({
      comment: data.comment,
      projectId: project.id,
      authorId: user?.id || "",
    });

    reset();
  };

  const onCommentDelete = async (id: string) => {
    await deleteComment({
      id: id,
    });

    reset();
  };

  const onCommentEdit = async (id: string, comment: string) => {
    await editComment({
      id: id,
      comment: comment,
    });

    reset();
  };

  const { mutateAsync } = api.likes.create.useMutation({
    onSuccess: async () => {
      await utils.events.findUnique.invalidate({
        id: project.eventId,
      });
      await utils.likes.findUnique.invalidate({
        projectId: project.id,
      });
    },
  });

  const { data: likeExists } = api.likes.findUnique.useQuery(
    {
      projectId: project?.id,
      userId: user?.id || "",
    },
    {
      enabled: !!user?.id,
    }
  );

  const { mutateAsync: joinProject, isLoading: joinProjectIsLoading } =
    api.projects.joinProject.useMutation({
      onSuccess: async () => {
        await utils.events.findUnique.invalidate({
          id: project.eventId,
        });
      },
    });

  const { mutateAsync: leaveProject, isLoading: leaveProjectIsLoading } =
    api.projects.leaveProject.useMutation({
      onSuccess: async () => {
        await utils.events.findUnique.invalidate({
          id: project.eventId,
        });
      },
    });

  const { mutateAsync: deleteProject, isLoading: deleteProjectIsLoading } =
    api.projects.deleteProject.useMutation({
      onSuccess: async () => {
        await utils.events.findUnique.invalidate({
          id: project.eventId,
        });
      },
    });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { mutateAsync: editProject, isLoading: editProjectIsLoading } =
    api.projects.editProject.useMutation({
      onSuccess: async () => {
        await Promise.all([
          utils.events.findUnique.invalidate({
            id: project.eventId,
          }),
          utils.projects.findUnique.invalidate({
            id: project.eventId,
          }),
        ]);
      },
    });

  const { mutateAsync: deleteAllProjectComments } =
    api.projects.deleteAllProjectComments.useMutation({
      onSuccess: async () => {
        await utils.events.findUnique.invalidate({
          id: project.eventId,
        });
    }
    });

  const handleAttendEvent = async () => {
    console.log("userID: ", user?.role);
    await attendEvent({
      eventId: project.eventId || "",
      userId: user?.id || "",
    });
  };

  const { mutateAsync: attendEvent, isLoading: joinEventIsLoading } =
    api.events.attendEvent.useMutation({
      onSuccess: async () => {
        await utils.events.findUnique.invalidate({
          id: project.eventId,
        });
      },
    });

  const handleJoinProject = async () => {
    await joinProject({
      projectId: project.id,
      userId: user?.id || "",
    });

    // add user to the event if not already not attending
    if (!isUserAttendingEvent) {
      await attendEvent({
        eventId: project.eventId,
        userId: user?.id || "",
      });
    }
  };

  const handleLeaveProject = async () => {
    await leaveProject({
      projectId: project.id,
      userId: user?.id || "",
    });
  };

  const handleDeleteProject = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this project?');

    if (confirmed) {
      try {
        await deleteProject({
          projectId: project.id,
        });
      } catch (error) {
        console.error("Error deleting prject and comments: ", error);
      }
    }
  };

  const handleEditProject = async (name: string, description: string, techs: string[]) => {
    await editProject({
      projectId: project.id,
      name,
      description,
      techs,
    });
    setIsEditModalOpen(false);
  }

  const handleUpvote = async () => {
    await mutateAsync({
      projectId: project.id,
      userId: user?.id || "",
    });
  };

  const handleCancelEdit = async () => {
    await editProject({
      projectId: project.id,
      name: project.name,
      description: project.description,
      techs: project.techs.map(t => t.masterTechId),
    });
    setIsEditModalOpen(false);
  };

  return (
    <>
      <EditProjectModal
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        project={project}
        onEdit={handleEditProject}
        onCancel={handleCancelEdit}
      />
      <div
        key={project.id}
        className="flex w-full flex-col overflow-hidden rounded-lg shadow-lg"
      >
        <div className="flex flex-1 flex-col justify-between bg-white p-6">
          <div className="flex-1">
            <div className="mt-2 block">
              <div className="text-xl font-semibold text-gray-700">
                {project.name}
              </div>
              <div className="py-2">
                <TechTagRow techs={project.techs} />
              </div>
              {user && (
              <div className="py-2 flex items-center justify-between">
                  <PillButton
                    label={
                      joinProjectIsLoading || leaveProjectIsLoading
                        ? "Loading..."
                        : project.isMember
                        ? "Leave Project"
                        : "Join Project"
                    }
                    isMember={project?.isMember}
                    isUserPartOfAnyProject={project.isUserPartOfAnyProject}
                    isLoading={joinProjectIsLoading || leaveProjectIsLoading}
                    handleClick={
                      joinProjectIsLoading || leaveProjectIsLoading
                        ? () => void null
                        : project?.isMember
                        ? handleLeaveProject
                        : handleJoinProject
                    }
                  />
              {(user.id === project.author.id || user.role === "MOD" || user.role === "ADMIN") && (
                    <div className="flex space-x-4">
                      <PillButton
                  label={
                    editProjectIsLoading
                    ? "Loading..."
                    : "Edit"
                  }
                        isMember={project?.isMember}
                        isUserPartOfAnyProject={false}
                        isLoading={editProjectIsLoading}
                        handleClick={() => setIsEditModalOpen(true)}
                      />
                      <PillButton
                  label={
                    deleteProjectIsLoading
                    ? "Loading..."
                    : "Delete" 
                  }
                        isMember={project?.isMember}
                        isUserPartOfAnyProject={false}
                        isLoading={deleteProjectIsLoading}
                        handleClick={handleDeleteProject}
                      />
                    </div>
                  )}
                </div>
              )}
              {project.members && project.members?.length > 0 && (
                <div className="flex flex-row flex-wrap items-center gap-2 text-sm font-light">
                  <span className="font-bold">Members:</span>
                  <MemberTagRow members={project?.members} />
                </div>
              )}
              <div
                className="prose mt-3 text-base leading-none text-gray-500"
                dangerouslySetInnerHTML={{ __html: project.description }}
              />
            </div>
          </div>
          <div className="mt-6 flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-10">
              <div>
                <span className="text-sm font-medium text-gray-900">
                  {project.author.name}
                </span>
                <div className="flex space-x-1 text-sm text-gray-500">
                  <div>
                    {formatDateForDisplayLong(project.createdAt)}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <motion.div
                whileHover={{
                  scale: 1.1,
                }}
                whileTap={{ scale: 0.97 }}
              >
                {user ? (
                  likeExists ? (
                    <HandThumbUpIconSolid
                      onClick={handleUpvote}
                      className="block h-6 w-6 cursor-pointer text-gray-700"
                    />
                  ) : (
                    <HandThumbUpIcon
                      onClick={handleUpvote}
                      className="block h-6 w-6 cursor-pointer text-gray-700"
                    />
                  )
                ) : null}
              </motion.div>
              <div>{project._count?.likes ?? 0} Likes</div>
            </div>
          </div>
          {user && (
            <div className="pt-4">
              <CommentTextArea
                isLoading={isLoading}
                handleSubmit={handleSubmit}
                register={register}
                onSubmit={onCommentSubmit}
                rows={2}
              />
            </div>
          )}
          {project.comments?.map((comment) => (
            <CommentBubble
              isLoading={isLoading}
              onDelete={onCommentDelete}
              onEdit={onCommentEdit}
              key={comment.id}
              image={comment.user?.image}
              username={comment.user.name}
              userIsPoster={comment.user.id == user?.id || false}
              createdAt={comment.createdAt}
              comment={comment.comment}
              commentId={comment.id}
              userTitle={comment.user.title}
              userTechs={comment.user.techs}
            />
          ))}
        </div>
      </div>
    </>
  );
}
