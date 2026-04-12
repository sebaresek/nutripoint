import React from 'react';
import styles from './TermsAndConditions.module.css';

const TermsAndConditions = () => {
    return (
        <div className={styles.container}>
            <h1 className={styles.mainTitle}>Términos y Condiciones</h1>
            
            <section className={styles.section}>
                <h2 className={styles.subTitle}>1. Términos y Condiciones</h2>
                <p>
                    1.1 Los presentes Términos y Condiciones rigen el acceso, navegación y adquisición de productos en el sitio web 
                    <strong> https://www.nutripoint.site/</strong> (en adelante, el "Sitio"). El Sitio es administrado por su titular, 
                    <strong> Sebastián Resek</strong>, para la comercialización de suplementos deportivos y productos relacionados en el territorio de la República Argentina.
                </p>
                <p>
                    1.2 El Sitio es una plataforma virtual donde el Usuario puede consultar el catálogo de productos, precios, disponibilidad y realizar compras de forma electrónica.
                </p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.subTitle}>2. Aceptación y Registro</h2>
                <p>
                    2.1 Al navegar o comprar en el Sitio, el Usuario acepta estos Términos y Condiciones. Si no está de acuerdo, le sugerimos no utilizar la plataforma.
                </p>
                <p>
                    2.2 Para realizar compras, el Usuario debe registrarse ingresando datos reales, precisos y actualizados. El acceso a la cuenta es personal y mediante el uso de una clave que el Usuario debe resguardar. NutriPoint no se responsabiliza por el mal uso de la cuenta por parte de terceros.
                </p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.subTitle}>3. Propiedad Intelectual</h2>
                <p>
                    3.1 El contenido del Sitio, incluyendo pero no limitado a logos, nombres comerciales "NutriPoint", código fuente, imágenes y textos, está protegido por las leyes de propiedad intelectual argentinas. Queda prohibida su reproducción o uso comercial sin autorización expresa del titular.
                </p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.subTitle}>4. Política de Privacidad</h2>
                <p>
                    4.1 NutriPoint garantiza la confidencialidad de los datos personales ingresados por los usuarios en cumplimiento con la Ley N° 25.326. Estos se utilizan con el único fin de procesar pedidos, gestionar envíos y mejorar la experiencia de compra.
                </p>
                <p>
                    4.2 El Usuario tiene derecho a solicitar el acceso, rectificación o supresión de sus datos personales enviando una solicitud a través de los canales de soporte del Sitio.
                </p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.subTitle}>5. Pagos y Promociones</h2>
                <p>
                    5.1 Los precios están expresados en pesos argentinos (ARS) e incluyen los impuestos correspondientes. NutriPoint se reserva el derecho de modificar precios y stock disponible sin previo aviso.
                </p>
                <p>
                    5.2 <strong>Mercado Pago:</strong> Todos los pagos electrónicos se procesan de forma segura a través de la plataforma Mercado Pago. NutriPoint no almacena información de tarjetas de crédito o débito de sus usuarios.
                </p>
                <p>
                    5.3 Las promociones y códigos de descuento son válidos bajo las condiciones comunicadas en el Sitio y no son acumulables salvo que se indique lo contrario.
                </p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.subTitle}>6. Envíos y Logística</h2>
                <p>
                    6.1 NutriPoint realiza envíos a través de servicios de logística tercerizados. El costo y el tiempo de entrega se calculan en base al domicilio proporcionado por el Usuario.
                </p>
                <p>
                    6.2 Es responsabilidad del Usuario verificar que los datos de entrega sean correctos. NutriPoint no se hace responsable por demoras o entregas fallidas causadas por errores en la información brindada.
                </p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.subTitle}>7. Cambios y Devoluciones</h2>
                <p>
                    7.1 Según la legislación vigente, el Usuario tiene derecho a revocar su compra dentro de los 10 días corridos de recibido el producto, siempre que el mismo no haya sido abierto y conserve su sello de seguridad intacto. Al tratarse de suplementos nutricionales, por razones de salud y seguridad, no se aceptan devoluciones de productos cuyos envases hayan sido abiertos o manipulados.
                </p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.subTitle}>8. Ley Aplicable y Jurisdicción</h2>
                <p>
                    8.1 Estos términos se rigen por las leyes de la República Argentina. Cualquier controversia será sometida a los tribunales competentes según el domicilio del titular o la normativa de consumo vigente.
                </p>
            </section>
        </div>
    );
};

export default TermsAndConditions;