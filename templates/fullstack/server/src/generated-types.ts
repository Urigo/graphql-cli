/* tslint:disable */
import { GraphQLResolveInfo } from 'graphql';
import { comment, note } from './generated-db-types';
import { GraphbackRuntimeContext } from '@graphback/runtime';
export type Maybe<T> = T | null;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };

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

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type StitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

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

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (parent: TParent, context: TContext, info: GraphQLResolveInfo) => Maybe<TTypes>;

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
  Query: ResolverTypeWrapper<{}>;
  NoteFilter: NoteFilter;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Note: ResolverTypeWrapper<note>;
  Comment: ResolverTypeWrapper<comment>;
  CommentFilter: CommentFilter;
  Mutation: ResolverTypeWrapper<{}>;
  NoteInput: NoteInput;
  CommentInput: CommentInput;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Query: {};
  NoteFilter: NoteFilter;
  ID: Scalars['ID'];
  String: Scalars['String'];
  Note: note;
  Comment: comment;
  CommentFilter: CommentFilter;
  Mutation: {};
  NoteInput: NoteInput;
  CommentInput: CommentInput;
  Boolean: Scalars['Boolean'];
}>;

export type CommentResolvers<
  ContextType = GraphbackRuntimeContext,
  ParentType extends ResolversParentTypes['Comment'] = ResolversParentTypes['Comment']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  note?: Resolver<ResolversTypes['Note'], ParentType, ContextType>;
}>;

export type MutationResolvers<
  ContextType = GraphbackRuntimeContext,
  ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']
> = ResolversObject<{
  createNote?: Resolver<ResolversTypes['Note'], ParentType, ContextType, RequireFields<MutationCreateNoteArgs, 'input'>>;
  createComment?: Resolver<ResolversTypes['Comment'], ParentType, ContextType, RequireFields<MutationCreateCommentArgs, 'input'>>;
  updateNote?: Resolver<ResolversTypes['Note'], ParentType, ContextType, RequireFields<MutationUpdateNoteArgs, 'id' | 'input'>>;
  updateComment?: Resolver<ResolversTypes['Comment'], ParentType, ContextType, RequireFields<MutationUpdateCommentArgs, 'id' | 'input'>>;
}>;

export type NoteResolvers<
  ContextType = GraphbackRuntimeContext,
  ParentType extends ResolversParentTypes['Note'] = ResolversParentTypes['Note']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  comment?: Resolver<Maybe<Array<ResolversTypes['Comment']>>, ParentType, ContextType>;
}>;

export type QueryResolvers<
  ContextType = GraphbackRuntimeContext,
  ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']
> = ResolversObject<{
  findNotes?: Resolver<Array<ResolversTypes['Note']>, ParentType, ContextType, RequireFields<QueryFindNotesArgs, 'fields'>>;
  findComments?: Resolver<Array<ResolversTypes['Comment']>, ParentType, ContextType, RequireFields<QueryFindCommentsArgs, 'fields'>>;
  findAllNotes?: Resolver<Array<ResolversTypes['Note']>, ParentType, ContextType>;
  findAllComments?: Resolver<Array<ResolversTypes['Comment']>, ParentType, ContextType>;
}>;

export type Resolvers<ContextType = GraphbackRuntimeContext> = ResolversObject<{
  Comment?: CommentResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Note?: NoteResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
}>;

/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = GraphbackRuntimeContext> = Resolvers<ContextType>;
