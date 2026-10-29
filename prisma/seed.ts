import "dotenv/config";
import { prisma } from "../src/database/prisma";
import { z } from "zod";
import { hash } from "bcrypt";

async function main() {
  const seedEnv = z
    .object({
      BOOTSTRAP_ADMIN_EMAIL: z.email(),
      BOOTSTRAP_ADMIN_PASSWORD: z.string().min(8),
    })
    .parse(process.env);

  const password = await hash(seedEnv.BOOTSTRAP_ADMIN_PASSWORD, 12);

  await prisma.account.upsert({
    where: {
      email: seedEnv.BOOTSTRAP_ADMIN_EMAIL,
    },
    update: {},
    create: {
      email: seedEnv.BOOTSTRAP_ADMIN_EMAIL,
      password,
      role: "superadmin",
      user: {
        create: {
          name: "Admin"
        }
      }
    },
  });
}

main()
  .catch((error) => {
    console.log(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
