export interface Project {
    id: string;
    name: string;
    description: string;
    link?: string | null;
    image?: string;
    eventId: string;
    authorId: string;
    createdAt: string;
    updatedAt: string;
    techs: Tech2[];
    author: Author;
    comments: Comment[];
    _count: Count;
    isMember?: boolean;
    isUserPartOfAnyProject?: boolean;
    members?: Member[];
  }
  
  export interface Member {
    id: string;
    name: string;
  }
  
  interface Count {
    likes: number;
  }
  
  interface Author {
    id: string;
    email: string;
    name: string;
  }
  
  export interface Tech2 {
    id: string;
    projectId: string;
    masterTechId: string;
    tech: Tech;
  }
  
  export interface Tech {
    label: string;
    id: string;
    imgUrl: string;
  }
  
  interface Comment {
    id: string;
    comment: string;
    projectId: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    user: User;
  }
  
  interface User {
    id: string;
    name: string;
    image: string;
    title: string;
    techs: Tech2[];
  }

  export interface ImportedProject {
    name: string;
    description: string;
    techs: {
      id: string;
      tech: {
        id: string;
        label: string;
        imgUrl: string;
      };
    }[];
  }

  export interface PastProject {
    id: string;
    name: string;
    description: string;
    techs: {
      id: string;
      tech: {
        id: string;
        label: string;
        imgUrl: string;
      };
    }[];
    event: {
      id: string;
      name: string;
      date: Date;
    };
  }
