import { ENDPOINTS } from '@/config/endpoints.config';
import api from '@/lib/api';
import {
  ReactionTargetType,
  ReactionType,
  SetReactionParams,
  SetReactionResult,
} from '@/types/reaction.type';
import { isAxiosError } from 'axios';

export class ReactionService {
  async setReaction(params: SetReactionParams): Promise<SetReactionResult> {
    try {
      const response = await api.post<SetReactionResult>(
        ENDPOINTS.REACTION.SET,
        params,
      );
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.message) {
        throw new Error(String(error.response.data.message));
      }
      throw error;
    }
  }

  async getReaction(
    targetType: ReactionTargetType,
    targetId: string,
  ): Promise<ReactionType | null> {
    try {
      const response = await api.get<{ type: ReactionType | null }>(
        ENDPOINTS.REACTION.GET,
        { params: { targetType, targetId } },
      );
      return response.data.type ?? null;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        return null;
      }
      if (isAxiosError(error) && error.response?.data?.message) {
        throw new Error(String(error.response.data.message));
      }
      throw error;
    }
  }
}

export const reactionService = new ReactionService();
