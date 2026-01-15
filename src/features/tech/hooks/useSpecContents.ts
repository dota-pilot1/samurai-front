import { useQuery } from '@tanstack/react-query';
import { specContentKeys } from '../model/queryKeys';
import { getSpecContents } from '../api/getSpecContents';

export function useSpecContents(categoryId: number | null) {
    return useQuery({
        queryKey: specContentKeys.list(categoryId!),
        queryFn: () => getSpecContents(categoryId!),
        enabled: !!categoryId,
        staleTime: 1000 * 60 * 5, // 5분
    });
}
