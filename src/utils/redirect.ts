const MODULE_ORDER = [
   { permission: "multas_ver", route: "multa" },
   { permission: "transito_vialidad__ver", route: "transito-vialidad" },
   { permission: "juzgados_ver", route: "juzgados" },
   { permission: "seguridad_publica__ver", route: "seguridad-publica" }
];
type RedirectData = {
   permisos: string[];
};

export const redirectRoute = (permisos: string[]): string => {
   for (const module of MODULE_ORDER) {
      if (permisos.includes(module.permission)) {
         return module.route;
      }
   }
   return "/";
};
