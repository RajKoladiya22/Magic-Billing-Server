import { env, prisma } from '@config/database.config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const signup = async (data: { email: string; password: string; name: string }) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) throw new Error('User already exists');

  const hashedPassword = await bcrypt.hash(data.password, Number(env.SALT_ROUNDS));

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword,
    },
  });

  return { id: user.id, email: user.email, name: user.name };
};

export const signin = async (data: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw new Error('Invalid email or password');

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) throw new Error('Invalid email or password');

  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    env.JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    env.JWT_REFRESH_TOKEN_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, name: user.name },
  };
};
