
const READ_ONLY = import.meta.env.VITE_READ_ONLY === 'true'

export const isReadOnly: () => boolean = () => READ_ONLY