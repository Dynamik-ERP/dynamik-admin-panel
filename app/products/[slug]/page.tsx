import { sanityFetch } from '@/integrations/sanity/live'
import { productBySlugQuery } from '@/integrations/sanity/queries'
import { productSchema } from '@/integrations/sanity/validation'
import { ProductViewer } from '@/components/product/ProductViewer'
import { notFound } from 'next/navigation'

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data } = await sanityFetch({ 
    query: productBySlugQuery, 
    params: { slug } 
  })
  
  if (!data) notFound()
  
  const result = productSchema.safeParse(data)
  if (!result.success) {
    console.error('Product validation failed for slug', slug, result.error.flatten())
    notFound()
  }
  const product = result.data

  return (
    <main className="max-w-4xl mx-auto p-8">
      <div className="grid md:grid-cols-2 gap-8">
        <ProductViewer 
            modelUrl={product.model3dUrl} 
            fallbackImage={product.photos[0] ?? ''} 
        />
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
          {product.price && <p className="text-2xl mb-4">${product.price}</p>}
          <p className="mb-4">{product.description}</p>
          {product.category && <p className="font-semibold">Category: {product.category.title}</p>}
        </div>
      </div>
    </main>
  )
}
