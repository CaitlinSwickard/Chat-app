import React from "react";
import { 
  ApolloClient, 
  InMemoryCache, 
  ApolloProvider, 
  useQuery, 
  gql, 
} from '@apollo/client';
import { 
  Container,
  Row,
  Col,
  FormInput,
  Button,
} from "shards-react";

// apollo client connection
const client = new ApolloClient({
  uri: "http://localhost:4000/",
  cache: new InMemoryCache()
});


// graphQl Query
const GET_MESSAGES = gql`
  query {
    messages {
      id
      content
      user
  }
}
`;


// messages component
const Messages = ({ user }) => {
  const { data } = useQuery(GET_MESSAGES);
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


// chat component - wrapped in shards container
const Chat = () => {
  return (
  <Container>
    <Messages user="Mary"/>
  </Container>
  );
} ;


// chat component wrapped in apolloprovider
export default () => (
  <ApolloProvider client={client}>
    <Chat />
  </ApolloProvider>
);