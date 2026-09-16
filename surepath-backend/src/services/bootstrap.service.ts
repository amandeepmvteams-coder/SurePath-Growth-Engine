import bcrypt from "bcrypt";

import { userRepository } from "../repositories/user.repository";

export const bootstrapService = {
  async createInitialAccount(): Promise<void> {
    const userCount = await userRepository.countUsers();

    if (userCount > 0) {
      console.log(
        "Initial account already exists. Skipping bootstrap."
      );

      return;
    }

    const username = process.env.DASHBOARD_USERNAME;
    const password = process.env.DASHBOARD_PASSWORD;

    if (!username || !password) {
      console.log(
        "No initial dashboard credentials configured. Skipping bootstrap."
      );

      return;
    }

    const passwordHash = await bcrypt.hash(
      password,
      10
    );

    await userRepository.createUser(
      username,
      null,
      null,
      passwordHash,
      "admin"
    );

    console.log(
      `Initial dashboard account created for username: ${username}`
    );
  },
};