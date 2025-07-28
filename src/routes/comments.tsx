import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/comments')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/comments"!</div>
}
