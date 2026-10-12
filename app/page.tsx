import { wpQuery } from '../lib/wp'
import Image from 'next/image'
import HeroSlider from './components/HeroSlider'
import TrustSection from './components/TrustSection'
import CategorySection from './components/CategorySection'

export default async function Home () {
  const data = await wpQuery(`
    query {
      posts(first: 10) {
        nodes {
          title
          slug
          excerpt
          featuredImage{
            node{
              sourceUrl
            }
          }
        }
      }
    }
  `)

  console.log(data)

  return (
    <>
      <HeroSlider />

      <TrustSection />

      <CategorySection />

      <div className='m-4'>
        <h1 className='text-4xl mb-4'>Recent Posts</h1>

        <div className='grid grid-flow-col grid-cols-4 gap-4'>
          {data.posts.nodes.map(({ title, slug, excerpt, featuredImage }) => (
            <div key={slug} className='border p-2'>
              <Image
                src={featuredImage?.node?.sourceUrl}
                width={500}
                height={500}
                alt={title}
                unoptimized={true}
              />
              <h2 className='my-2'>{title}</h2>
              <div
                dangerouslySetInnerHTML={{ __html: excerpt }}
                className='mb-2'
              ></div>
              <a href='' className='border px-3 py-2'>
                Read More
              </a>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
