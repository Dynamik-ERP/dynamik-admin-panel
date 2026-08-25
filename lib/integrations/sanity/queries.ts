export const productsQuery = `*[_type == "product"]{
  _id,
  title,
  slug,
  sku,
  price,
  "photos": photos[].asset->url
}`

export const productBySlugQuery = `*[_type == "product" && slug.current == $slug][0]{
  ...,
  "photos": photos[].asset->url,
  "model3dUrl": model3d.asset->url,
  category->
}`
