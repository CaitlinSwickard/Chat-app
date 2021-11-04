const { GraphQLServer, PubSub } = require('graphql-yoga');

const messages = [];

const typeDefs = `
type Message {
  id: ID!
  user: String!
  content: String!
}

type Query {
  messages: [Message!]
}

type Mutation {
  postMessage(user: String!, content: String!): ID! 
}

type Subscription {
  messages: [Message!]
}
`;

// keeps a list of who is subscribed to channel for pubsub
const subscribers = [];

// allows us to add(push) a new subscriber to list of subscribers
const onMessagesUpdates = (fn) => subscribers.push(fn);




const resolvers = {
  Query: {
    messages: () => messages,
  },

  Mutation: {
    postMessage: (parent, {user, content}) => {
      const id = messages.length;
      messages.push({
        id,
        user,
        content
      });
      // alerts the system when a new message is posted
      subscribers.forEach(fn => fn());
      return id;
    }
  },

  Subscription: {
    messages: {
      subscribe: (parent, args, { pubsub }) => {
        const channel = Math.random().toString(36).slice(2,15);
        // adds user to subscription [] and send the message to that channel
        onMessagesUpdates(() => pubsub.publish(channel, { messages }));
        setTimeout(() => pubsub.publish(channel, { messages }), 0);
        return pubsub.asyncIterator(channel);
      }
    }
  }
};

// pubsub for subscription - add as context into server
const pubsub = new PubSub();

// server connection
const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub }});
server.start(({ port }) => {
  console.log(`Server on http://localhost:${port}/`);
});