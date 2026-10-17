import { Link } from 'react-router-dom';
export default function NotFound() {
  return <div className="wrap py-32 text-center"><h1 className="text-6xl">Page not found</h1><p className="mt-3 text-sand">That page does not exist or has moved.</p><Link to="/" className="btn btn-gold mt-8">Back to home</Link></div>;
}
