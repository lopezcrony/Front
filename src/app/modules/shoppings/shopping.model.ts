export interface Shopping {
    idCompra: number;
    idProveedor: number;
    fechaCompra: Date;
    fechaRegistro?: Date;  
    numeroFactura: string; 
    valorCompra?: number;   
    estadoCompra: boolean;
}