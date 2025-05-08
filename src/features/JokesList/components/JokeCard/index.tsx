import React from 'react';
import type { Joke } from '../../../../types';

interface JokeCardProps {
  joke: Joke;
}

const JokeCard: React.FC<JokeCardProps> = ({ joke }) => {
  return (
    <div style={{ border: '1px solid #ccc', margin: '10px', padding: '10px', borderRadius: '5px' }}>
      <p><strong>Setup:</strong> {joke.setup}</p>
      <p><strong>Punchline:</strong> {joke.punchline}</p>
    </div>
  );
};

export default JokeCard;