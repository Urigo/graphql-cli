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

export type Comment = {
  __typename?: 'Comment';
  id: Scalars['ID'];
  title: Scalars['String'];
  description: Scalars['String'];
  note: Note;
};

export type CommentFilter = {
  id?: Maybe<Scalars['ID']>;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  noteId?: Maybe<Scalars['ID']>;
};

export type CommentInput = {
  title: Scalars['String'];
  description: Scalars['String'];
  noteId: Scalars['ID'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createNote: Note;
  createComment: Comment;
  updateNote: Note;
  updateComment: Comment;
};

export type MutationCreateNoteArgs = {
  input: NoteInput;
};

export type MutationCreateCommentArgs = {
  input: CommentInput;
};

export type MutationUpdateNoteArgs = {
  id: Scalars['ID'];
  input: NoteInput;
};

export type MutationUpdateCommentArgs = {
  id: Scalars['ID'];
  input: CommentInput;
};

export type Note = {
  __typename?: 'Note';
  id: Scalars['ID'];
  title: Scalars['String'];
  description: Scalars['String'];
  comment?: Maybe<Array<Comment>>;
};

export type NoteFilter = {
  id?: Maybe<Scalars['ID']>;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type NoteInput = {
  title: Scalars['String'];
  description: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  findNotes: Array<Note>;
  findComments: Array<Comment>;
  findAllNotes: Array<Note>;
  findAllComments: Array<Comment>;
};

export type QueryFindNotesArgs = {
  fields: NoteFilter;
};

export type QueryFindCommentsArgs = {
  fields: CommentFilter;
};

export type CommentFieldsFragment = { __typename?: 'Comment' } & Pick<Comment, 'id' | 'title' | 'description'>;

export type NoteFieldsFragment = { __typename?: 'Note' } & Pick<Note, 'id' | 'title' | 'description'>;

export type FindAllCommentsQueryVariables = {};

export type FindAllCommentsQuery = { __typename?: 'Query' } & { findAllComments: Array<{ __typename?: 'Comment' } & CommentFieldsFragment> };

export type FindAllNotesQueryVariables = {};

export type FindAllNotesQuery = { __typename?: 'Query' } & { findAllNotes: Array<{ __typename?: 'Note' } & NoteFieldsFragment> };

export type FindCommentsQueryVariables = {
  id: Scalars['ID'];
  title: Scalars['String'];
  description: Scalars['String'];
};

export type FindCommentsQuery = { __typename?: 'Query' } & { findComments: Array<{ __typename?: 'Comment' } & CommentFieldsFragment> };

export type FindNotesQueryVariables = {
  id: Scalars['ID'];
  title: Scalars['String'];
  description: Scalars['String'];
};

export type FindNotesQuery = { __typename?: 'Query' } & { findNotes: Array<{ __typename?: 'Note' } & NoteFieldsFragment> };

export type CreateCommentMutationVariables = {
  title: Scalars['String'];
  description: Scalars['String'];
};

export type CreateCommentMutation = { __typename?: 'Mutation' } & { createComment: { __typename?: 'Comment' } & CommentFieldsFragment };

export type CreateNoteMutationVariables = {
  title: Scalars['String'];
  description: Scalars['String'];
};

export type CreateNoteMutation = { __typename?: 'Mutation' } & { createNote: { __typename?: 'Note' } & NoteFieldsFragment };

export type UpdateCommentMutationVariables = {
  id: Scalars['ID'];
  title: Scalars['String'];
  description: Scalars['String'];
};

export type UpdateCommentMutation = { __typename?: 'Mutation' } & { updateComment: { __typename?: 'Comment' } & CommentFieldsFragment };

export type UpdateNoteMutationVariables = {
  id: Scalars['ID'];
  title: Scalars['String'];
  description: Scalars['String'];
};

export type UpdateNoteMutation = { __typename?: 'Mutation' } & { updateNote: { __typename?: 'Note' } & NoteFieldsFragment };

export const CommentFieldsFragmentDoc = gql`
  fragment CommentFields on Comment {
    id
    title
    description
  }
`;
export const NoteFieldsFragmentDoc = gql`
  fragment NoteFields on Note {
    id
    title
    description
  }
`;
export const FindAllCommentsDocument = gql`
  query findAllComments {
    findAllComments {
      ...CommentFields
    }
  }
  ${CommentFieldsFragmentDoc}
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
 *   },
 * });
 */
export function useFindAllCommentsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<FindAllCommentsQuery, FindAllCommentsQueryVariables>) {
  return ApolloReactHooks.useQuery<FindAllCommentsQuery, FindAllCommentsQueryVariables>(FindAllCommentsDocument, baseOptions);
}
export function useFindAllCommentsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<FindAllCommentsQuery, FindAllCommentsQueryVariables>) {
  return ApolloReactHooks.useLazyQuery<FindAllCommentsQuery, FindAllCommentsQueryVariables>(FindAllCommentsDocument, baseOptions);
}
export type FindAllCommentsQueryHookResult = ReturnType<typeof useFindAllCommentsQuery>;
export type FindAllCommentsLazyQueryHookResult = ReturnType<typeof useFindAllCommentsLazyQuery>;
export type FindAllCommentsQueryResult = ApolloReactCommon.QueryResult<FindAllCommentsQuery, FindAllCommentsQueryVariables>;
export const FindAllNotesDocument = gql`
  query findAllNotes {
    findAllNotes {
      ...NoteFields
    }
  }
  ${NoteFieldsFragmentDoc}
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
 *   },
 * });
 */
export function useFindAllNotesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<FindAllNotesQuery, FindAllNotesQueryVariables>) {
  return ApolloReactHooks.useQuery<FindAllNotesQuery, FindAllNotesQueryVariables>(FindAllNotesDocument, baseOptions);
}
export function useFindAllNotesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<FindAllNotesQuery, FindAllNotesQueryVariables>) {
  return ApolloReactHooks.useLazyQuery<FindAllNotesQuery, FindAllNotesQueryVariables>(FindAllNotesDocument, baseOptions);
}
export type FindAllNotesQueryHookResult = ReturnType<typeof useFindAllNotesQuery>;
export type FindAllNotesLazyQueryHookResult = ReturnType<typeof useFindAllNotesLazyQuery>;
export type FindAllNotesQueryResult = ApolloReactCommon.QueryResult<FindAllNotesQuery, FindAllNotesQueryVariables>;
export const FindCommentsDocument = gql`
  query findComments($id: ID!, $title: String!, $description: String!) {
    findComments(fields: { id: $id, title: $title, description: $description }) {
      ...CommentFields
    }
  }
  ${CommentFieldsFragmentDoc}
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
 *      id: // value for 'id'
 *      title: // value for 'title'
 *      description: // value for 'description'
 *   },
 * });
 */
export function useFindCommentsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<FindCommentsQuery, FindCommentsQueryVariables>) {
  return ApolloReactHooks.useQuery<FindCommentsQuery, FindCommentsQueryVariables>(FindCommentsDocument, baseOptions);
}
export function useFindCommentsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<FindCommentsQuery, FindCommentsQueryVariables>) {
  return ApolloReactHooks.useLazyQuery<FindCommentsQuery, FindCommentsQueryVariables>(FindCommentsDocument, baseOptions);
}
export type FindCommentsQueryHookResult = ReturnType<typeof useFindCommentsQuery>;
export type FindCommentsLazyQueryHookResult = ReturnType<typeof useFindCommentsLazyQuery>;
export type FindCommentsQueryResult = ApolloReactCommon.QueryResult<FindCommentsQuery, FindCommentsQueryVariables>;
export const FindNotesDocument = gql`
  query findNotes($id: ID!, $title: String!, $description: String!) {
    findNotes(fields: { id: $id, title: $title, description: $description }) {
      ...NoteFields
    }
  }
  ${NoteFieldsFragmentDoc}
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
 *      id: // value for 'id'
 *      title: // value for 'title'
 *      description: // value for 'description'
 *   },
 * });
 */
export function useFindNotesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<FindNotesQuery, FindNotesQueryVariables>) {
  return ApolloReactHooks.useQuery<FindNotesQuery, FindNotesQueryVariables>(FindNotesDocument, baseOptions);
}
export function useFindNotesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<FindNotesQuery, FindNotesQueryVariables>) {
  return ApolloReactHooks.useLazyQuery<FindNotesQuery, FindNotesQueryVariables>(FindNotesDocument, baseOptions);
}
export type FindNotesQueryHookResult = ReturnType<typeof useFindNotesQuery>;
export type FindNotesLazyQueryHookResult = ReturnType<typeof useFindNotesLazyQuery>;
export type FindNotesQueryResult = ApolloReactCommon.QueryResult<FindNotesQuery, FindNotesQueryVariables>;
export const CreateCommentDocument = gql`
  mutation createComment($title: String!, $description: String!) {
    createComment(input: { title: $title, description: $description }) {
      ...CommentFields
    }
  }
  ${CommentFieldsFragmentDoc}
`;
export type CreateCommentMutationFn = ApolloReactCommon.MutationFunction<CreateCommentMutation, CreateCommentMutationVariables>;

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
 *      title: // value for 'title'
 *      description: // value for 'description'
 *   },
 * });
 */
export function useCreateCommentMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateCommentMutation, CreateCommentMutationVariables>) {
  return ApolloReactHooks.useMutation<CreateCommentMutation, CreateCommentMutationVariables>(CreateCommentDocument, baseOptions);
}
export type CreateCommentMutationHookResult = ReturnType<typeof useCreateCommentMutation>;
export type CreateCommentMutationResult = ApolloReactCommon.MutationResult<CreateCommentMutation>;
export type CreateCommentMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateCommentMutation, CreateCommentMutationVariables>;
export const CreateNoteDocument = gql`
  mutation createNote($title: String!, $description: String!) {
    createNote(input: { title: $title, description: $description }) {
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
 *      title: // value for 'title'
 *      description: // value for 'description'
 *   },
 * });
 */
export function useCreateNoteMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateNoteMutation, CreateNoteMutationVariables>) {
  return ApolloReactHooks.useMutation<CreateNoteMutation, CreateNoteMutationVariables>(CreateNoteDocument, baseOptions);
}
export type CreateNoteMutationHookResult = ReturnType<typeof useCreateNoteMutation>;
export type CreateNoteMutationResult = ApolloReactCommon.MutationResult<CreateNoteMutation>;
export type CreateNoteMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateNoteMutation, CreateNoteMutationVariables>;
export const UpdateCommentDocument = gql`
  mutation updateComment($id: ID!, $title: String!, $description: String!) {
    updateComment(id: $id, input: { title: $title, description: $description }) {
      ...CommentFields
    }
  }
  ${CommentFieldsFragmentDoc}
`;
export type UpdateCommentMutationFn = ApolloReactCommon.MutationFunction<UpdateCommentMutation, UpdateCommentMutationVariables>;

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
 *      id: // value for 'id'
 *      title: // value for 'title'
 *      description: // value for 'description'
 *   },
 * });
 */
export function useUpdateCommentMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateCommentMutation, UpdateCommentMutationVariables>) {
  return ApolloReactHooks.useMutation<UpdateCommentMutation, UpdateCommentMutationVariables>(UpdateCommentDocument, baseOptions);
}
export type UpdateCommentMutationHookResult = ReturnType<typeof useUpdateCommentMutation>;
export type UpdateCommentMutationResult = ApolloReactCommon.MutationResult<UpdateCommentMutation>;
export type UpdateCommentMutationOptions = ApolloReactCommon.BaseMutationOptions<UpdateCommentMutation, UpdateCommentMutationVariables>;
export const UpdateNoteDocument = gql`
  mutation updateNote($id: ID!, $title: String!, $description: String!) {
    updateNote(id: $id, input: { title: $title, description: $description }) {
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
 *      id: // value for 'id'
 *      title: // value for 'title'
 *      description: // value for 'description'
 *   },
 * });
 */
export function useUpdateNoteMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateNoteMutation, UpdateNoteMutationVariables>) {
  return ApolloReactHooks.useMutation<UpdateNoteMutation, UpdateNoteMutationVariables>(UpdateNoteDocument, baseOptions);
}
export type UpdateNoteMutationHookResult = ReturnType<typeof useUpdateNoteMutation>;
export type UpdateNoteMutationResult = ApolloReactCommon.MutationResult<UpdateNoteMutation>;
export type UpdateNoteMutationOptions = ApolloReactCommon.BaseMutationOptions<UpdateNoteMutation, UpdateNoteMutationVariables>;
