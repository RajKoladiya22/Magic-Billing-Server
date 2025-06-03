import { prisma } from "../../config/database.config";
import { IUserDetailInput, IUserDetail } from "../../interfaces/userDetail.interface";

/** Create or update (upsert) user detail */
export const upsertUserDetail = async (
  userId: string,
  data: IUserDetailInput
): Promise<IUserDetail> => {
  const userDetail = await prisma.userDetail.upsert({
    where: { userId },
    update: data,
    create: { ...data, userId },
  });

  return userDetail;
};

/** Get user detail by user ID */
export const getUserDetail = async (userId: string): Promise<IUserDetail | null> => {
  return await prisma.userDetail.findUnique({ where: { userId } });
};

/** Update user detail */
export const updateUserDetail = async (
  userId: string,
  data: IUserDetailInput
): Promise<IUserDetail> => {
  return await prisma.userDetail.update({
    where: { userId },
    data,
  });
};
