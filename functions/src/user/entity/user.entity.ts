export class User {
  id!: string;
  email!: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string | null;
  createdAt!: Date;
  emailVerified?: boolean;
}
