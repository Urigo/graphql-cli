import React from 'react';
import './App.css';
import { useFindAllNotesQuery } from './generated-types';
import CreateNote from './components/notes/CreateNote';
import OneNote from './components/notes/OneNote';

const App: React.FC = () => {
  const allNotes = useFindAllNotesQuery();
  allNotes.startPolling(2000);
  console.log(allNotes.data?.findAllNotes);

  return (
    <div>
      <CreateNote></CreateNote>
      <ul>
        {
          // TODO fix typings
          allNotes.data &&
            allNotes.data.findAllNotes.map((note: any) => (
              <OneNote
                key={note.id}
                id={note.id}
                title={note.title}
                description={note.description}
                comments={note.comments}
              ></OneNote>
            ))
        }
      </ul>
    </div>
  );
};

export default App;
