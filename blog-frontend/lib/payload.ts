const PAYLOAD_URL = "http://localhost:3001";

export async function getPosts() {
  const res = await fetch(
    `${PAYLOAD_URL}/api/posts?where[_status][equals]=published`
  );

  return res.json();
}