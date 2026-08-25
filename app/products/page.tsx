import { sanityFetch } from '@/integrations/sanity/live'
import { productsQuery } from '@/integrations/sanity/queries'
import { productListSchema } from '@/integrations/sanity/validation'
import { Link } from '@/components/ui/link'

export default async function ProductsPage() {
  const { data } = await sanityFetch({ query: productsQuery })
  if (data == null) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-8">Our Furniture</h1>
        <div className="text-sm text-gray-500">No products available.</div>
      </main>
    )
  }

  const parsedProducts = productListSchema.safeParse(data)
  const products = parsedProducts.success ? parsedProducts.data : []

  if (!parsedProducts.success) {
    console.error('Failed to validate products:', parsedProducts.error.flatten())
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-8">Our Furniture</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <Link key={product._id} href={`/products/${product.slug.current}`} className="block border p-4">
            <img src={product.photos[0] ?? ''} alt={product.title} className="w-full aspect-square object-cover mb-2" />
            <h2 className="font-semibold">{product.title}</h2>
            {product.price && <p>${product.price}</p>}
          </Link>
        ))}
      </div>
    </main>
  )
}
