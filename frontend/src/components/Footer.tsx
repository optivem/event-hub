import { Link } from 'react-router-dom';

/** Site-wide footer with links every visitor can open, signed in or not. */
export function Footer() {
  return (
    <footer className="container border-top mt-5 py-3 small text-muted">
      <Link className="link-secondary" to="/privacy">
        Privacy
      </Link>
    </footer>
  );
}
