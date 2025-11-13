// PdfPreview.tsx - VERSIÓN OPTIMIZADA
import React, { useState, useEffect, ReactElement } from "react";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import Spinner from "../loading/loading";

interface PdfPreviewProps {
   name: string;
   children: ReactElement;
}

export default function PdfPreview({ name, children }: PdfPreviewProps) {
   const [isLoading, setIsLoading] = useState(true);
   const [showViewer, setShowViewer] = useState(false);

   // Carga diferida del PDFViewer
   useEffect(() => {
      const timer = setTimeout(() => {
         setShowViewer(true);
         setIsLoading(false);
      }, 500); // Retraso de 500ms

      return () => clearTimeout(timer);
   }, []);

   return (
      <div style={{ width: "100%", height: "100vh" }}>
         {/* Botón de descarga */}
         <div style={{ marginBottom: "1rem" }}>
            <PDFDownloadLink document={children} fileName={`${name || "sin-id"}.pdf`}>
               {({ loading }) => (loading ? <Spinner /> : "📄 Descargar Acta de Infracción")}
            </PDFDownloadLink>
         </div>

         {/* Loading mientras se prepara el PDF */}
         {isLoading && (
            <div
               style={{
                  width: "100%",
                  height: "90%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
               }}
            >
               <Spinner />
            </div>
         )}
         {!showViewer && (
            <div
               style={{
                  width: "100%",
                  height: "90%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
               }}
            >
               <Spinner />
            </div>
         )}
         {/* PDFViewer solo cuando está listo */}
         {showViewer && (
            <PDFViewer width="100%" height="90%">
               {children}
            </PDFViewer>
         )}
      </div>
   );
}
