export const specContentKeys = {
    all: ['spec', 'content'] as const,
    list: (categoryId: number) => [...specContentKeys.all, 'list', categoryId] as const,
    detail: (id: number) => [...specContentKeys.all, 'detail', id] as const,
};
