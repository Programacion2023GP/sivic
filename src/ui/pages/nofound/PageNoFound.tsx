import React, { useState, useEffect } from "react";
import { Home, MapPin, Radio, Search } from "lucide-react";

export default function PoliceSearch404() {
   const [searchText, setSearchText] = useState("");
   const [dots, setDots] = useState("");
   const [carMove, setCarMove] = useState(0);

   useEffect(() => {
      const phrases = ["BUSCANDO PÁGINA", "RASTREANDO UBICACIÓN", "ANALIZANDO PISTAS", "SIN RESULTADOS"];
      let phraseIndex = 0;

      const textInterval = setInterval(() => {
         setSearchText(phrases[phraseIndex]);
         phraseIndex = (phraseIndex + 1) % phrases.length;
      }, 2500);

      const dotsInterval = setInterval(() => {
         setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
      }, 400);

      const moveInterval = setInterval(() => {
         setCarMove((prev) => (prev + 1) % 100);
      }, 50);

      return () => {
         clearInterval(textInterval);
         clearInterval(dotsInterval);
         clearInterval(moveInterval);
      };
   }, []);

   return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 via-indigo-950 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
         {/* City silhouette */}
         <div className="absolute bottom-0 left-0 right-0 h-48 bg-black opacity-40">
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around">
               <div className="w-20 bg-gray-900 opacity-60" style={{ height: "120px" }} />
               <div className="w-24 bg-gray-900 opacity-60" style={{ height: "180px" }} />
               <div className="w-16 bg-gray-900 opacity-60" style={{ height: "100px" }} />
               <div className="w-28 bg-gray-900 opacity-60" style={{ height: "150px" }} />
               <div className="w-20 bg-gray-900 opacity-60" style={{ height: "130px" }} />
               <div className="w-24 bg-gray-900 opacity-60" style={{ height: "160px" }} />
               <div className="w-16 bg-gray-900 opacity-60" style={{ height: "110px" }} />
            </div>
         </div>

         {/* Stars */}
         {[...Array(50)].map((_, i) => (
            <div
               key={i}
               className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
               style={{
                  top: `${Math.random() * 60}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
               }}
            />
         ))}

         {/* Police lights effect */}
         <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-blue-600/20 to-transparent animate-pulse" />
         <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-600/20 to-transparent animate-pulse" style={{ animationDelay: "0.5s" }} />

         {/* Main content */}
         <div className="relative z-10 text-center max-w-5xl w-full">
            {/* Police officer searching */}
            <div className="mb-8 relative">
               <div className="flex justify-center mb-6">
                  {/* Flashlight beam */}
                  <div
                     className="absolute top-20 left-1/2 transform -translate-x-1/2 w-32 h-64 bg-gradient-to-b from-yellow-300/40 to-transparent opacity-60 blur-sm"
                     style={{
                        clipPath: "polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)",
                        animation: "sway 3s ease-in-out infinite"
                     }}
                  />

                  {/* Police officer */}
                  <div className="relative z-10">
                     <div className="text-8xl md:text-9xl animate-bounce" style={{ animationDuration: "2s" }}>
                        👮
                     </div>
                     {/* Flashlight */}
                     <div
                        className="absolute bottom-4 -right-8 text-4xl"
                        style={{
                           animation: "sway 3s ease-in-out infinite",
                           transformOrigin: "top left"
                        }}
                     >
                        🔦
                     </div>
                  </div>
               </div>

               {/* Speech bubble */}
               <div className="relative inline-block bg-white text-gray-900 px-6 py-3 rounded-2xl font-bold text-sm md:text-base mb-4 shadow-2xl">
                  "¿Me perdi?"
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45" />
               </div>
            </div>

            {/* Large 404 */}
            <div className="mb-8 relative">
               <h1
                  className="text-7xl md:text-[160px] lg:text-[200px] font-black text-transparent leading-none"
                  style={{
                     WebkitTextStroke: "3px rgba(239, 68, 68, 0.6)",
                     textShadow: "0 0 60px rgba(239, 68, 68, 0.5)"
                  }}
               >
                  404
               </h1>

               {/* Question marks floating */}
               <div className="absolute top-0 left-1/4 text-4xl animate-bounce opacity-40">❓</div>
               <div className="absolute top-1/4 right-1/4 text-4xl animate-bounce opacity-40" style={{ animationDelay: "0.5s" }}>
                  ❓
               </div>
               <div className="absolute bottom-0 left-1/3 text-4xl animate-bounce opacity-40" style={{ animationDelay: "1s" }}>
                  ❓
               </div>
            </div>

            {/* Status message */}
            <div className="mb-8">
               <div className="bg-red-600 text-white inline-block px-8 py-4 text-2xl md:text-4xl font-black mb-4 shadow-2xl transform -skew-x-3 border-4 border-red-800">
                  <span className="transform skew-x-3 inline-block">PÁGINA NO LOCALIZADA</span>
               </div>
               <p className="text-blue-300 text-lg md:text-xl font-bold max-w-2xl mx-auto mb-6">
                  El oficial ha buscado por todas partes pero no puede encontrar lo que buscas
               </p>

               {/* Searching animation */}
               <div className="bg-black/60 backdrop-blur-sm border-2 border-blue-500 py-4 px-6 inline-block rounded-lg shadow-xl">
                  <div className="flex items-center gap-3 text-yellow-400 font-mono text-sm md:text-base">
                     <Radio className="animate-pulse" size={24} />
                     <span className="font-bold">
                        {searchText}
                        {dots}
                     </span>
                  </div>
               </div>
            </div>

            {/* Police car */}
            <div className="mb-8 relative h-32 overflow-hidden">
               <div className="absolute bottom-0 w-full border-t-4 border-gray-700" />

               <div
                  className="absolute bottom-2 text-6xl transition-all"
                  style={{
                     left: `${carMove}%`,
                     transform: carMove > 50 ? "scaleX(-1)" : "scaleX(1)"
                  }}
               >
                  🚓
               </div>

               {/* Road marks */}
               <div className="absolute bottom-4 w-full flex justify-around">
                  {[...Array(10)].map((_, i) => (
                     <div key={i} className="w-12 h-1 bg-yellow-400 opacity-50" />
                  ))}
               </div>
            </div>

            {/* Info cards */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
               <div className="bg-black/50 backdrop-blur-sm border-2 border-yellow-500 p-4 rounded-lg">
                  <MapPin className="text-yellow-500 mx-auto mb-2" size={32} />
                  <div className="text-yellow-500 text-xs font-bold mb-1">ÚLTIMA UBICACIÓN</div>
                  <div className="text-white text-lg font-black">DESCONOCIDA</div>
               </div>

               <div className="bg-black/50 backdrop-blur-sm border-2 border-red-500 p-4 rounded-lg">
                  <Search className="text-red-500 mx-auto mb-2" size={32} />
                  <div className="text-red-500 text-xs font-bold mb-1">TIEMPO BUSCANDO</div>
                  <div className="text-white text-lg font-black">∞</div>
               </div>

               <div className="bg-black/50 backdrop-blur-sm border-2 border-blue-500 p-4 rounded-lg">
                  <Radio className="text-blue-500 mx-auto mb-2 animate-pulse" size={32} />
                  <div className="text-blue-500 text-xs font-bold mb-1">REFUERZOS</div>
                  <div className="text-white text-lg font-black">EN CAMINO</div>
               </div>
            </div> */}

            {/* Action buttons */}
            {/* <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
               <button className="group relative bg-blue-600 hover:bg-blue-700 text-white font-black py-5 px-10 text-lg transition-all duration-300 hover:scale-110 shadow-2xl border-4 border-blue-800">
                  <span className="relative z-10 flex items-center gap-3">
                     <Home size={24} />
                     REGRESAR A CASA
                  </span>
               </button>

               <button className="bg-yellow-400 hover:bg-yellow-300 text-black font-black py-5 px-10 text-lg transition-all duration-300 hover:scale-110 shadow-2xl border-4 border-yellow-600 flex items-center gap-3">
                  <Radio size={24} />
                  PEDIR AYUDA
               </button>
            </div> */}

            {/* Badge */}
            {/* <div className="mt-10 inline-block bg-gradient-to-br from-blue-700 to-blue-900 text-white px-6 py-3 rounded-full font-black text-sm border-4 border-blue-500 shadow-2xl">
               🚨 PATRULLA DIGITAL 404
            </div> */}
         </div>

         <style>{`
        @keyframes sway {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
      `}</style>
      </div>
   );
}
