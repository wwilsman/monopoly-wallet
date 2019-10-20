import React from 'react';

import { useGame } from '../api';

import { Container, Section } from '../ui/layout';
import { Text } from '../ui/typography';
import NavBar from '../ui/nav-bar';
import Card from '../ui/card';
import Toast from '../ui/toaster/toast';

function GameHistory() {
  let { notice, history } = useGame();

  if (!notice || !history.length) { return null; }

  return (
    <Section data-test-history>
      <Text data-test-history-heading>History</Text>

      <div>
        <Section compact>
          <Toast
            type={'message'}
            message={notice.message}
          />
        </Section>
        {history.map(({ notice }, index) => {
          if(!notice) { return; }

          return (
            <Section
              compact
              key={`${index}-${notice.message}`}
            >
              <Toast
                type={'message'}
                message={notice.message}
              />
            </Section>
          );
        })}
      </div>
    </Section>
  );
}

export default function BankScreen() {
  let { room } = useGame();

  return (
    <Container data-test-bank scrollable>
      <NavBar
        title="Bank"
        titleIcon="bank"
        showBack={`/${room}`}
        roomCode={room}
      />

      <Section>
        <Card linkTo={`/${room}/transfer`}>
          <Text upper icon="transfer">
            Transfer
          </Text>
        </Card>

        <Card linkTo={`/${room}/properties`}>
          <Text upper icon="bank">
            Properties
          </Text>
        </Card>
      </Section>

      <GameHistory />
    </Container>
  );
}
