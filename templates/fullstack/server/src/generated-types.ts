/* tslint:disable */
import { GraphQLResolveInfo } from 'graphql';
import { comment, note } from './generated-db-types';
import { GraphbackRuntimeContext } from '@graphback/runtime';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };

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
  /** @manyToOne(field: 'comments', key: 'noteId') */
  note?: Maybe<Note>;
};

export type CommentFilter = {
  id?: Maybe<IdInput>;
  text?: Maybe<StringInput>;
  description?: Maybe<StringInput>;
  noteId?: Maybe<IdInput>;
  and?: Maybe<Array<CommentFilter>>;
  or?: Maybe<Array<CommentFilter>>;
  not?: Maybe<CommentFilter>;
};

export type CommentResultList = {
  __typename?: 'CommentResultList';
  items: Array<Maybe<Comment>>;
  offset?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
  count?: Maybe<Scalars['Int']>;
};

export type CommentSubscriptionFilter = {
  id?: Maybe<Scalars['ID']>;
  text?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type CreateCommentInput = {
  id?: Maybe<Scalars['ID']>;
  text?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  noteId?: Maybe<Scalars['ID']>;
};

export type CreateNoteInput = {
  id?: Maybe<Scalars['ID']>;
  title: Scalars['String'];
  description?: Maybe<Scalars['String']>;
};

export type IdInput = {
  ne?: Maybe<Scalars['ID']>;
  eq?: Maybe<Scalars['ID']>;
  le?: Maybe<Scalars['ID']>;
  lt?: Maybe<Scalars['ID']>;
  ge?: Maybe<Scalars['ID']>;
  gt?: Maybe<Scalars['ID']>;
  in?: Maybe<Array<Scalars['ID']>>;
};

export type MutateCommentInput = {
  id: Scalars['ID'];
  text?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  noteId?: Maybe<Scalars['ID']>;
};

export type MutateNoteInput = {
  id: Scalars['ID'];
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createNote?: Maybe<Note>;
  updateNote?: Maybe<Note>;
  deleteNote?: Maybe<Note>;
  createComment?: Maybe<Comment>;
  updateComment?: Maybe<Comment>;
  deleteComment?: Maybe<Comment>;
};


export type MutationCreateNoteArgs = {
  input: CreateNoteInput;
};


export type MutationUpdateNoteArgs = {
  input: MutateNoteInput;
};


export type MutationDeleteNoteArgs = {
  input: MutateNoteInput;
};


export type MutationCreateCommentArgs = {
  input: CreateCommentInput;
};


export type MutationUpdateCommentArgs = {
  input: MutateCommentInput;
};


export type MutationDeleteCommentArgs = {
  input: MutateCommentInput;
};

/**  @model  */
export type Note = {
  __typename?: 'Note';
  id: Scalars['ID'];
  title: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  /** @oneToMany(field: 'note', key: 'noteId') */
  comments: Array<Maybe<Comment>>;
};


/**  @model  */
export type NoteCommentsArgs = {
  filter?: Maybe<CommentFilter>;
};

export type NoteFilter = {
  id?: Maybe<IdInput>;
  title?: Maybe<StringInput>;
  description?: Maybe<StringInput>;
  and?: Maybe<Array<NoteFilter>>;
  or?: Maybe<Array<NoteFilter>>;
  not?: Maybe<NoteFilter>;
};

export type NoteResultList = {
  __typename?: 'NoteResultList';
  items: Array<Maybe<Note>>;
  offset?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
  count?: Maybe<Scalars['Int']>;
};

export type NoteSubscriptionFilter = {
  id?: Maybe<Scalars['ID']>;
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type OrderByInput = {
  field: Scalars['String'];
  order?: Maybe<SortDirectionEnum>;
};

export type PageRequest = {
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};

export type Query = {
  __typename?: 'Query';
  getNote?: Maybe<Note>;
  findNotes: NoteResultList;
  getComment?: Maybe<Comment>;
  findComments: CommentResultList;
};


export type QueryGetNoteArgs = {
  id: Scalars['ID'];
};


export type QueryFindNotesArgs = {
  filter?: Maybe<NoteFilter>;
  page?: Maybe<PageRequest>;
  orderBy?: Maybe<OrderByInput>;
};


export type QueryGetCommentArgs = {
  id: Scalars['ID'];
};


export type QueryFindCommentsArgs = {
  filter?: Maybe<CommentFilter>;
  page?: Maybe<PageRequest>;
  orderBy?: Maybe<OrderByInput>;
};

export enum SortDirectionEnum {
  Desc = 'DESC',
  Asc = 'ASC'
}

export type StringInput = {
  ne?: Maybe<Scalars['String']>;
  eq?: Maybe<Scalars['String']>;
  le?: Maybe<Scalars['String']>;
  lt?: Maybe<Scalars['String']>;
  ge?: Maybe<Scalars['String']>;
  gt?: Maybe<Scalars['String']>;
  in?: Maybe<Array<Scalars['String']>>;
  contains?: Maybe<Scalars['String']>;
  startsWith?: Maybe<Scalars['String']>;
  endsWith?: Maybe<Scalars['String']>;
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
  filter?: Maybe<NoteSubscriptionFilter>;
};


export type SubscriptionUpdatedNoteArgs = {
  filter?: Maybe<NoteSubscriptionFilter>;
};


export type SubscriptionDeletedNoteArgs = {
  filter?: Maybe<NoteSubscriptionFilter>;
};


export type SubscriptionNewCommentArgs = {
  filter?: Maybe<CommentSubscriptionFilter>;
};


export type SubscriptionUpdatedCommentArgs = {
  filter?: Maybe<CommentSubscriptionFilter>;
};


export type SubscriptionDeletedCommentArgs = {
  filter?: Maybe<CommentSubscriptionFilter>;
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
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

export type IsTypeOfResolverFn<T = {}> = (obj: T, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

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
  Comment: ResolverTypeWrapper<comment>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  String: ResolverTypeWrapper<Scalars['String']>;
  CommentFilter: CommentFilter;
  CommentResultList: ResolverTypeWrapper<Omit<CommentResultList, 'items'> & { items: Array<Maybe<ResolversTypes['Comment']>> }>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  CommentSubscriptionFilter: CommentSubscriptionFilter;
  CreateCommentInput: CreateCommentInput;
  CreateNoteInput: CreateNoteInput;
  IDInput: IdInput;
  MutateCommentInput: MutateCommentInput;
  MutateNoteInput: MutateNoteInput;
  Mutation: ResolverTypeWrapper<{}>;
  Note: ResolverTypeWrapper<note>;
  NoteFilter: NoteFilter;
  NoteResultList: ResolverTypeWrapper<Omit<NoteResultList, 'items'> & { items: Array<Maybe<ResolversTypes['Note']>> }>;
  NoteSubscriptionFilter: NoteSubscriptionFilter;
  OrderByInput: OrderByInput;
  PageRequest: PageRequest;
  Query: ResolverTypeWrapper<{}>;
  SortDirectionEnum: SortDirectionEnum;
  StringInput: StringInput;
  Subscription: ResolverTypeWrapper<{}>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Comment: comment;
  ID: Scalars['ID'];
  String: Scalars['String'];
  CommentFilter: CommentFilter;
  CommentResultList: Omit<CommentResultList, 'items'> & { items: Array<Maybe<ResolversParentTypes['Comment']>> };
  Int: Scalars['Int'];
  CommentSubscriptionFilter: CommentSubscriptionFilter;
  CreateCommentInput: CreateCommentInput;
  CreateNoteInput: CreateNoteInput;
  IDInput: IdInput;
  MutateCommentInput: MutateCommentInput;
  MutateNoteInput: MutateNoteInput;
  Mutation: {};
  Note: note;
  NoteFilter: NoteFilter;
  NoteResultList: Omit<NoteResultList, 'items'> & { items: Array<Maybe<ResolversParentTypes['Note']>> };
  NoteSubscriptionFilter: NoteSubscriptionFilter;
  OrderByInput: OrderByInput;
  PageRequest: PageRequest;
  Query: {};
  StringInput: StringInput;
  Subscription: {};
  Boolean: Scalars['Boolean'];
}>;

export type CommentResolvers<ContextType = GraphbackRuntimeContext, ParentType extends ResolversParentTypes['Comment'] = ResolversParentTypes['Comment']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  text?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  note?: Resolver<Maybe<ResolversTypes['Note']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type CommentResultListResolvers<ContextType = GraphbackRuntimeContext, ParentType extends ResolversParentTypes['CommentResultList'] = ResolversParentTypes['CommentResultList']> = ResolversObject<{
  items?: Resolver<Array<Maybe<ResolversTypes['Comment']>>, ParentType, ContextType>;
  offset?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  limit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  count?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type MutationResolvers<ContextType = GraphbackRuntimeContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  createNote?: Resolver<Maybe<ResolversTypes['Note']>, ParentType, ContextType, RequireFields<MutationCreateNoteArgs, 'input'>>;
  updateNote?: Resolver<Maybe<ResolversTypes['Note']>, ParentType, ContextType, RequireFields<MutationUpdateNoteArgs, 'input'>>;
  deleteNote?: Resolver<Maybe<ResolversTypes['Note']>, ParentType, ContextType, RequireFields<MutationDeleteNoteArgs, 'input'>>;
  createComment?: Resolver<Maybe<ResolversTypes['Comment']>, ParentType, ContextType, RequireFields<MutationCreateCommentArgs, 'input'>>;
  updateComment?: Resolver<Maybe<ResolversTypes['Comment']>, ParentType, ContextType, RequireFields<MutationUpdateCommentArgs, 'input'>>;
  deleteComment?: Resolver<Maybe<ResolversTypes['Comment']>, ParentType, ContextType, RequireFields<MutationDeleteCommentArgs, 'input'>>;
}>;

export type NoteResolvers<ContextType = GraphbackRuntimeContext, ParentType extends ResolversParentTypes['Note'] = ResolversParentTypes['Note']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  comments?: Resolver<Array<Maybe<ResolversTypes['Comment']>>, ParentType, ContextType, RequireFields<NoteCommentsArgs, never>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type NoteResultListResolvers<ContextType = GraphbackRuntimeContext, ParentType extends ResolversParentTypes['NoteResultList'] = ResolversParentTypes['NoteResultList']> = ResolversObject<{
  items?: Resolver<Array<Maybe<ResolversTypes['Note']>>, ParentType, ContextType>;
  offset?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  limit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  count?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
}>;

export type QueryResolvers<ContextType = GraphbackRuntimeContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  getNote?: Resolver<Maybe<ResolversTypes['Note']>, ParentType, ContextType, RequireFields<QueryGetNoteArgs, 'id'>>;
  findNotes?: Resolver<ResolversTypes['NoteResultList'], ParentType, ContextType, RequireFields<QueryFindNotesArgs, never>>;
  getComment?: Resolver<Maybe<ResolversTypes['Comment']>, ParentType, ContextType, RequireFields<QueryGetCommentArgs, 'id'>>;
  findComments?: Resolver<ResolversTypes['CommentResultList'], ParentType, ContextType, RequireFields<QueryFindCommentsArgs, never>>;
}>;

export type SubscriptionResolvers<ContextType = GraphbackRuntimeContext, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = ResolversObject<{
  newNote?: SubscriptionResolver<ResolversTypes['Note'], "newNote", ParentType, ContextType, RequireFields<SubscriptionNewNoteArgs, never>>;
  updatedNote?: SubscriptionResolver<ResolversTypes['Note'], "updatedNote", ParentType, ContextType, RequireFields<SubscriptionUpdatedNoteArgs, never>>;
  deletedNote?: SubscriptionResolver<ResolversTypes['Note'], "deletedNote", ParentType, ContextType, RequireFields<SubscriptionDeletedNoteArgs, never>>;
  newComment?: SubscriptionResolver<ResolversTypes['Comment'], "newComment", ParentType, ContextType, RequireFields<SubscriptionNewCommentArgs, never>>;
  updatedComment?: SubscriptionResolver<ResolversTypes['Comment'], "updatedComment", ParentType, ContextType, RequireFields<SubscriptionUpdatedCommentArgs, never>>;
  deletedComment?: SubscriptionResolver<ResolversTypes['Comment'], "deletedComment", ParentType, ContextType, RequireFields<SubscriptionDeletedCommentArgs, never>>;
}>;

export type Resolvers<ContextType = GraphbackRuntimeContext> = ResolversObject<{
  Comment?: CommentResolvers<ContextType>;
  CommentResultList?: CommentResultListResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Note?: NoteResolvers<ContextType>;
  NoteResultList?: NoteResultListResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = GraphbackRuntimeContext> = Resolvers<ContextType>;
