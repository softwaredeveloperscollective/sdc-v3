/* eslint-disable @next/next/no-img-element */
import { format } from "date-fns";
import React from "react";
import { Popover } from "antd";
import type { Tech2 } from "@/components/ProjectCards/Project.model";
import UserCardSimple from "@/components/User/UserCardSimple";
import { useState } from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

interface CommentBubbleProps {
  image: string;
  username: string;
  userIsPoster: boolean;
  createdAt: string;
  comment: string;
  commentId: string;
  userTitle: string;
  userTechs: Tech2[];
  onDelete: (id: string) => void;
  onEdit: (id:string, comment: string) => void;
  isLoading: boolean;
}



export interface CommentBubbleValues {
  commentId: string;
}


export default function CommentBubble({
  image,
  username,
  userIsPoster,
  createdAt,
  comment,
  commentId,
  userTechs,
  userTitle,
  onDelete,
  onEdit,
  isLoading
}: CommentBubbleProps) {

    
  const handleDeleteClick = () => {
    const confirmed = window.confirm('Are you sure you want to delete this comment?');
    if (confirmed)
      onDelete(commentId);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  }


  const cancelClick = () => {
    setIsEditing(false);
  };

  const updateClick = () => {
    setIsEditing(false);
    onEdit(commentId, comment_text);
  }

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text_area = event.target.value;
    setCommentText(text_area);
  }

  const handleHoverOn = () => {
    setHovering(true);
  }

  const handleHoverOff = () => {
    setHovering(false);
  }

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [comment_text, setCommentText] = useState<string>(comment);
  const [hovering, setHovering] = useState<boolean>(false);

  return (
    <div className="flex w-full flex-row items-start gap-4 pt-6">
      <Popover
        content={
          <UserCardSimple
            image={image}
            userTechs={userTechs}
            username={username}
            userTitle={userTitle}
          />
        }
      >
        <div className="flex-shrink-0">
          <img
            className="inline-block h-10 w-10 rounded-full"
            src={image || "/images/blank-avatar.png"}
            alt=""
          />
        </div>
      </Popover>
      <div className="w-full rounded-lg bg-gray-50 p-3" onMouseEnter={handleHoverOn} onMouseLeave={handleHoverOff}>
        <div className="flex flex-row items-center justify-between gap-3">
          <div className="text-lg font-semibold">{username}</div>
          <div className="font-base text-sm">
            {format(new Date(createdAt), "HH:mm MMMM dd, yyyy")}
          </div>
          {
            (userIsPoster && hovering) &&
            <div style={{display: 'inline-flex'}}>
              <PencilSquareIcon 
                className="block h-6 w-6 cursor-pointer text-gray-700" 
                onClick={handleEditClick}
              />  
              &nbsp; &nbsp; &nbsp; 
              <TrashIcon
                className="block h-6 w-6 cursor-pointer text-gray-700"
                onClick={handleDeleteClick}
              />
            </div>
          }
        </div>
        <div className="pt-2 text-base font-light">
          { !isEditing &&
            <div id={commentId}>{comment}</div>
            }
          { isEditing && 
            <div>
                <textarea style={{width: "100%"}} onChange={handleTextChange}>
                  {comment}
                </textarea>
                <br></br>
                <button 
                onClick={cancelClick}
                disabled={isLoading}
                className={`
                inline-flex items-center rounded-md  px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600
                ${
                  isLoading
                    ? "cursor-not-allowed bg-gray-300 hover:bg-gray-300"
                    : "bg-gray-600"
                }
                `}
              >Cancel</button>
              &nbsp; 
                <button 
                disabled={isLoading}
                className={`
                inline-flex items-center rounded-md  px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600
                ${
                  isLoading
                    ? "cursor-not-allowed bg-gray-300 hover:bg-gray-300"
                    : "bg-gray-600"
                }
                `}
                onClick={updateClick}
              >Update</button>
            </div>
          }
        </div>
      </div>
    </div>
  );
}
