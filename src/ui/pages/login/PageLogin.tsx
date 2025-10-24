import { memo, useEffect, useState } from "react";

import { useUsersState } from "../../../store/storeusers/users.store";
import { ApiUsers } from "../../../infrastructure/infrastructureusers/inftrastructureusers";
import FormikForm from "../../formik/Formik";
import { FormikInput, FormikPasswordInput } from "../../formik/FormikInputs/FormikInput";
import { ColComponent, RowComponent } from "../../components/responsive/Responsive";
import { CustomButton } from "../../components/button/custombuttom";
import CustomCard from "../../components/card/customcard";
import * as Yup from "yup";
import type { Users } from "../../../domain/models/users/users.domain";

const PageLogin = () => {
    const {login} = useUsersState()
    const api = new ApiUsers()
    const colComponents = {
        "2xl": 6,
        xl: 6,
        lg: 6,
        md: 12,
        sm: 12,
    };
    const validationSchema = Yup.object({
        email: Yup.string().required("El correo es requerido"),
        password: Yup.string().required("La contraseña es requerida"),
    });

    return (
        <>
            {/* {mutation.status == "pending" && <Spinner />} */}

            <div className="bg bg-gradient-to-tr from-presidencia  bg-gray-300 w-screen h-screen flex justify-center items-center">
                <RowComponent>
                    <ColComponent responsive={colComponents}>
                        {/* Tarjeta de Login Estilizada */}
                        <CustomCard
                            title=""
                            children={() => (

                                <FormikForm
                                    onSubmit={(values)=>{
                                        login(values as Users,api)
                                    }}
                                    validationSchema={validationSchema}
                                    initialValues={{
                                        email: "",
                                        password: "",
                                    }}
                                    children={() => (
                                        <ColComponent>
                                            <FormikInput label="Correo" name="email" />
                                            <FormikPasswordInput label="Contraseña" name="password" />
                                            <div className="mt-8">
                                                <CustomButton
                                                    //   type="submit"

                                                    color="pink"
                                                    variant="secondary"
                                                >
                                                    Iniciar sesión
                                                </CustomButton>
                                            </div>
                                        </ColComponent>
                                    )}
                                />
                            )}
                        />








                    </ColComponent>

                    <ColComponent responsive={{ ...colComponents, sm: 0, md: 0 }}>
                        {/* Título Elegante de Requisiciones */}
                        <p className="text-center font-semibold text-white text-6xl mt-10">
                            Viviendas
                        </p>
                        <div className="text-center font-semibold text-white text-xs ">
                            {import.meta.env.VITE_VERSION}
                        </div>
                    </ColComponent>
                </RowComponent>
            </div>
        </>
    );
};

export default PageLogin;
