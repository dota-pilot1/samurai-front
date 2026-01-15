import { api } from '@/shared/api/base';

export const deleteSpecContent = (id: number): Promise<void> =>
    api.delete(`/specs/contents/${id}`);
