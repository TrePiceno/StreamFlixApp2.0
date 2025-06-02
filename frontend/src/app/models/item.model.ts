export interface Item {
    itemId: number;
    titulo: string;
    imagen?: string;
    imagenDetalle?: string;
    sinopsis?: string;
    anio?: number;
    director?: string;
    genero?: string;
    categoria: string; 
    esFavorito: boolean;
}
