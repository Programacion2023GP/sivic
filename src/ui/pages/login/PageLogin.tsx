import { memo, useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { useUsersState } from "../../../store/storeusers/users.store";
import { ApiUsers } from "../../../infrastructure/infrastructureusers/inftrastructureusers";
import Spinner from "../../components/loading/loading";

const PageLoginMorena = () => {
   const { login, loading } = useUsersState();
   const api = new ApiUsers();
   const [isMobile, setIsMobile] = useState(false);

   useEffect(() => {
      const checkMobile = () => {
         setIsMobile(window.innerWidth < 768);
      };

      checkMobile();
      window.addEventListener("resize", checkMobile);

      return () => window.removeEventListener("resize", checkMobile);
   }, []);

   const validationSchema = Yup.object({
      payroll: Yup.string().required("El usuario es requerido"),
      password: Yup.string().required("La contraseña es requerida")
   });

   const initialValues = {
      payroll: "",
      password: ""
   };

   const handleSubmit = (values: typeof initialValues) => {
      login(values, api);
   };

   return (
      <>
         {loading && <Spinner />}
         <div className="min-h-screen bg-gradient-to-br from-[#9B2242] via-[#651D32] to-[#130D0E] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Elementos decorativos animados */}
            <div className="absolute inset-0 overflow-hidden">
               {/* Círculos animados flotantes */}
               <motion.div
                  className="absolute -top-32 -right-32 w-96 h-96 bg-[#9B2242] rounded-full mix-blend-multiply filter blur-3xl opacity-40"
                  animate={{
                     y: [0, -30, 0]
                  }}
                  transition={{
                     duration: 12,
                     repeat: Infinity,
                     ease: "easeInOut"
                  }}
               />

               <motion.div
                  className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#651D32] rounded-full mix-blend-multiply filter blur-3xl opacity-40"
                  animate={{
                     y: [10, -20, 10],
                     x: [0, 15, 0]
                  }}
                  transition={{
                     duration: 15,
                     repeat: Infinity,
                     ease: "easeInOut"
                  }}
               />

               <motion.div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#130D0E] rounded-full mix-blend-multiply filter blur-3xl opacity-30"
                  animate={{
                     scale: [1, 1.05, 1],
                     opacity: [0.3, 0.4, 0.3]
                  }}
                  transition={{
                     duration: 10,
                     repeat: Infinity,
                     ease: "easeInOut"
                  }}
               />

               {/* Partículas flotantes */}
               <motion.div
                  className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full opacity-20"
                  animate={{
                     y: [0, -25, 0],
                     opacity: [0.2, 0.3, 0.2]
                  }}
                  transition={{
                     duration: 6,
                     repeat: Infinity,
                     ease: "easeInOut"
                  }}
               />

               <motion.div
                  className="absolute top-3/4 right-1/3 w-1 h-1 bg-[#B8B6AF] rounded-full opacity-30"
                  animate={{
                     y: [0, -15, 0],
                     x: [0, 8, 0]
                  }}
                  transition={{
                     duration: 5,
                     repeat: Infinity,
                     ease: "easeInOut",
                     delay: 0.8
                  }}
               />
            </div>

            {/* Contenido principal */}
            <div className="max-w-6xl w-full grid grid-cols-1 xl:grid-cols-12 gap-8 items-center relative z-10">
               {/* Formulario */}
               <div className="xl:col-span-4">
                  <motion.div
                     className="bg-gradient-to-b from-[#130D0E] to-[#1a0f10] rounded-3xl p-8 border-2 border-[#9B2242] shadow-2xl relative overflow-hidden"
                     initial={{ opacity: 0, y: 40 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{
                        duration: 1.2,
                        ease: [0.25, 0.1, 0.25, 1] // easeInOutQuint
                     }}
                     whileHover={{
                        y: -3,
                        transition: { duration: 0.8 }
                     }}
                  >
                     {/* Efecto de bandera sutil */}
                     <motion.div
                        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#9B2242] via-[#651D32] to-[#130D0E]"
                        animate={{
                           backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                        }}
                        transition={{
                           duration: 6,
                           repeat: Infinity,
                           ease: "easeInOut"
                        }}
                        style={{
                           backgroundSize: "200% 100%"
                        }}
                     />

                     <div className="text-center mb-8 relative z-10">
                        <motion.div
                           className="w-20 h-20 bg-gradient-to-br from-[#9B2242] to-[#651D32] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-[#B8B6AF]/20"
                           animate={{
                              y: [0, -6, 0]
                           }}
                           transition={{
                              duration: 8,
                              repeat: Infinity,
                              ease: "easeInOut"
                           }}
                        >
                           <motion.span
                              className="text-white text-2xl"
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{
                                 duration: 4,
                                 repeat: Infinity,
                                 ease: "easeInOut"
                              }}
                           >
                              🔐
                           </motion.span>
                        </motion.div>

                        <motion.h2
                           className="text-2xl font-bold text-white mb-2"
                           initial={{ opacity: 0, y: -25 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{
                              duration: 1,
                              delay: 0.3,
                              ease: [0.25, 0.1, 0.25, 1]
                           }}
                        >
                           Acceso al Sistema
                        </motion.h2>

                        <motion.p
                           className="text-[#B8B6AF] text-sm"
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           transition={{
                              duration: 1,
                              delay: 0.6,
                              ease: "easeOut"
                           }}
                        >
                           Credenciales de servidor público
                        </motion.p>
                     </div>

                     <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                        {({ isSubmitting, touched }) => (
                           <Form className="space-y-6 relative z-10">
                              <motion.div
                                 initial={{ opacity: 0, x: -30 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 transition={{
                                    duration: 0.9,
                                    delay: 0.4,
                                    ease: [0.25, 0.1, 0.25, 1]
                                 }}
                              >
                                 <label htmlFor="payroll" className="block text-sm font-semibold text-white mb-3">
                                    Nomina
                                 </label>
                                 <Field name="payroll">
                                    {({ field, form }) => (
                                       <motion.input
                                          {...field}
                                          type="text"
                                          id="payroll"
                                          className="w-full px-4 py-3 bg-[#130D0E] border-2 border-[#474C55] rounded-xl focus:ring-2 focus:ring-[#9B2242] focus:border-[#9B2242] transition-all duration-500 text-white placeholder-[#727372]"
                                          placeholder="xxxxxx"
                                          whileFocus={{
                                             scale: 1.01,
                                             borderColor: "#9B2242",
                                             transition: { duration: 0.3 }
                                          }}
                                          whileHover={{
                                             borderColor: "#9B2242",
                                             transition: { duration: 0.4 }
                                          }}
                                       />
                                    )}
                                 </Field>
                                 <AnimatePresence>
                                    <ErrorMessage name="payroll">
                                       {(error) => (
                                          <motion.div
                                             className="text-red-400 text-sm mt-2"
                                             initial={{ opacity: 0, y: -10 }}
                                             animate={{ opacity: 1, y: 0 }}
                                             exit={{ opacity: 0, y: -10 }}
                                             transition={{
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 20
                                             }}
                                          >
                                             {error}
                                          </motion.div>
                                       )}
                                    </ErrorMessage>
                                 </AnimatePresence>
                              </motion.div>

                              <motion.div
                                 initial={{ opacity: 0, x: 30 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 transition={{
                                    duration: 0.9,
                                    delay: 0.6,
                                    ease: [0.25, 0.1, 0.25, 1]
                                 }}
                              >
                                 <label htmlFor="password" className="block text-sm font-semibold text-white mb-3">
                                    Contraseña
                                 </label>
                                 <Field name="password">
                                    {({ field, form }) => (
                                       <motion.input
                                          {...field}
                                          type="password"
                                          id="password"
                                          className="w-full px-4 py-3 bg-[#130D0E] border-2 border-[#474C55] rounded-xl focus:ring-2 focus:ring-[#9B2242] focus:border-[#9B2242] transition-all duration-500 text-white placeholder-[#727372]"
                                          placeholder="••••••••"
                                          whileFocus={{
                                             scale: 1.01,
                                             borderColor: "#9B2242",
                                             transition: { duration: 0.3 }
                                          }}
                                          whileHover={{
                                             borderColor: "#9B2242",
                                             transition: { duration: 0.4 }
                                          }}
                                       />
                                    )}
                                 </Field>
                                 <AnimatePresence>
                                    <ErrorMessage name="password">
                                       {(error) => (
                                          <motion.div
                                             className="text-red-400 text-sm mt-2"
                                             initial={{ opacity: 0, y: -10 }}
                                             animate={{ opacity: 1, y: 0 }}
                                             exit={{ opacity: 0, y: -10 }}
                                             transition={{
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 20
                                             }}
                                          >
                                             {error}
                                          </motion.div>
                                       )}
                                    </ErrorMessage>
                                 </AnimatePresence>
                              </motion.div>

                              <motion.button
                                 type="submit"
                                 initial={{ opacity: 0, y: 25 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 transition={{
                                    duration: 1,
                                    delay: 0.8,
                                    ease: [0.25, 0.1, 0.25, 1]
                                 }}
                                 whileHover={{
                                    scale: 1.01,
                                    transition: { duration: 0.6 }
                                 }}
                                 whileTap={{ scale: 0.99 }}
                                 className="w-full hover:cursor-pointer bg-gradient-to-r from-[#9B2242] to-[#651D32] hover:from-[#8a1e3a] hover:to-[#7a1b2a] text-white font-bold py-4 px-4 rounded-xl transition-all duration-500 shadow-lg hover:shadow-xl border border-[#B8B6AF]/20 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                 <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                                    Ingresar al Sistema
                                 </motion.span>
                              </motion.button>

                              <motion.div
                                 className="text-center pt-4 border-t border-[#474C55]"
                                 initial={{ opacity: 0 }}
                                 animate={{ opacity: 1 }}
                                 transition={{
                                    duration: 0.8,
                                    delay: 1.2
                                 }}
                              >
                                 <div className="p-4 border-t border-white/10">
                                    <p className="text-white/65 text-sm text-center">Version  {import.meta.env.VITE_APP_VERSION}</p>
                                 </div>{" "}
                              </motion.div>
                           </Form>
                        )}
                     </Formik>
                  </motion.div>
               </div>
            </div>

            {/* Elemento decorativo inferior animado */}
            <motion.div
               className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#9B2242] via-[#651D32] to-[#130D0E]"
               animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
               }}
               transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
               }}
               style={{
                  backgroundSize: "200% 100%"
               }}
            />
         </div>
      </>
   );
};

export default memo(PageLoginMorena);
