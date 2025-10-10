// Componente de grid estandarizado para tarjetas de productos
export function ProductGrid({ children, className = "" }) {
  return (
    <div className={`grid-responsive-cards ${className}`}>
      {children}
    </div>
  )
}