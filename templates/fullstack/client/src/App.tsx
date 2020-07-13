import React from 'react';
import './App.css';
import { useFindNotesQuery } from './generated-types';
import CreateNote from './components/notes/CreateNote';
import OneNote from './components/notes/OneNote';

const App: React.FC = () => {
  const allNotes = useFindNotesQuery();
  allNotes.startPolling(2000);
  console.log(allNotes.data?.findNotes);

  return (
    <div>
      <CreateNote></CreateNote>
      <ul>
        {
          // TODO fix typings
          allNotes.data &&
            allNotes.data.findNotes.items.map((note: any) => (
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
