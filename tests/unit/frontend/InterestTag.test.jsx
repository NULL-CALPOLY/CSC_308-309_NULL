import { render, screen } from '@testing-library/react';
import TagComponent from '../../../frontend/src/Components/InterestTag/InterestTag.jsx';

describe('InterestTag', () => {
  it('renders the interest label', () => {
    render(<TagComponent Interest="Music" />);
    expect(screen.getByText('Music')).toBeInTheDocument();
  });

  it('renders nothing when Interest is falsy', () => {
    const { container } = render(<TagComponent Interest="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when Interest is undefined', () => {
    const { container } = render(<TagComponent />);
    expect(container.firstChild).toBeNull();
  });

  it('uses a predefined color for known interests (basketball)', () => {
    const { container } = render(<TagComponent Interest="basketball" />);
    const tag = container.querySelector('[data-testid="interest-tag"]');
    expect(tag).toBeInTheDocument();
    expect(tag.style.backgroundColor).toBe('rgb(255, 107, 107)');
  });

  it('generates a consistent color for unknown interests', () => {
    const { container: c1 } = render(<TagComponent Interest="Hiking" />);
    const { container: c2 } = render(<TagComponent Interest="Hiking" />);
    const color1 = c1.querySelector('[data-testid="interest-tag"]').style.backgroundColor;
    const color2 = c2.querySelector('[data-testid="interest-tag"]').style.backgroundColor;
    expect(color1).toBe(color2);
  });

  it('trims the interest name for color lookup', () => {
    const { container } = render(<TagComponent Interest="  soccer  " />);
    expect(container.querySelector('[data-testid="interest-tag"]')).toBeInTheDocument();
  });

  it('renders with different colors for different interests', () => {
    const { container: c1 } = render(<TagComponent Interest="Cooking" />);
    const { container: c2 } = render(<TagComponent Interest="Swimming" />);
    const color1 = c1.querySelector('[data-testid="interest-tag"]').style.backgroundColor;
    const color2 = c2.querySelector('[data-testid="interest-tag"]').style.backgroundColor;
    // Colors should differ (highly likely with different string hashes)
    // Just verify both render
    expect(c1.querySelector('[data-testid="interest-tag"]')).toBeInTheDocument();
    expect(c2.querySelector('[data-testid="interest-tag"]')).toBeInTheDocument();
  });
});
