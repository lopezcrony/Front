export interface Permission {
  idPermiso: number;
  nombrePermiso: string;
  modulo?: string; // Agregamos el módulo para agrupar
}

export interface Role {
  idRol: number;
  nombreRol: string;
  estadoRol: boolean;
  Permissions?: Permission[];
}

export interface PermissionGroup {
  modulo: string;
  icon: string;
  permisos: Permission[];
  checked?: boolean; 
}