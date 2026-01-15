import { useMutation, useQueryClient } from '@tanstack/react-query';
import { specContentKeys } from '../model/queryKeys';
import { createSpecContent } from '../api/createSpecContent';
import type { CreateSpecContentDto } from '@/entities/tech/model/types';

export function useCreateSpecContent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateSpecContentDto) => createSpecContent(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: specContentKeys.list(variables.categoryId),
            });
        },
    });
}
