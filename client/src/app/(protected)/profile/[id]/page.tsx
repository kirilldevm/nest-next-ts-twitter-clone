import ProfilePage from '@/components/profile/profile-page';

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return [];
}

export default async function UserProfilePage({ params }: PageProps) {
  const { id } = await params;
  return <ProfilePage userId={id} />;
}
