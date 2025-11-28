import Map, { Marker, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useState, useMemo, useCallback, useEffect } from "react";
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
   Search,
   Menu,
   ChevronLeft
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
   const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
   const [mapViewState, setMapViewState] = useState({
      longitude: -103.4586,
      latitude: 25.6596,
      zoom: 12
   });
   const [isMobile, setIsMobile] = useState(false);

   // Detectar si es móvil
   useEffect(() => {
      const checkMobile = () => {
         setIsMobile(window.innerWidth < 1024);
      };

      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
   }, []);

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

   // Mover el mapa a una ubicación específica
   const flyToLocation = useCallback((location: LocationGroup) => {
      setMapViewState({
         longitude: location.center.lon,
         latitude: location.center.lat,
         zoom: 14
      });
   }, []);

   const openPenaltyModal = (penalty: Penalty) => {
      setSelectedPenalty(penalty);
      setShowModal(true);
      setPopupVisible(false);
      onCaseSelect?.(penalty);
   };

   const handleMarkerClick = (location: LocationGroup) => {
      setSelectedLocation(location);
      setPopupVisible(true);
      flyToLocation(location);

      if (isMobile) {
         setMobilePanelOpen(false);
      }
   };

   const handleLocationSelect = (location: LocationGroup) => {
      setSelectedLocation(location);
      flyToLocation(location);

      if (isMobile) {
         setMobilePanelOpen(true);
      }
   };

   const handleClosePopup = () => {
      setPopupVisible(false);
   };

   const handleClosePanel = () => {
      setSelectedLocation(null);
      setPopupVisible(false);
      if (isMobile) {
         setMobilePanelOpen(false);
      }
   };

   const handleCloseMobilePanel = () => {
      setMobilePanelOpen(false);
      setSelectedLocation(null);
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
      <div className="flex flex-col h-screen bg-gray-900">
         {/* Header */}
         <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-white/10 rounded-lg">
                  <Navigation className="w-6 h-6 text-blue-200" />
               </div>
               <div className="hidden sm:block">
                  <h2 className="text-xl font-bold tracking-tight text-white">Sistema de Monitoreo de Infracciones</h2>
                  <p className="text-blue-200 text-sm flex items-center gap-2">
                     <Shield className="w-4 h-4" />
                     {penaltiesData.length} casos registrados • {locationGroups.length} zonas monitorizadas
                  </p>
               </div>
               <div className="sm:hidden">
                  <h2 className="text-lg font-bold tracking-tight text-white">Monitoreo de Infracciones</h2>
                  <p className="text-blue-200 text-xs">
                     {penaltiesData.length} casos • {locationGroups.length} zonas
                  </p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="relative hidden sm:block">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                     type="text"
                     placeholder="Buscar ciudad, CP o folio..."
                     className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 w-64 text-white"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
                  <Filter className="w-5 h-5 text-blue-200" />
               </button>
               {isMobile && (
                  <button onClick={() => setMobilePanelOpen(!mobilePanelOpen)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
                     <Menu className="w-5 h-5 text-blue-200" />
                  </button>
               )}
            </div>
         </div>

         {/* Búsqueda móvil */}
         {isMobile && (
            <div className="p-3 border-b border-gray-700 bg-gray-800">
               <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                     type="text"
                     placeholder="Buscar ciudad, CP o folio..."
                     className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
            </div>
         )}

         {/* Contenedor principal */}
         <div className="flex-1 flex flex-col lg:flex-row min-h-0">
            {/* Panel lateral para desktop */}
            {!isMobile && (
               <div className="w-96 border-r border-gray-700 bg-gray-950 overflow-y-auto flex-shrink-0">
                  {selectedLocation ? (
                     <div className="h-full flex flex-col">
                        <div className="p-4 border-b border-gray-700 bg-gray-800 flex-shrink-0">
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

                           <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                              <div className="text-lg font-bold text-blue-400">{selectedLocation.stats.avgAlcohol} mg/L</div>
                              <div className="text-xs text-gray-400">Promedio de Alcohol</div>
                           </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                           <h4 className="font-semibold text-gray-300 mb-3 flex items-center justify-between">
                              <span>Casos en esta zona</span>
                              <span className="text-sm text-gray-400">{selectedLocation.penalties.length} casos</span>
                           </h4>
                           <div className="space-y-3">
                              {selectedLocation.penalties.map((penalty) => {
                                 const risk = getRiskLevel(penalty.amountAlcohol);
                                 return (
                                    <div
                                       key={penalty.id}
                                       onClick={() => openPenaltyModal(penalty)}
                                       className="p-3 rounded-lg bg-gray-800/40 hover:bg-gray-700/60 cursor-pointer transition border border-gray-700"
                                    >
                                       <div className="flex justify-between items-start mb-2">
                                          <div className="min-w-0 flex-1">
                                             <div className="text-sm font-semibold text-white truncate">Folio {penalty.id}</div>
                                             <div className="text-xs text-gray-400 truncate">{penalty.name}</div>
                                          </div>
                                          <div className={`px-2 py-1 rounded-full text-xs font-semibold ${risk.bgColor} ${risk.textColor} whitespace-nowrap ml-2`}>
                                             {penalty.amountAlcohol} mg/L
                                          </div>
                                       </div>
                                       <div className="flex items-center justify-between text-xs text-gray-400">
                                          <span>{penalty.date}</span>
                                          <span>{penalty.time}</span>
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                        </div>
                     </div>
                  ) : (
                     <div className="p-6 h-full overflow-y-auto">
                        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-2xl mb-6">
                           <MapPin className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                           <h3 className="font-bold text-lg mb-2 text-gray-200 text-center">Sistema de Geolocalización</h3>
                           <p className="text-gray-400 text-sm text-center">Selecciona un marcador en el mapa para visualizar los casos</p>
                        </div>

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
                                    onClick={() => handleLocationSelect(location)}
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
            )}

            {/* Panel móvil overlay */}
            {isMobile && mobilePanelOpen && (
               <div className="fixed inset-0 z-50 bg-black/70 flex">
                  <div className="w-4/5 max-w-sm bg-gray-900 h-full overflow-y-auto">
                     <div className="p-4 border-b border-gray-700 bg-blue-800 flex items-center justify-between">
                        <h3 className="font-bold text-white">Panel de Navegación</h3>
                        <button onClick={handleCloseMobilePanel} className="text-white">
                           <X className="w-6 h-6" />
                        </button>
                     </div>
                     <div className="p-4">
                        <div className="space-y-3">
                           {filteredLocations.map((location) => (
                              <div
                                 key={location.cp}
                                 className="p-3 rounded-lg bg-gray-800/40 hover:bg-gray-700/60 cursor-pointer transition border border-gray-700"
                                 onClick={() => {

                                    handleLocationSelect(location);
                                    handleCloseMobilePanel()
                                 }}
                              >
                                 <div className="flex justify-between items-start">
                                    <div className="min-w-0 flex-1">
                                       <div className="text-sm font-semibold text-white truncate">{location.city}</div>
                                       <div className="text-xs text-gray-400 truncate">CP: {location.cp}</div>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-2">
                                       <div className="text-sm font-semibold text-blue-300">{location.stats.total} casos</div>
                                       <div className="text-xs text-gray-400">
                                          {location.stats.highRisk > 0 && <span className="text-red-400">{location.stats.highRisk} alto</span>}
                                          {location.stats.mediumRisk > 0 && <span className="text-yellow-400"> {location.stats.mediumRisk} medio</span>}
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
                  <div className="flex-1" onClick={handleCloseMobilePanel}></div>
               </div>
            )}

            {/* Mapa - Siempre visible */}
            <div className="flex-1 relative min-h-[500px] lg:min-h-[600px]">
               <Map
                  {...mapViewState}
                  onMove={(evt) => setMapViewState(evt.viewState)}
                  style={{ width: "100%", height: "100%" }}
                  mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
               >
                  {filteredLocations.map((location) => (
                     <Marker key={location.cp} longitude={location.center.lon} latitude={location.center.lat}>
                        <div className="cursor-pointer transition-all duration-300 hover:scale-125 relative group" onClick={() => handleMarkerClick(location)}>
                           <div
                              className="w-8 h-8 rounded-full border-2 border-white shadow-2xl relative z-10"
                              style={{
                                 background: `radial-gradient(circle at 30% 30%, ${getLocationColor(location)} 0%, #000 70%)`,
                                 boxShadow: `0 0 0 0px ${getLocationColor(location)}40, 0 4px 12px rgba(0,0,0,0.5)`
                              }}
                           >
                              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{location.stats.total}</span>
                           </div>

                           <div
                              className="absolute inset-0 w-8 h-8 rounded-full animate-ping opacity-75"
                              style={{ backgroundColor: getLocationColor(location) }}
                           ></div>
                        </div>
                     </Marker>
                  ))}

                  {/* Popup para desktop */}
                  {popupVisible && selectedLocation  && (
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

                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                 {selectedLocation.penalties.map((penalty) => {
                                    const risk = getRiskLevel(penalty.amountAlcohol);
                                    return (
                                       <div
                                          key={penalty.id}
                                          onClick={() => openPenaltyModal(penalty)}
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

               {/* Panel de control flotante */}
               <div
                  className={`
                  absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-xl p-3 border border-gray-700 shadow-2xl
                  ${isMobile ? "max-w-[160px]" : "max-w-xs"}
               `}
               >
                  <div className="flex items-center gap-2 mb-2">
                     <TrendingUp className="w-4 h-4 text-blue-400" />
                     <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-200 truncate">Resumen</div>
                        <div className="text-xs text-gray-400">{locationGroups.length} zonas</div>
                     </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-center">
                     <div className="bg-gray-800/50 rounded p-1">
                        <div className="text-sm font-bold text-green-400">{locationGroups.reduce((sum, loc) => sum + loc.stats.lowRisk, 0)}</div>
                        <div className="text-[10px] text-gray-400">Bajo</div>
                     </div>
                     <div className="bg-gray-800/50 rounded p-1">
                        <div className="text-sm font-bold text-yellow-400">{locationGroups.reduce((sum, loc) => sum + loc.stats.mediumRisk, 0)}</div>
                        <div className="text-[10px] text-gray-400">Medio</div>
                     </div>
                     <div className="bg-gray-800/50 rounded p-1">
                        <div className="text-sm font-bold text-red-400">{locationGroups.reduce((sum, loc) => sum + loc.stats.highRisk, 0)}</div>
                        <div className="text-[10px] text-gray-400">Alto</div>
                     </div>
                  </div>
               </div>

               {/* Botón para abrir panel en móvil */}
               {isMobile && !mobilePanelOpen && (
                  <button
                     onClick={() => setMobilePanelOpen(true)}
                     className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl shadow-2xl z-10 transition-all"
                  >
                     <Menu className="w-5 h-5" />
                  </button>
               )}
            </div>
         </div>

         {/* Modal para detalles del caso */}
     
      </div>
   );
};

export default CustomMap;
