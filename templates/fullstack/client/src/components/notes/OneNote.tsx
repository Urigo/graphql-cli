import React, { useState } from 'react';
import EditNote from './EditNote';
import { Note } from '../../generated-types';
import CreateComment from '../comment/CreateComment';
import OneComment from '../comment/OneComment';
import { Button, Card } from '@material-ui/core';

const OneNote = ({ id, title, description, comments }: Note) => {
  const [noteEdit, setNoteEdit] = useState(false);
  const [addComment, setAddComment] = useState(false);

  return (
    <div>
      <Card className="inputCard">
        <li className="OneNote">
          <strong>{title}</strong>:&nbsp;
          {description}
          <Button onClick={() => setNoteEdit(!noteEdit)} variant="outlined" color="primary">
            Edit
          </Button>
          <Button onClick={() => setAddComment(!addComment)} variant="outlined" color="primary">
            Add Comment
          </Button>
          {noteEdit ? (
            <EditNote id={id} title={title} description={description || ''} editState={setNoteEdit}></EditNote>
          ) : (
            <div></div>
          )}
          {addComment ? <CreateComment noteId={id} addCommentState={setAddComment}></CreateComment> : <div></div>}
          <ul>
            {comments && comments.length > 0 ? (
              comments.map((com) => {
                if (!com) {
                  return;
                }
                return <OneComment id={com.id} text={com.text} description={com.description} key={com.id}></OneComment>;
              })
            ) : (
              <div></div>
            )}
          </ul>
        </li>
      </Card>
    </div>
  );
};

export default OneNote;
