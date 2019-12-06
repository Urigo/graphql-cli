import { validateRuntimeContext } from "@graphback/runtime";
import { Resolvers } from "../../generated-types"

export default {
  Note: {
    comment: (parent, args, context) => {
      validateRuntimeContext(context)
      return context.crudService.batchLoadData("comment", "noteId", parent.id, context);
    }
  },

  Query: {
    findNotes: (_, args, context) => {
      validateRuntimeContext(context)
      return context.crudService.findBy("note", args.fields);
    },
    findAllNotes: (_, args, context) => {
      validateRuntimeContext(context)
      return context.crudService.findAll("note");
    }
  },

  Mutation: {
    createNote: (_, args, context) => {
      validateRuntimeContext(context)
      return context.crudService.create("note", args.input, {
        publishEvent: false
      }, context);
    },
    updateNote: (_, args, context) => {
      validateRuntimeContext(context)
      return context.crudService.update("note", args.id, args.input, {
        publishEvent: false
      }, context);
    }
  }
} as Resolvers
