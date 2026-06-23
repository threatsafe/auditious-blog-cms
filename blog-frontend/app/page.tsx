import Link from "next/link";
import { getPosts } from "@/lib/payload";

export default async function Home() {
  const posts = await getPosts();

  return (
    <>
      <h1>Auditious Blog</h1>

      {posts.docs.map((post: any) => (
        <div key={post.id}>
          <Link href={`/${post.slug}`}>
            {post.title}
          </Link>
        </div>
      ))}
    </>
  );
}