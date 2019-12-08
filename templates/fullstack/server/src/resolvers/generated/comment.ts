import { validateRuntimeContext } from "@graphback/runtime";
import { Resolvers } from "../../generated-types"

export default {
  Query: {
    findComments: (_, args, context) => {
      validateRuntimeContext(context)
      return context.crudService.findBy("comment", args.fields);
    },
    findAllComments: (_, args, context) => {
      validateRuntimeContext(context)
      return context.crudService.findAll("comment");
    }
  },

  Mutation: {
    createComment: (_, args, context) => {
      validateRuntimeContext(context)
      return context.crudService.create("comment", args.input, {
        publishEvent: false
      }, context);
    },
    updateComment: (_, args, context) => {
      validateRuntimeContext(context)
      return context.crudService.update("comment", args.id, args.input, {
        publishEvent: false
      }, context);
    }
  }
} as Resolvers
