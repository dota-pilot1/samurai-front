import { useMutation, useQueryClient } from '@tanstack/react-query';
import { specContentKeys } from '../model/queryKeys';
import { updateSpecContent } from '../api/updateSpecContent';
import type { UpdateSpecContentDto } from '@/entities/tech/model/types';

interface UpdateParams {
    id: number;
    categoryId: number;
    data: UpdateSpecContentDto;
}

export function useUpdateSpecContent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: UpdateParams) => updateSpecContent(id, data),
        onSuccess: (_, { categoryId }) => {
            queryClient.invalidateQueries({
                queryKey: specContentKeys.list(categoryId),
            });
        },
    });
}
