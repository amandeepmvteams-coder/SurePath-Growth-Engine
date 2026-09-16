import { Request, Response } from "express";
import { userService } from "../services/user.service";

export const createUser = async (req: Request, res: Response) => {
    try {
        const { username, display_name, email, password, role } = req.body;

        const user = await userService.createUser(
            username,
            display_name || null,
            email || null,
            password,
            role
        );

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: user.id,
                username: user.username,
                display_name: user.display_name,
                email: user.email,
                role: user.role,
                is_active: user.is_active,
                last_login_at: user.last_login_at,
                created_at: user.created_at,
                updated_at: user.updated_at,
            },
        });
    } catch (error) {
        console.error("Create user error:", error);

        res.status(500).json({
            message: "Failed to create user",
        });
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const activeOnly = req.query.active_only === "true";

        const users = activeOnly
            ? await userService.getActiveUsers()
            : await userService.getAllUsers();

        const safeUsers = users.map((user) => ({
            id: user.id,
            username: user.username,
            display_name: user.display_name,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
            last_login_at: user.last_login_at,
            created_at: user.created_at,
            updated_at: user.updated_at,
        }));

        res.status(200).json({
            users: safeUsers,
        });
    } catch (error) {

        console.error("Get users error:", error);

        res.status(500).json({
            message: "Failed to fetch users",
        });

    }
}

export const getUserById = async (
    req: Request,
    res: Response
) => {
    try {
        const id = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id;

        const user = await userService.getUserById(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json({
            user: {
                id: user.id,
                username: user.username,
                display_name: user.display_name,
                email: user.email,
                role: user.role,
                is_active: user.is_active,
                last_login_at: user.last_login_at,
                created_at: user.created_at,
                updated_at: user.updated_at,
            },
        });
    } catch (error) {
        console.error("Get user error:", error);

        res.status(500).json({
            message: "Failed to fetch user",
        });
    }
};

export const updateUser = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const {
      display_name,
      email,
      role,
      is_active,
    } = req.body;

    const user = await userService.updateUser(id, {
      display_name,
      email,
      role,
      is_active:
        is_active !== undefined
          ? is_active === true || is_active === "true"
          : undefined,
    });

    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        last_login_at: user.last_login_at,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);

    if (error instanceof Error) {
      if (error.message === "User not found") {
        return res.status(404).json({
          message: error.message,
        });
      }

      if (
        error.message ===
        "Cannot deactivate the final active user"
      ) {
        return res.status(400).json({
          message: error.message,
        });
      }
    }

    res.status(500).json({
      message: "Failed to update user",
    });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const { password } = req.body;

    await userService.resetPassword(id, password);

    res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    if (error instanceof Error) {
      if (error.message === "User not found") {
        return res.status(404).json({
          message: error.message,
        });
      }
    }

    res.status(500).json({
      message: "Failed to reset password",
    });
  }
};