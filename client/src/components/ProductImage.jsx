import Bottle from './Bottle';

export default function ProductImage({ product, className = '', index = 0 }) {
  const img = product.images?.[index];
  if (img?.url) {
    return <img src={img.url} alt={product.name} loading="lazy" className={`object-cover ${className}`} />;
  }
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Bottle accent={product.accent} name={product.name} brand={product.brand} className="h-full max-h-full w-auto" />
    </div>
  );
}
