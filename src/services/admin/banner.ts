import { prisma } from '../../libs/prisma';

export const getAllBanners = async () => {
  return await prisma.banner.findMany({
    orderBy: {
      order: 'asc',
    },
  });
};

export const getBannerById = async (id: number) => {
  return await prisma.banner.findUnique({
    where: { id },
  });
};

export const createBanner = async (data: { img: string; link: string; order?: number }) => {
  return await prisma.banner.create({
    data: {
      img: data.img,
      link: data.link,
      order: data.order ?? 0,
    },
  });
};

export const updateBanner = async (
  id: number,
  data: { img?: string; link?: string; order?: number }
) => {
  return await prisma.banner.update({
    where: { id },
    data,
  });
};

export const deleteBanner = async (id: number) => {
  return await prisma.banner.delete({
    where: { id },
  });
};

export const reorderBanners = async (banners: { id: number; order: number }[]) => {
  return await prisma.$transaction(
    banners.map((banner) =>
      prisma.banner.update({
        where: { id: banner.id },
        data: { order: banner.order },
      })
    )
  );
};
