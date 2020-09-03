import React, { useState } from 'react';
import { useCreateNoteMutation } from '../../generated-types';
import { Button, TextField, Card } from '@material-ui/core';
import './Note.css';

const CreateNote: React.FC = () => {
  const [createNote] = useCreateNoteMutation();
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteDescription, setNewNoteDescription] = useState('');

  return (
    <div>
      <Card className="inputCard">
        <form noValidate autoComplete="off" className="inputForm">
          <h3>Create Note</h3>
          <p>This application works only with sample Node/Comment model</p>
          <TextField
            label="Title"
            variant="outlined"
            onChange={(e) => setNewNoteTitle(e.target.value)}
            value={newNoteTitle}
          />
          <TextField
            label="Description"
            variant="outlined"
            onChange={(e) => setNewNoteDescription(e.target.value)}
            value={newNoteDescription}
          />
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              createNote({ variables: { input: { title: newNoteTitle, description: newNoteDescription } } });
            }}
          >
            Add Note
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CreateNote;
