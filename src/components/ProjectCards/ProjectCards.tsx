import type { ProjectModel } from "./Project.model";
import ProjectCard from "./ProjectCard/ProjectCard";

interface ProjectCardsProps {
  projects: ProjectModel[] | undefined;
  isUserAttendEvent: boolean;
}

export default function ProjectCards({ projects, isUserAttendEvent}: ProjectCardsProps) {
  console.log("projects: ", projects);
  return (
    <div className="mx-auto mt-12 grid w-full gap-5 lg:max-w-none lg:grid-cols-3">
      {projects?.map((project: ProjectModel) => (
        <ProjectCard project={project} key={project.id} isUserAttendEvent={isUserAttendEvent} />
      ))}
    </div>
  );
}
