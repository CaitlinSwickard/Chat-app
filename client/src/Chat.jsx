import React from "react";
import { 
  ApolloClient, 
  InMemoryCache, 
  ApolloProvider, 
  useSubscription, 
  useMutation,
  gql, 
} from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { 
  Container,
  Row,
  Col,
  FormInput,
  Button,
} from "shards-react";


// websocket link
const link = new WebSocketLink({
  uri: `ws://localhost:4000/`,
  options: {
    reconnect: true,
  },
});


// apollo client connection - added link for websocket
const client = new ApolloClient({
  link,
  uri: "http://localhost:4000/",
  cache: new InMemoryCache()
});


// graphQl Query- turned into subscription
const GET_MESSAGES = gql`
  subscription {
    messages {
      id
      content
      user
  }
}
`;

// graphql useMutation
const POST_MESSAGE = gql`
mutation ($user:String!, $content:String!) {
  postMessage(user: $user, content: $content)
}
`;


// messages component
const Messages = ({ user }) => {
  // useQuery turned into useSubscription
  const { data } = useSubscription(GET_MESSAGES);
  if (!data) {
    return null;
  }
  return (
    <>
      {data.messages.map(({ id, user: messageUser, content }) => (
        // styling for placement of message for when it is message user vs. other person in chat
        <div
        style={{
          display: 'flex',
          justifyContent: user === messageUser ? 'flex-end' : 'flex-start',
          paddingBottom: '1em',
        }}
        >
          {/* styling and logic for initials bubble with messages */}
          {user !== messageUser && (
            <div
              style={{
                height: 35,
                width: 35,
                marginRight: '0.5em',
                border: '2px solid #e5e6ea',
                borderRadius: 25,
                fontSize:'12pt',
                paddingTop: 4, 
                paddingLeft: 5,
              }}
            >
              {messageUser.slice(0,2).toUpperCase()}
            </div>
          )}

          {/* content div - styling for message blocks, green/white font if current user */}
          <div
          style={{
            background: user === messageUser ? '#58bf56' : '#e5e6ea',
            color: user === messageUser ? 'white' : 'black',
            padding: '1em',
            borderRadius: '1em',
            maxWidth: '60%',
          }}
          >
            {content}
          </div>
        </div>
      ))}
    </>
  );
};


// chat component - wrapped in shardsUI container
const Chat = () => {
  // state handler for chat 
  const [state, stateSet] = React.useState({
    user: 'Jack',
    content: '',
  });

  // mutation for postMessage
  const [postMessage] = useMutation(POST_MESSAGE);

  // onSend function for submit button/enter key
  const onSend = () => {
    // if no message dont send
    if (state.content.length > 0) {
      // mutation variables
      postMessage({
        variables: state,
      });
    }
    stateSet({
      ...state,
      content: "",
    });
  };


  return (
  <Container>
    <Messages user={state.user}/>
    {/* styling for user input form */}
    <Row>
      <Col xs={2} style={{ padding: 0}}>
        <FormInput
          label='User'
          value={state.user}
          onChange={(evt) => 
            stateSet({
            ...state,
            user: evt.target.value,
          })
        }
        />
      </Col>
      {/* styling and form for messaging input */}
      <Col xs={8}>
      <FormInput
            label="Content"
            value={state.content}
            onChange={(evt) =>
              stateSet({
                ...state,
                content: evt.target.value,
              })
            }
            // event handler for when someone presses enter key to submit
            onKeyUp={(evt) => {
              if (evt.keyCode === 13) {
                onSend();
              }
            }}
          />
        </Col>
        {/* submit button logic and styling */}
        <Col xs={2} style={{ padding: 0 }}>
          <Button onClick={() => onSend()} style={{ width: "100%" }}>
            Send
          </Button>
        </Col>
      </Row>
    </Container>
  );
};


// chat component wrapped in apolloprovider
export default () => (
  <ApolloProvider client={client}>
    <Chat />
  </ApolloProvider>
);