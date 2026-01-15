import { api } from '@/shared/api/base';
import type { SpecContent } from '@/entities/tech/model/types';

export const getSpecContents = (categoryId: number): Promise<SpecContent[]> =>
    api.get(`/specs/contents/${categoryId}`).then(res => res.data);
