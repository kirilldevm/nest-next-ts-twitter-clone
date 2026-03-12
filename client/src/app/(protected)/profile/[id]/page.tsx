import ProfilePage from '@/components/profile/profile-page';

async function fetchUserIds(): Promise<{ id: string }[]> {
  const base =
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:5001/fir-twitter-clone-ec0b2/us-central1/api';
  const apiBase = base.replace(/\/$/, '');
  const authorIds = new Set<string>();
  let cursor: string | null = null;

  try {
    do {
      const url = cursor
        ? `${apiBase}/post?limit=50&cursor=${encodeURIComponent(cursor)}`
        : `${apiBase}/post?limit=50`;
      const res = await fetch(url);

      if (!res.ok) break;

      const data = (await res.json()) as {
        items?: { authorId: string }[];
        nextCursor?: string | null;
      };

      const items = data.items ?? [];

      items.forEach((p) => p.authorId && authorIds.add(p.authorId));

      cursor = data.nextCursor ?? null;
    } while (cursor);
  } catch {
    // API may be unreachable at build time – return whatever we have
  }

  return Array.from(authorIds, (id) => ({ id }));
}

export async function generateStaticParams() {
  return fetchUserIds();
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function UserProfilePage({ params }: PageProps) {
  const { id } = await params;
  return <ProfilePage userId={id} />;
}
