import prisma from "../src/config/prisma";

async function main() {
  const products = [];

  for (let i = 1; i <= 20; i++) {
    products.push({
      title: `Product ${i}`,
      description: `Description for product ${i}`,
      productImg: `https://picsum.photos/200?random=${i}`,
      price: Math.floor(Math.random() * 500) + 50
    });
  }

  for (const product of products) {
    const createdProduct = await prisma.product.create({
      data: product
    });

    if (Math.random() > 0.7) {
      await prisma.featured.create({
        data: {
          productId: createdProduct.id
        }
      });
    }
  }

  console.log("20 products created");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });