// src/utils/validators.js

export const validateField = (name, value) => {
    const cleanValue = value.trim();

    switch (name) {
        case "fullName":
            if (cleanValue.length < 5) return "Nombre demasiado corto.";
            if (!cleanValue.includes(" ")) return "Falta el apellido.";
            if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(cleanValue)) return "Solo se permiten letras.";
            if (/(\w)\1{3,}/.test(cleanValue)) return "Ingresá un nombre real."; // evita "aaaaa"
            return "";

        case "phone":
            const phoneDigits = value.replace(/\D/g, '');
            if (phoneDigits.length < 10 || phoneDigits.length > 13) return "Ingresá un número real.";
            if (/^(\d)\1+$/.test(phoneDigits)) return "Número inválido.";
            return "";

        case "postalCode":
            if (!/^\d{4}$/.test(value)) return "El CP debe tener 4 números.";
            return "";

        case "address":
            if (cleanValue.length < 8) return "Dirección demasiado corta.";
            if (!/\d/.test(cleanValue)) return "Falta la altura (número).";
            if (cleanValue.split(" ").length < 2) return "Incluí calle y número.";
            return "";

        case "city":
        case "province":
            if (cleanValue.length < 3) return "Dato demasiado corto.";
            if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(cleanValue)) return "Solo letras.";
            if (/(\w)\1{2,}/.test(cleanValue)) return "Ingresá un lugar real.";
            return "";

        default:
            return "";
    }
};

/**
 * Valida todo el formulario de una vez (para el submit)
 */
export const validateFullForm = (formData) => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
        if (key === 'notes') return; 
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
    });
    return newErrors;
};

/**
 * Formatea el texto mientras el usuario escribe
 */
export const formatInput = (name, value) => {
    if (name === "phone" || name === "postalCode") {
        return value.replace(/\D/g, '');
    }
    if (name === "fullName" || name === "city" || name === "province") {
        return value.replace(/\b\w/g, l => l.toUpperCase());
    }
    return value;
};