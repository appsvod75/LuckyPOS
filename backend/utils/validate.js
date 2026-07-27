const validate = (rules) => {
    return (req, res, next) => {
        const errors = [];
        const data = { ...req.body, ...req.params, ...req.query };

        for (const rule of rules) {
            const { field, validations } = rule;
            const value = data[field];

            for (const validation of validations) {
                const { type, message, min, max, regex } = validation;

                if (type === 'required' && (value === undefined || value === null || value === '')) {
                    errors.push({ field, message: message || `${field} es requerido` });
                    break;
                }

                if (value === undefined || value === null || value === '') continue;

                switch (type) {
                    case 'number':
                        if (isNaN(Number(value))) {
                            errors.push({ field, message: message || `${field} debe ser un número` });
                        }
                        break;
                    case 'positive':
                        if (isNaN(Number(value)) || Number(value) <= 0) {
                            errors.push({ field, message: message || `${field} debe ser mayor a 0` });
                        }
                        break;
                    case 'min':
                        if (Number(value) < min) {
                            errors.push({ field, message: message || `${field} debe ser mínimo ${min}` });
                        }
                        break;
                    case 'max':
                        if (Number(value) > max) {
                            errors.push({ field, message: message || `${field} debe ser máximo ${max}` });
                        }
                        break;
                    case 'minLength':
                        if (String(value).length < min) {
                            errors.push({ field, message: message || `${field} debe tener al menos ${min} caracteres` });
                        }
                        break;
                    case 'maxLength':
                        if (String(value).length > max) {
                            errors.push({ field, message: message || `${field} debe tener máximo ${max} caracteres` });
                        }
                        break;
                    case 'regex':
                        if (!regex.test(String(value))) {
                            errors.push({ field, message: message || `${field} tiene un formato inválido` });
                        }
                        break;
                    case 'array':
                        if (!Array.isArray(value) || value.length === 0) {
                            errors.push({ field, message: message || `${field} debe ser un arreglo no vacío` });
                        }
                        break;
                    case 'enum':
                        if (!validation.values.includes(value)) {
                            errors.push({ field, message: message || `${field} debe ser uno de: ${validation.values.join(', ')}` });
                        }
                        break;
                    case 'boolean':
                        if (typeof value !== 'boolean' && value !== 'true' && value !== 'false' && value !== true && value !== false) {
                            errors.push({ field, message: message || `${field} debe ser verdadero o falso` });
                        }
                        break;
                }
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({ message: 'Error de validación', errors });
        }

        next();
    };
};

const rules = {
    login: [
        { field: 'pin', validations: [
            { type: 'required', message: 'El PIN es requerido' },
            { type: 'regex', regex: /^\d{4,6}$/, message: 'El PIN debe tener entre 4 y 6 dígitos' }
        ]}
    ],
    createUser: [
        { field: 'name', validations: [{ type: 'required', message: 'El nombre es requerido' }] },
        { field: 'pin', validations: [
            { type: 'required', message: 'El PIN es requerido' },
            { type: 'regex', regex: /^\d{4,6}$/, message: 'El PIN debe tener entre 4 y 6 dígitos' }
        ]},
        { field: 'roleId', validations: [{ type: 'required', message: 'El rol es requerido' }] }
    ],
    createProduct: [
        { field: 'name', validations: [{ type: 'required', message: 'El nombre del producto es requerido' }] },
        { field: 'basePrice', validations: [
            { type: 'required', message: 'El precio base es requerido' },
            { type: 'positive', message: 'El precio debe ser mayor a 0' }
        ]}
    ],
    createClient: [
        { field: 'name', validations: [{ type: 'required', message: 'El nombre del cliente es requerido' }] }
    ],
    updateClient: [
        { field: 'name', validations: [{ type: 'required', message: 'El nombre del cliente es requerido' }] }
    ],
    createSale: [
        { field: 'items', validations: [
            { type: 'required', message: 'Los items son requeridos' },
            { type: 'array', message: 'Debe incluir al menos un producto' }
        ]},
        { field: 'payment_method', validations: [{ type: 'required', message: 'El método de pago es requerido' }] }
    ],
    createPurchase: [
        { field: 'branch_id', validations: [{ type: 'required', message: 'La sucursal es requerida' }] },
        { field: 'details', validations: [
            { type: 'required', message: 'Los detalles son requeridos' },
            { type: 'array', message: 'Debe incluir al menos un producto' }
        ]}
    ],
    registerExpense: [
        { field: 'description', validations: [{ type: 'required', message: 'La descripción es requerida' }] },
        { field: 'amount', validations: [
            { type: 'required', message: 'El monto es requerido' },
            { type: 'positive', message: 'El monto debe ser mayor a 0' }
        ]},
        { field: 'branchId', validations: [{ type: 'required', message: 'La sucursal es requerida' }] }
    ],
    createProvider: [
        { field: 'name', validations: [{ type: 'required', message: 'El nombre del proveedor es requerido' }] }
    ],
    updateProvider: [
        { field: 'name', validations: [{ type: 'required', message: 'El nombre del proveedor es requerido' }] }
    ],
    createBranch: [
        { field: 'name', validations: [{ type: 'required', message: 'El nombre de la sucursal es requerido' }] }
    ],
    verifyPin: [
        { field: 'pin', validations: [
            { type: 'required', message: 'El PIN es requerido' },
            { type: 'regex', regex: /^\d{4,6}$/, message: 'El PIN debe tener entre 4 y 6 dígitos' }
        ]}
    ],
    payAccount: [
        { field: 'amount', validations: [
            { type: 'required', message: 'El monto es requerido' },
            { type: 'positive', message: 'El monto debe ser mayor a 0' }
        ]}
    ],
    createTransfer: [
        { field: 'from_branch_id', validations: [{ type: 'required', message: 'La sucursal origen es requerida' }] },
        { field: 'to_branch_id', validations: [{ type: 'required', message: 'La sucursal destino es requerida' }] },
        { field: 'items', validations: [
            { type: 'required', message: 'Los items son requeridos' },
            { type: 'array', message: 'Debe incluir al menos un producto' }
        ]}
    ]
};

module.exports = { validate, rules };