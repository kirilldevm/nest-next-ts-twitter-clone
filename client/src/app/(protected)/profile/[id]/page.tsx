import ProfilePageClient from './profile-page-client';

// Placeholder for static export; client reads real id from URL via useParams
export async function generateStaticParams() {
  return [{ id: '__' }];
}

export default function UserProfilePage() {
  return <ProfilePageClient />;
}
