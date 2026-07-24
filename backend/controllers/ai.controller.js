const prisma = require('../db');
const axios = require('axios');

const parseDescriptionToInfo = (description) => {
    if (!description || !description.includes('Principio Activo')) return null;

    try {
        const extract = (key) => {
            const regex = new RegExp(`• ${key}:\\s*(.*)`, 'i');
            const match = description.match(regex);
            return match ? match[1].trim() : null;
        };

        const info = {
            principioActivo: extract('Principio Activo'),
            paraQueSirve: extract('Acción'),
            dosisAdulto: extract('Dosis Adulto'),
            dosisNino: extract('Dosis Niños'),
            contraindicaciones: extract('Contraindicaciones'),
            efectosSecundarios: extract('Efectos Secundarios')
        };

        // Si al menos tenemos el principio activo o para que sirve, lo damos por válido
        if (info.principioActivo || info.paraQueSirve) {
            return {
                paraQueSirve: info.paraQueSirve || "No disponible",
                principioActivo: info.principioActivo || "No disponible",
                dosisAdulto: info.dosisAdulto || "No disponible",
                dosisNino: info.dosisNino || "No disponible",
                contraindicaciones: info.contraindicaciones || "No disponible",
                efectosSecundarios: info.efectosSecundarios || "No disponible"
            };
        }
        return null;
    } catch (e) {
        return null;
    }
};

const getMedicalInfo = async (req, res) => {
    const { product_id } = req.params;

    // 1. Fetch Key from Config
    const config = await prisma.masterConfig.findFirst();
    let GEMINI_API_KEY = config?.geminiApiKey || process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
        const mockInfo = {
            paraQueSirve: "Infecciones bacterianas leves a moderadas.",
            principioActivo: "Amoxicilina Trihidratada",
            dosisAdulto: "500mg cada 8 horas por 7 días.",
            dosisNino: "25mg/kg/día dividido en 3 dosis.",
            contraindicaciones: "Hipersensibilidad a las penicilinas.",
            efectosSecundarios: "Nauseas, diarrea, erupciones cutáneas."
        };
        return res.json(mockInfo);
    }

    try {
        const product = await prisma.product.findUnique({ where: { id: parseInt(product_id) } });
        if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

        // A. Intento de Parseo desde Descripción (Optimización principal)
        const parsedFromDescription = parseDescriptionToInfo(product.description);
        if (parsedFromDescription) {
            console.log(`AI Optimization: Info parsed from product description for ID ${product_id}`);
            return res.json(parsedFromDescription);
        }

        const cached = await prisma.aiCache.findFirst({
            where: { productId: parseInt(product_id) },
            orderBy: { createdAt: 'desc' }
        });

        if (cached && cached.responseJson) {
            return res.json(JSON.parse(cached.responseJson));
        }

        const productName = product.name;

        const prompt = `Proporciona una ficha médica estructurada en JSON para el medicamento "${productName}". 
    El JSON debe tener exactamente estas llaves:
    "paraQueSirve": string,
    "principioActivo": string,
    "dosisAdulto": string,
    "dosisNino": string,
    "contraindicaciones": string,
    "efectosSecundarios": string
    Responde ÚNICAMENTE el código JSON.`;

        const modelsToTry = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-2.0-flash-lite"];
        let lastError = null;

        for (const model of modelsToTry) {
            let retries = 2;
            while (retries > 0) {
                try {
                    console.log(`AI Fetch Attempt: model=${model}, retries_left=${retries - 1}`);
                    const response = await axios.post(
                        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
                        { contents: [{ parts: [{ text: prompt }] }] },
                        { timeout: 15000 }
                    );

                    const rawText = response.data.candidates[0].content.parts[0].text;
                    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
                    if (!jsonMatch) throw new Error('Error al parsear respuesta de Gemini');

                    const medicalInfo = JSON.parse(jsonMatch[0]);

                    await prisma.aiCache.create({
                        data: {
                            productId: parseInt(product_id),
                            responseJson: JSON.stringify(medicalInfo)
                        }
                    });

                    return res.json(medicalInfo);
                } catch (error) {
                    lastError = error;
                    const status = error.response?.status;
                    if (status === 404) break;
                    if (status === 503 || status === 429) {
                        retries--;
                        if (retries > 0) {
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            continue;
                        }
                    }
                    break;
                }
            }
        }

        throw lastError || new Error('All AI models failed');

    } catch (error) {
        console.error("AI Error (getMedicalInfo):", error.response?.data || error.message);
        res.status(500).json({ message: 'Error al obtener información médica por IA' });
    }
};

const generateMedicalInfo = async (req, res) => {
    const { name } = req.body;

    const config = await prisma.masterConfig.findFirst();
    let GEMINI_API_KEY = config?.geminiApiKey || process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
        const mockInfo = {
            paraQueSirve: "Infecciones bacterianas leves a moderadas.",
            principioActivo: "Amoxicilina Trihidratada",
            dosisAdulto: "500mg cada 8 horas por 7 días.",
            dosisNino: "25mg/kg/día dividido en 3 dosis.",
            contraindicaciones: "Hipersensibilidad a las penicilinas.",
            efectosSecundarios: "Nauseas, diarrea, erupciones cutáneas."
        };
        return res.json(mockInfo);
    }

    // List of models to try in order of preference
    const modelsToTry = [
        "gemini-2.0-flash",
        "gemini-flash-latest",
        "gemini-2.0-flash-lite"
    ];

    const prompt = `Proporciona una ficha médica estructurada en JSON para el medicamento "${name}". 
    El JSON debe tener exactamente estas llaves:
    "paraQueSirve": string,
    "principioActivo": string,
    "dosisAdulto": string,
    "dosisNino": string,
    "contraindicaciones": string,
    "efectosSecundarios": string
    Responde ÚNICAMENTE el código JSON.`;

    let lastError = null;

    for (const model of modelsToTry) {
        let retries = 2;
        while (retries > 0) {
            try {
                console.log(`AI Attempt: model=${model}, retries_left=${retries - 1}`);
                const response = await axios.post(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
                    {
                        contents: [{ parts: [{ text: prompt }] }]
                    },
                    { timeout: 15000 }
                );

                const rawText = response.data.candidates[0].content.parts[0].text;
                const jsonMatch = rawText.match(/\{[\s\S]*\}/);
                if (!jsonMatch) throw new Error('Error al parsear respuesta de Gemini');

                const medicalInfo = JSON.parse(jsonMatch[0]);
                return res.json(medicalInfo);

            } catch (error) {
                lastError = error;
                const status = error.response?.status;
                const errorData = error.response?.data?.error?.message || error.message;
                console.warn(`AI Attempt Failed (${model}):`, status, errorData);

                // If it's a 404, don't retry this model, try the next one
                if (status === 404) break;

                // If it's 503 or 429, retry after a small delay
                if (status === 503 || status === 429) {
                    retries--;
                    if (retries > 0) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        continue;
                    }
                }

                // For other errors, just move to next model
                break;
            }
        }
    }

    console.error("AI Error (generateMedicalInfo) - All models failed:", lastError?.response?.data || lastError?.message);
    res.status(500).json({
        message: 'Error al generar información médica',
        error: lastError?.response?.data?.error?.message || lastError?.message
    });
};

module.exports = { getMedicalInfo, generateMedicalInfo };
