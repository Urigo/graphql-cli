/* tslint:disable */
import gql from 'graphql-tag';
import * as ApolloReactCommon from '@apollo/react-common';
import * as ApolloReactHooks from '@apollo/react-hooks';
export type Maybe<T> = T | null;

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

/**  @model  */
export type Comment = {
  __typename?: 'Comment';
  id: Scalars['ID'];
  text?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  /**  @manyToOne field: 'comments', key: 'noteId'  */
  note?: Maybe<Note>;
};

export type CommentInput = {
  id?: Maybe<Scalars['ID']>;
  text?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  noteId?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createNote: Note;
  updateNote: Note;
  deleteNote: Note;
  createComment: Comment;
  updateComment: Comment;
  deleteComment: Comment;
};

export type MutationCreateNoteArgs = {
  input?: Maybe<NoteInput>;
};

export type MutationUpdateNoteArgs = {
  input?: Maybe<NoteInput>;
};

export type MutationDeleteNoteArgs = {
  input?: Maybe<NoteInput>;
};

export type MutationCreateCommentArgs = {
  input?: Maybe<CommentInput>;
};

export type MutationUpdateCommentArgs = {
  input?: Maybe<CommentInput>;
};

export type MutationDeleteCommentArgs = {
  input?: Maybe<CommentInput>;
};

/**  @model  */
export type Note = {
  __typename?: 'Note';
  id: Scalars['ID'];
  title: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  /** @oneToMany field: 'note', key: 'noteId' */
  comments: Array<Maybe<Comment>>;
};

export type NoteInput = {
  id?: Maybe<Scalars['ID']>;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  findAllNotes: Array<Maybe<Note>>;
  findNotes: Array<Maybe<Note>>;
  findAllComments: Array<Maybe<Comment>>;
  findComments: Array<Maybe<Comment>>;
};

export type QueryFindAllNotesArgs = {
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};

export type QueryFindNotesArgs = {
  fields?: Maybe<NoteInput>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};

export type QueryFindAllCommentsArgs = {
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};

export type QueryFindCommentsArgs = {
  fields?: Maybe<CommentInput>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  newNote: Note;
  updatedNote: Note;
  deletedNote: Note;
  newComment: Comment;
  updatedComment: Comment;
  deletedComment: Comment;
};

export type SubscriptionNewNoteArgs = {
  input?: Maybe<NoteInput>;
};

export type SubscriptionUpdatedNoteArgs = {
  input?: Maybe<NoteInput>;
};

export type SubscriptionDeletedNoteArgs = {
  input?: Maybe<NoteInput>;
};

export type SubscriptionNewCommentArgs = {
  input?: Maybe<CommentInput>;
};

export type SubscriptionUpdatedCommentArgs = {
  input?: Maybe<CommentInput>;
};

export type SubscriptionDeletedCommentArgs = {
  input?: Maybe<CommentInput>;
};

export type CommentFieldsFragment = { __typename?: 'Comment' } & Pick<Comment, 'id' | 'text' | 'description'>;

export type CommentExpandedFieldsFragment = { __typename?: 'Comment' } & Pick<
  Comment,
  'id' | 'text' | 'description'
> & { note: Maybe<{ __typename?: 'Note' } & Pick<Note, 'id' | 'title' | 'description'>> };

export type NoteFieldsFragment = { __typename?: 'Note' } & Pick<Note, 'id' | 'title' | 'description'>;

export type NoteExpandedFieldsFragment = { __typename?: 'Note' } & Pick<Note, 'id' | 'title' | 'description'> & {
    comments: Array<Maybe<{ __typename?: 'Comment' } & Pick<Comment, 'id' | 'text' | 'description'>>>;
  };

export type CreateCommentMutationVariables = {
  input: CommentInput;
};

export type CreateCommentMutation = { __typename?: 'Mutation' } & {
  createComment: { __typename?: 'Comment' } & CommentFieldsFragment;
};

export type CreateNoteMutationVariables = {
  input: NoteInput;
};

export type CreateNoteMutation = { __typename?: 'Mutation' } & {
  createNote: { __typename?: 'Note' } & NoteFieldsFragment;
};

export type DeleteCommentMutationVariables = {
  input: CommentInput;
};

export type DeleteCommentMutation = { __typename?: 'Mutation' } & {
  deleteComment: { __typename?: 'Comment' } & CommentFieldsFragment;
};

export type DeleteNoteMutationVariables = {
  input: NoteInput;
};

export type DeleteNoteMutation = { __typename?: 'Mutation' } & {
  deleteNote: { __typename?: 'Note' } & NoteFieldsFragment;
};

export type UpdateCommentMutationVariables = {
  input: CommentInput;
};

export type UpdateCommentMutation = { __typename?: 'Mutation' } & {
  updateComment: { __typename?: 'Comment' } & CommentFieldsFragment;
};

export type UpdateNoteMutationVariables = {
  input: NoteInput;
};

export type UpdateNoteMutation = { __typename?: 'Mutation' } & {
  updateNote: { __typename?: 'Note' } & NoteFieldsFragment;
};

export type FindAllCommentsQueryVariables = {
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};

export type FindAllCommentsQuery = { __typename?: 'Query' } & {
  findAllComments: Array<Maybe<{ __typename?: 'Comment' } & CommentExpandedFieldsFragment>>;
};

export type FindAllNotesQueryVariables = {
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};

export type FindAllNotesQuery = { __typename?: 'Query' } & {
  findAllNotes: Array<Maybe<{ __typename?: 'Note' } & NoteExpandedFieldsFragment>>;
};

export type FindCommentsQueryVariables = {
  fields: CommentInput;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};

export type FindCommentsQuery = { __typename?: 'Query' } & {
  findComments: Array<Maybe<{ __typename?: 'Comment' } & CommentExpandedFieldsFragment>>;
};

export type FindNotesQueryVariables = {
  fields: NoteInput;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};

export type FindNotesQuery = { __typename?: 'Query' } & {
  findNotes: Array<Maybe<{ __typename?: 'Note' } & NoteExpandedFieldsFragment>>;
};

export type DeletedCommentSubscriptionVariables = {};

export type DeletedCommentSubscription = { __typename?: 'Subscription' } & {
  deletedComment: { __typename?: 'Comment' } & CommentFieldsFragment;
};

export type DeletedNoteSubscriptionVariables = {};

export type DeletedNoteSubscription = { __typename?: 'Subscription' } & {
  deletedNote: { __typename?: 'Note' } & NoteFieldsFragment;
};

export type NewCommentSubscriptionVariables = {};

export type NewCommentSubscription = { __typename?: 'Subscription' } & {
  newComment: { __typename?: 'Comment' } & CommentFieldsFragment;
};

export type NewNoteSubscriptionVariables = {};

export type NewNoteSubscription = { __typename?: 'Subscription' } & {
  newNote: { __typename?: 'Note' } & NoteFieldsFragment;
};

export type UpdatedCommentSubscriptionVariables = {};

export type UpdatedCommentSubscription = { __typename?: 'Subscription' } & {
  updatedComment: { __typename?: 'Comment' } & CommentFieldsFragment;
};

export type UpdatedNoteSubscriptionVariables = {};

export type UpdatedNoteSubscription = { __typename?: 'Subscription' } & {
  updatedNote: { __typename?: 'Note' } & NoteFieldsFragment;
};

export const CommentFieldsFragmentDoc = gql`
  fragment CommentFields on Comment {
    id
    text
    description
  }
`;
export const CommentExpandedFieldsFragmentDoc = gql`
  fragment CommentExpandedFields on Comment {
    id
    text
    description
    note {
      id
      title
      description
    }
  }
`;
export const NoteFieldsFragmentDoc = gql`
  fragment NoteFields on Note {
    id
    title
    description
  }
`;
export const NoteExpandedFieldsFragmentDoc = gql`
  fragment NoteExpandedFields on Note {
    id
    title
    description
    comments {
      id
      text
      description
    }
  }
`;
export const CreateCommentDocument = gql`
  mutation createComment($input: CommentInput!) {
    createComment(input: $input) {
      ...CommentFields
    }
  }
  ${CommentFieldsFragmentDoc}
`;
export type CreateCommentMutationFn = ApolloReactCommon.MutationFunction<
  CreateCommentMutation,
  CreateCommentMutationVariables
>;

/**
 * __useCreateCommentMutation__
 *
 * To run a mutation, you first call `useCreateCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCommentMutation, { data, loading, error }] = useCreateCommentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateCommentMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<CreateCommentMutation, CreateCommentMutationVariables>
) {
  return ApolloReactHooks.useMutation<CreateCommentMutation, CreateCommentMutationVariables>(
    CreateCommentDocument,
    baseOptions
  );
}
export type CreateCommentMutationHookResult = ReturnType<typeof useCreateCommentMutation>;
export type CreateCommentMutationResult = ApolloReactCommon.MutationResult<CreateCommentMutation>;
export type CreateCommentMutationOptions = ApolloReactCommon.BaseMutationOptions<
  CreateCommentMutation,
  CreateCommentMutationVariables
>;
export const CreateNoteDocument = gql`
  mutation createNote($input: NoteInput!) {
    createNote(input: $input) {
      ...NoteFields
    }
  }
  ${NoteFieldsFragmentDoc}
`;
export type CreateNoteMutationFn = ApolloReactCommon.MutationFunction<CreateNoteMutation, CreateNoteMutationVariables>;

/**
 * __useCreateNoteMutation__
 *
 * To run a mutation, you first call `useCreateNoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateNoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createNoteMutation, { data, loading, error }] = useCreateNoteMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateNoteMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<CreateNoteMutation, CreateNoteMutationVariables>
) {
  return ApolloReactHooks.useMutation<CreateNoteMutation, CreateNoteMutationVariables>(CreateNoteDocument, baseOptions);
}
export type CreateNoteMutationHookResult = ReturnType<typeof useCreateNoteMutation>;
export type CreateNoteMutationResult = ApolloReactCommon.MutationResult<CreateNoteMutation>;
export type CreateNoteMutationOptions = ApolloReactCommon.BaseMutationOptions<
  CreateNoteMutation,
  CreateNoteMutationVariables
>;
export const DeleteCommentDocument = gql`
  mutation deleteComment($input: CommentInput!) {
    deleteComment(input: $input) {
      ...CommentFields
    }
  }
  ${CommentFieldsFragmentDoc}
`;
export type DeleteCommentMutationFn = ApolloReactCommon.MutationFunction<
  DeleteCommentMutation,
  DeleteCommentMutationVariables
>;

/**
 * __useDeleteCommentMutation__
 *
 * To run a mutation, you first call `useDeleteCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCommentMutation, { data, loading, error }] = useDeleteCommentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteCommentMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteCommentMutation, DeleteCommentMutationVariables>
) {
  return ApolloReactHooks.useMutation<DeleteCommentMutation, DeleteCommentMutationVariables>(
    DeleteCommentDocument,
    baseOptions
  );
}
export type DeleteCommentMutationHookResult = ReturnType<typeof useDeleteCommentMutation>;
export type DeleteCommentMutationResult = ApolloReactCommon.MutationResult<DeleteCommentMutation>;
export type DeleteCommentMutationOptions = ApolloReactCommon.BaseMutationOptions<
  DeleteCommentMutation,
  DeleteCommentMutationVariables
>;
export const DeleteNoteDocument = gql`
  mutation deleteNote($input: NoteInput!) {
    deleteNote(input: $input) {
      ...NoteFields
    }
  }
  ${NoteFieldsFragmentDoc}
`;
export type DeleteNoteMutationFn = ApolloReactCommon.MutationFunction<DeleteNoteMutation, DeleteNoteMutationVariables>;

/**
 * __useDeleteNoteMutation__
 *
 * To run a mutation, you first call `useDeleteNoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteNoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteNoteMutation, { data, loading, error }] = useDeleteNoteMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteNoteMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteNoteMutation, DeleteNoteMutationVariables>
) {
  return ApolloReactHooks.useMutation<DeleteNoteMutation, DeleteNoteMutationVariables>(DeleteNoteDocument, baseOptions);
}
export type DeleteNoteMutationHookResult = ReturnType<typeof useDeleteNoteMutation>;
export type DeleteNoteMutationResult = ApolloReactCommon.MutationResult<DeleteNoteMutation>;
export type DeleteNoteMutationOptions = ApolloReactCommon.BaseMutationOptions<
  DeleteNoteMutation,
  DeleteNoteMutationVariables
>;
export const UpdateCommentDocument = gql`
  mutation updateComment($input: CommentInput!) {
    updateComment(input: $input) {
      ...CommentFields
    }
  }
  ${CommentFieldsFragmentDoc}
`;
export type UpdateCommentMutationFn = ApolloReactCommon.MutationFunction<
  UpdateCommentMutation,
  UpdateCommentMutationVariables
>;

/**
 * __useUpdateCommentMutation__
 *
 * To run a mutation, you first call `useUpdateCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCommentMutation, { data, loading, error }] = useUpdateCommentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCommentMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateCommentMutation, UpdateCommentMutationVariables>
) {
  return ApolloReactHooks.useMutation<UpdateCommentMutation, UpdateCommentMutationVariables>(
    UpdateCommentDocument,
    baseOptions
  );
}
export type UpdateCommentMutationHookResult = ReturnType<typeof useUpdateCommentMutation>;
export type UpdateCommentMutationResult = ApolloReactCommon.MutationResult<UpdateCommentMutation>;
export type UpdateCommentMutationOptions = ApolloReactCommon.BaseMutationOptions<
  UpdateCommentMutation,
  UpdateCommentMutationVariables
>;
export const UpdateNoteDocument = gql`
  mutation updateNote($input: NoteInput!) {
    updateNote(input: $input) {
      ...NoteFields
    }
  }
  ${NoteFieldsFragmentDoc}
`;
export type UpdateNoteMutationFn = ApolloReactCommon.MutationFunction<UpdateNoteMutation, UpdateNoteMutationVariables>;

/**
 * __useUpdateNoteMutation__
 *
 * To run a mutation, you first call `useUpdateNoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateNoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateNoteMutation, { data, loading, error }] = useUpdateNoteMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateNoteMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateNoteMutation, UpdateNoteMutationVariables>
) {
  return ApolloReactHooks.useMutation<UpdateNoteMutation, UpdateNoteMutationVariables>(UpdateNoteDocument, baseOptions);
}
export type UpdateNoteMutationHookResult = ReturnType<typeof useUpdateNoteMutation>;
export type UpdateNoteMutationResult = ApolloReactCommon.MutationResult<UpdateNoteMutation>;
export type UpdateNoteMutationOptions = ApolloReactCommon.BaseMutationOptions<
  UpdateNoteMutation,
  UpdateNoteMutationVariables
>;
export const FindAllCommentsDocument = gql`
  query findAllComments($limit: Int, $offset: Int) {
    findAllComments(limit: $limit, offset: $offset) {
      ...CommentExpandedFields
    }
  }
  ${CommentExpandedFieldsFragmentDoc}
`;

/**
 * __useFindAllCommentsQuery__
 *
 * To run a query within a React component, call `useFindAllCommentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindAllCommentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindAllCommentsQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useFindAllCommentsQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<FindAllCommentsQuery, FindAllCommentsQueryVariables>
) {
  return ApolloReactHooks.useQuery<FindAllCommentsQuery, FindAllCommentsQueryVariables>(
    FindAllCommentsDocument,
    baseOptions
  );
}
export function useFindAllCommentsLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<FindAllCommentsQuery, FindAllCommentsQueryVariables>
) {
  return ApolloReactHooks.useLazyQuery<FindAllCommentsQuery, FindAllCommentsQueryVariables>(
    FindAllCommentsDocument,
    baseOptions
  );
}
export type FindAllCommentsQueryHookResult = ReturnType<typeof useFindAllCommentsQuery>;
export type FindAllCommentsLazyQueryHookResult = ReturnType<typeof useFindAllCommentsLazyQuery>;
export type FindAllCommentsQueryResult = ApolloReactCommon.QueryResult<
  FindAllCommentsQuery,
  FindAllCommentsQueryVariables
>;
export const FindAllNotesDocument = gql`
  query findAllNotes($limit: Int, $offset: Int) {
    findAllNotes(limit: $limit, offset: $offset) {
      ...NoteExpandedFields
    }
  }
  ${NoteExpandedFieldsFragmentDoc}
`;

/**
 * __useFindAllNotesQuery__
 *
 * To run a query within a React component, call `useFindAllNotesQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindAllNotesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindAllNotesQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useFindAllNotesQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<FindAllNotesQuery, FindAllNotesQueryVariables>
) {
  return ApolloReactHooks.useQuery<FindAllNotesQuery, FindAllNotesQueryVariables>(FindAllNotesDocument, baseOptions);
}
export function useFindAllNotesLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<FindAllNotesQuery, FindAllNotesQueryVariables>
) {
  return ApolloReactHooks.useLazyQuery<FindAllNotesQuery, FindAllNotesQueryVariables>(
    FindAllNotesDocument,
    baseOptions
  );
}
export type FindAllNotesQueryHookResult = ReturnType<typeof useFindAllNotesQuery>;
export type FindAllNotesLazyQueryHookResult = ReturnType<typeof useFindAllNotesLazyQuery>;
export type FindAllNotesQueryResult = ApolloReactCommon.QueryResult<FindAllNotesQuery, FindAllNotesQueryVariables>;
export const FindCommentsDocument = gql`
  query findComments($fields: CommentInput!, $limit: Int, $offset: Int) {
    findComments(fields: $fields, limit: $limit, offset: $offset) {
      ...CommentExpandedFields
    }
  }
  ${CommentExpandedFieldsFragmentDoc}
`;

/**
 * __useFindCommentsQuery__
 *
 * To run a query within a React component, call `useFindCommentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindCommentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindCommentsQuery({
 *   variables: {
 *      fields: // value for 'fields'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useFindCommentsQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<FindCommentsQuery, FindCommentsQueryVariables>
) {
  return ApolloReactHooks.useQuery<FindCommentsQuery, FindCommentsQueryVariables>(FindCommentsDocument, baseOptions);
}
export function useFindCommentsLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<FindCommentsQuery, FindCommentsQueryVariables>
) {
  return ApolloReactHooks.useLazyQuery<FindCommentsQuery, FindCommentsQueryVariables>(
    FindCommentsDocument,
    baseOptions
  );
}
export type FindCommentsQueryHookResult = ReturnType<typeof useFindCommentsQuery>;
export type FindCommentsLazyQueryHookResult = ReturnType<typeof useFindCommentsLazyQuery>;
export type FindCommentsQueryResult = ApolloReactCommon.QueryResult<FindCommentsQuery, FindCommentsQueryVariables>;
export const FindNotesDocument = gql`
  query findNotes($fields: NoteInput!, $limit: Int, $offset: Int) {
    findNotes(fields: $fields, limit: $limit, offset: $offset) {
      ...NoteExpandedFields
    }
  }
  ${NoteExpandedFieldsFragmentDoc}
`;

/**
 * __useFindNotesQuery__
 *
 * To run a query within a React component, call `useFindNotesQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindNotesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindNotesQuery({
 *   variables: {
 *      fields: // value for 'fields'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useFindNotesQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<FindNotesQuery, FindNotesQueryVariables>
) {
  return ApolloReactHooks.useQuery<FindNotesQuery, FindNotesQueryVariables>(FindNotesDocument, baseOptions);
}
export function useFindNotesLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<FindNotesQuery, FindNotesQueryVariables>
) {
  return ApolloReactHooks.useLazyQuery<FindNotesQuery, FindNotesQueryVariables>(FindNotesDocument, baseOptions);
}
export type FindNotesQueryHookResult = ReturnType<typeof useFindNotesQuery>;
export type FindNotesLazyQueryHookResult = ReturnType<typeof useFindNotesLazyQuery>;
export type FindNotesQueryResult = ApolloReactCommon.QueryResult<FindNotesQuery, FindNotesQueryVariables>;
export const DeletedCommentDocument = gql`
  subscription deletedComment {
    deletedComment {
      ...CommentFields
    }
  }
  ${CommentFieldsFragmentDoc}
`;

/**
 * __useDeletedCommentSubscription__
 *
 * To run a query within a React component, call `useDeletedCommentSubscription` and pass it any options that fit your needs.
 * When your component renders, `useDeletedCommentSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDeletedCommentSubscription({
 *   variables: {
 *   },
 * });
 */
export function useDeletedCommentSubscription(
  baseOptions?: ApolloReactHooks.SubscriptionHookOptions<
    DeletedCommentSubscription,
    DeletedCommentSubscriptionVariables
  >
) {
  return ApolloReactHooks.useSubscription<DeletedCommentSubscription, DeletedCommentSubscriptionVariables>(
    DeletedCommentDocument,
    baseOptions
  );
}
export type DeletedCommentSubscriptionHookResult = ReturnType<typeof useDeletedCommentSubscription>;
export type DeletedCommentSubscriptionResult = ApolloReactCommon.SubscriptionResult<DeletedCommentSubscription>;
export const DeletedNoteDocument = gql`
  subscription deletedNote {
    deletedNote {
      ...NoteFields
    }
  }
  ${NoteFieldsFragmentDoc}
`;

/**
 * __useDeletedNoteSubscription__
 *
 * To run a query within a React component, call `useDeletedNoteSubscription` and pass it any options that fit your needs.
 * When your component renders, `useDeletedNoteSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDeletedNoteSubscription({
 *   variables: {
 *   },
 * });
 */
export function useDeletedNoteSubscription(
  baseOptions?: ApolloReactHooks.SubscriptionHookOptions<DeletedNoteSubscription, DeletedNoteSubscriptionVariables>
) {
  return ApolloReactHooks.useSubscription<DeletedNoteSubscription, DeletedNoteSubscriptionVariables>(
    DeletedNoteDocument,
    baseOptions
  );
}
export type DeletedNoteSubscriptionHookResult = ReturnType<typeof useDeletedNoteSubscription>;
export type DeletedNoteSubscriptionResult = ApolloReactCommon.SubscriptionResult<DeletedNoteSubscription>;
export const NewCommentDocument = gql`
  subscription newComment {
    newComment {
      ...CommentFields
    }
  }
  ${CommentFieldsFragmentDoc}
`;

/**
 * __useNewCommentSubscription__
 *
 * To run a query within a React component, call `useNewCommentSubscription` and pass it any options that fit your needs.
 * When your component renders, `useNewCommentSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNewCommentSubscription({
 *   variables: {
 *   },
 * });
 */
export function useNewCommentSubscription(
  baseOptions?: ApolloReactHooks.SubscriptionHookOptions<NewCommentSubscription, NewCommentSubscriptionVariables>
) {
  return ApolloReactHooks.useSubscription<NewCommentSubscription, NewCommentSubscriptionVariables>(
    NewCommentDocument,
    baseOptions
  );
}
export type NewCommentSubscriptionHookResult = ReturnType<typeof useNewCommentSubscription>;
export type NewCommentSubscriptionResult = ApolloReactCommon.SubscriptionResult<NewCommentSubscription>;
export const NewNoteDocument = gql`
  subscription newNote {
    newNote {
      ...NoteFields
    }
  }
  ${NoteFieldsFragmentDoc}
`;

/**
 * __useNewNoteSubscription__
 *
 * To run a query within a React component, call `useNewNoteSubscription` and pass it any options that fit your needs.
 * When your component renders, `useNewNoteSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNewNoteSubscription({
 *   variables: {
 *   },
 * });
 */
export function useNewNoteSubscription(
  baseOptions?: ApolloReactHooks.SubscriptionHookOptions<NewNoteSubscription, NewNoteSubscriptionVariables>
) {
  return ApolloReactHooks.useSubscription<NewNoteSubscription, NewNoteSubscriptionVariables>(
    NewNoteDocument,
    baseOptions
  );
}
export type NewNoteSubscriptionHookResult = ReturnType<typeof useNewNoteSubscription>;
export type NewNoteSubscriptionResult = ApolloReactCommon.SubscriptionResult<NewNoteSubscription>;
export const UpdatedCommentDocument = gql`
  subscription updatedComment {
    updatedComment {
      ...CommentFields
    }
  }
  ${CommentFieldsFragmentDoc}
`;

/**
 * __useUpdatedCommentSubscription__
 *
 * To run a query within a React component, call `useUpdatedCommentSubscription` and pass it any options that fit your needs.
 * When your component renders, `useUpdatedCommentSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUpdatedCommentSubscription({
 *   variables: {
 *   },
 * });
 */
export function useUpdatedCommentSubscription(
  baseOptions?: ApolloReactHooks.SubscriptionHookOptions<
    UpdatedCommentSubscription,
    UpdatedCommentSubscriptionVariables
  >
) {
  return ApolloReactHooks.useSubscription<UpdatedCommentSubscription, UpdatedCommentSubscriptionVariables>(
    UpdatedCommentDocument,
    baseOptions
  );
}
export type UpdatedCommentSubscriptionHookResult = ReturnType<typeof useUpdatedCommentSubscription>;
export type UpdatedCommentSubscriptionResult = ApolloReactCommon.SubscriptionResult<UpdatedCommentSubscription>;
export const UpdatedNoteDocument = gql`
  subscription updatedNote {
    updatedNote {
      ...NoteFields
    }
  }
  ${NoteFieldsFragmentDoc}
`;

/**
 * __useUpdatedNoteSubscription__
 *
 * To run a query within a React component, call `useUpdatedNoteSubscription` and pass it any options that fit your needs.
 * When your component renders, `useUpdatedNoteSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUpdatedNoteSubscription({
 *   variables: {
 *   },
 * });
 */
export function useUpdatedNoteSubscription(
  baseOptions?: ApolloReactHooks.SubscriptionHookOptions<UpdatedNoteSubscription, UpdatedNoteSubscriptionVariables>
) {
  return ApolloReactHooks.useSubscription<UpdatedNoteSubscription, UpdatedNoteSubscriptionVariables>(
    UpdatedNoteDocument,
    baseOptions
  );
}
export type UpdatedNoteSubscriptionHookResult = ReturnType<typeof useUpdatedNoteSubscription>;
export type UpdatedNoteSubscriptionResult = ApolloReactCommon.SubscriptionResult<UpdatedNoteSubscription>;
