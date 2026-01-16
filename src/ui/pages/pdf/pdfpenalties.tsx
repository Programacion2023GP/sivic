// MultaPDF.tsx
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";
import { useMemo, memo } from "react";
import Logo from "../../../assets/logo-c.png";
import LogoCom from "../../../assets/TRANSITO.png";
import Greca from "../../../assets/greca-c.png";
import { DateFormat, formatDatetime } from "../../../utils/formats";
import { date } from "yup";

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
   const safeValue = (value: any): string => {
      if (value === null || value === undefined || value === "") {
         return "No proporcionado";
      }
      return String(value);
   };
// Componente principal optimizado para una sola página
export default function MultaPDF({ data }: { data: any }) {
   // Estilos memoizados
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
               <Text style={tw("text-[10px] text-guinda-primary")}>Folio: {safeValue(data.id)}</Text>
               <Text style={tw("text-[8px] text-gris")}>
                  fecha operativo {formatDatetime(`${data.date}`, true, DateFormat.DDDD_DD_DE_MMMM_DE_YYYY)} —{" "}
                  {safeValue(formatDatetime(`2025-01-01 ${data.time}`, false, DateFormat.HH_MM_SS_A))}
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
            rightTitle="Resultados de la prueba"
            leftContent={
               <>
                  <InfoField label="Nombre Completo" value={safeValue(data.name)} compact />
                  <InfoField label="Edad" value={safeValue(data.age)} compact />
                  <InfoField label="CURP" value={safeValue(data.curp)} compact />
                  <InfoField label="Teléfono" value={safeValue(data.detainee_phone_number)} compact />
                  <InfoField label="Persona que acudió" value={safeValue(data.detainee_released_to)} compact />
               </>
            }
            rightContent={
               <>
                  <View style={tw("text-center mb-2")}>
                     <Text style={tw("text-lg font-bold text-guinda-primary")}>{safeValue(data.amountAlcohol || "0")} mg/L</Text>
                     <Text style={tw("text-[8px] text-gris uppercase tracking-wide")}>Cantidad de Alcohol</Text>
                  </View>
                  <InfoField label="Grado de alcohol" value={safeValue(data.alcohol_concentration)} compact />
                  <InfoField label="Observaciones" value={safeValue(data.observations)} compact />
               </>
            }
         />
      ),
      [data.name, data.age, data.curp, data.detainee_phone_number, data.detainee_released_to, data.alcohol_concentration, data.amountAlcohol, data.observations]
   );

   const vehicleInfo = useMemo(
      () => (
         <Section title="Información del vehículo">
            <ThreeCols>
               <InfoField label="Número de Placa" value={safeValue(data.plate_number)} compact />
               <InfoField label="Tipo de Servicio" value={safeValue(data.vehicle_service_type)} compact />
               <InfoField label="N° de Pasajeros" value={safeValue(data.number_of_passengers)} compact />
            </ThreeCols>
         </Section>
      ),
      [data.plate_number, data.vehicle_service_type, data.number_of_passengers]
   );

   const personalInfo = useMemo(
      () => (
         <Section title="Personal interviniente">
            <TwoCols>
               <InfoField label="Oficial" value={safeValue(data.person_oficial)} compact />
               <InfoField label="Doctor" value={safeValue(data.doctor)} compact />
            </TwoCols>
            <TwoCols>
               <InfoField label="Nómina Oficial" value={safeValue(data.oficial_payroll)} compact />
               <InfoField label="Cédula" value={safeValue(data.cedula)} compact />
            </TwoCols>
            <TwoCols>
               <InfoField label="Contraloría" value={safeValue(data.person_contraloria)} compact />
               <InfoField label="Supervisor de Filtro" value={safeValue(data.filter_supervisor)} compact />
            </TwoCols>
         </Section>
      ),
      [data.person_oficial, data.doctor, data.oficial_payroll, data.cedula, data.person_contraloria, data.filter_supervisor]
   );

   const operationalData = useMemo(
      () => (
         <Section title="Datos operativos">
            <ThreeCols>
               <InfoField label="Grupo" value={safeValue(data.group)} compact />
               <InfoField label="Ciudad" value={safeValue(data.city)} compact />
               <InfoField label="Código Postal" value={safeValue(data.cp)} compact />
            </ThreeCols>
         </Section>
      ),
      [data.group, data.city, data.cp]
   );

   const resourcesData = useMemo(
      () => (
         <Section title="Recursos desplegados">
            <TwoCols>
               <InfoField label="Policía Municipal" value={safeValue(data.municipal_police)} compact />
               <InfoField label="Protección Civil" value={safeValue(data.civil_protection)} compact />
            </TwoCols>
            <TwoCols>
               <InfoField label="Vehículo Comando" value={safeValue(data.command_vehicle)} compact />
               <InfoField label="Tropa Comando" value={safeValue(data.command_troops)} compact />
            </TwoCols>
         </Section>
      ),
      [data.municipal_police, data.civil_protection, data.command_vehicle, data.command_troops]
   );
const exitDataSection = useMemo(
   () => (
      <Section title="Liberación">
         <TwoCols>
            <InfoField label="Monto de la multa" value={safeValue(data.fine_amount)} compact />
            <InfoField label="Motivo de la salida" value={safeValue(data.exit_reason)} compact />
         </TwoCols>
      </Section>
   ),
   [data.fine_amount, data.exit_reason]
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
            {vehicleInfo}
            {personalInfo}
            {operationalData}
            {resourcesData}
            {exitDataSection}
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
