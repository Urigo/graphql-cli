import React, { useState } from 'react';
import './App.css';
import { useCreateNoteMutation, useFindAllNotesQuery } from './generated-types';

const App: React.FC = () => {
  const allNotes = useFindAllNotesQuery();
  allNotes.startPolling(2000);
  const [createNote] = useCreateNoteMutation();
  const [newNoteTitle, setNewNoteTitle] = useState();
  const [newNoteDescription, setNewNoteDescription] = useState();
  return (
    <div>
      <fieldset>
        <legend>Create New Note</legend>
        <form onSubmit={e => {
          e.preventDefault();
          createNote({ variables: { title: newNoteTitle, description: newNoteDescription } });
        }}>
          <p>
            <label htmlFor="title">Title: </label>
            <input
              name="title"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)} />
          </p>
          <p>
            <label htmlFor="description">Description: </label>
            <input
              name="description"
              value={newNoteDescription}
              onChange={(e) => setNewNoteDescription(e.target.value)} />
          </p>
          <input type='submit' />
        </form>
      </fieldset>
      <ul>
        {
          allNotes.data && allNotes.data.findAllNotes.map((note) => (
            <li>
              <strong>{note.title}</strong>:&nbsp;
              {note.description}
            </li>
          ))
        }
      </ul>
    </div>
  );
}

export default App;
