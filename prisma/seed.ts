import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  // Check if seeding has already been done
  console.log('Checking if database has already been seeded...');
  const existingCategory = await prisma.category.findFirst({
    where: {
      slug: 'camisas',
    },
  });

  if (existingCategory) {
    console.log('✅ Database has already been seeded. Skipping to avoid duplicate records.');
    console.log('Found existing category:', existingCategory.name);
    return;
  }

  console.log('📝 No existing data found. Proceeding with seeding...');

  // Create Admin User
  console.log('Creating admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@devstore.com',
      password: hashedPassword,
      role: 'admin',
    },
  });
  console.log('✅ Admin user created:', adminUser.email);
  console.log('📧 Login: admin@devstore.com');
  console.log('🔑 Password: admin123');

  // Create Store
  console.log('Creating store info...');
  const store = await prisma.store.create({
    data: {
      topbarText: 'Frete grátis para compras acima de R$ 299',
      topbarTextEn: 'Free shipping on orders over $299',
      instagram: 'https://instagram.com/devstore',
      facebook: 'https://facebook.com/devstore',
      email: 'contato@devstore.com',
      whatsapp: 'https://wa.me/5511999999999',
      copyright: '© 2026 DevStore. Todos os direitos reservados.',
      copyrightEn: '© 2026 DevStore. All rights reserved.',
    },
  });
  console.log('✅ Store info created');

  // Create Store Benefits
  console.log('Creating store benefits...');
  const benefits = await Promise.all([
    prisma.storeBenefit.create({
      data: {
        storeId: store.id,
        iconName: 'truck',
        title: 'Frete grátis',
        titleEn: 'Free shipping',
        description: 'Frete grátis em pedidos acima de R$ 299',
        descriptionEn: 'Free shipping on orders over $299',
        order: 1,
      },
    }),
    prisma.storeBenefit.create({
      data: {
        storeId: store.id,
        iconName: 'shield-check',
        title: 'Pagamento seguro',
        titleEn: 'Secure payment',
        description: 'Pagamento seguro com cartão de crédito, débito e boleto',
        descriptionEn: 'Secure payment with credit card, debit card and boleto',
        order: 2,
      },
    }),
    prisma.storeBenefit.create({
      data: {
        storeId: store.id,
        iconName: 'headphones',
        title: 'Suporte 24/7',
        titleEn: '24/7 support',
        description: 'Suporte 24 horas por dia com email e telefone',
        descriptionEn: '24/7 support with email and phone',
        order: 3,
      },
    }),
    prisma.storeBenefit.create({
      data: {
        storeId: store.id,
        iconName: 'percent',
        title: 'Descontos e promoções',
        titleEn: 'Discounts and promotions',
        description: 'Descontos e promoções para clientes regulares',
        descriptionEn: 'Discounts and promotions for regular customers',
        order: 4,
      },
    }),
  ]);
  console.log('✅ Store benefits created:', benefits.length);

  // Create Category
  console.log('Creating category...');
  const category = await prisma.category.create({
    data: {
      slug: 'camisas',
      name: 'Camisas',
      nameEn: 'Shirts',
    },
  });
  console.log('✅ Category created:', category.name);

  // Create CategoryMetadata
  console.log('Creating category metadata...');
  const categoryMetadata = await prisma.categoryMetadata.create({
    data: {
      id: 'tech',
      name: 'Tecnologia',
      categoryId: category.id,
    },
  });
  console.log('✅ Category metadata created:', categoryMetadata.name);

  // Create Banners
  console.log('Creating banners...');
  const banners = await Promise.all([
    prisma.banner.create({
      data: {
        img: 'banner_promo_1.jpg',
        link: '/categories/camisas',
      },
    }),
    prisma.banner.create({
      data: {
        img: 'banner_promo_2.jpg',
        link: '/categories/algo',
      },
    }),
  ]);
  console.log('✅ Banners created:', banners.length);

  // Create MetadataValues
  console.log('Creating metadata values...');
  const metadataValues = await Promise.all([
    prisma.metadataValue.create({
      data: {
        id: 'node',
        label: 'Node',
        categoryMetadataId: 'tech',
      },
    }),
    prisma.metadataValue.create({
      data: {
        id: 'react',
        label: 'React',
        categoryMetadataId: 'tech',
      },
    }),
    prisma.metadataValue.create({
      data: {
        id: 'python',
        label: 'Python',
        categoryMetadataId: 'tech',
      },
    }),
    prisma.metadataValue.create({
      data: {
        id: 'php',
        label: 'PHP',
        categoryMetadataId: 'tech',
      },
    }),
  ]);
  console.log('✅ Metadata values created:', metadataValues.length);

  // Create Products
  console.log('Creating products...');
  const products = await Promise.all([
    prisma.product.create({
      data: {
        label: 'Camisa RN',
        price: 89.9,
        description: 'Camisa com estampa de React Native, perfeita para desenvolvedores',
        categoryId: category.id,
      },
    }),
    prisma.product.create({
      data: {
        label: 'Camisa React',
        price: 94.5,
        description: 'Camisa com logo do React, ideal para front-end developers',
        categoryId: category.id,
      },
    }),
    prisma.product.create({
      data: {
        label: 'Camisa Python',
        price: 79.99,
        description: 'Camisa com design Python, para programadores Python',
        categoryId: category.id,
      },
    }),
    prisma.product.create({
      data: {
        label: 'Camisa PHP',
        price: 69.9,
        description: 'Camisa com estampa PHP, para desenvolvedores web',
        categoryId: category.id,
      },
    }),
  ]);
  console.log('✅ Products created:', products.length);

  // Create ProductImages for each product
  console.log('Creating product images...');
  const productImages = [];
  for (const product of products) {
    const images = await Promise.all([
      prisma.productImage.create({
        data: {
          productId: product.id,
          url: `product_${product.id}_1.jpg`,
        },
      }),
      prisma.productImage.create({
        data: {
          productId: product.id,
          url: `product_${product.id}_2.jpg`,
        },
      }),
    ]);
    productImages.push(...images);
  }
  console.log('✅ Product images created:', productImages.length);

  // Create ProductMetadata for each product
  console.log('Creating product metadata...');
  const productMetadata = await Promise.all([
    prisma.productMetadata.create({
      data: {
        productId: products[0].id,
        categoryMetadataId: 'tech',
        metadataValueId: 'react',
      },
    }),
    prisma.productMetadata.create({
      data: {
        productId: products[1].id,
        categoryMetadataId: 'tech',
        metadataValueId: 'react',
      },
    }),
    prisma.productMetadata.create({
      data: {
        productId: products[2].id,
        categoryMetadataId: 'tech',
        metadataValueId: 'python',
      },
    }),
    prisma.productMetadata.create({
      data: {
        productId: products[3].id,
        categoryMetadataId: 'tech',
        metadataValueId: 'php',
      },
    }),
  ]);
  console.log('✅ Product metadata created:', productMetadata.length);

  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('🔐 Admin credentials:');
  console.log('   Email: admin@devstore.com');
  console.log('   Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
