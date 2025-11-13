import { memo } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useUsersState } from "../../../store/storeusers/users.store";
import { ApiUsers } from "../../../infrastructure/infrastructureusers/inftrastructureusers";
import Spinner from "../../components/loading/loading";


const PageLoginMorena = () => {
   const {login,loading} = useUsersState()
   const api = new ApiUsers()
   const validationSchema = Yup.object({
      payroll: Yup.string().required("El usuario es requerido"),
      password: Yup.string().required("La contraseña es requerida")
   });

   const initialValues = {
      payroll: "",
      password: ""
   };

   const handleSubmit = (values: typeof initialValues) => {
      login(values,api)
   };

   return (
      <>
         {loading && <Spinner/>}
         <div className="min-h-screen bg-gradient-to-br from-[#9B2242] via-[#651D32] to-[#130D0E] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Elementos decorativos con estilo Morena */}
            <div className="absolute inset-0 overflow-hidden">
               <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#9B2242] rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
               <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#651D32] rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#130D0E] rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
            </div>

            {/* Patrón de estrellas Morena */}
            <div className="absolute inset-0 opacity-10">
               <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,#9B2242_1px,transparent_0)] bg-[length:40px_40px]"></div>
            </div>

            <div className="max-w-6xl w-full grid grid-cols-1 xl:grid-cols-12 gap-8 items-center relative z-10">
               {/* Lado izquierdo - Identidad Morena */}
               <div className="xl:col-span-8">
                  <div className="bg-black/40 rounded-3xl p-8 lg:p-12 border-2 border-[#9B2242]/30 shadow-2xl backdrop-blur-sm">
                     <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                        {/* Logo y título principal */}
                        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 mb-8">
                           <div className="bg-gradient-to-br from-[#9B2242] to-[#651D32] p-6 rounded-2xl shadow-lg border border-[#B8B6AF]/20">
                              <div className="text-white text-4xl font-bold">M</div>
                           </div>
                           <div>
                              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2 leading-tight">
                                 SIVIC GP (Sistema Integral de Vigilancia y Control de Gómez Palacio)
                              </h1>
                              <div className="w-32 h-1 bg-gradient-to-r from-[#9B2242] to-[#651D32] rounded-full my-4"></div>
                           </div>
                        </div>

                        {/* Lema y descripción */}
                        {/* <div className="bg-gradient-to-r from-[#9B2242]/20 to-[#651D32]/20 rounded-2xl p-6 border border-[#9B2242]/30 mb-8 max-w-3xl">
                        <p className="text-white text-lg italic mb-4">"Por el bien de todos, primero los pobres"</p>
                        <p className="text-[#B8B6AF]">Plataforma oficial para la transparencia y rendición de cuentas de los servidores públicos</p>
                     </div> */}

                        {/* Valores Morena */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
                           <div className="bg-black/40 rounded-xl p-4 border border-[#9B2242]/20 text-center">
                              <div className="w-12 h-12 bg-[#9B2242] rounded-full flex items-center justify-center mx-auto mb-3">
                                 <span className="text-white text-xl">⚖️</span>
                              </div>
                              <h3 className="text-white font-semibold mb-1">Justicia</h3>
                              <p className="text-[#B8B6AF] text-xs">Social y económica</p>
                           </div>
                           <div className="bg-black/40 rounded-xl p-4 border border-[#9B2242]/20 text-center">
                              <div className="w-12 h-12 bg-[#651D32] rounded-full flex items-center justify-center mx-auto mb-3">
                                 <span className="text-white text-xl">🤝</span>
                              </div>
                              <h3 className="text-white font-semibold mb-1">Honestidad</h3>
                              <p className="text-[#B8B6AF] text-xs">Y transparencia</p>
                           </div>
                           <div className="bg-black/40 rounded-xl p-4 border border-[#9B2242]/20 text-center">
                              <div className="w-12 h-12 bg-[#130D0E] rounded-full flex items-center justify-center mx-auto mb-3">
                                 <span className="text-white text-xl">🇲🇽</span>
                              </div>
                              <h3 className="text-white font-semibold mb-1">Patria</h3>
                              <p className="text-[#B8B6AF] text-xs">Soberanía nacional</p>
                           </div>
                        </div>

                        {/* Información institucional */}
                        <div className="mt-8 p-5 bg-black/50 rounded-xl border border-[#651D32]/30 w-full max-w-3xl">
                           <p className="text-[#B8B6AF] text-sm text-center">Actualizacion : {String(import.meta.env.VITE_APP_VERSION)}</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Lado derecho - Formulario con identidad Morena */}
               <div className="xl:col-span-4">
                  <div className="bg-gradient-to-b from-[#130D0E] to-[#1a0f10] rounded-3xl p-8 border-2 border-[#9B2242] shadow-2xl relative overflow-hidden">
                     {/* Efecto de bandera sutil */}
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#9B2242] via-[#651D32] to-[#130D0E]"></div>

                     <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#9B2242] to-[#651D32] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-[#B8B6AF]/20">
                           <span className="text-white text-2xl">🔐</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Acceso al Sistema</h2>
                        <p className="text-[#B8B6AF] text-sm">Credenciales de servidor público</p>
                     </div>

                     <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                        {({ isSubmitting }) => (
                           <Form className="space-y-5">
                              <div>
                                 <label htmlFor="payroll" className="block text-sm font-semibold text-white mb-3">
                                    Nomina
                                 </label>
                                 <Field
                                    type="text"
                                    id="payroll"
                                    name="payroll"
                                    className="w-full px-4 py-3 bg-[#130D0E] border-2 border-[#474C55] rounded-xl focus:ring-2 focus:ring-[#9B2242] focus:border-[#9B2242] transition-all duration-300 text-white placeholder-[#727372]"
                                    placeholder="xxxxxx"
                                 />
                                 <ErrorMessage name="payroll" component="div" className="text-red-400 text-sm mt-2" />
                              </div>

                              <div>
                                 <label htmlFor="password" className="block text-sm font-semibold text-white mb-3">
                                    Contraseña
                                 </label>
                                 <Field
                                    type="password"
                                    id="password"
                                    name="password"
                                    className="w-full px-4 py-3 bg-[#130D0E] border-2 border-[#474C55] rounded-xl focus:ring-2 focus:ring-[#9B2242] focus:border-[#9B2242] transition-all duration-300 text-white placeholder-[#727372]"
                                    placeholder="••••••••"
                                 />
                                 <ErrorMessage name="password" component="div" className="text-red-400 text-sm mt-2" />
                              </div>

                              <button
                                 type="submit"
                                 className="w-full hover:cursor-pointer bg-gradient-to-r from-[#9B2242] to-[#651D32] hover:from-[#8a1e3a] hover:to-[#7a1b2a] text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl border border-[#B8B6AF]/20 uppercase tracking-wide"
                              >
                                 Ingresar al Sistema
                              </button>

                              <div className="text-center pt-4 border-t border-[#474C55]">
                                 <p className="text-[#727372] text-xs">Sistema seguro de la Cuarta Transformación</p>
                              </div>
                           </Form>
                        )}
                     </Formik>
                  </div>
               </div>
            </div>

            {/* Footer con identidad Morena */}
            <div className="absolute bottom-6 left-0 right-0 text-center">
               <div className="inline-flex bg-black/60 border border-[#9B2242]/30 rounded-full px-8 py-3 backdrop-blur-sm">
                  <p className="text-[#B8B6AF] text-sm font-semibold">© {new Date().getFullYear()} Movimiento Regeneración Nacional • "El pueblo es sabio y bueno"</p>
               </div>
            </div>

            {/* Elemento decorativo inferior */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#9B2242] via-[#651D32] to-[#130D0E]"></div>
         </div>
      </>
   );
};

export default memo(PageLoginMorena);
