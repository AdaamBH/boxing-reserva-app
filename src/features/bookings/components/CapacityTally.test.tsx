import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { CapacityTally } from './CapacityTally';

describe('CapacityTally', () => {
  it('renderiza un círculo por plaza, coincidiendo con el aforo total', () => {
    const { container } = render(<CapacityTally aforoMaximo={5} ocupadas={2} />);

    expect(container.querySelectorAll('span')).toHaveLength(5);
  });

  it('rellena tantos círculos como plazas ocupadas', () => {
    const { container } = render(<CapacityTally aforoMaximo={5} ocupadas={2} />);

    expect(container.querySelectorAll('.bg-brand-600')).toHaveLength(2);
  });

  it('nunca rellena más círculos que el aforo, aunque haya sobrerreserva', () => {
    const { container } = render(<CapacityTally aforoMaximo={3} ocupadas={5} />);

    expect(container.querySelectorAll('span')).toHaveLength(3);
    expect(container.querySelectorAll('.bg-brand-600')).toHaveLength(3);
  });
});
