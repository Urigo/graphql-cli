import React from 'react';
import { useDeleteCommentMutation, Comment } from '../../generated-types';
import { Button } from '@material-ui/core';
import './Comment.css';

const OneComment = ({ id, text, description }: Comment) => {
  const [deleteComment] = useDeleteCommentMutation();

  return (
    <div>
      <li className="comment">
        <strong>{text}</strong>:&nbsp;
        {description}
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => deleteComment({ variables: { input: { id: id } } })}
        >
          Delete Comment
        </Button>
      </li>
    </div>
  );
};

export default OneComment;
