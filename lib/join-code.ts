// Generación del código corto de evento (alternativa al link de invitación).

// Sin caracteres ambiguos: nada de 0/O, 1/I/L.
const CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

/** Genera un código de 6 caracteres en mayúsculas, fácil de transcribir a mano. */
export function generateJoinCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return code;
}

/** Valida que un texto tenga el formato esperado de un código de evento. */
export function isValidJoinCode(input: string): boolean {
  const pattern = new RegExp(`^[${CHARSET}]{${CODE_LENGTH}}$`);
  return pattern.test(input);
}
