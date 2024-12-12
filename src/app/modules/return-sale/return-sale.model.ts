export interface ReturnSaleModel{
    idDevolucionVenta:number, 
    idProveedor:number,
    idCodigoBarra:number,
    cantidad:number, 
    fechaDevolucion:Date, 
    motivoDevolucion:string,
    tipoReembolso:string, 
    valorDevolucion:number,
    estado: boolean;
}