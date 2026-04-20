import React, { useState } from 'react';
import { Plus, Minus, Mail, ShieldCheck, Truck, CreditCard, User } from 'lucide-react';
import styles from './FaqPage.module.css';
import ButtonSupport from '../../components/ButtonSupport/ButtonSupport'


const FaqItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`${styles.faqItem} ${isOpen ? styles.active : ''}`}>
            <button className={styles.questionButton} onClick={() => setIsOpen(!isOpen)}>
                <span>{question}</span>
                {isOpen ? <Minus size={20} /> : <Plus size={20} />}
            </button>
            <div className={`${styles.answerWrapper} ${isOpen ? styles.show : ''}`}>
                <div className={styles.answerContent}>
                    {typeof answer === 'string' ? <p>{answer}</p> : answer}
                </div>
            </div>
        </div>
    );
};

const FaqPage = () => {
    const faqData = [
        {
            category: "SUPLEMENTACIÓN GENERAL",
            // icon: <ShieldCheck size={24} />,
            items: [
                {
                    question: "¿Qué son los suplementos deportivos?",
                    answer: "Son productos destinados a suplementar la alimentación habitual. Suelen ser concentrados de proteínas, aminoácidos, vitaminas o minerales. Es importante integrarlos en un plan que relacione alimentación, suplementación y entrenamiento."
                },
                {
                    question: "¿Todos pueden consumir suplementos deportivos?",
                    answer: "No. Están contraindicados para embarazadas y personas en período de lactancia. Los menores de 18 años deben consumirlos bajo supervisión. Ante cualquier condición médica previa, siempre recomendamos consultar con tu médico."
                },
                {
                    question: "¿Los suplementos deben tomarse todos los días?",
                    answer: "Sí, la mayoría requiere constancia para optimizar sus beneficios. La excepción son los pre-entrenos, que se consumen específicamente los días de actividad física."
                },
                {
                    question: "¿Cómo verifico que son productos seguros?",
                    answer: "Todos los productos en NutriPoint cumplen con las exigencias del Código Alimentario Argentino y cuentan con sus respectivos registros RNE / RNPA visibles en sus etiquetas."
                }
            ]
        },
        {
            category: "PROTEÍNAS",
            items: [
                {
                    question: "¿Qué son y para qué sirven las proteínas?",
                    answer: "Es un macronutriente esencial para la formación y reparación de músculos, huesos y otros tejidos. Se utilizan para alimentar los músculos y estimular la síntesis proteica después del ejercicio."
                },
                {
                    question: "¿Cuánta proteína debo consumir por día?",
                    answer: (
                        <ul>
                            <li>Sin actividad física: 0.8 a 1g por kilo de peso corporal.</li>
                            <li>Actividad moderada: 1.1 a 1.6g por kilo de peso corporal.</li>
                            <li>Ejercicio intenso o fuerza: 1.5 a 2g por kilo de peso corporal.</li>
                        </ul>
                    )
                },
                {
                    question: "¿La proteína engorda?",
                    answer: "No. La proteína ayuda al desarrollo de masa muscular magra, lo que mantiene el metabolismo activo y ayuda a quemar más calorías durante el día."
                },
                {
                    question: "¿Un batido de proteína reemplaza una comida?",
                    answer: "No. Los batidos son complementos nutricionales, no reemplazos. Funcionan mejor como colaciones o recuperadores post-entrenamiento."
                },
                {
                    question: "¿Qué diferencia hay entre Whey Protein e Isolate (Aislada)?",
                    answer: "La Isolate es una proteína 100% aislada, lo que aporta mayor cantidad de proteína por porción, menos grasas/carbohidratos, es libre de lactosa y de absorción más rápida."
                }
            ]
        },
        {
            category: "CREATINA Y OTROS",
            items: [
                {
                    question: "¿Cómo se toma la creatina?",
                    answer: "Se recomienda tomarla todos los días (incluso los que no entrenas) con agua o jugos. Su efecto funciona por acumulación en el organismo."
                },
                {
                    question: "¿La creatina aumenta la testosterona?",
                    answer: "No directamente. La mejora del rendimiento y la fuerza permite entrenar más pesado, lo cual puede favorecer el entorno hormonal natural, pero no es un precursor de testosterona."
                },
                {
                    question: "¿Qué son y cómo actúan los quemadores de grasa?",
                    answer: "Son suplementos con ingredientes que aceleran el metabolismo y aumentan los niveles de energía (efecto termogénico) para facilitar el uso de reservas de grasa como energía."
                },
                {
                    question: "¿Qué diferencia existe entre el Pump 3D y el Pump V8?",
                    answer: "El Pump 3D Ripped es un pre-entreno potenciado que combina la energía explosiva del V8 con componentes específicos para estimular la quema de calorías extra durante el entrenamiento."
                }
            ]
        },
        {
            category: "COMPRAS Y ENVÍOS",
            // icon: <Truck size={24} />,
            items: [
                {
                    question: "¿Necesito registrarme para comprar?",
                    answer: "Sí, es necesario registrarse para que podamos gestionar el envío de tus productos de forma segura y precisa."
                },
                {
                    question: "¿Cuáles son los medios de pago?",
                    answer: "Aceptamos tarjetas de débito, crédito y cupones de pago (Rapipago/Pago Fácil) a través de Mercado Pago."
                },
                {
                    question: "¿Cuál es el plazo para cancelaciones o devoluciones?",
                    answer: "Según la Ley 24.240, tenés hasta 10 días corridos desde que recibís el producto para revocar la compra, siempre que el producto esté cerrado y en su estado original."
                }
            ]
        }
    ];

    return (
        <div className={styles.faqContainer}>
            <ButtonSupport />
            <header className={styles.header}>
                <h1 className={styles.mainTitle}>Centro de <span className={styles.accent}>Ayuda</span></h1>
                <p className={styles.subtitle}>Todo lo que necesitás saber sobre nuestros productos y tu compra</p>
            </header>
            
            <div className={styles.layout}>
                <aside className={styles.sidebar}>
                    {faqData.map((section, idx) => (
                        <a key={idx} href={`#category-${idx}`} className={styles.navLink}>
                            {section.category}
                        </a>
                    ))}
                </aside>

                <main className={styles.content}>
                    {faqData.map((section, idx) => (
                        <div key={idx} id={`category-${idx}`} className={styles.categorySection}>
                            <h2 className={styles.categoryTitle}>
                                {section.icon} {section.category}
                            </h2>
                            <div className={styles.itemsGrid}>
                                {section.items.map((item, i) => (
                                    <FaqItem key={i} question={item.question} answer={item.answer} />
                                ))}
                            </div>
                        </div>
                    ))}
                </main>
            </div>

            <div className={styles.contactCard}>
                {/* <Mail size={32} className={styles.contactIcon} /> */}
                <h3>¿No encontrás lo que buscás?</h3>
                <p>Envianos un mail contándonos qué necesitás y te responderemos lo antes posible.</p>
                <a href="mailto:nutripoint.ar@gmail.com" className={styles.contactLink}>
                    nutripoint.ar@gmail.com

                </a>
                <p className={styles.orderHint}>Si tenés una consulta sobre un pedido, adjuntá tu número de orden.</p>
            </div>
        </div>
    );
};

export default FaqPage;