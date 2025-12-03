// PublicSecurrityPDF.tsx
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";
import { useMemo, memo } from "react";
import Logo from "../../../assets/logo-c.png";
import LogoCom from "../../../assets/TRANSITO.png";
import Greca from "../../../assets/greca-c.png";
import { Public_Securrity } from "../../../domain/models/security/security";
import { DateFormat, formatDatetime } from "../../../utils/formats";

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
      <Text style={tw("text-[10px] text-negro border-b border-gris-claro pb-0.5 leading-tight")}>{value || "No proporcionado"}</Text>
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
export default function PublicSecurrityPDF({ data }: { data: Public_Securrity }) {
   // Estilos memoizados
      const safeValue = (value: any): string => {
      if (value === null || value === undefined || value === "") {
         return "No proporcionado";
      }
      return String(value);
   };

   const backgroundStyle = useMemo(
      () => ({
         position: "absolute" as const,
         top: 0,
         left: 0,
         right: 0,
         bottom: 0,
         zIndex: -1,
         opacity: 0.05,
         display: "flex" as const,
         justifyContent: "center" as const,
         alignItems: "center" as const
      }),
      []
   );

   const footerStyle = useMemo(
      () => ({
         position: "absolute" as const,
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
         objectFit: "contain" as const
      }),
      []
   );

   const grecaStyle = useMemo(
      () => ({
         width: "100%",
         height: 30,
         objectFit: "cover" as const
      }),
      []
   );

   // Contenido memoizado optimizado
   const headerContent = useMemo(
      () => (
         <View style={tw("flex flex-col items-start mb-3 pb-2 border-b border-gris-claro")}>
            <View style={tw("w-full h-24  mb-8")}>
               <Image source={LogoCom} style={[tw("w-full  h-full"), { objectFit: "contain" }]} />
            </View>

            <View style={tw("flex flex-col w-full ")}>
               <Text style={tw("text-sm font-bold text-gris-cool")}>Acta de Detención</Text>
               <Text style={tw("text-[10px] text-guinda-primary")}>Folio: {data.id}</Text>
               <Text style={tw("text-[8px] text-gris")}>
                  {data.date} — {data.time}
               </Text>
            </View>
         </View>
      ),
      [data.id, data.date, data.time]
   );

   const twoColumnContent = useMemo(
      () => (
         <TwoColumnSection
            leftTitle="Datos del detenido"
            rightTitle="Datos de la detención"
            leftContent={
               <>
                  <InfoField label="Nombre Completo" value={data.detainee_name} compact />
                  <InfoField label="Edad" value={data.age} compact />
                  <InfoField label="Ubicación" value={data.location} compact />
               </>
            }
            rightContent={
               <>
                  <InfoField label="Motivo de la detención" value={data.detention_reason} compact />
                  <InfoField label="Oficial" value={data.officer_name} compact />
                  <InfoField label="Número de patrulla" value={data.patrol_unit_number} compact />
               </>
            }
         />
      ),
      [data.detainee_name, data.age, data.location, data.detention_reason, data.officer_name, data.patrol_unit_number]
   );

   const detaineeStatus = useMemo(
      () => (
         <Section title="Estado del detenido">
            <ThreeCols>
               <View style={tw("text-center")}>
                  <Text style={tw("text-lg font-bold text-guinda-primary")}>{data.active ? "ACTIVO" : "INACTIVO"}</Text>
                  <Text style={tw("text-[8px] text-gris uppercase tracking-wide")}>Estado del Registro</Text>
               </View>
              
            </ThreeCols>
         </Section>
      ),
      [data.active, data.id]
   );

   const operationalData = useMemo(
      () => (
         <Section title="Información operativa">
            <ThreeCols>
               <InfoField label="Fecha de Registro" value={safeValue(formatDatetime(data.date,true,DateFormat.DDDD_DD_DE_MMMM_DE_YYYY))} compact />
               <InfoField label="Hora de Registro" value={safeValue(formatDatetime(`205-11-05 ${data?.time}`,true,DateFormat.H_MM_A))} compact />
            </ThreeCols>
         </Section>
      ),
      [data.date, data.time, data.id]
   );

   const additionalInfo = useMemo(
      () => (
         <Section title="Información adicional">
            <TwoCols>
               <InfoField label="Responsable de Registro" value={data.officer_name} compact />
            </TwoCols>
         </Section>
      ),
      [data.date, data.time, data.officer_name]
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
            {detaineeStatus}
            {operationalData}
            {additionalInfo}

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
