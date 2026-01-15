import { api } from '@/shared/api/base';
import type { CreateSpecContentDto, SpecContent } from '@/entities/tech/model/types';

export const createSpecContent = (data: CreateSpecContentDto): Promise<SpecContent> =>
    api.post('/specs/contents', data).then(res => res.data);
