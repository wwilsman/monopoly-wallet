import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import { useProperty, useGroup } from '../helpers/hooks';
import { Container, Section } from '../ui/layout';
import { BigInput } from '../ui/forms';
import Button from '../ui/button';
import Icon from '../ui/icon';

const { floor, min, max, random } = Math;

UtilityRentForm.propTypes = {
  utility: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default function UtilityRentForm({
  utility,
  onSubmit
}) {
  let [ roll, setRoll ] = useState(2);
  let { rent, owner } = useProperty(utility);
  let group = useGroup('utility', owner);
  // eslint-disable-next-line
  let multiplier = rent[group.owned.length - 1];

  let handleRoll = useCallback(e => {
    e.preventDefault();
    let d2 = floor(random() * 6 + 1);
    let d1 = floor(random() * 6 + 1);
    setRoll(d1 + d2);
  });

  let handleBlur = useCallback(() => {
    let bound = floor(max(min(roll, 12), 2));
    if (bound !== roll) setRoll(bound);
  });

  let handleSubmit = useCallback(e => {
    e.preventDefault();
    onSubmit(utility, roll);
  }, [onSubmit, roll]);

  return (
    <Container
      tagName="form"
      onSubmit={handleSubmit}
      data-test-utililty-rent-form
    >
      <Section collapse row justify="center" align="center">
        <BigInput
          xl
          center
          value={roll}
          color="primary"
          onChange={setRoll}
          onBlur={handleBlur}
          data-test-utility-rent-roll
        />

        <Button
          inline
          style="icon"
          onClick={handleRoll}
          type="button"
        >
          <Icon name="transfer"/>
        </Button>
      </Section>

      <Section flex="none">
        <Button
          block
          type="submit"
          style="alert"
          disabled={roll < 2 || roll > 12}
        >
          Pay Rent (x{multiplier})
        </Button>
      </Section>
    </Container>
  );
}
