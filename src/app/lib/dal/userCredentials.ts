import bcrypt from 'bcrypt';

export interface UserCredentials {
  id: string;
  email: string;
  password: string; // encrypted
  role: 'admin' | 'volunteer';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserCredentialsInput {
  email: string;
  password: string; // plain text, will be encrypted
  role: 'admin' | 'volunteer';
}

// Hardcoded credentials - replace with Prisma queries later
// Passwords: admin-pass for admin, vol-pass for volunteer
const userCredentials: UserCredentials[] = [
  {
    id: '1',
    email: 'admin@test.com',
    password: '$2b$10$QjfQCOFDIU9.S9xbHxnueezPhtl07enfbAXpUsPEoM4oEa7BWTJAK', // bcrypt hash for 'admin-pass'
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    email: 'volunteer@test.com',
    password: '$2b$10$4hw0fbVriOXAcBCQ25Jzjec66CtxjtWpGjkCzAjwGaCUXI.Dwmfja', // bcrypt hash for 'vol-pass'
    role: 'volunteer',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

export async function getUserCredentialsByEmailAndRole(email: string, role: string): Promise<UserCredentials | null> {
  const credentials = userCredentials.find(c => c.email === email && c.role === role);
  return credentials || null;
}

export async function createUserCredentials(input: CreateUserCredentialsInput): Promise<UserCredentials> {
  // Check if user already exists  
  const existingCredentials = await getUserCredentialsByEmailAndRole(input.email, input.role);
  if (existingCredentials) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(input.password, 10);
  
  // Create new credentials
  const newCredentials: UserCredentials = {
    id: (userCredentials.length + 1).toString(),
    email: input.email,
    password: hashedPassword,
    role: input.role,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  userCredentials.push(newCredentials);
  
  return newCredentials;
}


export async function updateUserPassword(userId: string, newPassword: string): Promise<UserCredentials | null> {
  const credentialsIndex = userCredentials.findIndex(c => c.id === userId);
  if (credentialsIndex === -1) return null;
  
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  userCredentials[credentialsIndex].password = hashedPassword;
  userCredentials[credentialsIndex].updatedAt = new Date();
  
  return userCredentials[credentialsIndex];
}