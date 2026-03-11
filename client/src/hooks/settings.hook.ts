import { QUERY_KEYS } from '@/config/query-keys.config';
import { useAuth } from '@/context/auth.context';
import {
  ChangePasswordFormData,
  UpdateProfileFormData,
} from '@/schemas/settings.schema';
import { settingsService } from '@/services/settings.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuth();

  return useMutation({
    mutationFn: (data: UpdateProfileFormData) =>
      settingsService.updateProfile(data, user?.photoURL ?? undefined),
    onSuccess: (data) => {
      queryClient.setQueryData([QUERY_KEYS.USER.ME], data);
      updateUser({ ...user, ...data });
    },
  });
}

export function useChangePasswordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChangePasswordFormData) =>
      settingsService.changePassword(data),
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: [QUERY_KEYS.USER.ME] });
    },
  });
}

export function useDeleteProfileMutation() {
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  return useMutation({
    mutationFn: () => settingsService.deleteProfile(),
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: [QUERY_KEYS.USER.ME] });
      logout();
    },
  });
}
