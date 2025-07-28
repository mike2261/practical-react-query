import { PostComponent } from '@/components/PostComponent';
import { fetchPostOption } from '@/services/posts';
import { dehydrate, HydrationBoundary, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, ErrorComponent } from '@tanstack/react-router'
import { useState } from 'react';

export const Route = createFileRoute('/posts')({
  loader: async ({context}) => {
    const queryClient = context.queryClient;
    await queryClient.prefetchQuery(fetchPostOption());
    await queryClient.ensureQueryData(fetchPostOption());
    return {
      props: {
        dehydratedState: dehydrate(queryClient)
      }
    }
  },
  component: RouteComponent,
  errorComponent: ErrorComponent,
})

function RouteComponent() {
  const [show, setShow] = useState<Boolean>(false);


  const {props} = Route.useLoaderData();
  return <HydrationBoundary state={props.dehydratedState}>
    <div>
    <h1>Posts</h1>
    <button onClick={() => setShow(prev => !prev)}>Show</button>
    {/* <ul>
      {posts?.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul> */}

   {
    show && <PostComponent />
   }


  </div>
  </HydrationBoundary>


  return <div>
    <h1>Posts</h1>
    <button onClick={() => setShow(prev => !prev)}>Show</button>
    {/* <ul>
      {posts?.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul> */}

   {
    show && <PostComponent />
   }


  </div>
}
