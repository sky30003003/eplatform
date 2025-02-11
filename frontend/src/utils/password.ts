/**
 * Generează o parolă temporară sigură care conține:
 * - Cel puțin o literă mare
 * - Cel puțin o literă mică
 * - Cel puțin un număr
 * - Cel puțin un caracter special
 * - Lungime minimă de 12 caractere
 */
export const generateTempPassword = (): string => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '@#$%^&*';
  
  // Asigurăm că avem cel puțin câte unul din fiecare
  const password = [
    lowercase[Math.floor(Math.random() * lowercase.length)],
    uppercase[Math.floor(Math.random() * uppercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)],
  ];
  
  // Completăm până la lungimea dorită
  const allChars = lowercase + uppercase + numbers + special;
  while (password.length < 12) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }
  
  // Amestecăm caracterele
  return password.sort(() => Math.random() - 0.5).join('');
}; 