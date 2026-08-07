/**
 * Renders a JSON-LD block.
 *
 * A plain <script type="application/ld+json"> in the body is the form Google
 * documents and the one the Rich Results Test reads. It is a server component,
 * so the markup is in the initial HTML — crawlers that do not execute
 * JavaScript still see it.
 */
export default function JsonLd({ json, id }: { json: string; id?: string }) {
  return (
    <script
      type="application/ld+json"
      id={id}
      // The payload comes from JSON.stringify of our own objects, never from
      // user input, so there is nothing here to escape.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}
