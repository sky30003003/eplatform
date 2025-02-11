import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  @Matches(/[a-z]/, { message: 'Parola trebuie să conțină cel puțin o literă mică' })
  @Matches(/[A-Z]/, { message: 'Parola trebuie să conțină cel puțin o literă mare' })
  @Matches(/[0-9]/, { message: 'Parola trebuie să conțină cel puțin o cifră' })
  @Matches(/[^a-zA-Z0-9]/, { message: 'Parola trebuie să conțină cel puțin un caracter special' })
  newPassword: string;
} 