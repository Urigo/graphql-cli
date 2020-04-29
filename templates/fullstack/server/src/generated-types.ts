/* tslint:disable */
import { GraphQLResolveInfo } from 'graphql';
import { comment, note } from './generated-db-types';
import { GraphbackRuntimeContext } from '@graphback/runtime';
export type Maybe<T> = T | null;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } &
  { [P in K]-?: NonNullable<T[P]> };

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
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

/**  @model  */
export type Note = {
  __typename?: 'Note';
  id: Scalars['ID'];
  title: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  /** @oneToMany field: 'note', key: 'noteId' */
  comments: Array<Maybe<Comment>>;
};

/**  @model  */
export type Comment = {
  __typename?: 'Comment';
  id: Scalars['ID'];
  text?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  /** @manyToOne field: 'comments', key: 'noteId' */
  note?: Maybe<Note>;
};

export type NoteInput = {
  id?: Maybe<Scalars['ID']>;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type CommentInput = {
  id?: Maybe<Scalars['ID']>;
  text?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  noteId?: Maybe<Scalars['ID']>;
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

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type StitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type isTypeOfResolverFn<T = {}> = (obj: T, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  String: ResolverTypeWrapper<Scalars['String']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Query: ResolverTypeWrapper<{}>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Note: ResolverTypeWrapper<note>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Comment: ResolverTypeWrapper<comment>;
  NoteInput: NoteInput;
  CommentInput: CommentInput;
  Mutation: ResolverTypeWrapper<{}>;
  Subscription: ResolverTypeWrapper<{}>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  String: Scalars['String'];
  Boolean: Scalars['Boolean'];
  Query: {};
  Int: Scalars['Int'];
  Note: note;
  ID: Scalars['ID'];
  Comment: comment;
  NoteInput: NoteInput;
  CommentInput: CommentInput;
  Mutation: {};
  Subscription: {};
}>;

export type QueryResolvers<
  ContextType = GraphbackRuntimeContext,
  ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']
> = ResolversObject<{
  findAllNotes?: Resolver<
    Array<Maybe<ResolversTypes['Note']>>,
    ParentType,
    ContextType,
    RequireFields<QueryFindAllNotesArgs, never>
  >;
  findNotes?: Resolver<
    Array<Maybe<ResolversTypes['Note']>>,
    ParentType,
    ContextType,
    RequireFields<QueryFindNotesArgs, never>
  >;
  findAllComments?: Resolver<
    Array<Maybe<ResolversTypes['Comment']>>,
    ParentType,
    ContextType,
    RequireFields<QueryFindAllCommentsArgs, never>
  >;
  findComments?: Resolver<
    Array<Maybe<ResolversTypes['Comment']>>,
    ParentType,
    ContextType,
    RequireFields<QueryFindCommentsArgs, never>
  >;
}>;

export type NoteResolvers<
  ContextType = GraphbackRuntimeContext,
  ParentType extends ResolversParentTypes['Note'] = ResolversParentTypes['Note']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  comments?: Resolver<Array<Maybe<ResolversTypes['Comment']>>, ParentType, ContextType>;
  __isTypeOf?: isTypeOfResolverFn<ParentType>;
}>;

export type CommentResolvers<
  ContextType = GraphbackRuntimeContext,
  ParentType extends ResolversParentTypes['Comment'] = ResolversParentTypes['Comment']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  text?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  note?: Resolver<Maybe<ResolversTypes['Note']>, ParentType, ContextType>;
  __isTypeOf?: isTypeOfResolverFn<ParentType>;
}>;

export type MutationResolvers<
  ContextType = GraphbackRuntimeContext,
  ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']
> = ResolversObject<{
  createNote?: Resolver<ResolversTypes['Note'], ParentType, ContextType, RequireFields<MutationCreateNoteArgs, never>>;
  updateNote?: Resolver<ResolversTypes['Note'], ParentType, ContextType, RequireFields<MutationUpdateNoteArgs, never>>;
  deleteNote?: Resolver<ResolversTypes['Note'], ParentType, ContextType, RequireFields<MutationDeleteNoteArgs, never>>;
  createComment?: Resolver<
    ResolversTypes['Comment'],
    ParentType,
    ContextType,
    RequireFields<MutationCreateCommentArgs, never>
  >;
  updateComment?: Resolver<
    ResolversTypes['Comment'],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateCommentArgs, never>
  >;
  deleteComment?: Resolver<
    ResolversTypes['Comment'],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteCommentArgs, never>
  >;
}>;

export type SubscriptionResolvers<
  ContextType = GraphbackRuntimeContext,
  ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']
> = ResolversObject<{
  newNote?: SubscriptionResolver<
    ResolversTypes['Note'],
    'newNote',
    ParentType,
    ContextType,
    RequireFields<SubscriptionNewNoteArgs, never>
  >;
  updatedNote?: SubscriptionResolver<
    ResolversTypes['Note'],
    'updatedNote',
    ParentType,
    ContextType,
    RequireFields<SubscriptionUpdatedNoteArgs, never>
  >;
  deletedNote?: SubscriptionResolver<
    ResolversTypes['Note'],
    'deletedNote',
    ParentType,
    ContextType,
    RequireFields<SubscriptionDeletedNoteArgs, never>
  >;
  newComment?: SubscriptionResolver<
    ResolversTypes['Comment'],
    'newComment',
    ParentType,
    ContextType,
    RequireFields<SubscriptionNewCommentArgs, never>
  >;
  updatedComment?: SubscriptionResolver<
    ResolversTypes['Comment'],
    'updatedComment',
    ParentType,
    ContextType,
    RequireFields<SubscriptionUpdatedCommentArgs, never>
  >;
  deletedComment?: SubscriptionResolver<
    ResolversTypes['Comment'],
    'deletedComment',
    ParentType,
    ContextType,
    RequireFields<SubscriptionDeletedCommentArgs, never>
  >;
}>;

export type Resolvers<ContextType = GraphbackRuntimeContext> = ResolversObject<{
  Query?: QueryResolvers<ContextType>;
  Note?: NoteResolvers<ContextType>;
  Comment?: CommentResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
}>;

/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = GraphbackRuntimeContext> = Resolvers<ContextType>;
