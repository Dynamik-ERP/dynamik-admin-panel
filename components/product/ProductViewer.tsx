'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const DynamicProductScene = dynamic(() => import('./ProductScene').then((mod) => mod.ProductSceneWrapper), {
  ssr: false,
})

interface ProductViewerProps {
  modelUrl: string | undefined
  fallbackImage: string
}

export function ProductViewer({ modelUrl, fallbackImage }: ProductViewerProps) {
  return (
    <div className="aspect-square w-full overflow-hidden bg-gray-100">
      {modelUrl ? (
        <Suspense fallback={<img src={fallbackImage} alt="Product" className="h-full w-full object-cover" />}>
          <DynamicProductScene modelUrl={modelUrl} />
        </Suspense>
      ) : (
        <img src={fallbackImage} alt="Product" className="h-full w-full object-cover" />
      )}
    </div>
  )
}
