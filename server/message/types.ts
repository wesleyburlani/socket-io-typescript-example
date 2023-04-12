import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class Message {
  @IsNumber()
  @IsOptional()
  id?: number;
  @IsString()
  @IsNotEmpty()
  text: string;
}
