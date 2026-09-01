import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container center" style={{ paddingTop: 190, paddingBottom: 120 }}>
      <span className="eyebrow">404</span>
      <h1 className="display" style={{ margin: '14px 0' }}>LOST IN SCENT</h1>
      <p className="muted" style={{ maxWidth: 460, margin: '0 auto 30px' }}>
        The page you're looking for has evaporated. Let's get you back to something beautiful.
      </p>
      <Link to="/" className="btn btn-gold">Back to Home</Link>
    </div>
  );
}
