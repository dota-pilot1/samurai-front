import { api } from '@/shared/api/base';
import type { UpdateSpecContentDto, SpecContent } from '@/entities/tech/model/types';

export const updateSpecContent = (id: number, data: UpdateSpecContentDto): Promise<SpecContent> =>
    api.patch(`/specs/contents/${id}`, data).then(res => res.data);
