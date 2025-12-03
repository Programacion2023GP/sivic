// CourtPDF.tsx
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";
import { useMemo, memo } from "react";
import Logo from "../../../assets/logo-c.png";
import LogoCom from "../../../assets/TRANSITO.png";
import Greca from "../../../assets/greca-c.png";
import { DateFormat, formatDatetime } from "../../../utils/formats";

export interface Court {
   id: number; // folio
   date: string;
   referring_agency: string; // remite
   detainee_name: string; // nombre detenido
   detention_reason: string; // motivo de detención
   entry_time: string; // hora de entrada
   exit_datetime: string | null; // hora y fecha de salida
   exit_reason: string | null; // causa de salida
   fine_amount: number | null; // multa
   image_court: string;
   // Campos adicionales comunes
   created_at: string;
   penalties_id?: number;
   updated_at: string;
   active?: boolean;
}

const tw = createTw({
   fontFamily: {
      sans: ["Helvetica", "Arial", "sans-serif"]
   },
   colors: {
      "guinda-primary": "#9B2242",
      "guinda-secondary": "#651D32",
      "gris-cool": "#474C55",
      gris: "#727372",
      "gris-claro": "#D4D4D4",
      negro: "#130D0E"
   }
});

// Componentes memoizados optimizados
const Section = memo(({ title, children }: { title: string; children: React.ReactNode }) => (
   <View wrap={false} style={tw("mb-3")}>
      <Text style={tw("text-xs font-bold text-guinda-secondary uppercase tracking-wide mb-1")}>{title}</Text>
      {children}
   </View>
));

const InfoField = memo(({ label, value, compact }: { label: string; value: any; compact?: boolean }) => (
   <View style={tw(`mb-${compact ? "1" : "2"}`)}>
      <Text style={tw("text-[8px] font-semibold text-gris uppercase tracking-wide")}>{label}</Text>
      <Text style={tw("text-[10px] text-negro border-b border-gris-claro pb-0.5 leading-tight")}>
         {value !== null && value !== undefined && value !== "" ? value : "No proporcionado"}
      </Text>
   </View>
));

const Separator = memo(() => <View style={tw("border-b border-gris-claro my-2")} />);

const TwoCols = memo(({ children }: { children: React.ReactNode }) => (
   <View style={tw("flex flex-row justify-between gap-4")}>
      {Array.isArray(children)
         ? children.map((child, i) => (
              <View key={i} style={tw("flex-1")}>
                 {child}
              </View>
           ))
         : children}
   </View>
));

const ThreeCols = memo(({ children }: { children: React.ReactNode }) => (
   <View style={tw("flex flex-row justify-between gap-3")}>
      {Array.isArray(children)
         ? children.map((child, i) => (
              <View key={i} style={tw("flex-1")}>
                 {child}
              </View>
           ))
         : children}
   </View>
));

const TwoColumnSection = memo(
   ({ leftTitle, rightTitle, leftContent, rightContent }: { leftTitle: string; rightTitle: string; leftContent: React.ReactNode; rightContent: React.ReactNode }) => (
      <View style={tw("flex flex-row justify-between gap-4 mb-3")}>
         <View style={tw("flex-1")}>
            <Text style={tw("text-xs font-bold text-guinda-secondary uppercase tracking-wide mb-1")}>{leftTitle}</Text>
            {leftContent}
         </View>

         <View style={tw("flex-1")}>
            <Text style={tw("text-xs font-bold text-guinda-secondary uppercase tracking-wide mb-1")}>{rightTitle}</Text>
            {rightContent}
         </View>
      </View>
   )
);

// Componente principal optimizado para una sola página
export default function CourtPDF({ data }: { data: Court }) {
   // Función helper para proteger valores
   const safeValue = (value: any): string => {
      if (value === null || value === undefined || value === "") {
         return "No proporcionado";
      }
      return String(value);
   };

   // Formatear moneda
   const formatCurrency = (amount: number | null): string => {
      if (amount === null || amount === undefined) {
         return "No aplicable";
      }
      return new Intl.NumberFormat("es-MX", {
         style: "currency",
         currency: "MXN"
      }).format(amount);
   };

   // Estilos memoizados
   const backgroundStyle = useMemo(
      () => ({
         position: "absolute" as "absolute",
         top: 0,
         left: 0,
         right: 0,
         bottom: 0,
         zIndex: -1,
         opacity: 0.05,
         display: "flex" as "flex",
         justifyContent: "center" as "center",
         alignItems: "center" as "center"
      }),
      []
   );

   const footerStyle = useMemo(
      () => ({
         position: "absolute" as "absolute",
         bottom: 0,
         left: 0,
         right: 0,
         borderTop: "1px solid #9B2242",
         paddingTop: 4
      }),
      []
   );

   const logoStyle = useMemo(
      () => ({
         width: "50%",
         height: "50%",
         objectFit: "contain" as "contain"
      }),
      []
   );

   const logoComStyle = useMemo(
      () => ({
         width: "100%",
         height: "100%",
         objectFit: "contain" as "contain"
      }),
      []
   );

   const grecaStyle = useMemo(
      () => ({
         width: "100%",
         height: 30,
         objectFit: "cover" as "cover"
      }),
      []
   );

   // Contenido memoizado optimizado
   const headerContent = useMemo(
      () => (
         <View style={tw("flex flex-col items-start mb-3 pb-2 border-b border-gris-claro")}>
            <View style={tw("w-full h-24 mb-8")}>
               <Image source={LogoCom} style={logoComStyle} />
            </View>

            <View style={tw("flex flex-col w-full")}>
               <Text style={tw("text-sm font-bold text-gris-cool")}>Acta de Juzgado</Text>
               <Text style={tw("text-[10px] text-guinda-primary")}>Folio: {data?.id ? data.id : "N/A"}</Text>
               <Text style={tw("text-[8px] text-gris")}>
                  {safeValue(data?.date)} — {safeValue(data?.entry_time)}
               </Text>
            </View>
         </View>
      ),
      [data?.id, data?.date, data?.entry_time, logoComStyle]
   );

   const twoColumnContent = useMemo(
      () => (
         <TwoColumnSection
            leftTitle="Datos del detenido"
            rightTitle="Datos de ingreso"
            leftContent={
               <>
                  <InfoField label="Nombre Completo" value={safeValue(data?.detainee_name)} compact />
                  <InfoField label="Motivo de Detención" value={safeValue(data?.detention_reason)} compact />
                  <InfoField label="Remite" value={safeValue(data?.referring_agency)} compact />
               </>
            }
            rightContent={
               <>
                  <InfoField label="Fecha de Ingreso" value={safeValue(formatDatetime(data?.date,true,DateFormat.DDDD_DD_DE_MMMM_DE_YYYY))} compact />
                  <InfoField label="Hora de Entrada" value={safeValue(formatDatetime(`2025-01-01 ${data?.entry_time}`, false, DateFormat.HH_MM_SS_A))} compact />
                  <InfoField label="Monto de Multa" value={formatCurrency(data?.fine_amount)} compact />
               </>
            }
         />
      ),
      [data?.detainee_name, data?.detention_reason, data?.referring_agency, data?.date, data?.entry_time, data?.fine_amount]
   );

   const exitInfo = useMemo(
      () => (
         <Section title="Información de salida">
            <ThreeCols>
               <InfoField label="Fecha y Hora de Salida" value={safeValue(formatDatetime(data?.exit_datetime,true,DateFormat.DDD_MMM_D_YYYY_H_MM_A))} compact />
               <InfoField label="Causa de Salida" value={safeValue(data?.exit_reason)} compact />
               <View style={tw("text-center")}>
                  <Text style={tw(`text-lg font-bold ${data?.exit_datetime ? "text-gris" : "text-guinda-primary"}`)}>
                     {data?.exit_datetime ? "LIBERADO" : "EN CUSTODIA"}
                  </Text>
                  <Text style={tw("text-[8px] text-gris uppercase tracking-wide")}>Estado Actual</Text>
               </View>
            </ThreeCols>
         </Section>
      ),
      [data?.exit_datetime, data?.exit_reason]
   );

   const courtStatus = useMemo(
      () => (
         <Section title="Estado del registro">
            <ThreeCols>
               <View style={tw("text-center")}>
                  <Text style={tw("text-lg font-bold text-guinda-primary")}>{data?.active !== false ? "ACTIVO" : "INACTIVO"}</Text>
                  <Text style={tw("text-[8px] text-gris uppercase tracking-wide")}>Estado del Registro</Text>
               </View>
              
               <InfoField label="Folio de Penalidad" value={data?.penalties_id ? `${data.penalties_id}` : "No asignado"} compact />
            </ThreeCols>
         </Section>
      ),
      [data?.active, data?.id, data?.penalties_id]
   );

   const operationalData = useMemo(
      () => (
         <Section title="Información operativa">
            <ThreeCols>
               <InfoField label="Fecha de Creación" value={safeValue(data?.created_at)} compact />
               <InfoField label="Última Actualización" value={safeValue(data?.updated_at)} compact />
               <InfoField label="Agencia Remitente" value={safeValue(data?.referring_agency)} compact />
            </ThreeCols>
         </Section>
      ),
      [data?.created_at, data?.updated_at, data?.referring_agency]
   );

   const financialInfo = useMemo(
      () => (
         <Section title="Información financiera">
            <TwoCols>
               <InfoField label="Monto de Multa" value={formatCurrency(data?.fine_amount)} compact />
             
            </TwoCols>
         </Section>
      ),
      [data?.fine_amount]
   );

   return (
      <Document>
         <Page size="A4" style={tw("px-6 py-4 font-sans bg-white relative")}>
            {/* Background Logo más tenue */}
            <View style={backgroundStyle}>
               <Image src={Logo} style={logoStyle} />
            </View>

            {/* Header más compacto */}
            {headerContent}

            {/* Contenido Principal */}
            {twoColumnContent}

            <Separator />

            {/* Secciones compactas */}
            {exitInfo}
            {courtStatus}
            {/* {operationalData} */}
            {financialInfo}

            {/* Footer más pequeño */}
            <View style={footerStyle}>
               <Image src={Greca} style={grecaStyle} />
            </View>
         </Page>
      </Document>
   );
}

// Exportar componentes para reutilización
export { Section, InfoField, Separator, TwoCols, ThreeCols, TwoColumnSection };
