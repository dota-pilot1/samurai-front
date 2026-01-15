export interface SpecContent {
    id: number;
    categoryId: number;
    title: string;
    content: string;
    displayOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSpecContentDto {
    categoryId: number;
    title: string;
    content: string;
}

export interface UpdateSpecContentDto {
    title?: string;
    content?: string;
}
