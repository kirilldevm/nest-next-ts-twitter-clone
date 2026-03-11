import ChangePassword from '@/components/settings/change-password';
import DeleteProfile from '@/components/settings/delete-profile';
import EditDetails from '@/components/settings/edit-details';
import { Typography } from '@mui/material';

export default function SettingsPage() {
  return (
    <>
      <Typography variant='h4' sx={{ mb: 4, fontWeight: 500 }}>
        Settings
      </Typography>

      {/* Edit details */}
      <EditDetails />

      {/* Change password */}
      <ChangePassword />

      {/* Delete profile */}
      <DeleteProfile />
    </>
  );
}
