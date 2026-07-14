import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ScoreCard from './ScoreCard.jsx';

describe('ScoreCard', () => {
  it('clamps an out-of-range score and renders the supplied risk band', () => {
    render(<ScoreCard score={135} bandLabel="Low Risk" title="Eligibility" />);

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Risk Band:')).toBeInTheDocument();
    expect(screen.getByText('Low Risk')).toBeInTheDocument();
  });
});
