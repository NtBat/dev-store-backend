import bcrypt from 'bcryptjs';
import { prisma } from '../libs/prisma';
import { v4 } from 'uuid';
import { Address } from '../types/address';

export const createUser = async (name: string, email: string, password: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return null;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email: email.toLowerCase(), password: hashedPassword },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return null;
  }

  const token = v4();

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { token },
  });

  if (!updatedUser) {
    return null;
  }

  return token;
};

export const getUserIdByToken = async (token: string) => {
  const user = await prisma.user.findFirst({
    where: { token },
  });

  if (!user) {
    return null;
  }

  return user.id;
};

export const getUserByToken = async (token: string) => {
  const user = await prisma.user.findFirst({
    where: { token },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user) {
    return null;
  }

  return user;
};

export const createUserAddress = async (userId: number, address: Address) => {
  return await prisma.userAddress.create({
    data: {
      ...address,
      userId,
    },
  });
};

export const getUserAddresses = async (userId: number) => {
  return await prisma.userAddress.findMany({
    where: { userId },
    select: {
      id: true,
      zipcode: true,
      street: true,
      number: true,
      city: true,
      state: true,
      country: true,
      complement: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getUserAddressById = async (userId: number, addressId: number) => {
  return await prisma.userAddress.findUnique({
    where: { id: addressId, userId },
    select: {
      id: true,
      zipcode: true,
      street: true,
      number: true,
      city: true,
      state: true,
      country: true,
      complement: true,
    },
  });
};
