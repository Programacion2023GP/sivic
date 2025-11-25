import Map, { Marker, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useState, useMemo } from "react";
import {
   MapPin,
   AlertTriangle,
   Calendar,
   Clock,
   Droplet,
   User,
   X,
   ChevronRight,
   BarChart3,
   TrendingUp,
   Shield,
   Navigation,
   FileText,
   Download,
   Share2,
   Filter,
   Search
} from "lucide-react";

// Definir interfaces TypeScript
interface Penalty {
   id: string;
   name: string;
   city: string;
   cp: string;
   date: string;
   time: string;
   amountAlcohol: number;
   lat: number;
   lon: number;
   vehicleType?: string;
   licensePlate?: string;
   officer?: string;
   status?: "pending" | "processed" | "appealed";
}

interface LocationGroup {
   cp: string;
   city: string;
   penalties: Penalty[];
   center: {
      lat: number;
      lon: number;
   };
   stats: {
      total: number;
      highRisk: number;
      mediumRisk: number;
      lowRisk: number;
      avgAlcohol: number;
   };
}

interface CustomMapProps {
   penaltiesData: Penalty[];
   onCaseSelect?: (penalty: Penalty) => void;
}

const CustomMap = ({ penaltiesData, onCaseSelect }: CustomMapProps) => {
   const [selectedLocation, setSelectedLocation] = useState<LocationGroup | null>(null);
   const [selectedPenalty, setSelectedPenalty] = useState<Penalty | null>(null);
   const [showModal, setShowModal] = useState(false);
   const [popupVisible, setPopupVisible] = useState(false);
   const [activeTab, setActiveTab] = useState<"details" | "analytics" | "documents">("details");
   const [searchTerm, setSearchTerm] = useState("");

   const initialView = {
      latitude: 25.6596,
      longitude: -103.4586,
      zoom: 12
   };

   // Calcular estadísticas para cada ubicación
   const locationGroups: LocationGroup[] = useMemo(() => {
      const grouped = penaltiesData.reduce((acc: { [key: string]: LocationGroup }, penalty) => {
         const key = penalty.cp;
         if (!acc[key]) {
            acc[key] = {
               cp: penalty.cp,
               city: penalty.city,
               penalties: [],
               center: { lat: penalty.lat, lon: penalty.lon },
               stats: {
                  total: 0,
                  highRisk: 0,
                  mediumRisk: 0,
                  lowRisk: 0,
                  avgAlcohol: 0
               }
            };
         }
         acc[key].penalties.push(penalty);
         return acc;
      }, {});

      // Calcular estadísticas para cada grupo
      return Object.values(grouped).map((location) => {
         const penalties = location.penalties;
         const highRisk = penalties.filter((p) => p.amountAlcohol > 3).length;
         const mediumRisk = penalties.filter((p) => p.amountAlcohol >= 1 && p.amountAlcohol <= 3).length;
         const lowRisk = penalties.filter((p) => p.amountAlcohol < 1).length;
         const avgAlcohol = penalties.reduce((sum, p) => sum + p.amountAlcohol, 0) / penalties.length;

         return {
            ...location,
            stats: {
               total: penalties.length,
               highRisk,
               mediumRisk,
               lowRisk,
               avgAlcohol: Number(avgAlcohol.toFixed(2))
            }
         };
      });
   }, [penaltiesData]);

   // Filtrar ubicaciones basado en búsqueda
   const filteredLocations = useMemo(() => {
      if (!searchTerm) return locationGroups;
      return locationGroups.filter(
         (location) =>
            location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            location.cp.includes(searchTerm) ||
            location.penalties.some((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.includes(searchTerm))
      );
   }, [locationGroups, searchTerm]);

   const openPenaltyModal = (penalty: Penalty) => {
      setSelectedPenalty(penalty);
      setShowModal(true);
      setPopupVisible(false);
      onCaseSelect?.(penalty);
   };

   const handleMarkerClick = (location: LocationGroup) => {
      setSelectedLocation(location);
      setPopupVisible(true);
   };

   const handleClosePopup = () => {
      setPopupVisible(false);
   };

   const handleClosePanel = () => {
      setSelectedLocation(null);
      setPopupVisible(false);
   };

   const handleViewAllCases = () => {
      setPopupVisible(false);
      // El panel lateral ya se mostrará automáticamente porque selectedLocation está establecido
   };

   // Función para determinar el color basado en el nivel máximo de alcohol en un grupo
   const getLocationColor = (location: LocationGroup) => {
      if (location.stats.highRisk > 0) return "#ef4444";
      if (location.stats.mediumRisk > 0) return "#f59e0b";
      return "#10b981";
   };

   const getRiskLevel = (alcohol: number) => {
      if (alcohol > 3) return { level: "Alto", color: "red", bgColor: "bg-red-500/20", textColor: "text-red-300" };
      if (alcohol >= 1) return { level: "Medio", color: "yellow", bgColor: "bg-yellow-500/20", textColor: "text-yellow-300" };
      return { level: "Bajo", color: "green", bgColor: "bg-green-500/20", textColor: "text-green-300" };
   };

   const getStatusInfo = (status?: string) => {
      switch (status) {
         case "pending":
            return { text: "Pendiente", color: "bg-yellow-500/20 text-yellow-300" };
         case "processed":
            return { text: "Procesado", color: "bg-green-500/20 text-green-300" };
         case "appealed":
            return { text: "En Apelación", color: "bg-blue-500/20 text-blue-300" };
         default:
            return { text: "No Especificado", color: "bg-gray-500/20 text-gray-300" };
      }
   };

   // Navegación entre casos en la misma ubicación
   const navigateCase = (direction: "prev" | "next") => {
      if (!selectedLocation || !selectedPenalty) return;

      const currentIndex = selectedLocation.penalties.findIndex((p) => p.id === selectedPenalty.id);
      let newIndex;

      if (direction === "next") {
         newIndex = (currentIndex + 1) % selectedLocation.penalties.length;
      } else {
         newIndex = (currentIndex - 1 + selectedLocation.penalties.length) % selectedLocation.penalties.length;
      }

      setSelectedPenalty(selectedLocation.penalties[newIndex]);
   };

   return (
      <>
         {/* Header Mejorado */}
         <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-white/10 rounded-lg">
                  <Navigation className="w-6 h-6 text-blue-200" />
               </div>
               <div>
                  <h2 className="text-xl font-bold tracking-tight">Sistema de Monitoreo de Infracciones</h2>
                  <p className="text-blue-200 text-sm flex items-center gap-2">
                     <Shield className="w-4 h-4" />
                     {penaltiesData.length} casos registrados • {locationGroups.length} zonas monitorizadas
                  </p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                     type="text"
                     placeholder="Buscar ciudad, CP o folio..."
                     className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 w-64"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
                  <Filter className="w-5 h-5 text-blue-200" />
               </button>
            </div>
         </div>

         <div className="flex-1 flex flex-col lg:flex-row min-h-0">
            {/* PANEL LATERAL MEJORADO */}
            <div className="w-full lg:w-96 border-r border-gray-700 bg-gray-950/80 backdrop-blur-sm overflow-y-auto flex-shrink-0">
               {selectedLocation ? (
                  <div className="animate-fadeIn h-full flex flex-col">
                     {/* Header del Panel */}
                     <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 flex-shrink-0">
                        <div className="flex justify-between items-start mb-3">
                           <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg flex items-center gap-2 text-blue-300 truncate">
                                 <MapPin className="w-5 h-5 flex-shrink-0" />
                                 <span className="truncate">{selectedLocation.city}</span>
                              </h3>
                              <p className="text-blue-200 text-sm truncate">Código Postal: {selectedLocation.cp}</p>
                           </div>
                           <button onClick={handleClosePanel} className="text-gray-400 hover:text-white transition p-1 flex-shrink-0 ml-2">
                              <X className="w-5 h-5" />
                           </button>
                        </div>

                        {/* Tarjeta de Estadísticas */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                           <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                              <div className="text-2xl font-bold text-white">{selectedLocation.stats.total}</div>
                              <div className="text-xs text-gray-400">Total Casos</div>
                           </div>
                           <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                              <div className="text-2xl font-bold text-red-400">{selectedLocation.stats.highRisk}</div>
                              <div className="text-xs text-gray-400">Alto Riesgo</div>
                           </div>
                           <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                              <div className="text-2xl font-bold text-yellow-400">{selectedLocation.stats.mediumRisk}</div>
                              <div className="text-xs text-gray-400">Medio Riesgo</div>
                           </div>
                           <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                              <div className="text-2xl font-bold text-green-400">{selectedLocation.stats.lowRisk}</div>
                              <div className="text-xs text-gray-400">Bajo Riesgo</div>
                           </div>
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="p-6 text-center animate-fadeIn h-full overflow-y-auto">
                     <div className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-2xl mb-6">
                        <MapPin className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                        <h3 className="font-bold text-lg mb-2 text-gray-200">Sistema de Geolocalización</h3>
                        <p className="text-gray-400 text-sm">Selecciona un marcador en el mapa para visualizar los casos detallados</p>
                     </div>

                     {/* Resumen de Estadísticas Globales */}
                     <div className="bg-gray-800/40 rounded-xl p-4 text-left mb-4">
                        <h4 className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                           <BarChart3 className="w-4 h-4" />
                           Resumen General
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                           {filteredLocations.map((location) => (
                              <div
                                 key={location.cp}
                                 className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-700/40 cursor-pointer transition"
                                 onClick={() => handleMarkerClick(location)}
                              >
                                 <div className="min-w-0 flex-1">
                                    <span className="text-sm font-medium text-gray-200 block truncate">{location.city}</span>
                                    <div className="text-xs text-gray-400 truncate">CP: {location.cp}</div>
                                 </div>
                                 <div className="text-right flex-shrink-0 ml-2">
                                    <div className="text-sm font-semibold text-blue-300 whitespace-nowrap">{location.stats.total} casos</div>
                                    <div className="text-xs text-gray-400 whitespace-nowrap">
                                       {location.stats.highRisk > 0 && <span className="text-red-400">{location.stats.highRisk} alto</span>}
                                       {location.stats.highRisk > 0 && location.stats.mediumRisk > 0 && " • "}
                                       {location.stats.mediumRisk > 0 && <span className="text-yellow-400">{location.stats.mediumRisk} medio</span>}
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Leyenda Mejorada */}
                     <div className="bg-gray-800/40 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                           <AlertTriangle className="w-4 h-4" />
                           Niveles de Riesgo
                        </h4>
                        <div className="space-y-2">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                 <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                 <span className="text-sm text-gray-300">Bajo Riesgo</span>
                              </div>
                              <span className="text-xs text-gray-400">&lt; 1.0 mg/L</span>
                           </div>
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                 <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                 <span className="text-sm text-gray-300">Riesgo Medio</span>
                              </div>
                              <span className="text-xs text-gray-400">1.0 - 3.0 mg/L</span>
                           </div>
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                 <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                 <span className="text-sm text-gray-300">Alto Riesgo</span>
                              </div>
                              <span className="text-xs text-gray-400">&gt; 3.0 mg/L</span>
                           </div>
                        </div>
                     </div>
                  </div>
               )}
            </div>

            {/* MAPA MEJORADO */}
            <div className="flex-1 relative min-h-[500px]">
               <Map
                  initialViewState={initialView}
                  style={{ width: "100%", height: "100%" }}
                  mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
               >
                  {filteredLocations.map((location) => (
                     <Marker key={location.cp} longitude={location.center.lon} latitude={location.center.lat}>
                        <div className="cursor-pointer transition-all duration-300 hover:scale-125 relative group" onClick={() => handleMarkerClick(location)}>
                           {/* Marcador principal */}
                           <div
                              className="w-8 h-8 rounded-full border-2 border-white shadow-2xl relative z-10"
                              style={{
                                 background: `radial-gradient(circle at 30% 30%, ${getLocationColor(location)} 0%, #000 70%)`,
                                 boxShadow: `0 0 0 0px ${getLocationColor(location)}40, 0 4px 12px rgba(0,0,0,0.5)`
                              }}
                           >
                              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{location.stats.total}</span>
                           </div>

                           {/* Efecto de pulso */}
                           <div
                              className="absolute inset-0 w-8 h-8 rounded-full animate-ping opacity-75"
                              style={{ backgroundColor: getLocationColor(location) }}
                           ></div>
                        </div>
                     </Marker>
                  ))}

                  {/* Popup Mejorado */}
                  {popupVisible && selectedLocation && (
                     <Popup
                        longitude={selectedLocation.center.lon}
                        latitude={selectedLocation.center.lat}
                        anchor="top"
                        onClose={handleClosePopup}
                        closeButton={true}
                        closeOnClick={false}
                        className="custom-popup !bg-gray-900 !text-white !rounded-xl !shadow-2xl !border !border-gray-700"
                        maxWidth="300px"
                     >
                        <div className="w-full max-w-[280px]">
                           {/* Header del Popup */}
                           <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 rounded-t-xl">
                              <div className="flex items-start gap-3">
                                 <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-blue-400" />
                                 </div>
                                 <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-blue-300 truncate text-sm">{selectedLocation.city}</h3>
                                    <p className="text-blue-200 text-xs truncate">CP: {selectedLocation.cp}</p>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 flex-wrap">
                                       <span>{selectedLocation.stats.total} casos</span>
                                       <span>•</span>
                                       <span>Prom: {selectedLocation.stats.avgAlcohol} mg/L</span>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           {/* Contenido del Popup */}
                           <div className="p-3">
                              <div className="grid grid-cols-3 gap-2 mb-3">
                                 <div className="text-center p-2 bg-red-500/10 rounded-lg">
                                    <div className="text-sm font-bold text-red-400">{selectedLocation.stats.highRisk}</div>
                                    <div className="text-xs text-gray-400">Alto</div>
                                 </div>
                                 <div className="text-center p-2 bg-yellow-500/10 rounded-lg">
                                    <div className="text-sm font-bold text-yellow-400">{selectedLocation.stats.mediumRisk}</div>
                                    <div className="text-xs text-gray-400">Medio</div>
                                 </div>
                                 <div className="text-center p-2 bg-green-500/10 rounded-lg">
                                    <div className="text-sm font-bold text-green-400">{selectedLocation.stats.lowRisk}</div>
                                    <div className="text-xs text-gray-400">Bajo</div>
                                 </div>
                              </div>

                              <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                                 {selectedLocation.penalties.map((penalty) => {
                                    const risk = getRiskLevel(penalty.amountAlcohol);
                                    return (
                                       <div
                                          key={penalty.id}
                                          onClick={() => onCaseSelect(penalty)}
                                          className="flex items-center justify-between p-2 rounded-lg bg-gray-800/40 hover:bg-gray-700/60 cursor-pointer transition group"
                                       >
                                          <div className="min-w-0 flex-1">
                                             <div className="text-xs font-medium text-gray-200 truncate">Folio {penalty.id}</div>
                                             <div className="text-xs text-gray-400 truncate">{penalty.name}</div>
                                          </div>
                                          <div className="text-right flex-shrink-0 ml-2 flex items-center gap-1">
                                             <div className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${risk.bgColor} ${risk.textColor} whitespace-nowrap`}>
                                                {penalty.amountAlcohol} mg/L
                                             </div>
                                             <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-white" />
                                          </div>
                                       </div>
                                    );
                                 })}
                              </div>
                           </div>
                        </div>
                     </Popup>
                  )}
               </Map>

               {/* Panel de Control Flotante */}
               <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-xl p-4 border border-gray-700 shadow-2xl max-w-xs">
                  <div className="flex items-center gap-3 mb-3">
                     <TrendingUp className="w-5 h-5 text-blue-400" />
                     <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-200 truncate">Resumen General</div>
                        <div className="text-xs text-gray-400">{locationGroups.length} zonas activas</div>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                     <div className="bg-gray-800/50 rounded-lg p-2">
                        <div className="text-lg font-bold text-green-400">{locationGroups.reduce((sum, loc) => sum + loc.stats.lowRisk, 0)}</div>
                        <div className="text-xs text-gray-400">Bajo</div>
                     </div>
                     <div className="bg-gray-800/50 rounded-lg p-2">
                        <div className="text-lg font-bold text-red-400">{locationGroups.reduce((sum, loc) => sum + loc.stats.highRisk, 0)}</div>
                        <div className="text-xs text-gray-400">Alto</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* MODAL SUPER PROFESIONAL */}
         {showModal && selectedPenalty && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn p-4">
               <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                  {/* Header del Modal */}
                  <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 flex-shrink-0">
                     <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4 min-w-0">
                           <div className="p-3 bg-blue-500/20 rounded-xl flex-shrink-0">
                              <FileText className="w-8 h-8 text-blue-400" />
                           </div>
                           <div className="min-w-0">
                              <h3 className="text-2xl font-bold text-white truncate">Expediente #{selectedPenalty.id}</h3>
                              <p className="text-blue-200 truncate">Caso de infracción por alcohol</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                           <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
                              <Download className="w-5 h-5 text-gray-300" />
                           </button>
                           <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
                              <Share2 className="w-5 h-5 text-gray-300" />
                           </button>
                           <button onClick={() => setShowModal(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
                              <X className="w-5 h-5 text-gray-300" />
                           </button>
                        </div>
                     </div>

                     {/* Navegación entre casos */}
                     {selectedLocation && selectedLocation.penalties.length > 1 && (
                        <div className="flex justify-between items-center mt-4">
                           <button
                              onClick={() => navigateCase("prev")}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition whitespace-nowrap"
                           >
                              <ChevronRight className="w-4 h-4 rotate-180" />
                              Anterior
                           </button>
                           <span className="text-sm text-gray-400 whitespace-nowrap mx-4">
                              Caso {selectedLocation.penalties.findIndex((p) => p.id === selectedPenalty.id) + 1} de {selectedLocation.penalties.length}
                           </span>
                           <button
                              onClick={() => navigateCase("next")}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition whitespace-nowrap"
                           >
                              Siguiente
                              <ChevronRight className="w-4 h-4" />
                           </button>
                        </div>
                     )}
                  </div>

                  {/* Tabs del Modal */}
                  <div className="border-b border-gray-700 flex-shrink-0">
                     <div className="flex px-6 overflow-x-auto">
                        {[
                           { id: "details" as const, label: "Detalles", icon: FileText },
                           { id: "analytics" as const, label: "Analíticas", icon: BarChart3 },
                           { id: "documents" as const, label: "Documentos", icon: Shield }
                        ].map((tab) => (
                           <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                                 activeTab === tab.id ? "border-blue-500 text-blue-400 bg-blue-500/10" : "border-transparent text-gray-400 hover:text-gray-300"
                              }`}
                           >
                              <tab.icon className="w-4 h-4" />
                              {tab.label}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Contenido del Modal */}
               </div>
            </div>
         )}
      </>
   );
};

export default CustomMap;
