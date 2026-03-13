import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  postId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content!: string;

  @IsString()
  @IsOptional()
  parentId?: string | null;
}
