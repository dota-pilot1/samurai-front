import { useMutation, useQueryClient } from '@tanstack/react-query';
import { specContentKeys } from '../model/queryKeys';
import { deleteSpecContent } from '../api/deleteSpecContent';

interface DeleteParams {
    id: number;
    categoryId: number;
}

export function useDeleteSpecContent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id }: DeleteParams) => deleteSpecContent(id),
        onSuccess: (_, { categoryId }) => {
            queryClient.invalidateQueries({
                queryKey: specContentKeys.list(categoryId),
            });
        },
    });
}
