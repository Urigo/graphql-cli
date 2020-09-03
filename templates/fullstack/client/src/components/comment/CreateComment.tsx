import React, { useState } from 'react';
import { useCreateCommentMutation } from '../../generated-types';
import { Card, TextField, Button } from '@material-ui/core';
import './../notes/Note.css';

type createCommentProps = {
  noteId: string;
  addCommentState: any;
};

const CreateComment = ({ noteId, addCommentState }: createCommentProps) => {
  const [createComment] = useCreateCommentMutation();
  const [newCommentTitle, setNewCommentTitle] = useState('');
  const [newCommentDescription, setNewCommentDescription] = useState('');

  return (
    <div>
      <Card className="inputCard">
        <form noValidate autoComplete="off" className="inputForm">
          <h3>Create Comment</h3>
          <TextField
            label="Title"
            variant="outlined"
            onChange={(e) => setNewCommentTitle(e.target.value)}
            value={newCommentTitle}
          />
          <TextField
            label="Description"
            variant="outlined"
            onChange={(e) => setNewCommentDescription(e.target.value)}
            value={newCommentDescription}
          />
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              createComment({
                variables: { input: { text: newCommentTitle, description: newCommentDescription, noteId: noteId } },
              });
              addCommentState(false);
            }}
          >
            Add Comment
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CreateComment;
