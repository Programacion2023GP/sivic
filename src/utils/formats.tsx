import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");

type DateInput = string | Date | number | null | undefined;
export enum DateFormat {
   // FECHAS BÁSICAS
   YYYY_MM_DD = "YYYY-MM-DD",
   DD_MM_YYYY = "DD/MM/YYYY",
   MM_DD_YYYY = "MM/DD/YYYY",
   DD_MM_YYYY_DASHED = "DD-MM-YYYY",
   YYYY_MM_DD_DOTTED = "YYYY.MM.DD",
   YYYY_MM_DD_SLASHED = "YYYY/MM/DD",

   // FECHAS EXTENDIDAS
   DD_MMM_YYYY = "DD MMM YYYY",
   DD_MMMM_YYYY = "DD MMMM YYYY",
   DDD_DD_MMM_YYYY = "ddd, DD MMM YYYY",
   DDDD_DD_MMMM_YYYY = "dddd, DD MMMM YYYY",
   DD_MM_YY = "DD/MM/YY",
   MMM_D_YYYY = "MMM D, YYYY",

   // HORAS BÁSICAS
   HH_MM = "HH:mm",
   HH_MM_SS = "HH:mm:ss",
   HH_MM_SS_A = "HH:mm:ss a ",

   H_MM_A = "h:mm A",
   H_MM_SS_A = "h:mm:ss A",
   HH_MM_DOUBLE_SS = "HH:mm::ss",
   HH_DOUBLE_MM_DOUBLE_SS = "HH::mm::ss",

   // HORAS EXTENDIDAS
   H_MM_a = "h:mm a",
   HH_MM_SS_MS = "HH:mm:ss.SSS",
   KK_MM = "kk:mm",
   KK_MM_SS = "kk:mm:ss",

   // FECHA + HORA COMBINADOS
   YYYY_MM_DD_HH_MM_SS = "YYYY-MM-DD HH:mm:ss",
   DD_MM_YYYY_HH_MM = "DD/MM/YYYY HH:mm",
   DD_MM_YYYY_H_MM_A = "DD-MM-YYYY h:mm A",
   MM_DD_YYYY_hh_MM_A = "MM/DD/YYYY hh:mm A",
   YYYY_MM_DD_HH_DOUBLE_MM = "YYYY.MM.DD HH::mm",
   DDD_MMM_D_YYYY_H_MM_A = "ddd, MMM D, YYYY h:mm A",

   // FORMATOS ESPECIALES
   UNIX_SECONDS = "X",
   UNIX_MILLISECONDS = "x",
   ISO = "YYYY-MM-DDTHH:mm:ssZ",
   ISO_WITH_MS = "YYYY-MM-DDTHH:mm:ss.SSSZ",

   // FORMATOS EN ESPAÑOL
   DD_DE_MMMM_DE_YYYY = "DD [de] MMMM [de] YYYY",
   DD_DE_MMMM_DE_YYYY_H_MM_a = "DD [de] MMMM [de] YYYY, h:mm a",
   DDDD_DD_DE_MMMM_DE_YYYY = "dddd, DD [de] MMMM [de] YYYY",

   // FORMATOS CORTOS
   DD_MM = "DD/MM",
   MM_YY = "MM/YY",
   H_A = "h A",

   // FORMATOS INTERNACIONALES
   INTERNATIONAL = "YYYY-MM-DD",
   EUROPEAN = "DD.MM.YYYY",
   US = "MMMM D, YYYY",

   // FORMATOS PERSONALIZADOS
   TODAY_IS_DDDD = "[Today is] dddd",
   YEAR_QUARTER = "YYYY-[Q]Q",
   YEAR_WEEK = "YYYY-[W]WW",
   HH_MM_HRS = "HH:mm [hrs]",
   DD_MM_YYYY_A_LAS_H_MM_a = "DD/MM/YYYY [a las] h:mm a"
}

// EJEMPLOS DE USO:
// formatDatetime(new Date(), true, DateFormat.DD_MM_YYYY_HH_MM)
// formatDatetime(new Date(), false, DateFormat.DD_DE_MMMM_DE_YYYY)
export function formatDatetime(
  the_date: DateInput | string,
  long_format: boolean = true,
  format: DateFormat
): string {
  if (!the_date) return "Sin Fecha";

  let date: Date;

  if (typeof the_date === "string" || typeof the_date === "number") {
    date = new Date(the_date);
  } else {
    date = the_date;
  }

  // Validamos que sea una fecha válida
//   if (isNaN(date.getTime())) return "Fecha inválida";

  // Formato por defecto
  const defaultFormat = long_format ? "DD-MM-YYYY h:mm:ss a" : "DD-MM-YYYY";
  const finalFormat = format || defaultFormat;

  return dayjs(date).format(finalFormat);
}
