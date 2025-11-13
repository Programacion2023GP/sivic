// MultaPDF.tsx
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";
import Logo from "../../../../assets/logo.png";
import LogoCom from "../../../../assets/logo-gpd.png";
import Greca from "../../../../assets/greca.png";

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

export default function MultaPDF({ data }: { data: any }) {
   return (
      <Document>
         {/* Página 1 */}
         <Page size="A4" style={tw("px-10 py-8 font-sans bg-white relative")}>
            {/* === BACKGROUND LOGO EN TODA LA PÁGINA === */}
            <View
               style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: -1,
                  opacity: 0.1,
                  display: "flex",
                  justifyContent: "center", // centra verticalmente
                  alignItems: "center" // centra horizontalmente
               }}
            >
               <Image
                  src={Logo}
                  style={{
                     width: "60%",
                     height: "60%",
                     objectFit: "contain"
                  }}
               />
            </View>

            {/* === HEADER CON LOGO Y ENCABEZADO === */}
            <View style={tw("flex flex-row items-start mb-6 pb-4 border-b border-gris-claro")}>
               <Image src={LogoCom} style={tw("w-28 h-20 mr-4")} /> {/* Imagen más grande */}
               <View style={tw("flex-1")}>
                  <Text style={tw("text-lg font-bold text-guinda-primary leading-tight")}>Secretaría de{"\n"}Seguridad Ciudadana</Text>
                  <Text style={tw("text-sm text-guinda-secondary mt-1")}>Dirección de Tránsito y Movilidad</Text>
               </View>
               <View style={tw("text-right")}>
                  <Text style={tw("text-base font-bold text-gris-cool")}>Acta de Detención</Text>
                  <Text style={tw("text-sm text-guinda-primary")}>Folio: {data.id}</Text>
                  <Text style={tw("text-xs text-gris")}>
                     {data.date} — {data.time}
                  </Text>
               </View>
            </View>

            {/* === CONTENIDO PRINCIPAL === */}
            <TwoColumnSection
               leftTitle="Datos del detenido"
               rightTitle="Resultados de la prueba"
               leftContent={
                  <>
                     <InfoField label="Nombre Completo" value={data.name} />
                     <InfoField label="Edad" value={data.age} />
                     <InfoField label="CURP" value={data.curp} />
                     <InfoField label="Teléfono" value={data.detainee_phone_number} />
                     <InfoField label="Persona que acudió" value={data.detainee_released_to} />
                  </>
               }
               rightContent={
                  <>
                     <View style={tw("text-center mb-3")}>
                        <Text style={tw("text-2xl font-bold text-guinda-primary")}>{data.alcohol_concentration || "0"} mg/L</Text>
                        <Text style={tw("text-xs text-gris uppercase tracking-wide")}>Concentración de Alcohol</Text>
                     </View>
                     <InfoField label="Cantidad consumida" value={data.amountAlcohol} />
                     <InfoField label="Observaciones" value={data.observations} />
                  </>
               }
            />

            <Separator />

            <Section title="Información del vehículo">
               <ThreeCols>
                  <InfoField label="Número de Placa" value={data.plate_number} />
                  <InfoField label="Tipo de Servicio" value={data.vehicle_service_type} />
                  <InfoField label="N° de Pasajeros" value={data.number_of_passengers} />
               </ThreeCols>
            </Section>

            <Section title="Personal interviniente">
               <TwoCols>
                  <InfoField label="Oficial" value={data.person_oficial} />
                  <InfoField label="Doctor" value={data.doctor} />
               </TwoCols>
               <TwoCols>
                  <InfoField label="Nómina Oficial" value={data.oficial_payroll} />
                  <InfoField label="Cédula" value={data.cedula} />
               </TwoCols>
               <TwoCols>
                  <InfoField label="Contraloría" value={data.person_contraloria} />
                  <InfoField label="Supervisor de Filtro" value={data.filter_supervisor} />
               </TwoCols>
            </Section>

            <Section title="Datos operativos">
               <ThreeCols>
                  <InfoField label="Grupo" value={data.group} />
                  <InfoField label="Ciudad" value={data.city} />
                  <InfoField label="Código Postal" value={data.cp} />
               </ThreeCols>
            </Section>

            <Section title="Recursos desplegados">
               <TwoCols>
                  <InfoField label="Policía Municipal" value={data.municipal_police} />
                  <InfoField label="Protección Civil" value={data.civil_protection} />
               </TwoCols>
               <TwoCols>
                  <InfoField label="Vehículo Comando" value={data.command_vehicle} />
                  <InfoField label="Tropa Comando" value={data.command_troops} />
               </TwoCols>
            </Section>

            {/* === FOOTER FIJO EN CADA PÁGINA === */}
            <View
               style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0, // Cambiado de 40 a 0
                  right: 0, // Cambiado de 40 a 0
                  borderTop: "2px solid #9B2242",
                  paddingTop: 8
               }}
            >
               <Image
                  src={Greca}
                  style={{
                     width: "100%",
                     height: 40,
                     objectFit: "cover" // o "contain" según prefieras
                  }}
               />
            </View>
         </Page>

         {/* Página 2 (ejemplo) - SE REPITE LA MISMA ESTRUCTURA */}
      </Document>
   );
}

/* === COMPONENTES AUXILIARES (sin cambios) === */
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
   <View wrap={false} style={tw("mb-6")}>
      <Text style={tw("text-base font-bold text-guinda-secondary uppercase tracking-wide mb-2")}>{title}</Text>
      {children}
   </View>
);

const InfoField = ({ label, value }: { label: string; value: any }) => (
   <View style={tw("mb-2")}>
      <Text style={tw("text-[10px] font-semibold text-gris uppercase tracking-wide")}>{label}</Text>
      <Text style={tw("text-sm text-negro border-b border-gris-claro pb-0.5 leading-tight")}>{value || "No proporcionado"}</Text>
   </View>
);

const Separator = () => <View style={tw("border-b border-gris-claro my-6")} />;

const TwoCols = ({ children }: { children: React.ReactNode }) => (
   <View style={tw("flex flex-row justify-between gap-8")}>
      {Array.isArray(children)
         ? children.map((child, i) => (
              <View key={i} style={tw("flex-1")}>
                 {child}
              </View>
           ))
         : children}
   </View>
);

const ThreeCols = ({ children }: { children: React.ReactNode }) => (
   <View style={tw("flex flex-row justify-between gap-6")}>
      {Array.isArray(children)
         ? children.map((child, i) => (
              <View key={i} style={tw("flex-1")}>
                 {child}
              </View>
           ))
         : children}
   </View>
);

const TwoColumnSection = ({
   leftTitle,
   rightTitle,
   leftContent,
   rightContent
}: {
   leftTitle: string;
   rightTitle: string;
   leftContent: React.ReactNode;
   rightContent: React.ReactNode;
}) => (
   <View style={tw("flex flex-row justify-between gap-8 mb-6")}>
      <View style={tw("flex-1")}>
         <Text style={tw("text-base font-bold text-guinda-secondary uppercase tracking-wide mb-2")}>{leftTitle}</Text>
         {leftContent}
      </View>

      <View style={tw("flex-1")}>
         <Text style={tw("text-base font-bold text-guinda-secondary uppercase tracking-wide mb-2")}>{rightTitle}</Text>
         {rightContent}
      </View>
   </View>
);
